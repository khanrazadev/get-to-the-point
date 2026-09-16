import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError.js";
import { createContent, getAllContent, getContentById, deleteContent } from "../services/content.service.js";
import { extractAudio } from "../services/media.service.js";
import { transcribeAudio } from "../services/transcription.service.js";

export async function createContentController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const content = await createContent(req.body);

    res.status(201).json({
      success: true,
      data: content,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAllContentController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const content = await getAllContent();

    res.status(200).json({
      success: true,
      data: content,
    });
  } catch (error) {
    next(error);
  }
}


export async function getContentByIdController(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const content = await getContentById(req.params.id);

    if (!content) {
      throw new AppError("Content not found", 404);
    }

    res.status(200).json({
      success: true,
      data: content,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteContentController(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const content = await deleteContent(req.params.id);

    res.status(200).json({
      success: true,
      data: content,
    });
  } catch (error) {
    next(error);
  }
}


export async function uploadContentController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.file) {
      throw new AppError("Media file is required", 400);
    }

    const audioPath = await extractAudio(req.file.path);
    const transcription = await transcribeAudio(audioPath);

    console.log("Audio extracted:", audioPath);
    console.log("Transcription:", transcription);

    const content = await createContent({
      type: req.file.mimetype.startsWith("audio/")
        ? "AUDIO"
        : "VIDEO",
      filePath: req.file.path,
      title: req.file.originalname,
    });

    res.status(201).json({
      success: true,
      data: {
        content,
        transcription
      },
    });
  } catch (error) {
    next(error);
  }
}