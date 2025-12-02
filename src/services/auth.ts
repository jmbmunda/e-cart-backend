import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import {
  getRefreshTokenByUserIdQuery,
  registerQuery,
  resetPasswordQuery,
  revokeRefreshTokenQuery,
  setTokenStatusQuery,
  storeRefreshTokenQuery,
  storeResetTokenQuery,
  validateResetTokenQuery,
} from "../models/auth";
import { config } from "../config/env.config";
import { BaseJsonType, JWTUserDataType, ResponseType, UserType } from "../utils/types";
import { findUserByEmailQuery } from "../models/user";
import { mapUserToResponse } from "../mappers/userMapper";
import { nanoid } from "nanoid";

const generateJwtToken = (user: Partial<UserType>, expiresIn: string = "5m") => {
  const jwtData: JWTUserDataType = { id: user.id, email: user.email, role: user.role };
  return jwt.sign(jwtData, config.token.secret!, { expiresIn });
};

const verifyJwtToken = (token: string) => {
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

const compareHash = async (value: string, hashedValue: string) => {
  return await bcrypt.compare(value, hashedValue);
};

const hashPassword = async (password: string, saltLength: number = 10) => {
  const salt = await bcrypt.genSalt(saltLength);
  const hashedPassword = await bcrypt.hash(password.toString(), salt);
  return hashedPassword;
};

const emailPasswordReset = async (
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

const generateSaveRefreshToken = async (user: Partial<UserType>) => {
  // const token = generateRandomToken();
  const token = generateJwtToken(user, "7d");
  const hashedToken = await bcrypt.hash(token, 10);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await storeRefreshTokenQuery(user.id!, hashedToken, expiresAt);
  return token;
};

const rotateRefreshToken = async (
  user: Partial<UserType>,
  options?: { shouldCheckExpiry?: boolean }
): Promise<ResponseType<BaseJsonType & { refresh_token: string | null }>> => {
  const row = await getRefreshTokenByUserIdQuery(user.id!);
  const shouldCheckExpiry = options?.shouldCheckExpiry ?? false;

  if (row?.is_revoked) {
    return {
      status: 401,
      json: {
        statusCode: 0,
        message: "Refresh token is already used or revoked",
        refresh_token: null,
      },
    };
  }

  if (shouldCheckExpiry && new Date(row?.expires_at).getTime() < Date.now()) {
    return {
      status: 401,
      json: { statusCode: 0, message: "Refresh token has expired", refresh_token: null },
    };
  }

  if (row?.id) await revokeRefreshTokenQuery(row.id);

  const newRefreshToken = await generateSaveRefreshToken(user);
  return {
    status: 200,
    json: { statusCode: 1, message: "Success", refresh_token: newRefreshToken },
  };
};

const register = async (data: UserType<true> & { confirmPassword?: string }) => {
  const user = await findUserByEmailQuery(data.email);
  if (user) return { status: 400, json: { statusCode: 0, message: "User already exists" } };

  const hashedPassword = await hashPassword(data.password!);
  const values = { ...data, password: hashedPassword };
  const registerData = await registerQuery(values);

  const mappedUser = mapUserToResponse(registerData);
  const token = generateJwtToken(mappedUser.id);

  const result = await rotateRefreshToken(mappedUser);
  if (result.json.statusCode === 0) {
    return { ...result, json: { ...result.json, data: null, token: null } };
  }

  return {
    status: 201,
    json: {
      statusCode: 1,
      message: "User registered successfully",
      data: mappedUser,
      token,
      refresh_token: result.json.refresh_token,
    },
  };
};

const login = async ({ email, password }: { email: string; password: string }) => {
  const user = await findUserByEmailQuery(email, true);
  if (!user) return { status: 400, json: { statusCode: 0, message: "Account does not exist" } };

  const isValid = await compareHash(password, user.password!);
  if (!isValid) return { status: 400, json: { statusCode: 0, message: "Wrong password" } };

  if (user.is_mfa_enabled) {
    const temporary_token = generateJwtToken(user, "5m");
    return {
      status: 200,
      json: {
        statusCode: 1,
        message: "MFA required. Please proceed to the next step to verify your identity.",
        data: { temporary_token, mfa_method: user.mfa_method },
      },
    };
  }

  const token = generateJwtToken(user);
  const data = mapUserToResponse(user);

  const result = await rotateRefreshToken(user);
  if (result.json.statusCode === 0) {
    return { ...result, json: { ...result.json, data: null, token: null } };
  }

  return {
    status: 200,
    json: {
      statusCode: 1,
      message: "Logged In Successfully",
      data,
      token,
      refresh_token: result.json.refresh_token,
    },
  };
};

const refreshToken = async (refreshToken: string) => {
  if (!refreshToken) {
    return { status: 401, json: { statusCode: 0, message: "No refresh token found" } };
  }

  const { isValid, expired, decoded } = verifyJwtToken(refreshToken);
  if (expired)
    return { status: 401, json: { statusCode: 0, message: "Refresh token has expired" } };
  if (!isValid) return { status: 401, json: { statusCode: 0, message: "Invalid refresh token" } };

  const userDecoded = { id: decoded?.id, email: decoded?.email, role_id: decoded?.role_id };
  const token = generateJwtToken(userDecoded);

  const result = await rotateRefreshToken(userDecoded, { shouldCheckExpiry: true });
  if (result.json.statusCode === 0) {
    return { ...result, json: { ...result.json, data: null, token: null } };
  }

  return {
    status: 200,
    json: {
      statusCode: 1,
      message: "Token refreshed",
      data: undefined,
      token,
      refresh_token: result.json.refresh_token,
    },
  };
};

const forgotPassword = async (email: string) => {
  const user = await findUserByEmailQuery(email);
  if (!user)
    return {
      status: 404,
      json: { statusCode: 0, message: "No user found with this email address" },
    };

  const token = nanoid();
  const expiry = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  await storeResetTokenQuery(user.id!, token, expiry);
  await emailPasswordReset(email, token);
  return {
    status: 200,
    json: { statusCode: 1, message: `Success! Reset password link has been sent to ${email}` },
  };
};

const resetPassword = async ({
  reset_token,
  new_password,
}: {
  reset_token: string;
  new_password: string;
}) => {
  const result = await validateResetTokenQuery(reset_token);
  if (result.length === 0)
    return {
      status: 400,
      json: { statusCode: 0, message: "Invalid Token" },
    };

  const hashedPassword = await hashPassword(new_password);
  await resetPasswordQuery(result[0].user_id, hashedPassword);
  await setTokenStatusQuery(reset_token);

  return {
    status: 200,
    json: { statusCode: 1, message: "Password has been updated successfully" },
  };
};

export default {
  generateJwtToken,
  verifyJwtToken,
  compareHash,
  hashPassword,
  emailPasswordReset,
  generateSaveRefreshToken,
  rotateRefreshToken,
  register,
  login,
  refreshToken,
  forgotPassword,
  resetPassword,
};
