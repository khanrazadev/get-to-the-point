export type ContentType =
  | "YOUTUBE"
  | "INSTAGRAM"
  | "AUDIO"
  | "VIDEO";

export type CreateContentInput = {
  type: ContentType;
  sourceUrl?: string;
  filePath?: string;
  title?: string;
};