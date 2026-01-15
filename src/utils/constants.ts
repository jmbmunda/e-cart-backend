import { OrderStatusType } from "./types";

export const ALLOWED_PRODUCT_SORT_FIELDS = ["price", "name", "created_at"];
export const ALLOWED_ORDERS = ["ASC", "DESC"];

export const ALLOWED_CATEGORY_SORT_FIELDS = ["name", "is_active"];

export const PostgresErrorCodes = {
  UNIQUE_VIOLATION: "23505",
  FOREIGN_KEY_VIOLATION: "23503",
  NOT_NULL_VIOLATION: "23502",
  CHECK_VIOLATION: "23514",
  EXCLUSION_VIOLATION: "23P01",
  INVALID_TEXT_REPRESENTATION: "22P02",
  NUMERIC_VALUE_OUT_OF_RANGE: "22003",
  STRING_DATA_RIGHT_TRUNCATION: "22001",
} as const;

export const TTL = {
  CART: 60 * 60,
  PRODUCTS: 60 * 5,
  CATEGORIES: 60 * 60 * 24,
};

export const ORDER_STATUSES = {
  pending: "pending",
  processing: "processing",
  shipped: "shipped",
  delivered: "delivered",
  completed: "completed",
  cancelled: "cancelled",
} as const;

export const ORDER_STATUS_TRANSITIONS: Record<OrderStatusType, string[]> = {
  pending: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: ["completed"],
  completed: [],
  cancelled: [],
};

export const ORDER_STATUS_MESSAGE: Record<OrderStatusType, string> = {
  pending: "Awaiting confirmation",
  processing: "Order is being processed",
  shipped: "Shipped and on the way",
  delivered: "Delivered successfully",
  completed: "Order completed",
  cancelled: "Order has been cancelled",
};
