import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import {
  getRefreshTokenByUserIdQuery,
  revokeRefreshTokenQuery,
  storeRefreshTokenQuery,
} from "../models/auth";
import { config } from "../config/env.config";
import { JWTUserDataType, UserType } from "../utils/types";

export const generateJwtToken = (user: Partial<UserType>, expiresIn: string = "1h") => {
  const jwtData: JWTUserDataType = { id: user.id, email: user.email, role: user.role };
  return jwt.sign(jwtData, config.token.secret!, {
    expiresIn: config.token.access_expiry || expiresIn,
  });
};

export const verifyJwtToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, config.token.secret!) as jwt.JwtPayload & JWTUserDataType;
    return { isValid: true, expired: false, decoded };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return { isValid: false, expired: true, decoded: null };
    } else {
      return { isValid: false, expired: false, decoded: null };
    }
  }
};

export const compareHash = async (value: string, hashedValue: string) => {
  return await bcrypt.compare(value, hashedValue);
};

export const hashPassword = async (password: string, saltLength: number = 10) => {
  const salt = await bcrypt.genSalt(saltLength);
  const hashedPassword = await bcrypt.hash(password.toString(), salt);
  return hashedPassword;
};

export const emailPasswordReset = async (
  email: string,
  token: string,
  emailConfig?: {
    service?: string;
    from?: string;
    subject?: string;
    text?: string;
  }
) => {
  const transporter = nodemailer.createTransport({
    service: emailConfig?.service ?? "gmail",
    auth: {
      user: config.mailer.user,
      pass: config.mailer.pass,
    },
  });
  const webResetLink = `${config.mailer.base_url}/reset-password/${token}`;
  const mobileResetLink = `${config.mailer.base_url}/reset-password/${token}`;
  await transporter.sendMail({
    from: emailConfig?.from ?? `E-Cart <${config.mailer.user}>`,
    to: email,
    subject: emailConfig?.subject ?? "Password Reset",
    text:
      emailConfig?.text ||
      `We received a request to reset your password. To securely proceed, please select the appropriate link below based on your device:\n\n
        For web user: ${webResetLink}\n
        For mobile user: ${mobileResetLink}\n
        If you did not request this, please disregard this email.
        `,
  });
};

export const generateSaveRefreshToken = async (user: Partial<UserType>) => {
  // const token = generateRandomToken();
  const token = generateJwtToken(user, "7d");
  const hashedToken = await bcrypt.hash(token, 10);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await storeRefreshTokenQuery(user.id!, hashedToken, expiresAt);
  return token;
};

export const rotateRefreshToken = async (
  user: Partial<UserType>,
  options?: { shouldCheckExpiry?: boolean }
) => {
  const row = await getRefreshTokenByUserIdQuery(user.id!);
  const shouldCheckExpiry = options?.shouldCheckExpiry ?? false;

  if (row?.is_revoked) {
    return { statusCode: 401, message: "Refresh token is already used or revoked" };
  }

  if (shouldCheckExpiry && row?.expires_at < Date.now()) {
    return { statusCode: 401, message: "Refresh token has expired" };
  }

  if (row?.id) await revokeRefreshTokenQuery(row.id);

  const newRefreshToken = await generateSaveRefreshToken(user);
  return newRefreshToken;
};
