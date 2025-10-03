import { Request, Response } from "express";
import { deactivateMfa, activateMfa, disableMfa, verifyMfa, sendOTPCode } from "../services/mfa";
import { findUserByEmailQuery, findUserByIdQuery } from "../models/user";
import { generateJwtToken, verifyJwtToken } from "../services/authService";
import { mapUserToResponse } from "../mappers/userMapper";
import { asyncHandler } from "../middlewares/asyncHandler";
import { sendError, sendSuccess } from "../utils/helper";

// TODO: add refresh token

const mfaSetup = asyncHandler(async (req: Request, res: Response) => {
  const { email, is_mfa_enabled, mfa_method } = req.body;
  const user = await findUserByEmailQuery(email, true);
  if (!user) return sendError(res, "User not found", undefined, 404);

  if (!is_mfa_enabled) {
    await disableMfa(user.id!);
    return sendSuccess(res, "MFA has been disabled");
  }

  if (is_mfa_enabled && !mfa_method) {
    return sendError(res, "Please provide mfa method", undefined, 400);
  }

  if (is_mfa_enabled && user.is_mfa_enabled) {
    return sendError(res, "MFA is already enabled", undefined, 400);
  }

  if (!is_mfa_enabled && !user.is_mfa_enabled) {
    return sendError(res, "MFA is already disabled", undefined, 400);
  }

  const { status, json } = is_mfa_enabled
    ? await activateMfa({
        userId: user.id!,
        email,
        method: mfa_method,
        mfa_secret: user.mfa_secret!,
      })
    : await deactivateMfa({ userId: user.id!, method: mfa_method });
  const { message, statusCode, ...meta } = json;
  return sendSuccess(res, message, undefined, status, statusCode, meta);
});

const mfaVerify = asyncHandler(async (req: Request, res: Response) => {
  const { code, temporary_token } = req.body;
  const tempToken = verifyJwtToken(temporary_token);
  const id = tempToken.decoded?.id;
  const user = await findUserByIdQuery(id!, true);

  if (tempToken.expired) {
    return sendError(res, "Session expired, please login again.", undefined, 401);
  }
  if (!user) return sendError(res, "User not found", undefined, 404);

  const { status, json } = await verifyMfa({
    userId: user.id!,
    otp: code,
    method: user.mfa_method!,
    secret: user.mfa_secret!,
  });
  const { message, statusCode, ...meta } = json;
  if (!json.statusCode) return sendSuccess(res, message, undefined, status, statusCode, meta);

  const token = generateJwtToken(user.id!);
  const data = mapUserToResponse(user);
  return sendSuccess(res, "Authenticated", data, 200, 1, { token });
});

const otpSend = asyncHandler(async (req: Request, res: Response) => {
  const { temporary_token } = req.body;
  const tempToken = verifyJwtToken(temporary_token);
  const id = tempToken.decoded?.id;
  const user = await findUserByIdQuery(id!, true);

  if (tempToken.expired) {
    return sendError(res, "Session expired, please login again.", undefined, 401);
  }
  if (!user) return sendError(res, "User not found", undefined, 404);

  const { status, json } = await sendOTPCode({
    userId: user.id!,
    method: user.mfa_method!,
    email: user.email!,
    mobileNumber: user.mobile_number!,
  });
  const { statusCode, message, ...meta } = json;
  return sendSuccess(res, message, undefined, status, statusCode, meta);
});

export default { mfaSetup, mfaVerify, otpSend };
