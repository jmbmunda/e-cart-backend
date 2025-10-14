import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/env.config";

const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const bearerToken = req.headers["authorization"];
  const token = bearerToken?.split(" ")[1];

  if (!token) return res.status(401).json({ statusCode: 0, message: "Token not provided" });

  try {
    const decoded = jwt.verify(token, config.token.secret!);
    (req as any).user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({ statusCode: 0, message: "Invalid token" });
  }
};

export default verifyToken;
