import express from "express";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const app = express();

const execFileAsync = promisify(execFile);

const PORT = process.env.PORT || 3000;

function extractYouTubeVideoId(url: string): string {
    const parsedUrl = new URL(url);

    if (
        parsedUrl.hostname === "www.youtube.com" ||
        parsedUrl.hostname === "youtube.com" ||
        parsedUrl.hostname === "m.youtube.com"
    ) {
        if (parsedUrl.pathname.startsWith("/shorts/")) {
            return parsedUrl.pathname.split("/")[2] ?? "";
        }

        return parsedUrl.searchParams.get("v") ?? "";
    }

    if (parsedUrl.hostname === "youtu.be") {
        return parsedUrl.pathname.slice(1);
    }

    return "";
}

function parseVtt(vtt: string): string {
    return vtt
        .split("\n")
        .filter((line) => {
            const trimmed = line.trim();

            return (
                trimmed.length > 0 &&
                !trimmed.startsWith("WEBVTT") &&
                !trimmed.includes("-->") &&
                !/^\d+$/.test(trimmed)
            );
        })
        .map((line) => line.replace(/<[^>]+>/g, "").trim())
        .filter(Boolean)
        .join(" ");
}

app.get("/health", (_req, res) => {
    res.json({
        status: "ok",
    });
});

app.get("/transcript", async (req, res) => {
    let tempDirectory: string | undefined;

    try {
        const url = req.query.url;

        if (typeof url !== "string" || !url.trim()) {
            res.status(400).json({
                success: false,
                message: "YouTube URL is required",
            });
            return;
        }

        const videoId = extractYouTubeVideoId(url);

        if (!videoId) {
            res.status(400).json({
                success: false,
                message: "Invalid YouTube URL",
            });
            return;
        }

        tempDirectory = await fs.mkdtemp(
            path.join(os.tmpdir(), "youtube-transcript-"),
        );

        const outputTemplate = path.join(
            tempDirectory,
            "%(id)s.%(ext)s",
        );

        await execFileAsync("yt-dlp", [
            "--js-runtimes",
            "deno",
            "--skip-download",
            "--write-auto-subs",
            "--sub-langs",
            "en",
            "--sub-format",
            "vtt",
            "--extractor-args",
            "youtube:player_client=mweb",
            "--extractor-args",
            "youtubepot-bgutilhttp:base_url=http://127.0.0.1:4416",
            "--output",
            outputTemplate,
            url,
        ]);
        const files = await fs.readdir(tempDirectory);

        const subtitleFile = files.find((file) =>
            file.endsWith(".vtt"),
        );

        if (!subtitleFile) {
            throw new Error("No English subtitles found");
        }

        const subtitlePath = path.join(
            tempDirectory,
            subtitleFile,
        );

        const vtt = await fs.readFile(
            subtitlePath,
            "utf-8",
        );

        const transcript = parseVtt(vtt);

        if (!transcript) {
            throw new Error("Transcript is empty");
        }

        res.json({
            success: true,
            videoId,
            transcript,
        });
    } catch (error) {
        console.error("Transcript request failed:", error);

        res.status(500).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to retrieve transcript",
        });
    } finally {
        if (tempDirectory) {
            await fs.rm(tempDirectory, {
                recursive: true,
                force: true,
            });
        }
    }
});

app.listen(PORT, () => {
    console.log(`YouTube worker running on port ${PORT}`);
});