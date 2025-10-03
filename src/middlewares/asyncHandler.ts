import { NextFunction, Request, Response } from "express";
import { sendError } from "../utils/helper";

export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((error) =>
      sendError(res, error.error, error.message, error.status, error.statusCode)
    );
  };
};
