import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";

const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((error) => {
      if (error.type === "field") {
        return {
          field: error.path,
          message: error.msg,
        };
      }
      return { field: "_", message: error.msg };
    });
    return res.status(422).json({ statusCode: 0, message: "Invalid", errors: formattedErrors });
  }
  next();
};

export default validateRequest;
