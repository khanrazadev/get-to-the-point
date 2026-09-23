import { prisma } from "../lib/prisma.js";

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

import { downloadMedia } from "./youtube.service.js";

export async function processYouTubeContent(
  contentId: string,
  url: string,
) {
  let audioPath: string | undefined;

  try {
    await updateContentStatus(contentId, "PROCESSING");

    audioPath = await downloadMedia(url);

    const transcription = await transcribeAudio(audioPath);

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

    await updateContentStatus(contentId, "COMPLETED");
  } catch (error) {
    await updateContentStatus(contentId, "FAILED");

    console.error(
      `YouTube processing failed for ${contentId}:`,
      error,
    );
  } finally {
    if (audioPath) {
      await deleteFile(audioPath).catch(() => {});
    }
  }
}