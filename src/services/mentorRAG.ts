
import { GoogleGenAI } from "@google/genai";
import { retrieveContext } from "./embeddings";
import { EmbeddingEntry } from "../types";

export const queryMentor = async (
    question: string, 
    embeddings: EmbeddingEntry[]
): Promise<{ answer: string, sources: string[] }> => {
    
    // 1. Retrieve Context (Top 5 chunks)
    const contextEntries = await retrieveContext(question, embeddings, 5);
    const contextText = contextEntries.map(e => e.text).join("\n\n---\n\n");
    const sources = contextEntries.map(e => e.nodeId || e.id); 

    // 2. LLM Call with Strict Prompt
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `You are an expert academic mentor. Answer the student's question ONLY using the provided context chunks below.
        If the answer is not present in the context, strictly respond: "Insufficient context in your notes to answer this question."
        Do not make up information.
        
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

export const queryGroupMentor = async (
    question: string,
    embeddings: EmbeddingEntry[],
    recentChatHistory: string
): Promise<{ answer: string, sources: string[] }> => {
    
    // 1. Retrieve Context
    const contextEntries = await retrieveContext(question, embeddings, 5);
    const contextText = contextEntries.map(e => `[Source: ${e.type || 'text'}] ${e.text}`).join("\n\n");
    const sources = contextEntries.map(e => e.nodeId || e.id);

    // 2. LLM Call
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `You are a helpful AI assistant inside a student study group chat.
        Answer the question based on the provided study materials (context) and the recent conversation history.
        
        Constraint: Answer ONLY using the provided context. If the context does not contain the answer, write exactly: "Insufficient context".
        
        Study Material Context:
        ${contextText}
        
        Recent Chat History:
        ${recentChatHistory}
        
        Question: ${question}
        
        Answer:`
    });

    return {
        answer: response.text || "Insufficient context",
        sources
    };
}
