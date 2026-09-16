import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";
import { AppError } from "../errors/AppError.js";

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const message = result.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join(", ");

      throw new AppError(message, 400);
    }

    req.body = result.data;
    next();
  };
}