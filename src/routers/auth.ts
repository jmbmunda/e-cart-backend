import express from "express";
import authController from "../controllers/auth";
import authValidator from "../validators/auth";
import validateRequest from "../middlewares/validateRequest";
import {
  forgotPasswordLimiter,
  loginLimiter,
  passwordResetLimiter,
  refreshTokenLimiter,
  registerLimiter,
} from "../middlewares/rateLimit";

const router = express.Router();

router.post(
  "/register",
  registerLimiter,
  authValidator.register,
  validateRequest,
  authController.handleRegister
);

router.post(
  "/login",
  loginLimiter,
  authValidator.login,
  validateRequest,
  authController.handleLogin
);

router.post(
  "/forgot-password",
  forgotPasswordLimiter,
  authValidator.forgotPassword,
  validateRequest,
  authController.handleForgotPassword
);

router.post(
  "/reset-password",
  passwordResetLimiter,
  authValidator.resetPassword,
  validateRequest,
  authController.handleResetPassword
);

router.post("/refresh", refreshTokenLimiter, authController.handleRefreshToken);

router.post("/logout", authController.handleLogout);

export default router;
