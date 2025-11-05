import { NextFunction, Request, RequestHandler, Response } from "express";
import { sendError } from "../utils/helper";
import { JWTUserDataType } from "../utils/types";

export const authorizeRoles = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user: JWTUserDataType = (req as any).user;

    if (!user) return sendError(res, "Unauthorized", undefined, 401);

    if (!roles.includes(user.role!.name)) {
      return sendError(res, "Access Denied", undefined, 403);
    }

    next();
  };
};
