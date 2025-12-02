import {
  addProductQuery,
  deleteProductQuery,
  editProductQuery,
  getProductByIdQuery,
  getProductsQuery,
} from "../models/products";
import cache from "../utils/cache";
import { TTL } from "../utils/constants";
import { generateSKU, makeCacheKey } from "../utils/helper";
import { ProductFiltersType, ProductType } from "../utils/types";

const getAllProducts = async (queryParams?: ProductFiltersType) => {
  const cacheKey = makeCacheKey("products", "list", queryParams);
  const products = await cache.getOrFetch(cacheKey, () => getProductsQuery(queryParams), {
    shouldSetCache: true,
    ttl: TTL.PRODUCTS,
    ttlStrategy: "sliding",
  });
  return { status: 200, json: { statusCode: 1, message: "Success", data: products } };
};

const getProductById = async (id: string) => {
  const cacheKey = makeCacheKey("products", "item", { id });
  const product = await cache.getOrFetch(cacheKey, () => getProductByIdQuery(id), {
    shouldSetCache: true,
    ttl: TTL.PRODUCTS,
    ttlStrategy: "sliding",
  });

  if (!product) return { status: 404, json: { statusCode: 0, message: "Product does not exist" } };
  return { status: 200, json: { statusCode: 1, message: "Success", data: product } };
};

const addProduct = async (data: ProductType) => {
  const prefix = data?.name?.substring(0, 3)?.toUpperCase() || "ECP";
  const sku = data?.sku ?? generateSKU(prefix);
  const addedProduct = await addProductQuery({ ...data, sku });

  const cacheKey = makeCacheKey("products", "item", { id: addedProduct.id });
  await cache.set(cacheKey, addedProduct, TTL.PRODUCTS);
  await cache.delPrefix(`products:list`);

  return { status: 200, json: { statusCode: 1, message: "Success", data: addedProduct } };
};

const editProduct = async (id: string, data: ProductType) => {
  const product = await getProductByIdQuery(id);
  if (!product) return { status: 404, json: { statusCode: 0, message: "Product does not exist" } };
  const editedProduct = await editProductQuery(id, data);

  const cacheKey = makeCacheKey("products", "item", { id });
  await cache.set(cacheKey, editedProduct, TTL.PRODUCTS);
  await cache.delPrefix("products:list");

  return {
    status: 200,
    json: { statusCode: 1, message: "Updated successfully", data: editedProduct },
  };
};

const deleteProduct = async (id: string) => {
  const product = await getProductByIdQuery(id);
  if (!product) return { status: 404, json: { statusCode: 0, message: "Product does not exist" } };
  const deletedId = await deleteProductQuery(id);

  const cacheKey = makeCacheKey("products", "item", { id });
  await cache.del(cacheKey);
  await cache.delPrefix("products:list");

  return { status: 200, json: { statusCode: 1, message: "Deleted successfully", data: deletedId } };
};

export default { getAllProducts, getProductById, addProduct, editProduct, deleteProduct };
