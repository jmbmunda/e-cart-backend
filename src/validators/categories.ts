import { body, query } from "express-validator";
import { ALLOWED_ORDERS } from "../utils/constants";

const addCategory = [
  body(["name", "slug"]).notEmpty(),
  body("is_active").optional().isBoolean().toBoolean(),
  body("thumbnail").optional().isURL().withMessage("thumbnail must be a valid URL"),
];

const editCategory = [
  body(["name", "slug"]).optional(),
  body("is_active").optional().isBoolean().toBoolean(),
  body("thumbnail").optional().isURL().withMessage("thumbnail must be a valid URL"),
];

const getCategories = [
  query("is_active").optional().isBoolean().toBoolean(),
  query("order")
    .optional()
    .toUpperCase()
    .isIn(ALLOWED_ORDERS)
    .withMessage(`order must be one of ${ALLOWED_ORDERS.join(", ")}`),
];

export default { getCategories, addCategory, editCategory };
