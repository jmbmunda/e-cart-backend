import { NextFunction, Request, Response } from "express";
import { config } from "../config/env.config";

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const status = err.status ?? 500;
  const statusCode = err.statusCode ?? 0;
  const message = err.message || "Something went wrong!";
  res.status(status).json({
    statusCode,
    message,
    error: config.app.node_env === "production" ? undefined : err.error,
  });
};
