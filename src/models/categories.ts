import pool from "../config/db";
import { AppError } from "../utils/AppError";
import { PostgresErrorCodes } from "../utils/constants";
import { CategoriesFiltersType, CategoryType } from "../utils/types";

export const getCategoriesQuery = async (filters: CategoriesFiltersType) => {
  const { is_active, order = "desc", page = 1, limit = 10 } = filters;
  let query = `SELECT * FROM categories`;
  let queryParams = [];

  if (typeof is_active === "boolean") {
    queryParams.push(is_active);
    query += ` WHERE is_active = $${queryParams.length}`;
  }

  const offset = (page - 1) * limit;
  queryParams.push(limit, offset);
  query += ` ORDER BY name ${order.toUpperCase()} LIMIT $${queryParams.length - 1} OFFSET $${
    queryParams.length
  }`;

  const { rows } = await pool.query(query, queryParams);
  return rows;
};

export const getCategoryByIdQuery = async (id: string) => {
  const { rows } = await pool.query("SELECT * FROM categories WHERE id = $1", [id]);
  return rows[0];
};

export const addCategoryQuery = async (data: CategoryType) => {
  try {
    const { name, slug, is_active, thumbnail } = data;
    const { rows } = await pool.query(
      `INSERT INTO categories (name, slug, is_active, thumbnail) VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, slug, is_active, thumbnail]
    );
    return rows[0];
  } catch (error: any) {
    if (error.code === PostgresErrorCodes.UNIQUE_VIOLATION) {
      throw new AppError(error, "Category with this slug already exists", 400);
    }
    throw new AppError(error);
  }
};

export const editCategoryQuery = async (id: string, data: CategoryType) => {
  try {
    const { name, slug, is_active, thumbnail } = data;
    const { rows } = await pool.query(
      `UPDATE categories SET name = COALESCE($1, name), slug = COALESCE($2, slug), is_active = COALESCE($3, is_active), thumbnail = COALESCE($4, thumbnail) WHERE id = $5 RETURNING *`,
      [name, slug, is_active, thumbnail, id]
    );
    return rows[0];
  } catch (error: any) {
    if (error.code === PostgresErrorCodes.UNIQUE_VIOLATION) {
      throw new AppError(error, "Category with this slug already exists", 400);
    }
    throw new AppError(error);
  }
};

export const deleteCategoryQuery = async (id: string) => {
  const { rows } = await pool.query("DELETE FROM categories WHERE id = $1 RETURNING id", [id]);
  return rows[0];
};
