import { safeQuery } from "../utils/helper";
import { CategoriesFiltersType, CategoryType } from "../utils/types";

export const getCategoriesQuery = async ({
  is_active,
  order = "desc",
  page = 1,
  limit = 10,
}: CategoriesFiltersType) => {
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

  const rows = await safeQuery<CategoryType[]>(query, queryParams);
  return rows;
};

export const getCategoryByIdQuery = async (id: string) => {
  const rows = await safeQuery<CategoryType[]>("SELECT * FROM categories WHERE id = $1", [id]);
  return rows[0];
};

export const getCategoryBySlugQuery = async (slug: string) => {
  const rows = await safeQuery<CategoryType[]>("SELECT * FROM categories WHERE slug = $1", [slug]);
  return rows[0];
};

export const addCategoryQuery = async (data: CategoryType) => {
  const { name, slug, is_active, thumbnail } = data;
  const rows = await safeQuery<CategoryType[]>(
    `INSERT INTO categories (name, slug, is_active, thumbnail) VALUES ($1, $2, $3, $4) RETURNING *`,
    [name, slug, is_active, thumbnail]
  );
  return rows[0];
};

export const editCategoryQuery = async (id: string, data: CategoryType) => {
  const { name, slug, is_active, thumbnail } = data;
  const rows = await safeQuery<CategoryType[]>(
    `UPDATE categories SET name = COALESCE($1, name), slug = COALESCE($2, slug), is_active = COALESCE($3, is_active), thumbnail = COALESCE($4, thumbnail) WHERE id = $5 RETURNING *`,
    [name, slug, is_active, thumbnail, id]
  );
  return rows[0];
};

export const deleteCategoryQuery = async (id: string) => {
  const rows = await safeQuery<Pick<CategoryType, "id">[]>(
    "DELETE FROM categories WHERE id = $1 RETURNING id",
    [id]
  );
  return rows[0];
};
