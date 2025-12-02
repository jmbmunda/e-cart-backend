import { AppError } from "../utils/AppError";
import { PostgresErrorCodes } from "../utils/constants";

export function mapPostgresError(error: any): never {
  switch (error.code) {
    case PostgresErrorCodes.FOREIGN_KEY_VIOLATION:
      throw new AppError({
        error: error.detail || "Invalid reference — related record not found",
        status: 400,
      });

    case PostgresErrorCodes.UNIQUE_VIOLATION:
      throw new AppError({
        error: error.detail || "Duplicate record — this entry already exists",
        status: 409,
      });

    case PostgresErrorCodes.NOT_NULL_VIOLATION:
      throw new AppError({
        error: `Missing required field: ${error.column}`,
        status: 400,
      });

    case PostgresErrorCodes.CHECK_VIOLATION:
      throw new AppError({ error: `Check constraint failed: ${error.constraint}`, status: 400 });

    case PostgresErrorCodes.INVALID_TEXT_REPRESENTATION:
      throw new AppError({
        error: "Invalid input syntax (e.g. invalid UUID or data type)",
        status: 400,
      });

    case PostgresErrorCodes.NUMERIC_VALUE_OUT_OF_RANGE:
      throw new AppError({ error: "Numeric value out of range.", status: 400 });

    case PostgresErrorCodes.STRING_DATA_RIGHT_TRUNCATION:
      throw new AppError({ error: "String value too long for column", status: 400 });

    default:
      throw new AppError({
        error: error.error || "Internal database error",
        message: error.message,
        status: error.status,
        statusCode: error.statusCode,
      });
  }
}
