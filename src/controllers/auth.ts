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
import { asyncHandler } from "../middlewares/asyncHandler";
import { sendError, sendSuccess } from "../utils/helper";

const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await findUserByEmailQuery(email);
  if (user) return sendError(res, "User already exists", undefined, 400);
  const hashedPassword = await hashPassword(password);
  const values = { ...req.body, password: hashedPassword };
  const registerData = await registerQuery(values);
  const data = mapUserToResponse(registerData);
  return sendSuccess(res, "Account created", data, 201);
});

const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await findUserByEmailQuery(email, true);
  if (!user) return sendError(res, "Account does not exist", undefined, 400);
  const isValid = isPasswordValid(password, user.password!);
  if (!isValid) return sendError(res, "Wrong password", undefined, 400);
  if (user.is_mfa_enabled) {
    const temporary_token = generateJwtToken(user.id!, "5m");
    return sendSuccess(
      res,
      "MFA required. Please proceed to the next step to verify your identity.",
      undefined,
      200,
      1,
      { temporary_token, mfa_method: user.mfa_method }
    );
  }
  const token = generateJwtToken(user.id!);
  const data = mapUserToResponse(user);
  return sendSuccess(res, "Logged In Successfully", data, 200, 1, { token });
});

const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  const user = await findUserByEmailQuery(email);
  if (!user) return sendError(res, "No user found with this email address", undefined, 404);
  const token = nanoid();
  const expiry = new Date(Date.now() + 5 * 60 * 1000).toISOString();
  await storeResetTokenQuery(user.id!, token, expiry);
  await emailPasswordReset(email, token);
  return sendSuccess(res, `Success! Reset password link has been sent to ${email}`);
});

const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { reset_token, new_password } = req.body;
  const result = await validateResetTokenQuery(reset_token);
  if (result.length === 0) return sendError(res, "Invalid token", undefined, 400);
  const hashedPassword = await hashPassword(new_password);
  await resetPasswordQuery(result[0].user_id, hashedPassword);
  await setTokenStatusQuery(reset_token);
  return sendError(res, "Password has been updated successfully");
});

export default { register, login, forgotPassword, resetPassword };
