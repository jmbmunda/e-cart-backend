import { body, check } from "express-validator";

const register = [
  body(["name", "profile_picture"]).notEmpty().escape(),
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .notEmpty()
    .withMessage("Email is required")
    .escape(),
  check("mobile_number")
    .notEmpty()
    .withMessage("Mobile number is required")
    .bail()
    .matches(/^(?:\+639\d{9}|09\d{9})$/)
    .withMessage("Mobile number must start with 09 or +63 and contain 11 digits"),
  check("password", "Password is required").notEmpty(),
  check("password", "Must be at least 8 characters long").isLength({ min: 8 }),
  check("confirm_password", "Confirm Password is required").notEmpty(),
  check("confirm_password", "Must be at least 8 characters long").isLength({
    min: 8,
  }),
  check("confirm_password").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Confirm password does not match password");
    }
    return true;
  }),
];

const login = [
  check("email", "Email is required").notEmpty(),
  check("email", "Please provide a valid email address").isEmail(),
  check("password", "Password is required").notEmpty(),
  check("password", "Must be at least 8 characters").isLength({ min: 8 }),
];

const forgotPassword = [check("email", "Email is required").notEmpty()];

const resetPassword = [
  check("reset_token", "Reset Token is required").notEmpty(),
  check("new_password", "New Password is required").notEmpty(),
  check("new_password", "Must be at least 8 characters long").isLength({
    min: 8,
  }),
];

export default { register, login, forgotPassword, resetPassword };
