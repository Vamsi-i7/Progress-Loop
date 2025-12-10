
import { GoogleGenAI, Type } from "@google/genai";
import { Node, Flashcard } from '../types';

export const generateFlashcards = async (node: Node): Promise<Flashcard[]> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Generate exactly 6 study flashcards for the topic: "${node.title}".
            Content Context: ${node.content}
            
            Required Types (one of each):
            1. Concept
            2. Definition
            3. Reverse
            4. Example
            5. Cloze
            6. Key Fact
            `,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            question: { type: Type.STRING },
                            answer: { type: Type.STRING },
                            type: { type: Type.STRING, enum: ['concept', 'definition', 'reverse', 'example', 'cloze', 'key_fact'] },
                            tags: { type: Type.ARRAY, items: { type: Type.STRING } }
                        },
                        required: ["question", "answer", "type"]
                    }
                }
            }
        });

        if (response.text) {
            const rawCards = JSON.parse(response.text) as any[];
            return rawCards.slice(0, 6).map((c: any, i: number) => ({
                id: `fc_${node.id}_${i}_${Date.now()}`,
                nodeId: node.id,
                question: c.question,
                answer: c.answer,
                type: c.type,
                tags: c.tags || []
            }));
        }
        return [];
    } catch (e) {
        console.error("Flashcard Gen Error", e);
        return [];
    }
};
