import fs from "node:fs/promises";
import path from "node:path";

import { prisma } from "../lib/prisma.js";
import { splitAudioIntoChunks, deleteFile } from "./media.service.js";

const SARVAM_API_URL = "https://api.sarvam.ai/speech-to-text";

type CreateTranscriptInput = {
  contentId: string;
  text: string;
  language?: string;
};

export async function createTranscript(data: CreateTranscriptInput) {
  return prisma.transcript.upsert({
    where: {
      contentId: data.contentId,
    },
    update: {
      text: data.text,
      language: data.language ?? null,
    },
    create: {
      contentId: data.contentId,
      text: data.text,
      language: data.language ?? null,
    },
  });
}

async function transcribeChunk(filePath: string) {
  const apiKey = process.env.SARVAM_API_KEY;

  if (!apiKey) {
    throw new Error("SARVAM_API_KEY is not defined");
  }

  const fileBuffer = await fs.readFile(filePath);
  const fileName = path.basename(filePath);

  const formData = new FormData();

  formData.append(
    "file",
    new Blob([fileBuffer]),
    fileName,
  );

  formData.append("model", "saaras:v3");
  formData.append("mode", "transcribe");

  const response = await fetch(SARVAM_API_URL, {
    method: "POST",
    headers: {
      "api-subscription-key": apiKey,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();

    throw new Error(`Sarvam transcription failed: ${error}`);
  }

  return response.json();
}

export async function transcribeAudio(filePath: string) {
  const chunks = await splitAudioIntoChunks(filePath);

  try {
    const CONCURRENCY = 3;
    const transcripts: string[] = [];

    for (let i = 0; i < chunks.length; i += CONCURRENCY) {
      const batch = chunks.slice(i, i + CONCURRENCY);

      const results = await Promise.all(
        batch.map((chunk) => transcribeChunk(chunk)),
      );

      transcripts.push(
        ...results.map((result) => result.transcript),
      );
    }

    return {
      transcript: transcripts.join(" "),
    };
  } finally {
    await Promise.all(
      chunks.map((chunk) =>
        deleteFile(chunk).catch(() => {}),
      ),
    );
  }
}