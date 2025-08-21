import pool from "../db";

const users = async () => {
  await pool.query(`
INSERT INTO users (name,email,profile_picture,password) 
VALUES 
    ('John Doe','john@example.com','https://picsum.photos/200','hashed_password_1'),
    ('Jane Smith','jane@example.com','https://picsum.photos/100','hashed_password_2')
ON CONFLICT (email) DO NOTHING;`);
};

export default { users };

// TODO: use migration (node-pg-migrate)
