import { safeQuery } from "../utils/helper";
import { OrderFiltersType, OrderItemType, OrderResponseType, OrderType } from "../utils/types";

export const getOrdersQuery = async (filters?: OrderFiltersType) => {
  const { q, status, order, page = 1, limit = 10 } = filters ?? {};
  let query = `
  SELECT o.id, o.user_id, o.total_amount, o.status, o.created_at, o.updated_at, json_agg(
    json_build_object(
      'product_id', p.id,
      'product_name', p.name,
      'thumbnail', p.thumbnail,
      'quantity', oi.quantity,
      'price', oi.price
    )
  ) AS items
  FROM orders o 
  JOIN order_items oi ON o.id = oi.order_id
  JOIN products p ON oi.product_id = p.id
  WHERE 1=1`;

  const queryParams = [];

  if (q) {
    queryParams.push(`%${q}%`);
    const idx = queryParams.length;
    query += ` AND (p.name ILIKE $${idx} OR o.id::text ILIKE $${idx})`;
  }

  if (status) {
    queryParams.push(status);
    const idx = queryParams.length;
    query += ` AND status = $${idx}`;
  }

  query += ` GROUP BY o.id, o.user_id, o.total_amount, o.status`;
  query += ` ORDER BY o.created_at ${order?.toUpperCase() ?? "DESC"}`;

  const offset = (page - 1) * limit;
  queryParams.push(limit, offset);
  query += ` LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}`;

  const rows = await safeQuery<OrderResponseType[]>(query, queryParams);
  return rows;
};

export const getOrderByIdQuery = async (id: string) => {
  const query = `SELECT * FROM orders WHERE id = $1;`;
  const rows = await safeQuery<OrderType[]>(query, [id]);
  return rows[0];
};

export const addOrderQuery = async (
  data: Pick<OrderType, "user_id" | "status" | "total_amount">
) => {
  const { user_id, status, total_amount } = data;
  const query = `INSERT INTO orders (user_id, status, total_amount) VALUES ($1, $2, $3) RETURNING id;`;
  const rows = await safeQuery<Pick<OrderType, "id">[]>(query, [user_id, status, total_amount]);
  return rows[0];
};

export const addOrderItemQuery = async (
  data: Omit<OrderItemType, "id" | "created_at" | "updated_at">
) => {
  const { order_id, product_id, quantity, price } = data;
  const query = `
  INSERT INTO order_items (order_id, product_id, quantity, price)
  VALUES ($1, $2, $3, $4) RETURNING *;`;
  const rows = await safeQuery<OrderItemType[]>(query, [order_id, product_id, quantity, price]);
  return rows[0];
};

export const updateOrderStatusQuery = async (id: string, status: string) => {
  const query = `UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *;`;
  const rows = await safeQuery<OrderType[]>(query, [status, id]);
  return rows[0];
};
