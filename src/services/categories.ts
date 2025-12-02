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
import { makeCacheKey } from "../utils/helper";
import { CategoriesFiltersType, CategoryType } from "../utils/types";

const getCategories = async (queryParams: CategoriesFiltersType) => {
  const cacheKey = makeCacheKey("categories", "list", queryParams);
  const categories = await cache.getOrFetch(cacheKey, () => getCategoriesQuery(queryParams), {
    shouldSetCache: false,
    ttl: TTL.CATEGORIES,
    ttlStrategy: "sliding",
  });

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

  await cache.delPrefix("categories:list");

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

  await cache.delPrefix("categories:list");

  return { status: 200, json: { statusCode: 1, message: "Updated successfully", data: result } };
};

const deleteCategory = async (id: string) => {
  const category = await getCategoryByIdQuery(id);
  if (!category) {
    return { status: 404, json: { statusCode: 0, message: "Category does not exist" } };
  }
  const deleteId = await deleteCategoryQuery(id);

  await cache.delPrefix("categories:list");

  return { status: 200, json: { statusCode: 1, message: "Deleted successfully", data: deleteId } };
};

export default { getCategories, addCategory, editCategory, deleteCategory };
