import { body, query } from "express-validator";

const getCart = [query("q").optional().isString().trim()];

// TODO: should I get the cart_id from the user or query it?
// TODO: should I create user's cart upon creation of account?

const addCart = [
  body(["product_id", "quantity", "price"]).notEmpty(),
  body("quantity").isInt({ min: 0 }).toInt(),
  body("price").isFloat({ gt: 0 }).toFloat(),
];

const editCart = [
  body(["is_selected", "quantity"]).notEmpty(),
  body("is_selected").isBoolean().toBoolean(),
  body("quantity").isInt({ min: 0 }).toInt(),
];

export default { getCart, addCart, editCart };
