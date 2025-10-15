import { authenticator } from "otplib";
import { generateMfaSecret, generateQRCodeUrl } from ".";
import pool from "../../config/db";
import {
  deleteMfaSecretQuery,
  saveMfaSecretQuery,
  updateMfaMethodQuery,
  updateMfaStatusQuery,
} from "../../models/mfa";
import { generateJwtToken } from "../authService";
import { config } from "../../config/env.config";

const enable = async (id: string, email: string, mfa_secret: string) => {
  try {
    let secret = mfa_secret;
    await pool.query("BEGIN");
    if (!mfa_secret) {
      const newSecret = await generateMfaSecret();
      await saveMfaSecretQuery(id, secret);
      secret = newSecret;
    }
    const qrCodeUrl = await generateQRCodeUrl(email, secret);
    await updateMfaMethodQuery(id, "authenticator");
    await updateMfaStatusQuery(id, true);
    await pool.query("COMMIT");
    return {
      status: 200,
      json: { statusCode: 1, message: "MFA has been setup successfully", qrCodeUrl },
    };
  } catch (error) {
    await pool.query("ROLLBACK");
    throw error;
  }
};

const disable = async (id: string) => {
  try {
    await deleteMfaSecretQuery(id);
    return {
      status: 200,
      json: { statusCode: 1, message: "MFA has been disabled" },
    };
  } catch (error) {
    throw error;
  }
};

const verify = (otp: string, secret: string) => {
  try {
    const isValid = authenticator.check(otp, secret);
    if (!isValid) {
      return {
        status: 401,
        json: { statusCode: 0, message: "Invalid Code" },
      };
    }
    return {
      status: 200,
      json: { statusCode: 1, message: "OTP verified successfully" },
    };
  } catch (error) {
    throw error;
  }
};

const send = async (userId: string) => {
  const OTP_DURATION_MINUTES = config.otp.duration_ms;

  try {
    const temporary_token = generateJwtToken(userId, `${OTP_DURATION_MINUTES}m`);
    return {
      status: 200,
      json: {
        statusCode: 1,
        message: `Open your authenticator app to view your one-time passcode. You can request a new code after ${OTP_DURATION_MINUTES} minutes if needed.`,
        temporary_token,
      },
    };
  } catch (error) {
    throw error;
  }
};

export { enable, disable, verify, send };
