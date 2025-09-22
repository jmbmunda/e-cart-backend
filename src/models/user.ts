import pool from "../config/db";
import { UserType } from "../utils/types";

const getFields = (includeSensitive: boolean = false) => {
  const baseFields = [
    "id",
    "name",
    "email",
    "profile_picture",
    "is_mfa_enabled",
    "created_at",
    "updated_at",
    "mfa_method",
    "mobile_number",
  ];
  const sensitiveFields = ["password", "mfa_secret"];
  const fields = includeSensitive ? [...baseFields, ...sensitiveFields] : baseFields;
  return fields;
};

export const findUserByIdQuery = async <T extends boolean = false>(
  id: string,
  includeSensitive?: T
): Promise<UserType<T>[]> => {
  const fields = getFields(includeSensitive);
  const { rows } = await pool.query(`SELECT ${fields.join(", ")} FROM users WHERE id = $1`, [id]);
  return rows;
};

export const findUserByEmailQuery = async <T extends boolean = false>(
  email: string,
  includeSensitive?: T
): Promise<UserType<T>[]> => {
  const fields = getFields(includeSensitive);
  const { rows } = await pool.query(`SELECT ${fields} FROM users WHERE email = $1`, [email]);
  return rows;
};

export const updateInformationQuery = async () => {};
