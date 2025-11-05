import { Request, Response } from "express";
import { deactivateMfa, activateMfa, disableMfa, verifyMfa, sendOTPCode } from "../services/mfa";
import { findUserByEmailQuery, findUserByIdQuery } from "../models/user";
import { generateJwtToken, rotateRefreshToken, verifyJwtToken } from "../services/authService";
import { mapUserToResponse } from "../mappers/userMapper";
import { asyncHandler } from "../middlewares/asyncHandler";
import { sendError, sendSuccess } from "../utils/helper";
import { config } from "../config/env.config";

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

  const token = generateJwtToken(user);
  const data = mapUserToResponse(user);

  const result = await rotateRefreshToken(user);
  if (typeof result !== "string") {
    return sendError(res, result.message, undefined, result.statusCode);
  }

  res.cookie("refresh_token", result, {
    httpOnly: true,
    secure: config.app.node_env === "production",
    sameSite: "lax",
  });
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

  const { status, json } = await sendOTPCode(user);
  const { statusCode, message, ...meta } = json;
  return sendSuccess(res, message, undefined, status, statusCode, meta);
});

export default { mfaSetup, mfaVerify, otpSend };
