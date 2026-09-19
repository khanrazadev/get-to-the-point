import { z } from "zod";

export const createContentSchema = z.object({
  type: z.enum(["YOUTUBE", "INSTAGRAM", "AUDIO", "VIDEO"]),
  sourceUrl: z.string().url().optional(),
  filePath: z.string().optional(),
  title: z.string().min(1).max(200).optional(),
});

export const youtubeContentSchema = z.object({
  url: z
    .string()
    .url()
    .refine((value) => {
      const url = new URL(value);

      return [
        "youtube.com",
        "www.youtube.com",
        "m.youtube.com",
        "youtu.be",
      ].includes(url.hostname);
    }, "Invalid YouTube URL"),
});