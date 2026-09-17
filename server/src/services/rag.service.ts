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
    console.log(queryEmbedding);

    const chunks = await searchSimilarChunks(
        contentId,
        queryEmbedding,
        5,
    );

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
You answer questions using only the provided retrieved context.

Rules:
- Use conversation history only to understand references such as "it", "that", or "he".
- Do not treat previous assistant messages as factual evidence.
- Use only information explicitly supported by the retrieved context.
- Never guess, infer, or identify information that is not explicitly stated.
- If the answer is not explicitly supported by the retrieved context, say:
  "I don't know based on the provided content."
- Keep the answer concise.
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
        answer: response.choices[0]?.message?.content ?? "",
        sources: chunks,
    };
}