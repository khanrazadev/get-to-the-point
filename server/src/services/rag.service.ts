import { InferenceClient } from "@huggingface/inference";

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

  const queryEmbedding =
    await generateEmbedding(question);

  const chunks = await searchSimilarChunks(
    contentId,
    queryEmbedding,
    5,
  );

  const topScore = chunks[0]?.similarity ?? -1;

  if (topScore < MIN_RELEVANCE_SCORE) {
    return {
      answer: "I don't know based on the provided content.",
      sources: [],
    };
  }

  const context = chunks
    .map((chunk) => chunk.text)
    .join("\n\n");

  const historyMessages = history.map((message) => ({
    role:
      message.role === "USER"
        ? ("user" as const)
        : ("assistant" as const),
    content: message.content,
  }));

  const response = await hf.chatCompletion({
    model: RAG_MODEL,
    messages: [
      {
        role: "system",
        content: `
You are a retrieval-grounded assistant.

You MUST answer using ONLY the retrieved context.

Rules:
- The retrieved context is your only source of factual information.
- Do not use your pretrained knowledge.
- Do not answer from general world knowledge.
- Do not assume facts that are not present in the context.
- Conversation history may only be used to understand references such as "it", "that", or "he".
- Previous assistant messages are NOT factual evidence.
- If the retrieved context does not contain enough information to answer the question, say exactly:
"I don't know based on the provided content."
- Never answer an unrelated question using your general knowledge.
- Keep answers concise.
`.trim(),
      },
      ...historyMessages,
      {
        role: "user",
        content: `
Retrieved context:
${context}

Current question:
${question}
        `.trim(),
      },
    ],
    max_tokens: 300,
    temperature: 0.1,
  });

  return {
    answer:
      response.choices[0]?.message?.content ??
      "I don't know based on the provided content.",
    sources: chunks,
  };
}