
import { GoogleGenAI, Type } from "@google/genai";
import { Node } from '../types';

export const generateSummaries = async (node: Node): Promise<{ overview: string, detailed: string }> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Generate two summaries for: "${node.title}".
            Context: ${node.content}
            
            1. Overview: 40-60 words.
            2. Detailed: 400-600 words, structured with markdown.
            `,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        overview: { type: Type.STRING },
                        detailed: { type: Type.STRING }
                    },
                    required: ["overview", "detailed"]
                }
            }
        });

        if (response.text) {
            return JSON.parse(response.text);
        }
        return { overview: "Failed to generate", detailed: "Failed to generate" };
    } catch (e) {
        console.error("Summary Gen Error", e);
        return { overview: "Error generating summary", detailed: "Error generating summary" };
    }
};
