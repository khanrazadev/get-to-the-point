import type { NextFunction, Request, Response } from "express";
import { answerQuestion } from "../services/rag.service.js";
import {
    createMessage,
    getChatHistory,
    getChatSession,
    getOrCreateChatSession,
} from "../services/chat.service.js";
import { prisma } from "../lib/prisma.js";

export async function chatController(
    req: Request,
    res: Response,
) {
    try {
        const { contentId } = req.params;
        const { question, sessionId } = req.body;

        if (
            typeof contentId !== "string" ||
            typeof question !== "string"
        ) {
            return res.status(400).json({
                message: "contentId and question are required",
            });
        }

        if (
            sessionId !== undefined &&
            typeof sessionId !== "string"
        ) {
            return res.status(400).json({
                message: "sessionId must be a string",
            });
        }

        const user = res.locals.user;

        if (!user) {
            return res.status(500).json({
                message: "Development user not found",
            });
        }

        const session = await getOrCreateChatSession({
            userId: user.id,
            contentId,
            sessionId,
        });

        await createMessage({
            sessionId: session.id,
            role: "USER",
            content: question,
        });

        const history = await getChatHistory(session.id);

        const previousHistory = history.slice(0, -1);

        const result = await answerQuestion(
            contentId,
            question,
            previousHistory,
        );

        await createMessage({
            sessionId: session.id,
            role: "ASSISTANT",
            content: result.answer,
        });

        return res.json({
            ...result,
            sessionId: session.id,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Failed to answer question",
        });
    }
}


export async function getChatSessionController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { contentId } = req.params;

    if (typeof contentId !== "string") {
      return res.status(400).json({
        message: "contentId is required",
      });
    }

    const user = res.locals.user;

    const session = await getChatSession(
      user.id,
      contentId,
    );

    return res.json({
      success: true,
      data: session,
    });
  } catch (error) {
    next(error);
  }
}