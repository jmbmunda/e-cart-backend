import pool from "../config/db";
import cache from "../utils/cache";
import { mapOrdersToResponse } from "../mappers";
import {
  addOrderItemQuery,
  addOrderQuery,
  getOrderByIdQuery,
  getOrdersQuery,
  updateOrderStatusQuery,
} from "../models/orders";
import { editProductQuery, getProductByIdQuery } from "../models/products";
import { AppError } from "../utils/AppError";
import { OrderFiltersType, OrderItemType, OrderStatusType } from "../utils/types";
import { ORDER_STATUS_MESSAGE, ORDER_STATUS_TRANSITIONS, ORDER_STATUSES } from "../utils/constants";

const getOrders = async (queryParams?: OrderFiltersType) => {
  const result = await getOrdersQuery(queryParams);
  const orders = result.map(mapOrdersToResponse);
  return {
    status: 200,
    json: { statusCode: 1, message: "Success", data: orders },
  };
};

const addOrder = async ({
  userId,
  items,
}: {
  userId: string;
  items: Pick<OrderItemType, "product_id" | "quantity">[];
}) => {
  try {
    await pool.query("BEGIN");

    const products = await Promise.all(items.map((item) => getProductByIdQuery(item.product_id)));
    const productMap = new Map(products.map((product) => [product.id, product]));
    const totalAmount = items.reduce((sum, item) => {
      const product = productMap.get(item.product_id);
      if (!product) throw new AppError({ message: "Product not found", statusCode: 400 });
      return sum + +product.price * item.quantity;
    }, 0);

    const order = await addOrderQuery({
      user_id: userId,
      status: "pending",
      total_amount: totalAmount,
    });

    for (const item of items) {
      const product = productMap.get(item.product_id);
      if (!product) throw new AppError({ message: "Product not found", statusCode: 400 });
      await addOrderItemQuery({
        order_id: order.id,
        product_id: product.id,
        quantity: item.quantity,
        price: +product.price,
      });

      await editProductQuery(product.id, {
        ...product,
        price: +product.price,
        stock: product.stock - item.quantity,
      });
      await cache.delPrefix("products");
    }

    await pool.query("COMMIT");

    return {
      status: 200,
      json: { statusCode: 1, message: "Order added successfully", data: { id: order.id } },
    };
  } catch (error) {
    await pool.query("ROLLBACK");
    throw error;
  }
};

const transitionOrder = async (id: string, status: OrderStatusType) => {
  const order = await getOrderByIdQuery(id);

  if (!order) {
    return {
      status: 404,
      json: { statusCode: 0, message: "Order not found" },
    };
  }

  const isAllowed = ORDER_STATUS_TRANSITIONS[order.status].includes(status);
  if (!isAllowed) {
    return {
      status: 400,
      json: {
        statusCode: 0,
        message: `Invalid transition: cannot move from '${order.status}' to '${status}' directly.`,
      },
    };
  }

  const updatedOrder = await updateOrderStatusQuery(id, status);

  return {
    status: 200,
    json: {
      statusCode: 1,
      message: ORDER_STATUS_MESSAGE[status],
      data: { ...updatedOrder, total_amount: +updatedOrder.total_amount },
    },
  };
};

const processOrder = async (id: string) => transitionOrder(id, ORDER_STATUSES.processing);
const shipOrder = async (id: string) => transitionOrder(id, ORDER_STATUSES.shipped);
const deliverOrder = async (id: string) => transitionOrder(id, ORDER_STATUSES.delivered);
const completeOrder = async (id: string) => transitionOrder(id, ORDER_STATUSES.completed);
const cancelOrder = async (id: string) => transitionOrder(id, ORDER_STATUSES.cancelled);

export default {
  getOrders,
  addOrder,
  processOrder,
  shipOrder,
  deliverOrder,
  completeOrder,
  cancelOrder,
};
