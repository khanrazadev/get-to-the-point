import { z } from "zod";

export const createContentSchema = z.object({
  type: z.enum(["YOUTUBE", "INSTAGRAM", "AUDIO", "VIDEO"]),
  sourceUrl: z.string().url().optional(),
  filePath: z.string().optional(),
  title: z.string().min(1).max(200).optional(),
});