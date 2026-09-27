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

  await execFileAsync("yt-dlp", [
    "-v",
    "-f",
    "ba",
    "--extractor-args",
    "youtube:player_client=mweb",
    "--extractor-args",
    "youtubepot-bgutilhttp:base_url=http://bgutil:4416",
    "-o",
    outputPath,
    url,
  ]);
  return outputPath;
}