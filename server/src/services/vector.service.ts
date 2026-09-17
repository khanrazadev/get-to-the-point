import { prisma } from "../lib/prisma.js";
import { chunkText } from "./chunk.service.js";
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

    const embeddings = [];

    for (const chunk of chunks) {
        const embedding = await generateEmbedding(chunk.text);

        embeddings.push({
            ...chunk,
            embedding,
        });
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
/*

*/
export async function searchSimilarChunks(
    contentId: string,
    queryEmbedding: number[],
    limit = 5
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
        ORDER BY "embedding" <=> ${vector}::vector
        LIMIT ${limit}
    `;
}