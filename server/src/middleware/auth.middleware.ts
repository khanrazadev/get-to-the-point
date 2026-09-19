import type { NextFunction, Request, Response } from "express";
import { getAuth } from "@clerk/express";

import { prisma } from "../lib/prisma.js";
import { AppError } from "../errors/AppError.js";

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }

    const user = await prisma.user.upsert({
      where: {
        clerkId: userId,
      },
      update: {},
      create: {
        clerkId: userId,
        email: null,
      },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    res.locals.user = user;

    next();
  } catch (error) {
    next(error);
  }
}