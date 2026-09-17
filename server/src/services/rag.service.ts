import { InferenceClient } from "@huggingface/inference";
import { generateEmbedding } from "./embedding.service.js";
import { searchSimilarChunks } from "./vector.service.js";

const hf = new InferenceClient(
  process.env.HUGGINGFACE_API_KEY,
);

const RAG_MODEL = "Qwen/Qwen3-4B-Instruct-2507";

export async function answerQuestion(
  contentId: string,
  question: string,
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

  const context = chunks
    .map((chunk) => chunk.text)
    .join("\n\n");

  const response = await hf.chatCompletion({
    model: RAG_MODEL,
    messages: [
      {
        role: "system",
        content: `
You answer questions using only the provided context.

Rules:
- Do not use information outside the context.
- If the answer is not present in the context, say you don't know.
- Keep the answer concise.
        `.trim(),
      },
      {
        role: "user",
        content: `
Context:
${context}

Question:
${question}
        `.trim(),
      },
    ],
    max_tokens: 300,
    temperature: 0.1,
  });

  return {
    answer: response.choices[0]?.message?.content ?? "",
    sources: chunks,
  };
}