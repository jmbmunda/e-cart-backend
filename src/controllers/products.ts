import { Request, Response } from "express";
import {
  addProductQuery,
  deleteProductQuery,
  editProductQuery,
  getProductQuery,
  getProductsQuery,
} from "../models/products";
import { FiltersType } from "../utils/types";
import { generateSKU } from "../utils/helper";

const getProducts = async (req: Request, res: Response) => {
  try {
    const queryParams = req.query as unknown as FiltersType;
    // Perform a query
    const products = await getProductsQuery(queryParams);
    return res.status(200).json({ statusCode: 1, message: "Success", data: products });
  } catch (error) {
    return res.status(500).json({
      statusCode: 0,
      message: "Something went wrong",
      error,
    });
  }
};

const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = await getProductQuery(id);
    return res.status(200).json({ statusCode: 1, message: "Success", data });
  } catch (error) {
    return res.status(500).json({ statusCode: 0, message: "Something went wrong", error });
  }
};

const addProduct = async (req: Request, res: Response) => {
  try {
    const prefix = req?.body?.name?.substring(0, 3).toUpperCase() || "ECP";
    const sku = req?.body?.sku ?? generateSKU(prefix);
    const data = await addProductQuery({ ...req.body, sku });
    return res.status(201).json({ statusCode: 1, message: "Your product has been added!", data });
  } catch (error) {
    return res.status(500).json({
      statusCode: 0,
      message: "Something went wrong",
      error,
    });
  }
};

const editProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // Check if the product exist
    const product = await getProductQuery(id);
    if (!product.length) {
      return res.status(200).json({ statusCode: 0, message: "Product does not exist" });
    }
    // Perform a query
    const data = await editProductQuery(id, req.body);
    return res.status(200).json({ statusCode: 1, message: "Success", data });
  } catch (error) {
    return res.status(500).json({
      statusCode: 0,
      message: "Something went wrong",
      error,
    });
  }
};

const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // Check if the product exists
    const product = await getProductQuery(id);
    if (!product.length) {
      return res.status(200).json({ statusCode: 0, message: "Product does not exist" });
    }
    // Perform a query
    await deleteProductQuery(id);
    return res.status(200).json({
      statusCode: 1,
      message: "Successfully deleted the product",
    });
  } catch (error) {
    return res.status(500).json({
      statusCode: 0,
      message: "Something went wrong",
      error,
    });
  }
};

export default {
  getProducts,
  getProductById,
  addProduct,
  editProduct,
  deleteProduct,
};
