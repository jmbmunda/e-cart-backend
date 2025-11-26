import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import { sendSuccess } from "../utils/helper";
import { AuthRequestType } from "../utils/types";
import cartService from "../services/cart";

const handleGetCart = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as AuthRequestType).user.id;
  const { status, json } = await cartService.getCartItems(userId);
  return sendSuccess(res, json.message, json.data, status, json.statusCode);
});

const handleAddCartItem = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as AuthRequestType).user.id;
  const { status, json } = await cartService.addToCart(userId, req.body);
  return sendSuccess(res, json.message, json.data, status, json.statusCode);
});

const handleEditCartItem = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as AuthRequestType).user.id;
  const { status, json } = await cartService.updateCartItem(id, userId, req.body);
  return sendSuccess(res, json.message, json.data, status, json.statusCode);
});

export const handleDeleteCartItem = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as AuthRequestType).user.id;
  const { status, json } = await cartService.deleteCartItem(id, userId);
  return sendSuccess(res, json.message, json.data, status, json.statusCode);
});

export const handleClearCart = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as AuthRequestType).user.id;
  const { status, json } = await cartService.clearCartItems(userId);
  return sendSuccess(res, json.message, undefined, status, json.statusCode);
});

export default {
  handleGetCart,
  handleAddCartItem,
  handleEditCartItem,
  handleDeleteCartItem,
  handleClearCart,
};
