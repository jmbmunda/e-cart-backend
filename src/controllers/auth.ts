import { Request, Response } from "express";
import { findUserByEmailQuery } from "../models/user";
import {
  registerQuery,
  resetPasswordQuery,
  setTokenStatusQuery,
  storeResetTokenQuery,
  validateResetTokenQuery,
} from "../models/auth";
import { nanoid } from "nanoid";
import {
  emailPasswordReset,
  generateJwtToken,
  hashPassword,
  isPasswordValid,
} from "../services/authService";
import { mapUserToResponse } from "../mappers/userMapper";

const register = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await findUserByEmailQuery(email);
    if (result.length) {
      return res.status(400).json({ statusCode: 0, message: "User already exists" });
    }

    const hashedPassword = await hashPassword(password);
    const values = { ...req.body, password: hashedPassword };
    const queryRes = await registerQuery(values);
    const data = mapUserToResponse(queryRes[0]);

    return res.status(201).json({ statusCode: 1, message: "Account created", data });
  } catch (error) {
    return res.status(500).json({ statusCode: 0, message: "Something went wrong", error });
  }
};

const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await findUserByEmailQuery(email, true);
    if (!user || !user.length) {
      return res.status(400).json({ statusCode: 0, message: "Account does not exist" });
    }

    const isValid = isPasswordValid(password, user[0].password!);
    if (!isValid) {
      return res.status(400).json({ statusCode: 0, message: "Wrong password" });
    }

    if (user[0].is_mfa_enabled) {
      const temporary_token = generateJwtToken(user[0].id!, "5m");
      return res.status(200).json({
        statusCode: 1,
        message: "MFA required. Please proceed to the next step to verify your identity.",
        mfa_method: user[0].mfa_method,
        temporary_token,
      });
    }

    const token = generateJwtToken(user[0].id!);
    const data = mapUserToResponse(user[0]);
    return res.status(200).json({ statusCode: 1, message: "Logged In Successfully", token, data });
  } catch (error) {
    return res.status(500).json({ statusCode: 0, message: "Something went wrong", error });
  }
};

const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await findUserByEmailQuery(email);
    if (!user.length) {
      return res.status(404).json({
        statusCode: 0,
        message: "No user found with this email address",
      });
    }

    const token = nanoid();
    const expiry = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    await storeResetTokenQuery(user[0].id!, token, expiry);
    await emailPasswordReset(email, token);

    return res.status(200).json({
      statusCode: 1,
      message: `Success! Reset password link has been sent to ${email}`,
    });
  } catch (error) {
    return res.status(500).json({ statusCode: 0, message: "Something went wrong", error });
  }
};

const resetPassword = async (req: Request, res: Response) => {
  try {
    const { reset_token, new_password } = req.body;

    const result = await validateResetTokenQuery(reset_token);
    if (result.length === 0) {
      return res.status(400).json({ statusCode: 0, message: "Invalid token" });
    }

    const hashedPassword = await hashPassword(new_password);
    await resetPasswordQuery(result[0].user_id, hashedPassword);
    await setTokenStatusQuery(reset_token);

    return res.status(200).json({
      statusCode: 1,
      message: "Password has been updated successfully",
    });
  } catch (error) {
    return res.status(500).json({ statusCode: 0, message: "Something went wrong", error });
  }
};

export default { register, login, forgotPassword, resetPassword };
