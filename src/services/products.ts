import {
  addProductQuery,
  deleteProductQuery,
  editProductQuery,
  getProductByIdQuery,
  getProductsQuery,
} from "../models/products";
import { generateSKU } from "../utils/helper";
import { ProductFiltersType, ProductType } from "../utils/types";

const getAllProducts = async (queryParams?: ProductFiltersType) => {
  const products = await getProductsQuery(queryParams);
  return { status: 200, json: { statusCode: 1, message: "Success", data: products } };
};

const getProductById = async (id: string) => {
  const product = await getProductByIdQuery(id);
  if (!product) return { status: 404, json: { statusCode: 0, message: "Product does not exist" } };
  return { status: 200, json: { statusCode: 1, message: "Success", data: product } };
};

const addProduct = async (data: ProductType) => {
  const prefix = data?.name?.substring(0, 3)?.toUpperCase() || "ECP";
  const sku = data?.sku ?? generateSKU(prefix);
  const row = await addProductQuery({ ...data, sku });
  return { status: 200, json: { statusCode: 1, message: "Success", data: row } };
};

const editProduct = async (id: string, data: ProductType) => {
  const product = await getProductByIdQuery(id);
  if (!product) return { status: 404, json: { statusCode: 0, message: "Product does not exist" } };
  const row = await editProductQuery(id, data);
  return { status: 200, json: { statusCode: 1, message: "Updated successfully", data: row } };
};

const deleteProduct = async (id: string) => {
  const product = await getProductByIdQuery(id);
  if (!product) return { status: 404, json: { statusCode: 0, message: "Product does not exist" } };
  const deletedId = await deleteProductQuery(id);
  return { status: 200, json: { statusCode: 1, message: "Deleted successfully", data: deletedId } };
};

export default { getAllProducts, getProductById, addProduct, editProduct, deleteProduct };
