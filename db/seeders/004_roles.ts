import pool from "../../src/config/db";
import { RoleType } from "../../src/utils/types";

const roles: RoleType[] = [
  {
    name: "user",
    description: "Regular Customer",
  },
  {
    name: "seller",
    description: "Can list and manage products",
  },
  {
    name: "admin",
    description: "Full system access",
  },
];

export const seedRoles = async () => {
  for (const r of roles) {
    await pool.query(
      "INSERT INTO roles (name, description) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING",
      [r.name, r.description]
    );
  }
};
