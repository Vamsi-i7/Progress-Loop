
import { GoogleGenAI } from "@google/genai";
import { retrieveContext } from "./embeddings";
import { EmbeddingEntry } from "../types";

export const queryMentor = async (
    question: string, 
    embeddings: EmbeddingEntry[]
): Promise<{ answer: string, sources: string[] }> => {
    
    // 1. Retrieve Context
    const contextEntries = await retrieveContext(question, embeddings, 3);
    const contextText = contextEntries.map(e => e.text).join("\n\n");
    const sources = contextEntries.map(e => e.nodeId); 

    // 2. LLM Call
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `You are an expert academic mentor. Answer the student's question ONLY using the provided context.
        If the answer is not in the context, say "I don't have enough information in your notes to answer that."
        
        Context:
        ${contextText}
        
        Student Question: ${question}
        
        Answer:`
    });

    return {
        answer: response.text || "Sorry, I couldn't generate an answer.",
        sources
    };
};
