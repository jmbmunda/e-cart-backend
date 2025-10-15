import { Request, Response } from "express";
import {
  addCategoryQuery,
  deleteCategoryQuery,
  editCategoryQuery,
  getCategoriesQuery,
  getCategoryByIdQuery,
} from "../models/categories";
import { asyncHandler } from "../middlewares/asyncHandler";
import { sendError, sendSuccess } from "../utils/helper";

const getCategories = asyncHandler(async (req: Request, res: Response) => {
  const queryParams = req.query;
  const categories = await getCategoriesQuery(queryParams);
  return sendSuccess(res, "Success", categories);
});

export const addCategory = asyncHandler(async (req: Request, res: Response) => {
  const result = await addCategoryQuery(req.body);
  return sendSuccess(res, "New category has been added", result, 201);
});

export const editCategory = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const category = await getCategoryByIdQuery(id);
  if (!category) return sendError(res, "Category does not exist", undefined, 404);
  const result = await editCategoryQuery(id, req.body);
  return sendSuccess(res, "Updated successfully", result);
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const category = await getCategoryByIdQuery(id);
  if (!category) return sendError(res, "Category does not exist", undefined, 404);
  await deleteCategoryQuery(id);
  return sendSuccess(res, "Category deleted");
});

export default { getCategories, addCategory, editCategory, deleteCategory };
