-- migrate:up
ALTER TABLE users
ADD COLUMN mfa_method VARCHAR(20),
ADD COLUMN mobile_number VARCHAR(20) NOT NULL;

-- migrate:down
ALTER TABLE users
DROP COLUMN IF EXISTS mfa_method,
DROP COLUMN IF EXISTS mobile_number;