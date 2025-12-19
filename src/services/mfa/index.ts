import { authenticator } from "otplib";
import qrcode from "qrcode";

import * as totpService from "./totpService";
import * as emailService from "./emailService";
import { BaseJsonType, MfaMethodType, ResponseType, UserType } from "../../utils/types";
import { saveOtpQuery, updateMfaStatusQuery } from "../../models/mfa";
import { findUserByEmailQuery, findUserByIdQuery } from "../../models/user";
import authService from "../../services/auth";
import { mapUserToResponse } from "../../mappers/userMapper";

const generateMfaSecret = async () => {
  const secret = authenticator.generateSecret();
  return secret;
};

const generateQRCodeUrl = async (email: string, secret: string) => {
  const otpAuthUrl = authenticator.keyuri(email, "e-cart", secret);
  const qrCodeUrl = await qrcode.toDataURL(otpAuthUrl);
  return qrCodeUrl;
};

const verifyMfaCode = async (code: string, secret: string) => {
  try {
    return authenticator.check(code, secret);
  } catch (error) {
    throw error;
  }
};

const disableMfa = async (id: string) => {
  await updateMfaStatusQuery(id, false);
  return {
    status: 200,
    json: { statusCode: 1, message: "MFA has been deactivated" },
  };
};

const saveOTPCode = async ({
  userId,
  tempToken,
  otp,
  expiresAt,
}: {
  userId: string;
  tempToken: string;
  otp: string;
  expiresAt: Date;
}) => {
  try {
    await saveOtpQuery(userId, otp, expiresAt);
    return {
      status: 200,
      json: { statusCode: 1, message: "OTP sent!", temporary_token: tempToken },
    };
  } catch (error) {
    throw error;
  }
};

const activateMfa = async ({
  userId,
  email,
  method,
  mfa_secret,
}: {
  userId: string;
  email: string;
  method: MfaMethodType;
  mfa_secret: string;
}) => {
  switch (method) {
    case "authenticator":
      return await totpService.enable(userId, email, mfa_secret);
    case "email":
      return await emailService.enable(userId);
    // case "sms":
    //   return await smsService.enable(userId);
    default:
      return { status: 400, json: { statusCode: 0, message: "Unsupported MFA method" } };
  }
};

const deactivateMfa = async ({ userId, method }: { userId: string; method: MfaMethodType }) => {
  switch (method) {
    case "authenticator":
      return await totpService.disable(userId);
    case "email":
      return await emailService.disable(userId);
    // case "sms":
    //   return await smsService.disable(userId);
    default:
      return { status: 400, json: { statusCode: 0, message: "Unsupported MFA method" } };
  }
};

const sendOTPCode = async (user: UserType<true>) => {
  switch (user?.mfa_method) {
    case "authenticator":
      return await totpService.send(user);
    case "email":
      return await emailService.send(user);
    // case "sms":
    //   return await smsService.send(userId, mobileNumber);
    default:
      return { status: 400, json: { statusCode: 0, message: "Unsupported MFA method" } };
  }
};

export const verifyMfa = async ({
  userId,
  otp,
  method,
  secret,
}: {
  userId: string;
  otp: string;
  method: MfaMethodType;
  secret: string;
}) => {
  switch (method) {
    case "authenticator":
      return totpService.verify(otp, secret);
    case "email":
      return await emailService.verify(userId, otp);
    // case "sms":
    //   return await smsService.verify(userId, otp);
    default:
      return { status: 400, json: { statusCode: 0, message: "Unsupported MFA method" } };
  }
};

const mfaSetup = async ({
  email,
  is_mfa_enabled,
  mfa_method,
}: {
  email: string;
  is_mfa_enabled: boolean;
  mfa_method: MfaMethodType;
}) => {
  const user = await findUserByEmailQuery(email, true);
  if (!user)
    return {
      status: 404,
      json: { statusCode: 0, message: "User not found" },
    };

  if (is_mfa_enabled && user.is_mfa_enabled) {
    return {
      status: 400,
      json: { statusCode: 0, message: "MFA is already enabled" },
    };
  }

  if (!is_mfa_enabled && !user.is_mfa_enabled) {
    return {
      status: 400,
      json: { statusCode: 0, message: "MFA is already disabled" },
    };
  }

  if (!is_mfa_enabled) {
    await disableMfa(user.id!);
    return {
      status: 200,
      json: { statusCode: 1, message: "MFA has been disabled" },
    };
  }

  if (is_mfa_enabled && !mfa_method) {
    return {
      status: 400,
      json: { statusCode: 0, message: "Please provide mfa method" },
    };
  }

  const { status, json } = is_mfa_enabled
    ? await activateMfa({
        userId: user.id!,
        email,
        method: mfa_method,
        mfa_secret: user.mfa_secret!,
      })
    : await deactivateMfa({ userId: user.id!, method: mfa_method });
  const { message, statusCode, ...others } = json;
  return { status, json: { message, statusCode, others } };
};

const mfaVerify = async ({
  temporary_token,
  code,
}: {
  temporary_token: string;
  code: string;
}): Promise<
  ResponseType<
    BaseJsonType & { token?: string; refresh_token?: string | null; data?: any; meta?: any }
  >
> => {
  const tempToken = authService.verifyJwtToken(temporary_token);
  const id = tempToken.decoded?.id;
  const user = await findUserByIdQuery(id!, true);

  if (tempToken.expired) {
    return {
      status: 401,
      json: { statusCode: 0, message: "Session expired, please login again." },
    };
  }
  if (!user) return { status: 404, json: { statusCode: 0, message: "User not found" } };

  const { status, json } = await verifyMfa({
    userId: user.id!,
    otp: code,
    method: user.mfa_method!,
    secret: user.mfa_secret!,
  });
  const { message, statusCode, ...meta } = json;
  if (!json.statusCode) return { status, json: { message, statusCode, meta } };

  const token = authService.generateJwtToken(user);
  const data = mapUserToResponse(user);

  const result = await authService.rotateRefreshToken(user);

  if (result.json.statusCode === 0) {
    return {
      ...result,
      json: { message: result.json.message, statusCode: result.json.statusCode },
    };
  }

  return {
    status: result.status,
    json: {
      ...result.json,
      data,
      token,
      refresh_token: result.json.refresh_token,
    },
  };
};

const sendOtp = async ({ temporary_token }: { temporary_token: string }) => {
  const tempToken = authService.verifyJwtToken(temporary_token);
  const id = tempToken.decoded?.id;
  const user = await findUserByIdQuery(id!, true);

  if (tempToken.expired) {
    return {
      status: 400,
      json: { statusCode: 0, message: "Session expired, please login again." },
    };
  }

  if (!user)
    return {
      status: 404,
      json: { statusCode: 0, message: "User not found" },
    };

  const { status, json } = await sendOTPCode(user);
  const { statusCode, message, ...meta } = json;
  return { status, json: { message, statusCode, meta } };
};

export default {
  generateMfaSecret,
  generateQRCodeUrl,
  verifyMfaCode,
  disableMfa,
  saveOTPCode,
  activateMfa,
  deactivateMfa,
  sendOTPCode,
  mfaSetup,
  mfaVerify,
  sendOtp,
};
