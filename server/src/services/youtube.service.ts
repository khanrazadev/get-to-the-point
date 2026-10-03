import { execFile } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const execFileAsync = promisify(execFile);

const TEMP_DIR = path.join(os.tmpdir(), "get-to-the-point");

export async function downloadMedia(url: string) {
  await fs.mkdir(TEMP_DIR, { recursive: true });

  const outputPath = path.join(
    TEMP_DIR,
    `media-${Date.now()}.m4a`,
  );

  try {
    await execFileAsync("yt-dlp", [
      "-f",
      "ba",
      "-o",
      outputPath,
      url,
    ]);
  } catch (error) {
    const details = error as Error & {
      stderr?: string;
      stdout?: string;
    };

    const output = `${details.stderr ?? ""}\n${details.stdout ?? ""}`;

    if (output.includes("429") || output.includes("Too Many Requests")) {
      throw new Error(
        "Instagram is temporarily limiting requests from our server. Please try again later or upload the video directly.",
      );
    }

    console.error("Media download failed:", details.message);

    throw new Error(
      "We couldn't download this media. Check that the URL is public, or upload the video directly.",
    );
  }

  return outputPath;
}
