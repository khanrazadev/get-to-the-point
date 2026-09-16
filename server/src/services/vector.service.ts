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
    data: StoreTranscriptEmbeddingsInput
) {
    const chunks = chunkText(data.text);

    for (const chunk of chunks) {
        const embedding = await generateEmbedding(chunk.text);

        await storeEmbedding({
            contentId: data.contentId,
            text: chunk.text,
            chunkIndex: chunk.chunkIndex,
            embedding,
        });
    }

    return chunks.length;
}