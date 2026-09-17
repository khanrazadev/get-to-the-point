import "dotenv/config";
import { generateEmbedding } from "../services/embedding.service.js";
import { searchSimilarChunks } from "../services/vector.service.js";

const contentId = "fa7ddf41-dc4a-43c0-92e6-5d29599072a2";

const query = "What is this video about?";

const queryEmbedding = await generateEmbedding(query);

const results = await searchSimilarChunks(contentId, queryEmbedding, 5);

console.log(results);