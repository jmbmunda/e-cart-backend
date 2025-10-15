import { Request, Response } from "express";
import {
  addProductQuery,
  deleteProductQuery,
  editProductQuery,
  getProductByIdQuery,
  getProductsQuery,
} from "../models/products";
import { ProductFiltersType } from "../utils/types";
import { generateSKU, sendError, sendSuccess } from "../utils/helper";
import { asyncHandler } from "../middlewares/asyncHandler";

const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const queryParams = req.query as unknown as ProductFiltersType;
  const products = await getProductsQuery(queryParams);
  return sendSuccess(res, undefined, products);
});

const getProductById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = await getProductByIdQuery(id);
  if (!data) return sendError(res, "Product does not exist", undefined, 404);
  return sendSuccess(res, "Success", data);
});

const addProduct = asyncHandler(async (req: Request, res: Response) => {
  const prefix = req?.body?.name?.substring(0, 3)?.toUpperCase() || "ECP";
  const sku = req?.body?.sku ?? generateSKU(prefix);
  const data = await addProductQuery({ ...req.body, sku });
  return sendSuccess(res, "Your product has been added!", data, 201);
});

const editProduct = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const product = await getProductByIdQuery(id);
  if (!product) return sendError(res, "Product does not exist", undefined, 404);
  const data = await editProductQuery(id, req.body);
  return sendSuccess(res, "Updated successfully", data);
});

const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const product = await getProductByIdQuery(id);
  if (!product) return sendError(res, "Product does not exist", undefined, 404);
  await deleteProductQuery(id);
  return sendSuccess(res, "Product deleted");
});

export default {
  getProducts,
  getProductById,
  addProduct,
  editProduct,
  deleteProduct,
};
