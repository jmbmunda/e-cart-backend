import pool from "../../config/db";
import { config } from "../../config/env.config";
import {
  getOtpByUserIdQuery,
  updateMfaMethodQuery,
  updateMfaStatusQuery,
  updateOtpStatusQuery,
  verifyOtpQuery,
} from "../../models/mfa";
import { generateOtp, sendEmail } from "../../utils/helper";
import { UserType } from "../../utils/types";
import authService from "../auth";
import mfaService from ".";

const enable = async (id: string) => {
  try {
    await pool.query("BEGIN");
    await updateMfaStatusQuery(id, true);
    await updateMfaMethodQuery(id, "email");
    await pool.query("COMMIT");
    return {
      status: 200,
      json: { statusCode: 1, message: "MFA has been setup successfully" },
    };
  } catch (error) {
    await pool.query("ROLLBACK");
    throw error;
  }
};

const disable = async (id: string) => {
  try {
    await updateMfaMethodQuery(id, null);
    return {
      status: 200,
      json: { statusCode: 1, message: "MFA has been disabled" },
    };
  } catch (error) {
    throw error;
  }
};

const verify = async (userId: string, otp: string) => {
  try {
    await pool.query("BEGIN");
    const otps = await verifyOtpQuery(userId, otp);

    if (otps?.length === 0) {
      return {
        status: 400,
        json: {
          statusCode: 0,
          message: "Invalid OTP",
        },
      };
    }

    if (otps[0].used) {
      return {
        status: 400,
        json: {
          statusCode: 0,
          message: "OTP has already been used",
        },
      };
    }

    const expiry = otps[0]?.expires_at;
    if (expiry && new Date(expiry) < new Date()) {
      return {
        status: 400,
        json: {
          statusCode: 0,
          message: "OTP has expired",
        },
      };
    }

    await updateOtpStatusQuery(userId, otp, true);
    await pool.query("COMMIT");
    return {
      status: 200,
      json: { statusCode: 1, message: "OTP verified successfully" },
    };
  } catch (error) {
    await pool.query("ROLLBACK");
    throw error;
  }
};

const send = async (user: UserType) => {
  const OTP_DURATION_MINUTES = config.otp.duration_ms;
  try {
    const temporary_token = authService.generateJwtToken(user, `${OTP_DURATION_MINUTES}m`);
    const validOtps = await getOtpByUserIdQuery(user.id!);
    if (validOtps?.length === 0) {
      const otp = generateOtp();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
      sendEmail({
        subject: "E-Cart OTP",
        emailRecipient: user.email,
        text: `Your OTP is ${otp}. It will expire in ${OTP_DURATION_MINUTES} minutes. Do not share this code with anyone.`,
      });
      return await mfaService.saveOTPCode({
        userId: user.id!,
        tempToken: temporary_token,
        otp,
        expiresAt,
      });
    }

    return {
      status: 200,
      json: {
        statusCode: 0,
        message: `OTP already sent, please wait for ${OTP_DURATION_MINUTES} minutes before sending again`,
        temporary_token,
      },
    };
  } catch (error) {
    throw error;
  }
};

export { enable, disable, verify, send };
