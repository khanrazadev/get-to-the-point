import express from "express";
import { fetchTranscript } from "youtube-transcript";

const app = express();

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

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
  });
});

app.get("/transcript", async (req, res) => {
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

    const transcript = await fetchTranscript(videoId);

    res.json({
      success: true,
      videoId,
      data: transcript,
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
  }
});

app.listen(PORT, () => {
  console.log(`YouTube worker running on port ${PORT}`);
});