-- migrate:up
ALTER TABLE users
ADD COLUMN is_mfa_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN mfa_secret TEXT NULL;

-- migrate:down
ALTER TABLE users
DROP COLUMN IF EXISTS is_mfa_enabled,
DROP COLUMN IF EXISTS mfa_secret;