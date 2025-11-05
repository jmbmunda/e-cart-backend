-- migrate:up
ALTER TABLE users
ADD COLUMN role_id INT REFERENCES roles(id) ON DELETE SET NULL; 


-- migrate:down
ALTER TABLE users 
DROP COLUMN IF EXISTS role_id;
