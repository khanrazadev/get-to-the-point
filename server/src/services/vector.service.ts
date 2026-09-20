import { prisma } from "../lib/prisma.js";

import { chunkText, TextChunk } from "./chunk.service.js";

import { generateEmbedding } from "./embedding.service.js";

interface StoreEmbeddingInput {
  contentId: string;
  text: string;
  chunkIndex: number;
  embedding: number[];
}

interface StoreTranscriptEmbeddingsInput {
  contentId: string;
  text: string;
}

type EmbeddedChunk = TextChunk & {
  embedding: number[];
};

export async function storeEmbedding(data: StoreEmbeddingInput) {
  const id = crypto.randomUUID();

  await prisma.$executeRaw`
    INSERT INTO "Chunk" (
      "id",
      "contentId",
      "text",
      "chunkIndex",
      "embedding"
    )
    VALUES (
      ${id},
      ${data.contentId},
      ${data.text},
      ${data.chunkIndex},
      ${JSON.stringify(data.embedding)}::vector
    )
  `;

  return id;
}

export async function storeTranscriptEmbeddings(
  data: StoreTranscriptEmbeddingsInput,
) {
  const chunks = chunkText(data.text);

  const CONCURRENCY = 3;
  const embeddings: EmbeddedChunk[] = [];

  for (let i = 0; i < chunks.length; i += CONCURRENCY) {
    const batch = chunks.slice(i, i + CONCURRENCY);

    const results = await Promise.all(
      batch.map(async (chunk) => {
        const embedding = await generateEmbedding(chunk.text);

        return {
          ...chunk,
          embedding,
        };
      }),
    );

    embeddings.push(...results);
  }

  await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`
      DELETE FROM "Chunk"
      WHERE "contentId" = ${data.contentId}
    `;

    for (const chunk of embeddings) {
      const id = crypto.randomUUID();

      await tx.$executeRaw`
        INSERT INTO "Chunk" (
          "id",
          "contentId",
          "text",
          "chunkIndex",
          "embedding"
        )
        VALUES (
          ${id},
          ${data.contentId},
          ${chunk.text},
          ${chunk.chunkIndex},
          ${JSON.stringify(chunk.embedding)}::vector
        )
      `;
    }
  });

  return chunks.length;
}

const MIN_SIMILARITY = 0.05;

export async function searchSimilarChunks(
  contentId: string,
  queryEmbedding: number[],
  limit = 5,
) {
  const vector = JSON.stringify(queryEmbedding);

  return prisma.$queryRaw<
    {
      id: string;
      text: string;
      chunkIndex: number;
      similarity: number;
    }[]
  >`
    SELECT
      "id",
      "text",
      "chunkIndex",
      1 - ("embedding" <=> ${vector}::vector) AS similarity
    FROM "Chunk"
    WHERE "contentId" = ${contentId}
      AND 1 - ("embedding" <=> ${vector}::vector) >= ${MIN_SIMILARITY}
    ORDER BY "embedding" <=> ${vector}::vector
    LIMIT ${limit}
  `;
}