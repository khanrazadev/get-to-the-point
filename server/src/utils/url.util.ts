export function normalizeContentUrl(url: string): string {
  const parsedUrl = new URL(url.trim());

  parsedUrl.hash = "";

  if (
    parsedUrl.hostname === "www.youtube.com" ||
    parsedUrl.hostname === "youtube.com" ||
    parsedUrl.hostname === "m.youtube.com"
  ) {
    const videoId = parsedUrl.searchParams.get("v");

    if (videoId) {
      return `https://www.youtube.com/watch?v=${videoId}`;
    }
  }

  if (parsedUrl.hostname === "youtu.be") {
    const videoId = parsedUrl.pathname.replace(/^\/+/, "");

    if (videoId) {
      return `https://www.youtube.com/watch?v=${videoId}`;
    }
  }

  if (
    parsedUrl.hostname === "www.instagram.com" ||
    parsedUrl.hostname === "instagram.com"
  ) {
    parsedUrl.hostname = "www.instagram.com";
    parsedUrl.search = "";

    return parsedUrl.toString().replace(/\/$/, "");
  }

  return parsedUrl.toString().replace(/\/$/, "");
}