import {
  addProductQuery,
  deleteProductQuery,
  editProductQuery,
  getProductByIdQuery,
  getProductsQuery,
} from "../models/products";
import cache from "../utils/cache";
import { TTL } from "../utils/constants";
import { generateSKU } from "../utils/helper";
import { ProductFiltersType, ProductType } from "../utils/types";

const getAllProducts = async (queryParams?: ProductFiltersType) => {
  const cacheKey = `products:all`;

  const cached = await cache.get(cacheKey);
  if (cached) {
    await cache.expire(cacheKey, TTL.PRODUCTS);
    return { status: 200, json: { statusCode: 1, message: "Success", data: cached } };
  }

  const products = await getProductsQuery(queryParams);
  await cache.set(cacheKey, products, TTL.PRODUCTS);

  return { status: 200, json: { statusCode: 1, message: "Success", data: products } };
};

const getProductById = async (id: string) => {
  const cacheKey = `products:${id}`;
  const product = await cache.getOrFetch(cacheKey, () => getProductByIdQuery(id), {
    shouldSetCache: true,
    ttl: TTL.PRODUCTS,
  });

  if (!product) return { status: 404, json: { statusCode: 0, message: "Product does not exist" } };
  return { status: 200, json: { statusCode: 1, message: "Success", data: product } };
};

const addProduct = async (data: ProductType) => {
  const prefix = data?.name?.substring(0, 3)?.toUpperCase() || "ECP";
  const sku = data?.sku ?? generateSKU(prefix);
  const addedProduct = await addProductQuery({ ...data, sku });
  await cache.set(`products:${addedProduct.id}`, addedProduct, TTL.PRODUCTS);

  const products = await getProductsQuery();
  await cache.set(`products:all`, products, TTL.PRODUCTS);

  return { status: 200, json: { statusCode: 1, message: "Success", data: addedProduct } };
};

const editProduct = async (id: string, data: ProductType) => {
  const product = await getProductByIdQuery(id);
  if (!product) return { status: 404, json: { statusCode: 0, message: "Product does not exist" } };
  const editedProduct = await editProductQuery(id, data);
  await cache.set(`products:${id}`, editedProduct, TTL.PRODUCTS);

  const products = await getProductsQuery();
  await cache.set(`products:all`, products, TTL.PRODUCTS);

  return {
    status: 200,
    json: { statusCode: 1, message: "Updated successfully", data: editedProduct },
  };
};

const deleteProduct = async (id: string) => {
  const product = await getProductByIdQuery(id);
  if (!product) return { status: 404, json: { statusCode: 0, message: "Product does not exist" } };
  const deletedId = await deleteProductQuery(id);
  await cache.del(`products:${id}`);

  const products = await getProductsQuery();
  await cache.set(`products:all`, products, TTL.PRODUCTS);

  return { status: 200, json: { statusCode: 1, message: "Deleted successfully", data: deletedId } };
};

export default { getAllProducts, getProductById, addProduct, editProduct, deleteProduct };
