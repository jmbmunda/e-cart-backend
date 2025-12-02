import { body, query } from "express-validator";

const getCart = [query("q").optional().isString().trim()];

const addCart = [
  body(["product_id", "quantity"]).notEmpty(),
  body("quantity").isInt({ min: 0 }).toInt(),
];

const editCart = [
  body(["is_selected", "quantity"]).notEmpty(),
  body("is_selected").isBoolean().toBoolean(),
  body("quantity").isInt({ min: 0 }).toInt(),
];

export default { getCart, addCart, editCart };
