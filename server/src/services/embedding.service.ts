import { InferenceClient } from "@huggingface/inference";

const hf = new InferenceClient(process.env.HUGGINGFACE_API_KEY);

const EMBEDDING_MODEL =
    "sentence-transformers/distiluse-base-multilingual-cased-v2";

export async function generateEmbedding(text: string): Promise<number[]> {
    if (!process.env.HUGGINGFACE_API_KEY) {
        throw new Error("HUGGINGFACE_API_KEY is not defined");
    }

    const response = await hf.featureExtraction({
        model: EMBEDDING_MODEL,
        inputs: text,
    });

    return response as number[];
}