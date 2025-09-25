import pool from "../config/db";
import { ALLOWED_ORDERS, ALLOWED_PRODUCT_SORT_FIELDS } from "../utils/constants";
import { FiltersType, ProductType } from "../utils/types";

export const getProductsQuery = async (filters: FiltersType) => {
  const { q, min_price, max_price, sort_by, order = "desc", page = 1, limit = 10 } = filters;
  let query = `SELECT * FROM products WHERE 1=1`;
  const queryParams: any[] = [];
  if (q) {
    queryParams.push(`%${q}%`);
    query += ` AND name ILIKE $${queryParams.length}`;
  }
  if (min_price) {
    queryParams.push(min_price);
    query += ` AND price >= $${queryParams.length}`;
  }
  if (max_price) {
    queryParams.push(max_price);
    query += ` AND price <= $${queryParams.length}`;
  }
  if (sort_by && ALLOWED_PRODUCT_SORT_FIELDS.includes(sort_by)) {
    const safeOrder = ALLOWED_ORDERS.includes(order.toUpperCase()) ? order.toUpperCase() : "DESC";
    query += ` ORDER BY ${sort_by} ${safeOrder}`;
  }
  const offset = (page - 1) * limit;
  queryParams.push(limit, offset);
  query += ` LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}`;
  const { rows } = await pool.query(query, queryParams);
  return rows;
};

export const getProductQuery = async (id: string) => {
  const { rows } = await pool.query(
    `SELECT p.*,
    COALESCE(
    json_agg(
      json_build_object(
        'id', pi.id, 'url', pi.url, 'is_thumbnail', pi.is_thumbnail
      )    
    ) FILTER (WHERE pi.id IS NOT NULL), '[]') as images
    FROM products p
    LEFT JOIN product_images pi ON pi.product_id = p.id 
    WHERE p.id = $1 GROUP BY p.id`,
    [id]
  );
  return rows;
};

export const addProductQuery = async ({
  sku,
  name,
  description,
  price,
  stock,
  category,
  thumbnail,
}: ProductType) => {
  const { rows } = await pool.query(
    "INSERT INTO products (sku, name, description, price, stock, category, thumbnail) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
    [sku, name, description, price, stock, category, thumbnail]
  );
  return rows;
};

export const editProductQuery = async (id: string, data: ProductType) => {
  const { name, description, price, stock, category, thumbnail, sku } = data;
  const { rows } = await pool.query(
    "UPDATE products SET name = COALESCE($1, name), description = COALESCE($2, description), price = COALESCE($3, price), stock = COALESCE($4, stock), category = COALESCE($5, category), thumbnail = COALESCE($6, thumbnail), sku = COALESCE($7, sku) WHERE id = $8 RETURNING *",
    [name, description, price, stock, category, thumbnail, sku, id]
  );
  return rows;
};

export const deleteProductQuery = async (id: string) => {
  const { rows } = await pool.query("DELETE FROM products WHERE id = $1 RETURNING id", [id]);
  return rows;
};
