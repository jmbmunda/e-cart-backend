-- migrate:up
CREATE INDEX IF NOT EXISTS idx_mfa_tokens_user_valid
ON mfa_tokens (user_id, used, expires_at DESC);

-- migrate:down
DROP INDEX IF EXISTS idx_mfa_tokens_user_valid;
