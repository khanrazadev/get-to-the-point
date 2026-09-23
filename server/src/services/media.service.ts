import { execFile } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs/promises";
import path from "node:path";

const execFileAsync = promisify(execFile);

const FFMPEG_PATH = "ffmpeg";

/**
 * Extracts mono MP3 audio from an uploaded media file.
 */
export async function extractAudio(inputPath: string) {
  const outputPath = path.join(
    path.dirname(inputPath),
    `${path.basename(inputPath, path.extname(inputPath))}-audio.mp3`,
  );

  await execFileAsync(FFMPEG_PATH, [
    "-i",
    inputPath,
    "-vn",
    "-ac",
    "1",
    "-ar",
    "16000",
    "-b:a",
    "64k",
    "-y",
    outputPath,
  ]);

  return outputPath;
}

export async function deleteFile(filePath: string) {
  await fs.rm(filePath, { force: true });
}

export async function splitAudioIntoChunks(inputPath: string) {
  const outputPattern = path.join(
    path.dirname(inputPath),
    `${path.basename(inputPath, path.extname(inputPath))}-chunk-%03d.mp3`,
  );

  await execFileAsync(FFMPEG_PATH, [
    "-i",
    inputPath,
    "-f",
    "segment",
    "-segment_time",
    "25",
    "-reset_timestamps",
    "1",
    "-ac",
    "1",
    "-ar",
    "16000",
    "-b:a",
    "64k",
    outputPattern,
  ]);

  const directory = path.dirname(inputPath);
  const baseName = path.basename(
    inputPath,
    path.extname(inputPath),
  );

  const files = await fs.readdir(directory);

  return files
    .filter(
      (file) =>
        file.startsWith(`${baseName}-chunk-`) &&
        file.endsWith(".mp3"),
    )
    .map((file) => path.join(directory, file))
    .sort();
}