import { NextFunction, Request, Response } from "express";
import { config } from "../config/env.config";

export const errorHandler = async (err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Something went wrong!";
  res.status(statusCode).json({
    statusCode: 0,
    message,
    error: config.app.node_env === "production" ? undefined : err,
  });
};
