import pool from "../config/db";
import { mapPostgresError } from "../mappers/pgErrorMapper";
import {
  addCartItemQuery,
  createCartQuery,
  editCartItemQuery,
  findCartItemQuery,
  getCartItemsQuery,
  removeAllCartItemsQuery,
  removeCartItemQuery,
} from "../models/cart";
import { getProductByIdQuery } from "../models/products";
import { AppError } from "../utils/AppError";
import cache from "../utils/cache";
import { TTL } from "../utils/constants";
import { makeCacheKey } from "../utils/helper";
import { CartItemType } from "../utils/types";

const getCartItems = async (userId: string) => {
  const cacheKey = makeCacheKey("cart", "list");
  const cachedItems = await cache.get(cacheKey);
  if (cachedItems) {
    await cache.expire(cacheKey, TTL.CART);
    return { status: 200, json: { statusCode: 1, message: "Success", data: cachedItems } };
  }

  console.log(`🌱 Fetching fresh data`);
  const cart = await createCartQuery(userId);
  const cartItems = await getCartItemsQuery(cart.id);

  await cache.set(cacheKey, cartItems, TTL.CART);

  return { status: 200, json: { statusCode: 1, message: "Success", data: cartItems } };
};

const addToCart = async (userId: string, data: Pick<CartItemType, "product_id" | "quantity">) => {
  const { product_id, quantity } = data;

  try {
    await pool.query("BEGIN");
    const cart = await createCartQuery(userId);
    const cart_id = cart?.id;

    const product = await getProductByIdQuery(product_id!);
    if (!product) throw new AppError({ message: "Product does not exist", status: 404 });
    const price = product.price;

    const newCartItem = await addCartItemQuery({ cart_id, product_id, quantity, price });
    await pool.query("COMMIT");

    const cartItems = await getCartItemsQuery(cart_id);
    const cacheKey = makeCacheKey("cart", "list");
    await cache.set(cacheKey, cartItems, TTL.CART);

    return { status: 201, json: { statusCode: 1, message: "Item added", data: newCartItem } };
  } catch (error) {
    await pool.query("ROLLBACK");
    throw mapPostgresError(error);
  }
};

const updateCartItem = async (id: string, data: Pick<CartItemType, "is_selected" | "quantity">) => {
  const { is_selected, quantity } = data;
  let resultRow;

  const cartItem = await findCartItemQuery(id);
  if (!cartItem) {
    return { status: 404, json: { statusCode: 0, message: "Item does not exist" } };
  }

  if (quantity === 0) {
    resultRow = await removeCartItemQuery(id);
  } else {
    resultRow = await editCartItemQuery(id, { is_selected, quantity });
  }

  const cartItems = await getCartItemsQuery(cartItem.cart_id);
  const cacheKey = makeCacheKey("cart", "list");
  await cache.set(cacheKey, cartItems, TTL.CART);

  return {
    status: 200,
    json: { statusCode: 1, message: quantity === 0 ? "Item Removed" : "Success", data: resultRow },
  };
};

const deleteCartItem = async (id: string) => {
  const cartItem = await findCartItemQuery(id);
  if (!cartItem) {
    return { status: 404, json: { statusCode: 0, message: "Item does not exist" } };
  }

  const deletedId = await removeCartItemQuery(id);

  const cartItems = await getCartItemsQuery(cartItem.cart_id);
  const cacheKey = makeCacheKey("cart", "list");
  await cache.set(cacheKey, cartItems, TTL.CART);

  return { status: 200, json: { statusCode: 1, message: "Item removed", data: deletedId } };
};

const clearCartItems = async (userId: string) => {
  const cart = await createCartQuery(userId);
  await removeAllCartItemsQuery(cart.id);

  const cacheKey = makeCacheKey("cart", "list");
  await cache.set(cacheKey, [], TTL.CART);

  return { status: 200, json: { statusCode: 1, message: "Cart cleared" } };
};

export default { getCartItems, addToCart, updateCartItem, deleteCartItem, clearCartItems };
