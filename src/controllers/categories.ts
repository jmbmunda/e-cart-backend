import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import { sendSuccess } from "../utils/helper";
import categoriesService from "../services/categories";

const handleGetCategories = asyncHandler(async (req: Request, res: Response) => {
  const queryParams = req.query;
  const { status, json } = await categoriesService.getCategories(queryParams);
  return sendSuccess(res, json.message, json.data, status, json.statusCode, {}, json.meta);
});

export const handleAddCategory = asyncHandler(async (req: Request, res: Response) => {
  const { status, json } = await categoriesService.addCategory(req.body);
  return sendSuccess(res, json.message, json.data, status, json.statusCode);
});

export const handleEditCategory = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, json } = await categoriesService.editCategory(id, req.body);
  return sendSuccess(res, json.message, json.data, status, json.statusCode);
});

export const handleDeleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, json } = await categoriesService.deleteCategory(id);
  return sendSuccess(res, json.message, json.data, status, json.statusCode);
});

export default { handleGetCategories, handleAddCategory, handleEditCategory, handleDeleteCategory };
