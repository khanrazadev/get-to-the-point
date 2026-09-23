import type { NextFunction, Request, Response } from "express";

import { prisma } from "../lib/prisma.js";

import { AppError } from "../errors/AppError.js";

import {
  createContent,
  getAllContent,
  getContentById,
  deleteContent,
  updateContentStatus,
  findContentByUrl,
} from "../services/content.service.js";

import {
  deleteFile,
  extractAudio,
} from "../services/media.service.js";

import {
  transcribeAudio,
  createTranscript,
} from "../services/transcription.service.js";

import {
  createSummary,
  generateSummary,
} from "../services/summary.service.js";

import {
  storeTranscriptEmbeddings,
} from "../services/vector.service.js";

import {
  processYouTubeContent,
} from "../services/youtube-processing.service.js";

import {
  downloadMedia,
} from "../services/youtube.service.js";
import { normalizeContentUrl } from "../utils/url.util.js";

export async function createContentController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = res.locals.user;

    const content = await createContent(
      user.id,
      req.body,
    );

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
    const user = res.locals.user;

    const content = await getAllContent(user.id);

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
    const user = res.locals.user;

    const content = await getContentById(
      user.id,
      req.params.id,
    );

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
    const user = res.locals.user;

    const content = await deleteContent(
      user.id,
      req.params.id,
    );

    if (content.count === 0) {
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

/**
 * Processes an uploaded media file and persists its transcript,
 * embeddings, and summary.
 */
export async function uploadContentController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  let contentId: string | undefined;
  let audioPath: string | undefined;
  let uploadedFilePath: string | undefined;

  try {
    if (!req.file) {
      throw new AppError(
        "Media file is required",
        400,
      );
    }

    const user = res.locals.user;

    uploadedFilePath = req.file.path;

    const content = await createContent(user.id, {
      type: req.file.mimetype.startsWith("audio/")
        ? "AUDIO"
        : "VIDEO",
      filePath: uploadedFilePath,
      title: req.file.originalname,
    });

    contentId = content.id;

    await updateContentStatus(
      content.id,
      "PROCESSING",
    );

    audioPath = await extractAudio(
      uploadedFilePath,
    );

    const transcription =
      await transcribeAudio(audioPath);

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

    await updateContentStatus(
      content.id,
      "COMPLETED",
    );

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
      await updateContentStatus(
        contentId,
        "FAILED",
      );
    }

    next(error);
  } finally {
    if (audioPath) {
      await deleteFile(audioPath).catch(() => { });
    }

    if (uploadedFilePath) {
      await deleteFile(uploadedFilePath).catch(() => { });
    }

    if (contentId) {
      await prisma.content
        .update({
          where: {
            id: contentId,
          },
          data: {
            filePath: null,
          },
        })
        .catch(() => { });
    }
  }
}

function getUrlContentType(
  url: string,
): "YOUTUBE" | "INSTAGRAM" {
  try {
    const parsedUrl = new URL(url);

    if (
      parsedUrl.hostname === "youtube.com" ||
      parsedUrl.hostname === "www.youtube.com" ||
      parsedUrl.hostname === "m.youtube.com" ||
      parsedUrl.hostname === "youtu.be"
    ) {
      return "YOUTUBE";
    }

    if (
      parsedUrl.hostname === "instagram.com" ||
      parsedUrl.hostname === "www.instagram.com"
    ) {
      return "INSTAGRAM";
    }
  } catch {
    throw new AppError("Invalid URL", 400);
  }

  throw new AppError(
    "Only YouTube and Instagram URLs are supported",
    400,
  );
}
export async function urlContentController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  let audioPath: string | undefined;

  try {
    const { url } = req.body;

    if (
      typeof url !== "string" ||
      !url.trim()
    ) {
      throw new AppError(
        "YouTube or Instagram URL is required",
        400,
      );
    }

    const cleanUrl = url.trim();
    const contentType = getUrlContentType(cleanUrl);
    const normalizedUrl = normalizeContentUrl(cleanUrl);
    const user = res.locals.user;

    const existingContent = await findContentByUrl(
      user.id,
      normalizedUrl,
    );

    if (existingContent) {
      throw new AppError(
        "This content has already been added to your library.",
        409,
      );
    }

    try {
      audioPath = await downloadMedia(cleanUrl);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message.toLowerCase()
          : "";

      if (
        contentType === "INSTAGRAM" &&
        (
          message.includes("login required") ||
          message.includes("private") ||
          message.includes("authentication")
        )
      ) {
        throw new AppError(
          "Private Instagram content isn't supported. Please use a public Reel.",
          400,
        );
      }

      throw new AppError(
        "We couldn't access this content. Please check the URL and try again.",
        400,
      );
    }

    const content = await createContent(user.id, {
      type: contentType,
      sourceUrl: normalizedUrl,
    });

    void processYouTubeContent(
      content.id,
      audioPath,
    );

    res.status(202).json({
      success: true,
      data: content,
    });

    audioPath = undefined;
  } catch (error) {
    if (audioPath) {
      await deleteFile(audioPath).catch(() => { });
    }

    next(error);
  }
}