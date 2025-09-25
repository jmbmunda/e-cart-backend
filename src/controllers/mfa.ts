import { Request, Response } from "express";
import { deactivateMfa, activateMfa, disableMfa, verifyMfa, sendOTPCode } from "../services/mfa";
import { findUserByEmailQuery, findUserByIdQuery } from "../models/user";
import { generateJwtToken, verifyJwtToken } from "../services/authService";
import { mapUserToResponse } from "../mappers/userMapper";

// TODO:
// If mfa_enabled is true, mfa_method is required - DONE
// WHen mfa_enabled is false, deactivate mfa - DONE
// OTP resend functionality

const mfaSetup = async (req: Request, res: Response) => {
  try {
    const { email, is_mfa_enabled, mfa_method } = req.body;
    const user = await findUserByEmailQuery(email, true);
    if (!user || !user.length) {
      return res.status(404).json({ statusCode: 0, message: "User not found" });
    }

    if (!is_mfa_enabled) {
      await disableMfa(user[0].id!);
      return res.status(200).json({ statusCode: 1, message: "MFA has been disabled" });
    }

    if (is_mfa_enabled && !mfa_method) {
      return res.status(400).json({ statusCode: 0, message: "Please provide mfa method" });
    }

    if (is_mfa_enabled && user[0].is_mfa_enabled) {
      return res.status(400).json({ statusCode: 0, message: "MFA is already enabled" });
    }

    if (!is_mfa_enabled && !user[0].is_mfa_enabled) {
      return res.status(400).json({ statusCode: 0, message: "MFA is already disabled" });
    }

    const { status, json } = is_mfa_enabled
      ? await activateMfa({
          userId: user[0].id!,
          email,
          method: mfa_method,
          mfa_secret: user[0].mfa_secret!,
        })
      : await deactivateMfa({ userId: user[0].id!, method: mfa_method });

    return res.status(status).json(json);
  } catch (error) {
    return res.status(500).json({ statusCode: 0, message: "Something went wrong", error });
  }
};

const mfaVerify = async (req: Request, res: Response) => {
  try {
    const { code, temporary_token } = req.body;
    const tempToken = verifyJwtToken(temporary_token);
    const id = tempToken.decoded?.id;
    const user = await findUserByIdQuery(id!, true);

    if (tempToken.expired)
      return res
        .status(401)
        .json({ statusCode: 0, message: "Session expired, please login again." });
    if (!user.length) return res.status(404).json({ statusCode: 0, message: "User not found" });

    const { status, json } = await verifyMfa({
      userId: user[0].id!,
      otp: code,
      method: user[0].mfa_method!,
      secret: user[0].mfa_secret!,
    });
    if (!json.statusCode) return res.status(status).json(json);

    const token = generateJwtToken(user[0].id!);
    const data = mapUserToResponse(user[0]);

    return res.status(200).json({ statusCode: 1, message: "Authenticated", token, data });
  } catch (error) {
    return res.status(500).json({ statusCode: 0, message: "Something went wrong", error });
  }
};

const otpSend = async (req: Request, res: Response) => {
  try {
    const { temporary_token } = req.body;
    const tempToken = verifyJwtToken(temporary_token);
    const id = tempToken.decoded?.id;
    const user = await findUserByIdQuery(id!, true);

    if (tempToken.expired)
      return res
        .status(401)
        .json({ statusCode: 0, message: "Session expired, please login again." });
    if (!user.length) return res.status(404).json({ statusCode: 0, message: "User not found" });

    const { status, json } = await sendOTPCode({
      userId: user[0].id!,
      method: user[0].mfa_method!,
      email: user[0].email!,
      mobileNumber: user[0].mobile_number!,
    });
    return res.status(status).json(json);
  } catch (error) {
    return res.status(500).json({ statusCode: 0, message: "Something went wrong", error });
  }
};

export default { mfaSetup, mfaVerify, otpSend };
