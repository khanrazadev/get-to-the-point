export type ChatSource = {
  id: string;
  text: string;
  similarity: number;
};

export type ChatResponse = {
  answer: string;
  sessionId: string;
  sources: ChatSource[];
};