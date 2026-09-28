import { fetchTranscript } from "youtube-transcript";

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

export async function getYouTubeTranscript(url: string) {
  const videoId = extractYouTubeVideoId(url);

  if (!videoId) {
    throw new Error("Invalid YouTube URL");
  }

  const transcript = await fetchTranscript(videoId);

  if (!transcript.length) {
    throw new Error("No YouTube transcript found");
  }

  return transcript
    .map((item) => item.text.trim())
    .filter(Boolean)
    .join(" ");
}