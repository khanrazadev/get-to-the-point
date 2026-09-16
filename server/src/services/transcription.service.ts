import fs from "node:fs/promises";
import path from "node:path";
import { prisma } from "../lib/prisma.js";

const SARVAM_API_URL = "https://api.sarvam.ai/speech-to-text";


type CreateTranscriptInput = {
  contentId: string;
  text: string;
  language?: string;
};

export async function createTranscript(data: CreateTranscriptInput) {
  return prisma.transcript.create({
    data: {
      contentId: data.contentId,
      text: data.text,
      language: data.language ?? null,
    },
  });
}

export async function transcribeAudio(filePath: string) {
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

