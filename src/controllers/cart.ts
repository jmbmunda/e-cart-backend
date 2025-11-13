import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import { sendSuccess } from "../utils/helper";
import { AuthRequestType } from "../utils/types";
import cartService from "../services/cart";

const handleGetCart = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as AuthRequestType).user.id;
  const { message, data } = await cartService.getCartItems(userId);
  return sendSuccess(res, message, data);
});

const handleAddCartItem = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as AuthRequestType).user.id;
  const row = await cartService.addToCart(userId, req.body);
  return sendSuccess(res, "Item added", row);
});

const handleEditCartItem = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, message, data } = await cartService.updateCartItem(id, req.body);
  return sendSuccess(res, message, data, status);
});

export const handleDeleteCartItem = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { message, data } = await cartService.deleteCartItem(id);
  return sendSuccess(res, message, data);
});

export const handleClearCart = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as AuthRequestType).user.id;
  const { message } = await cartService.clearCartItems(userId);
  return sendSuccess(res, message);
});

export default {
  handleGetCart,
  handleAddCartItem,
  handleEditCartItem,
  handleDeleteCartItem,
  handleClearCart,
};
