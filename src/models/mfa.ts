import pool from "../config/db";
import { MfaMethodType, MfaTokenType } from "../utils/types";

export const updateMfaStatusQuery = async (userId: string, status: boolean) => {
  const { rows } = await pool.query(
    `UPDATE users 
        SET is_mfa_enabled = $1 
        WHERE id = $2 
        RETURNING *`,
    [status, userId]
  );
  return rows;
};

export const saveMfaSecretQuery = async (userId: string, secret: string) => {
  const { rows } = await pool.query(
    `UPDATE users 
        SET mfa_secret = $1 
        WHERE id = $2 
        RETURNING *`,
    [secret, userId]
  );
  return rows;
};

export const deleteMfaSecretQuery = async (userId: string) => {
  const { rows } = await pool.query(
    `UPDATE users 
        SET mfa_secret = NULL 
        WHERE id = $1 
        RETURNING *`,
    [userId]
  );
  return rows;
};

export const updateMfaMethodQuery = async (userId: string, method: MfaMethodType | null) => {
  const { rows } = await pool.query(
    `UPDATE users 
        SET mfa_method = $1 
        WHERE id = $2 
        RETURNING *`,
    [method, userId]
  );
  return rows;
};

export const saveOtpQuery = async (
  userId: string,
  otp: string,
  expiresAt: Date
): Promise<MfaTokenType[]> => {
  const { rows } = await pool.query(
    `INSERT INTO mfa_tokens (user_id, otp, expires_at) VALUES ($1, $2, $3) RETURNING *`,
    [userId, otp, expiresAt]
  );
  return rows;
};

export const verifyOtpQuery = async (userId: string, otp: string): Promise<MfaTokenType[]> => {
  const { rows } = await pool.query(
    `SELECT * FROM mfa_tokens WHERE user_id = $1 AND otp = $2 LIMIT 5`,
    [userId, otp]
  );
  return rows;
};

export const updateOtpStatusQuery = async (userId: string, otp: string, used: boolean) => {
  const { rows } = await pool.query(
    `UPDATE mfa_tokens 
        SET used = $1 
        WHERE user_id = $2 AND otp = $3 
        RETURNING *`,
    [used, userId, otp]
  );
  return rows;
};

export const getOtpByUserIdQuery = async (userId: string): Promise<MfaTokenType[]> => {
  const { rows } = await pool.query(
    `SELECT * FROM mfa_tokens WHERE user_id = $1 AND used = false AND expires_at > NOW() ORDER BY created_at DESC LIMIT 5`,
    [userId]
  );
  return rows;
};
