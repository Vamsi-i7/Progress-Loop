
import { GoogleGenAI } from "@google/genai";
import { EmbeddingEntry, Node } from '../types';

export const generateEmbeddings = async (nodes: Node[]): Promise<EmbeddingEntry[]> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const entries: EmbeddingEntry[] = [];

        // Processing sequentially to avoid rate limits
        for (const node of nodes) {
            const textToEmbed = `${node.title}: ${node.content}`.substring(0, 2048); 
            
            const result = await ai.models.embedContent({
                model: "text-embedding-004",
                contents: [{ parts: [{ text: textToEmbed }] }],
            });

            // Correct response access: response.embeddings[0].values
            if (result.embeddings && result.embeddings.length > 0 && result.embeddings[0].values) {
                entries.push({
                    id: `emb_${node.id}`,
                    nodeId: node.id,
                    vector: result.embeddings[0].values,
                    text: textToEmbed
                });
            }
        }
        return entries;
    } catch (e) {
        console.error("Embedding Gen Error", e);
        return [];
    }
};

const cosineSimilarity = (vecA: number[], vecB: number[]) => {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    return (normA > 0 && normB > 0) ? dotProduct / (Math.sqrt(normA) * Math.sqrt(normB)) : 0;
};

export const retrieveContext = async (query: string, embeddings: EmbeddingEntry[], topK: number = 5): Promise<EmbeddingEntry[]> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const result = await ai.models.embedContent({
            model: "text-embedding-004",
            contents: [{ parts: [{ text: query }] }],
        });

        if (!result.embeddings || !result.embeddings[0] || !result.embeddings[0].values) return [];
        const queryVector = result.embeddings[0].values;

        const scored = embeddings.map(entry => ({
            ...entry,
            score: cosineSimilarity(queryVector, entry.vector)
        }));

        scored.sort((a, b) => b.score - a.score);
        return scored.slice(0, topK);

    } catch (e) {
        console.error("Context Retrieval Error", e);
        return [];
    }
};
