import express from "express";
import authController from "../controllers/auth";
import authValidator from "../validators/auth";
import validateRequest from "../middlewares/validateRequest";
import {
  forgotPasswordLimiter,
  loginLimiter,
  passwordResetLimiter,
  registerLimiter,
} from "../middlewares/rateLimit";

const router = express.Router();

router.post(
  "/register",
  registerLimiter,
  authValidator.register,
  validateRequest,
  authController.register
);
router.post("/login", loginLimiter, authValidator.login, validateRequest, authController.login);

router.post(
  "/forgot-password",
  forgotPasswordLimiter,
  authValidator.forgotPassword,
  validateRequest,
  authController.forgotPassword
);

router.post(
  "/reset-password",
  passwordResetLimiter,
  authValidator.resetPassword,
  validateRequest,
  authController.resetPassword
);

export default router;
