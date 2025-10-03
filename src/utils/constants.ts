export const OTP_DURATION_MINUTES = 5;

export const ALLOWED_PRODUCT_SORT_FIELDS = ["price", "name", "created_at"];
export const ALLOWED_ORDERS = ["ASC", "DESC"];

export const ALLOWED_CATEGORY_SORT_FIELDS = ["name", "is_active"];

export const PostgresErrorCodes = {
  UNIQUE_VIOLATION: "23505",
  FOREIGN_KEY_VIOLATION: "23503",
  NOT_NULL_VIOLATION: "23502",
  CHECK_VIOLATION: "23514",
  EXCLUSION_VIOLATION: "23P01",
} as const;
