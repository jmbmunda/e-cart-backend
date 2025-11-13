import pool from "../../config/db";
import { mapPostgresError } from "../../mappers/pgErrorMapper";
import {
  addCartItemQuery,
  createCartQuery,
  editCartItemQuery,
  findCartItemQuery,
  getCartItemsQuery,
  removeAllCartItemsQuery,
  removeCartItemQuery,
} from "../../models/cart";
import { CartType } from "../../utils/types";

const addToCart = async (
  userId: string,
  data: Pick<CartType, "product_id" | "quantity" | "price">
) => {
  const { product_id, quantity, price } = data;

  try {
    await pool.query("BEGIN");
    const cart = await createCartQuery(userId);
    const cart_id = cart?.id;

    const row = await addCartItemQuery({ cart_id, product_id, quantity, price });
    await pool.query("COMMIT");
    return row;
  } catch (error) {
    await pool.query("ROLLBACK");
    throw mapPostgresError(error);
  }
};

const updateCartItem = async (id: string, data: Pick<CartType, "is_selected" | "quantity">) => {
  const { is_selected, quantity } = data;

  const cartItem = await findCartItemQuery(id);
  if (!cartItem) {
    return { status: 404, message: "Item does not exist" };
  }

  if (quantity === 0) {
    const deletedRow = await removeCartItemQuery(id);
    return { status: 200, message: "Item removed", data: deletedRow };
  }

  const row = await editCartItemQuery(id, { is_selected, quantity });
  return { status: 200, message: "Success", data: row };
};

const getCartItems = async (userId: string) => {
  const cart = await createCartQuery(userId);
  const cartItems = await getCartItemsQuery(cart.id);
  return { status: 200, message: "Success", data: cartItems };
};

const deleteCartItem = async (id: string) => {
  const cartItem = findCartItemQuery(id);
  if (!cartItem) {
    return { status: 404, message: "Item does not exist" };
  }

  const row = await removeCartItemQuery(id);
  return { status: 200, message: "Item removed", data: row };
};

const clearCartItems = async (userId: string) => {
  const cart = await createCartQuery(userId);
  await removeAllCartItemsQuery(cart.id);
  return { status: 200, message: "Cart Cleared" };
};

export default { addToCart, updateCartItem, getCartItems, deleteCartItem, clearCartItems };
