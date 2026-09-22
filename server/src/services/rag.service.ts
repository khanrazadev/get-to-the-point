import { InferenceClient } from "@huggingface/inference";

import { prisma } from "../lib/prisma.js";

import { generateEmbedding } from "./embedding.service.js";
import { searchSimilarChunks } from "./vector.service.js";

type ChatHistoryMessage = {
  role: "USER" | "ASSISTANT";
  content: string;
};

const hf = new InferenceClient(
  process.env.HUGGINGFACE_API_KEY,
);

const RAG_MODEL = "Qwen/Qwen3-4B-Instruct-2507";

const MIN_RELEVANCE_SCORE = 0.08;

export async function answerQuestion(
  contentId: string,
  question: string,
  history: ChatHistoryMessage[] = [],
) {
  if (!process.env.HUGGINGFACE_API_KEY) {
    throw new Error("HUGGINGFACE_API_KEY is not defined");
  }

  const queryEmbedding = await generateEmbedding(question);

  const chunks = await searchSimilarChunks(
    contentId,
    queryEmbedding,
    5,
  );

  const topScore = chunks[0]?.similarity ?? -1;

  console.log("\n--- RAG QUERY ---");
  console.log(question);

  console.log("\n--- RETRIEVED CHUNKS ---");

  chunks.forEach((chunk, index) => {
    console.log(`\nChunk ${index + 1}`);
    console.log("Similarity:", chunk.similarity);
    console.log("Text:", chunk.text);
  });

  console.log("\nTop score:", topScore);
  console.log("-----------------\n");

  const historyMessages = history.map((message) => ({
    role:
      message.role === "USER"
        ? ("user" as const)
        : ("assistant" as const),
    content: message.content,
  }));

  let context: string;
  let sources = chunks;

  if (topScore >= MIN_RELEVANCE_SCORE) {
    context = chunks
      .map(
        (chunk, index) =>
          `[Retrieved context ${index + 1}]\n${chunk.text}`,
      )
      .join("\n\n");
  } else {
    const summary = await prisma.summary.findUnique({
      where: {
        contentId,
      },
    });

    if (!summary) {
      return {
        answer: "I don't know based on the provided content.",
        sources: [],
      };
    }

    context = `[Content summary]\n${summary.text}`;
    sources = [];
  }

  const response = await hf.chatCompletion({
    model: RAG_MODEL,

    messages: [
      {
        role: "system",
        content: `
You answer questions about a specific piece of content.

Use ONLY the provided context as your source of information.

Rules:
- Answer the user's question directly when the context supports it.
- You may combine information from different parts of the context.
- Do not use outside knowledge.
- Do not invent or assume facts.
- Conversation history can only be used to understand references such as "it", "that", "they", or "he".
- Previous assistant messages are not evidence.
- If the context does not contain enough information to answer the question, say:
"I don't know based on the provided content."
- Keep the answer concise and natural.

Context:
${context}
        `.trim(),
      },

      ...historyMessages,

      {
        role: "user",
        content: question,
      },
    ],

    max_tokens: 300,
    temperature: 0.1,
  });

  const answer =
    response.choices[0]?.message?.content ??
    "I don't know based on the provided content.";

  console.log("\n--- LLM ANSWER ---");
  console.log(answer);
  console.log("-----------------\n");

  return {
    answer,
    sources,
  };
}