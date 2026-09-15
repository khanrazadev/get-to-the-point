import { Request, Response } from "express";
import { createContent } from "../services/content.service.js";

export async function createContentController(
  req: Request,
  res: Response
) {
  try {
    const content = await createContent(req.body);

    res.status(201).json({
      success: true,
      data: content,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to create content",
    });
  }
}