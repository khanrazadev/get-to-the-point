export type TextChunk = {
  text: string;
  chunkIndex: number;
};

const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;

/**
 * Splits text into overlapping chunks for vector embedding and retrieval.
 */
export function chunkText(text: string): TextChunk[] {
  const chunks: TextChunk[] = [];

  let start = 0;
  let chunkIndex = 0;

  while (start < text.length) {
    const end = Math.min(start + CHUNK_SIZE, text.length);

    const chunk = text.slice(start, end).trim();

    if (chunk.length > 0) {
      chunks.push({
        text: chunk,
        chunkIndex,
      });

      chunkIndex++;
    }

    start += CHUNK_SIZE - CHUNK_OVERLAP;
  }

  return chunks;
}