import {
  addCategoryQuery,
  deleteCategoryQuery,
  editCategoryQuery,
  getCategoriesQuery,
  getCategoryByIdQuery,
  getCategoryBySlugQuery,
} from "../models/categories";
import cache from "../utils/cache";
import { TTL } from "../utils/constants";
import { CategoriesFiltersType, CategoryType } from "../utils/types";

const getCategories = async (queryParams: CategoriesFiltersType) => {
  const cacheKey = `categories:all`;
  const cached = await cache.get(cacheKey);
  if (cached) {
    await cache.expire(cacheKey, TTL.CATEGORIES);
    return { status: 200, json: { statusCode: 1, message: "Success", data: cached } };
  }

  const categories = await getCategoriesQuery(queryParams);
  return { status: 200, json: { statusCode: 1, message: "Success", data: categories } };
};

const addCategory = async (data: Omit<CategoryType, "id" | "created_at" | "updated_at">) => {
  const category = await getCategoryBySlugQuery(data.slug);
  if (category) {
    return {
      status: 400,
      json: { statusCode: 0, message: "Category with this slug already exists" },
    };
  }

  const result = await addCategoryQuery(data);

  const categories = await getCategoriesQuery({});
  await cache.set("categories:all", categories, TTL.CATEGORIES);

  return {
    status: 201,
    json: { statusCode: 1, message: "New category has been added", data: result },
  };
};

const editCategory = async (
  id: string,
  data: Omit<CategoryType, "id" | "created_at" | "updated_at">
) => {
  const categoryWithSlug = await getCategoryBySlugQuery(data.slug);
  if (categoryWithSlug) {
    return {
      status: 400,
      json: { statusCode: 0, message: "Category with this slug already exists" },
    };
  }

  const category = await getCategoryByIdQuery(id);
  if (!category) {
    return { status: 404, json: { statusCode: 0, message: "Category does not exist" } };
  }

  const result = await editCategoryQuery(id, data);

  const categories = await getCategoriesQuery({});
  await cache.set("categories:all", categories, TTL.CATEGORIES);

  return { status: 200, json: { statusCode: 1, message: "Updated successfully", data: result } };
};

const deleteCategory = async (id: string) => {
  const category = await getCategoryByIdQuery(id);
  if (!category) {
    return { status: 404, json: { statusCode: 0, message: "Category does not exist" } };
  }
  const deleteId = await deleteCategoryQuery(id);

  const categories = await getCategoriesQuery({});
  await cache.set("categories:all", categories, TTL.CATEGORIES);

  return { status: 200, json: { statusCode: 1, message: "Deleted successfully", data: deleteId } };
};

export default { getCategories, addCategory, editCategory, deleteCategory };
