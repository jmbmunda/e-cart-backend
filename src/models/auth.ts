import pool from "../config/db";
import { UserType } from "../utils/types";

export const registerQuery = async (user: UserType<true>) => {
  const { name, email, mobile_number, profile_picture, password } = user;
  const { rows } = await pool.query(
    `INSERT INTO users (name, email, mobile_number, profile_picture, password) 
    VALUES ($1, $2, $3, $4, $5) 
    RETURNING *`,
    [name, email, mobile_number, profile_picture, password]
  );
  return rows[0];
};

export const loginQuery = async () => {};

// STORE PASSWORD RESET TOKEN (upsert pattern)
export const storeResetTokenQuery = async (userId: string, token: string, expiry: string) => {
  const { rows } = await pool.query(
    `INSERT INTO password_reset_tokens (user_id, token, expires_at) 
    VALUES ($1, $2, $3) 
    ON CONFLICT (user_id)
    DO UPDATE SET token = EXCLUDED.token, expires_at = EXCLUDED.expires_at, used = FALSE 
    RETURNING *`,
    [userId, token, expiry]
  );
  return rows;
};

// VALIDATE RESET PASSWORD TOKEN
export const validateResetTokenQuery = async (token: string) => {
  const { rows } = await pool.query(
    `SELECT user_id, token, expires_at FROM password_reset_tokens 
    WHERE token = $1 
    AND expires_at > NOW() 
    AND used = FALSE`,
    [token]
  );
  return rows;
};

export const resetPasswordQuery = async (userId: string, newPassword: string) => {
  const { rows } = await pool.query(
    `UPDATE users 
    SET password = $1 
    WHERE id = $2 
    RETURNING *`,
    [newPassword, userId]
  );
  return rows;
};

export const setTokenStatusQuery = async (token: string) => {
  const { rows } = await pool.query(
    `UPDATE password_reset_tokens 
    SET used = TRUE 
    WHERE token = $1 
    RETURNING *`,
    [token]
  );
  return rows;
};
