import { NextFunction, Request, Response } from "express";

export const errorHandler = async (err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Something went wrong!";
  res
    .status(statusCode)
    .json({
      statusCode: 0,
      message,
      error: process.env.NODE_ENV === "production" ? undefined : err,
    });
};
