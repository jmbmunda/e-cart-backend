import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import { sendSuccess } from "../utils/helper";
import ordersService from "../services/orders";
import { AuthRequestType } from "../utils/types";

const handleGetOrders = asyncHandler(async (req: Request, res: Response) => {
  const queryParams = req.query;
  const result = await ordersService.getOrders(queryParams);
  return sendSuccess(
    res,
    result.json.message,
    result.json.data,
    result.status,
    result.json.statusCode
  );
});

const handleAddOrder = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as AuthRequestType).user.id;
  const { items } = req.body;
  const result = await ordersService.addOrder({ userId, items });
  return sendSuccess(
    res,
    result.json.message,
    result.json.data,
    result.status,
    result.json.statusCode
  );
});

const handleProcessOrder = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, json } = await ordersService.processOrder(id);
  return sendSuccess(res, json.message, json.data, status, json.statusCode);
});

const handleShipOrder = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, json } = await ordersService.shipOrder(id);
  return sendSuccess(res, json.message, json.data, status, json.statusCode);
});

const handleDeliverOrder = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, json } = await ordersService.deliverOrder(id);
  return sendSuccess(res, json.message, json.data, status, json.statusCode);
});

const handleCompleteOrder = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, json } = await ordersService.completeOrder(id);
  return sendSuccess(res, json.message, json.data, status, json.statusCode);
});

const handleCancelOrder = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, json } = await ordersService.cancelOrder(id);
  return sendSuccess(res, json.message, json.data, status, json.statusCode);
});

export default {
  handleGetOrders,
  handleAddOrder,
  handleProcessOrder,
  handleShipOrder,
  handleDeliverOrder,
  handleCompleteOrder,
  handleCancelOrder,
};
