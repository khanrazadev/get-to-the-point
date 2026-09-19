import type { NextFunction, Request, Response } from "express";

import multer from "multer";

import { AppError } from "../errors/AppError.js";

export function errorMiddleware(
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  console.error(error);

  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      res.status(400).json({
        success: false,
        message: "File size must be 100MB or less",
      });
      return;
    }

    res.status(400).json({
      success: false,
      message: error.message,
    });
    return;
  }

  if (error instanceof Error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
    return;
  }



  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
}