import { body, query, param } from "express-validator";
import { ALLOWED_ORDERS } from "../utils/constants";

const getOrders = [
  query("status").optional(),
  query("order")
    .optional()
    .toUpperCase()
    .isIn(ALLOWED_ORDERS)
    .withMessage(`order must be one of ${ALLOWED_ORDERS.join(", ")}`),
];

const addOrder = [
  body("items").isArray({ min: 1 }).withMessage("Order must contain at least one item"),
  body("items.*.product_id").isInt({ min: 1 }).toInt(),
  body("items.*.quantity").isInt({ min: 1 }).toInt(),
];

const orderId = [param("id").isInt({ gt: 0 }).toInt()];

export default { getOrders, addOrder, orderId };
