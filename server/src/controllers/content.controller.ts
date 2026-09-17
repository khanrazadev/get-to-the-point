import type { NextFunction, Request, Response } from "express";

import { prisma } from "../lib/prisma.js";
import { AppError } from "../errors/AppError.js";

import {
  createContent,
  getAllContent,
  getContentById,
  deleteContent,
  updateContentStatus,
} from "../services/content.service.js";

import { deleteFile, extractAudio } from "../services/media.service.js";

import {
  transcribeAudio,
  createTranscript,
} from "../services/transcription.service.js";

import {
  createSummary,
  generateSummary,
} from "../services/summary.service.js";

import { storeTranscriptEmbeddings } from "../services/vector.service.js";

import { downloadYoutubeAudio } from "../services/youtube.service.js";

export async function createContentController(
  req: Request,
  res: Response,
  next: NextFunction,
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
  next: NextFunction,
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
  next: NextFunction,
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
  next: NextFunction,
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

/**
 * Processes an uploaded media file by extracting audio, generating a
 * transcript, generating embeddings and a summary, and persisting the results.
 */
export async function uploadContentController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  let contentId: string | undefined;
  let audioPath: string | undefined;

  try {
    if (!req.file) {
      throw new AppError("Media file is required", 400);
    }

    const content = await createContent({
      type: req.file.mimetype.startsWith("audio/")
        ? "AUDIO"
        : "VIDEO",
      filePath: req.file.path,
      title: req.file.originalname,
    });

    contentId = content.id;

    await updateContentStatus(content.id, "PROCESSING");

    audioPath = await extractAudio(req.file.path);

    const transcription = await transcribeAudio(audioPath);

    await createTranscript({
      contentId: content.id,
      text: transcription.transcript,
    });

    await storeTranscriptEmbeddings({
      contentId: content.id,
      text: transcription.transcript,
    });

    const summary = await generateSummary(
      transcription.transcript,
    );

    await createSummary({
      contentId: content.id,
      text: summary,
    });

    await updateContentStatus(content.id, "COMPLETED");

    const completedContent =
      await prisma.content.findUniqueOrThrow({
        where: {
          id: content.id,
        },
      });

    res.status(201).json({
      success: true,
      data: completedContent,
    });
  } catch (error) {
    if (contentId) {
      await updateContentStatus(contentId, "FAILED");
    }

    next(error);
  } finally {
    if (audioPath) {
      await deleteFile(audioPath).catch(() => {});
    }
  }
}

export async function youtubeContentController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  let contentId: string | undefined;
  let audioPath: string | undefined;

  try {
    const { url } = req.body;

    if (typeof url !== "string" || !url.trim()) {
      throw new AppError("YouTube URL is required", 400);
    }

    audioPath = await downloadYoutubeAudio(url);

    const content = await createContent({
      type: "YOUTUBE",
      sourceUrl: url,
      filePath: audioPath,
    });

    contentId = content.id;

    await updateContentStatus(content.id, "PROCESSING");

    const transcription = await transcribeAudio(audioPath);

    await createTranscript({
      contentId: content.id,
      text: transcription.transcript,
    });

    await storeTranscriptEmbeddings({
      contentId: content.id,
      text: transcription.transcript,
    });

    const summary = await generateSummary(
      transcription.transcript,
    );

    await createSummary({
      contentId: content.id,
      text: summary,
    });

    await updateContentStatus(content.id, "COMPLETED");

    const completedContent =
      await prisma.content.findUniqueOrThrow({
        where: {
          id: content.id,
        },
      });

    res.status(201).json({
      success: true,
      data: completedContent,
    });
  } catch (error) {
    if (contentId) {
      await updateContentStatus(contentId, "FAILED");
    }

    next(error);
  } finally {
    if (audioPath) {
      await deleteFile(audioPath).catch(() => {});
    }
  }
}