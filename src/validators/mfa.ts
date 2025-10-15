import { check } from "express-validator";

const setup = [
  check("email", "Email is required")
    .notEmpty()
    .bail()
    .isEmail()
    .withMessage("Please provide a valid email address"),
  check("is_mfa_enabled", "is_mfa_enabled is required")
    .notEmpty()
    .bail()
    .isBoolean()
    .withMessage("is_mfa_enabled must be a boolean")
    .toBoolean(),
  check("mfa_method").optional(),
];

const verify = [
  check("code", "Code is required").notEmpty(),
  check("temporary_token", "Temporary token is required").notEmpty(),
];

const send = [check("temporary_token", "Temporary token is required").notEmpty()];

export default { setup, verify, send };
