import pool from "../../src/config/db";
import bcrypt from "bcrypt";

export const users = async () => {
  const hashed = await bcrypt.hash("password123", 10);
  await pool.query(
    `INSERT INTO users (id, name, email, password, profile_picture)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (id) DO NOTHING;`,
    [1, "Jm User", "jmuser@example.com", hashed, "https://picsum.photos/200"]
  );
};
