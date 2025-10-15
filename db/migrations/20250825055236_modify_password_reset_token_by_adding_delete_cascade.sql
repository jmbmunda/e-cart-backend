-- migrate:up
ALTER TABLE password_reset_tokens
DROP CONSTRAINT password_reset_tokens_user_id_fkey,
ADD CONSTRAINT password_reset_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE;

-- migrate:down
ALTER TABLE password_reset_tokens
DROP CONSTRAINT password_reset_tokens_user_id_fkey,
ADD CONSTRAINT password_reset_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES users (id);