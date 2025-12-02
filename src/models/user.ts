import { safeQuery } from "../utils/helper";
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
    "role_id",
  ];
  const sensitiveFields = ["password", "mfa_secret"];
  const fields = includeSensitive ? [...baseFields, ...sensitiveFields] : baseFields;
  return fields;
};

export const findUserByIdQuery = async <T extends boolean = false>(
  id: string,
  includeSensitive?: T
): Promise<UserType<T>> => {
  const fields = getFields(includeSensitive);
  const rows = await safeQuery<UserType[]>(`SELECT ${fields.join(", ")} FROM users WHERE id = $1`, [
    id,
  ]);
  return rows[0];
};

export const findUserByEmailQuery = async <T extends boolean = false>(
  email: string,
  includeSensitive?: T
): Promise<UserType<T>> => {
  const fields = getFields(includeSensitive);
  const rows = await safeQuery<UserType[]>(
    `SELECT ${fields
      .map((q) => `u.${q}`)
      .join(", ")}, json_build_object('id', r.id, 'name', r.name) AS role
     FROM users u
     LEFT JOIN roles r ON u.role_id = r.id
     WHERE email = $1`,
    [email]
  );
  return rows[0];
};

export const updateInformationQuery = async () => {};
