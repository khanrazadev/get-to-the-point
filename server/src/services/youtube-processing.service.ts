import { updateContentStatus } from "./content.service.js";

import { deleteFile } from "./media.service.js";

import {
  createTranscript,
  transcribeAudio,
} from "./transcription.service.js";

import {
  createSummary,
  generateSummary,
} from "./summary.service.js";

import { storeTranscriptEmbeddings } from "./vector.service.js";

export async function processYouTubeContent(
  contentId: string,
  audioPath: string,
) {
  try {
    await updateContentStatus(
      contentId,
      "PROCESSING",
    );

    const transcription = await transcribeAudio(
      audioPath,
    );

    await createTranscript({
      contentId,
      text: transcription.transcript,
    });

    await storeTranscriptEmbeddings({
      contentId,
      text: transcription.transcript,
    });

    const summary = await generateSummary(
      transcription.transcript,
    );

    await createSummary({
      contentId,
      text: summary,
    });

    await updateContentStatus(
      contentId,
      "COMPLETED",
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message.toLowerCase()
        : "";

    const userMessage =
      errorMessage.includes("login required") ||
      errorMessage.includes("private") ||
      errorMessage.includes("authentication")
        ? "Private Instagram content isn't supported. Please use a public Reel."
        : "We couldn't process this content. Please check the URL and try again.";

    await updateContentStatus(
      contentId,
      "FAILED",
      userMessage,
    );

    console.error(
      `Content processing failed for ${contentId}:`,
      error,
    );
  } finally {
    await deleteFile(audioPath).catch(() => {});
  }
}