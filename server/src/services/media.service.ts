import { createRequire } from "node:module";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";

const require = createRequire(import.meta.url);
const ffmpegPath = require("ffmpeg-static") as string;

const execFileAsync = promisify(execFile);

if (!ffmpegPath) {
    throw new Error("FFmpeg binary not found");
}

/**
 * Extracts mono MP3 audio from an uploaded media file.
 */
export async function extractAudio(inputPath: string) {
    const outputPath = path.join(
        path.dirname(inputPath),
        `${path.basename(inputPath, path.extname(inputPath))}.mp3`,
    );

    await execFileAsync(ffmpegPath, [
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