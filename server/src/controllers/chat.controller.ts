import type { Request, Response } from "express";
import { answerQuestion } from "../services/rag.service.js";

export async function chatController(
  req: Request,
  res: Response,
) {
  try {
    const { contentId } = req.params;
    const { question } = req.body;

    if (
      typeof contentId !== "string" ||
      typeof question !== "string"
    ) {
      return res.status(400).json({
        message: "contentId and question are required",
      });
    }

    const result = await answerQuestion(
      contentId,
      question,
    );

    return res.json(result);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to answer question",
    });
  }
}