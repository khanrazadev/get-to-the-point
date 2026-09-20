export type ContentType =
  | "YOUTUBE"
  | "INSTAGRAM"
  | "AUDIO"
  | "VIDEO";

export type ContentStatus =
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED";

export type Content = {
  id: string;
  type: ContentType;
  sourceUrl: string | null;
  filePath: string | null;
  title: string | null;
  status: ContentStatus;
  createdAt: string;
};

export type ContentDetails = Content & {
  transcript: {
    id: string;
    text: string;
    language: string | null;
    createdAt: string;
  } | null;

  summary: {
    id: string;
    text: string;
    createdAt: string;
  } | null;
};