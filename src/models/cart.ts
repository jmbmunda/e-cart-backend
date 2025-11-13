import pool from "../config/db";

export const getCartQuery = async (userId: string) => {
  const getCartQuery = `SELECT * FROM carts WHERE user_id = $1`;
  const { rows } = await pool.query(getCartQuery, [userId]);
  return rows[0];
};

export const getCartItemsQuery = async (cartId: string) => {
  const getCartItemsQUery = `SELECT ci.id, ci.product_id, p.name, p.sku, p.thumbnail, ci.price, ci.quantity, ci.is_selected
  FROM cart_items ci
  JOIN PRODUCTS p ON p.id = ci.product_id
  WHERE cart_id = $1`;
  const { rows: cartItems } = await pool.query(getCartItemsQUery, [cartId]);
  return cartItems;
};

export const findCartItemQuery = async (id: string) => {
  const query = `SELECT * FROM cart_items WHERE id = $1`;
  const { rows } = await pool.query(query, [id]);
  return rows[0];
};

export const createCartQuery = async (userId: string) => {
  const query = `INSERT INTO carts (user_id) VALUES ($1) ON CONFLICT (user_id) DO UPDATE SET updated_at = CURRENT_TIMESTAMP RETURNING id`;
  const { rows } = await pool.query(query, [userId]);
  return rows[0];
};

export const addCartItemQuery = async (data: any) => {
  const { cart_id, product_id, quantity, price } = data;
  const query = `INSERT INTO cart_items (cart_id, product_id, quantity, price) 
  VALUES ($1, $2, $3, $4) 
  ON CONFLICT (cart_id, product_id) 
  DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity, updated_at = CURRENT_TIMESTAMP 
  RETURNING *`;
  const { rows } = await pool.query(query, [cart_id, product_id, quantity, price]);
  return rows[0];
};

export const editCartItemQuery = async (id: string, data: any) => {
  const { is_selected, quantity } = data;
  const query = `UPDATE cart_items SET is_selected = $1, quantity = $2 WHERE id = $3 RETURNING *`;
  const { rows } = await pool.query(query, [is_selected, quantity, id]);
  return rows[0];
};

export const removeCartItemQuery = async (id: string) => {
  const query = `DELETE FROM cart_items WHERE id = $1 RETURNING id`;
  const { rows } = await pool.query(query, [id]);
  return rows[0];
};

export const removeAllCartItemsQuery = async (cartId: string) => {
  const query = `TRUNCATE TABLE cart_items WHERE cart_id = $1 RESET IDENTITY`;
  const { rows } = await pool.query(query, [cartId]);
  return rows[0];
};
