import { InferenceClient } from "@huggingface/inference";
import { CreateSummaryInput } from "../types/summary.types.js";
import { prisma } from "../lib/prisma.js";


const hf = new InferenceClient(process.env.HUGGINGFACE_API_KEY);

const SUMMARY_MODEL = "Qwen/Qwen3-4B-Instruct-2507";

/**
 * Generates a concise summary from a transcript using the configured LLM.
 */
export async function generateSummary(transcript: string) {
    if (!process.env.HUGGINGFACE_API_KEY) {
        throw new Error("HUGGINGFACE_API_KEY is not defined");
    }

    const response = await hf.chatCompletion({
        model: SUMMARY_MODEL,
        messages: [
            {
                role: "system",
                content: `You are a concise summarization assistant.Summarize the provided transcript in 3-5 bullet points.Only include information explicitly stated in the transcript.Do not explain your reasoning.Do not mention the summarization process.Do not repeat the transcript.Keep the summary shorter than the transcript.`
                    .trim(),
            },
            {
                role: "user",
                content: transcript,
            },
        ],
        max_tokens: 150,
        temperature: 0.1,
    });

    return response.choices[0]?.message?.content ?? "";
}

/**
 * Persists a generated summary for a content item.
 */
export async function createSummary(data: CreateSummaryInput) {
    return prisma.summary.create({
        data: {
            contentId: data.contentId,
            text: data.text,
        },
    });
}