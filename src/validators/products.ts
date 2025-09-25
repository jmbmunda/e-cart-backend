import { body, query } from "express-validator";
import { ALLOWED_ORDERS, ALLOWED_PRODUCT_SORT_FIELDS } from "../utils/constants";

const addProduct = [
  body(["name", "description", "price", "stock", "category", "thumbnail"]).notEmpty().escape(),
  body("price").isFloat({ gt: 0 }).toFloat(),
  body("stock").isInt({ min: 0 }).toInt(),
  body("sku")
    .optional()
    .matches(/^[A-Z0-9-]+$/)
    .withMessage("SKU must contain only uppercase letters, numbers, and dashes"),
];

const editProduct = [
  body(["name", "description", "price", "stock", "category", "thumbnail"]).optional().escape(),
  body("price").optional().isFloat({ gt: 0 }).toFloat(),
  body("stock").optional().isInt({ min: 0 }).toInt(),
  body("sku")
    .optional()
    .matches(/^[A-Z0-9-]+$/)
    .withMessage("SKU must contain only uppercase letters, numbers, and dashes"),
];

const getProducts = [
  query("q").optional().isString().trim().escape(),
  query(["min_price", "max_price"]).optional().isFloat({ min: 0 }).toFloat(),
  query("sort_by")
    .optional()
    .isIn(ALLOWED_PRODUCT_SORT_FIELDS)
    .withMessage(`sory_by must be one of ${ALLOWED_PRODUCT_SORT_FIELDS.join(", ")}`),
  query("order")
    .optional()
    .toUpperCase()
    .isIn(ALLOWED_ORDERS)
    .withMessage(`order must be one of ${ALLOWED_ORDERS.join(", ")}`),
];

export default { addProduct, editProduct, getProducts };
