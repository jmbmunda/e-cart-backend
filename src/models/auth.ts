import { safeQuery } from "../utils/helper";
import { PasswordResetType, RefreshTokenType, UserType } from "../utils/types";

export const registerQuery = async (user: UserType<true>) => {
  const { name, email, mobile_number, profile_picture, password } = user;
  const rows = await safeQuery<UserType[]>(
    `INSERT INTO users (name, email, mobile_number, profile_picture, password) 
    VALUES ($1, $2, $3, $4, $5) 
    RETURNING *`,
    [name, email, mobile_number, profile_picture, password]
  );
  return rows[0];
};

// STORE PASSWORD RESET TOKEN (upsert pattern)
export const storeResetTokenQuery = async (userId: string, token: string, expiry: string) => {
  const rows = await safeQuery<PasswordResetType[]>(
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
  const rows = await safeQuery<PasswordResetType[]>(
    `SELECT user_id, token, expires_at FROM password_reset_tokens 
    WHERE token = $1 
    AND expires_at > NOW() 
    AND used = FALSE`,
    [token]
  );
  return rows;
};

export const resetPasswordQuery = async (userId: string, newPassword: string) => {
  const rows = await safeQuery<UserType[]>(
    `UPDATE users 
    SET password = $1 
    WHERE id = $2 
    RETURNING *`,
    [newPassword, userId]
  );
  return rows;
};

export const setTokenStatusQuery = async (token: string) => {
  const rows = await safeQuery<PasswordResetType[]>(
    `UPDATE password_reset_tokens 
    SET used = TRUE 
    WHERE token = $1 
    RETURNING *`,
    [token]
  );
  return rows;
};

export const storeRefreshTokenQuery = async (
  userId: string,
  refreshToken: string,
  expiresAt: Date,
  isRevoked: boolean = false
) => {
  const rows = await safeQuery<RefreshTokenType[]>(
    `INSERT INTO refresh_tokens (user_id, token, expires_at, is_revoked) 
    VALUES ($1, $2, $3, $4) 
    RETURNING *`,
    [userId, refreshToken, expiresAt, isRevoked]
  );
  return rows[0];
};

export const getRefreshTokenByUserIdQuery = async (userId: string) => {
  const rows = await safeQuery<RefreshTokenType[]>(
    `SELECT * FROM refresh_tokens WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
    [userId]
  );
  return rows[0];
};

export const revokeRefreshTokenQuery = async (id: string, isRevoked: boolean = true) => {
  const rows = await safeQuery<RefreshTokenType[]>(
    `UPDATE refresh_tokens 
    SET is_revoked = $2 
    WHERE id = $1 
    RETURNING *`,
    [id, isRevoked]
  );
  return rows;
};
