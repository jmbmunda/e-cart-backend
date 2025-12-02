import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import { sendError, sendSuccess } from "../utils/helper";
import { config } from "../config/env.config";
import authService from "../services/auth";

const handleRegister = asyncHandler(async (req: Request, res: Response) => {
  const registerData = await authService.register(req.body);
  const { refresh_token, message, statusCode, data, token } = registerData.json;

  if (refresh_token) {
    res.cookie("refresh_token", refresh_token, {
      httpOnly: true,
      secure: config.app.node_env === "production",
      sameSite: "lax",
    });
  }
  return sendSuccess(res, message, data, registerData.status, statusCode, { token });
});

const handleLogin = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);
  const { refresh_token, message, statusCode, data, token } = result.json;

  if (refresh_token) {
    res.cookie("refresh_token", refresh_token, {
      httpOnly: true,
      secure: config.app.node_env === "production",
      sameSite: "lax",
    });
  }

  return sendSuccess(res, message, data, result.status, statusCode, { token });
});

const handleForgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  const result = await authService.forgotPassword(email);
  return sendSuccess(res, result.json.message, undefined, result.status, result.json.statusCode);
});

const handleResetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { reset_token, new_password } = req.body;

  const result = await authService.resetPassword({ reset_token, new_password });
  return sendError(res, result.json.message, undefined, result.status, result.json.statusCode);
});

const handleRefreshToken = asyncHandler(async (req: Request, res: Response) => {
  const { refresh_token: refreshToken } = req.cookies;
  const result = await authService.refreshToken(refreshToken);
  const { refresh_token, message, statusCode, data, token } = result.json;

  res.cookie("refresh_token", refresh_token, {
    httpOnly: true,
    secure: config.app.node_env === "production",
    sameSite: "lax",
  });
  return sendSuccess(res, message, data, result.status, statusCode, { token });
});

export default {
  handleRegister,
  handleLogin,
  handleForgotPassword,
  handleResetPassword,
  handleRefreshToken,
};
