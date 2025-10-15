import { authenticator } from "otplib";
import qrcode from "qrcode";

import * as totpService from "./totpService";
import * as emailService from "./emailService";
import { MfaMethodType } from "../../utils/types";
import { saveOtpQuery, updateMfaStatusQuery } from "../../models/mfa";

export const generateMfaSecret = async () => {
  const secret = authenticator.generateSecret();
  return secret;
};

export const generateQRCodeUrl = async (email: string, secret: string) => {
  const otpAuthUrl = authenticator.keyuri(email, "e-cart", secret);
  const qrCodeUrl = await qrcode.toDataURL(otpAuthUrl);
  return qrCodeUrl;
};

export const verifyMfaCode = async (code: string, secret: string) => {
  try {
    return authenticator.check(code, secret);
  } catch (error) {
    throw error;
  }
};

export const disableMfa = async (id: string) => {
  await updateMfaStatusQuery(id, false);
  return {
    status: 200,
    json: { statusCode: 1, message: "MFA has been deactivated" },
  };
};

export const saveOTPCode = async ({
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

export const activateMfa = async ({
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

export const deactivateMfa = async ({
  userId,
  method,
}: {
  userId: string;
  method: MfaMethodType;
}) => {
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

export const sendOTPCode = async ({
  userId,
  method,
  email,
  mobileNumber,
}: {
  userId: string;
  method: MfaMethodType;
  email: string;
  mobileNumber: string;
}) => {
  switch (method) {
    case "authenticator":
      return await totpService.send(userId);
    case "email":
      return await emailService.send(userId, email);
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
