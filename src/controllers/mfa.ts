import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import { sendSuccess } from "../utils/helper";
import { config } from "../config/env.config";
import mfaService from "../services/mfa";

const handleMfaSetup = asyncHandler(async (req: Request, res: Response) => {
  const { email, is_mfa_enabled, mfa_method } = req.body;

  const { status, json } = await mfaService.mfaSetup({ email, is_mfa_enabled, mfa_method });
  return sendSuccess(res, json.message, undefined, status, json.statusCode, json.others);
});

const handleMfaVerify = asyncHandler(async (req: Request, res: Response) => {
  const { code, temporary_token } = req.body;

  const result = await mfaService.mfaVerify({ temporary_token, code });
  const { refresh_token, data, token, statusCode, meta, message } = result.json;

  if (refresh_token) {
    res.cookie("refresh_token", refresh_token, {
      httpOnly: true,
      secure: config.app.node_env === "production",
      sameSite: "lax",
    });
  }

  return sendSuccess(res, message, data, result.status, statusCode, { token, ...meta });
});

const handleOtpSend = asyncHandler(async (req: Request, res: Response) => {
  const { temporary_token } = req.body;

  const result = await mfaService.sendOtp({ temporary_token });
  const { message, statusCode, meta } = result.json;
  return sendSuccess(res, message, undefined, result.status, statusCode, meta);
});

export default { handleMfaSetup, handleMfaVerify, handleOtpSend };
