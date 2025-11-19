import { Request, Response } from "express";
import { ProductFiltersType } from "../utils/types";
import { sendError, sendSuccess } from "../utils/helper";
import { asyncHandler } from "../middlewares/asyncHandler";
import productsService from "../services/products";

const handleGetProducts = asyncHandler(async (req: Request, res: Response) => {
  const queryParams = req.query as unknown as ProductFiltersType;
  const { status, json } = await productsService.getAllProducts(queryParams);
  return sendSuccess(res, json.message, json.data, status, json.statusCode);
});

const handleGetProductById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const { status, json } = await productsService.getProductById(id);
  const { statusCode, message, data } = json;

  if (statusCode === 0) {
    return sendError(res, message, undefined, status, statusCode);
  }
  return sendSuccess(res, message, data, status, statusCode);
});

const handleAddProduct = asyncHandler(async (req: Request, res: Response) => {
  const { status, json } = await productsService.addProduct(req.body);
  return sendSuccess(res, json.message, json.data, status, json.statusCode);
});

const handleEditProduct = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, json } = await productsService.editProduct(id, req.body);
  return sendSuccess(res, json.message, json.data, status, json.statusCode);
});

const handleDeleteProduct = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, json } = await productsService.deleteProduct(id);
  return sendSuccess(res, json.message, json.data, status, json.statusCode);
});

export default {
  handleGetProducts,
  handleGetProductById,
  handleAddProduct,
  handleEditProduct,
  handleDeleteProduct,
};
