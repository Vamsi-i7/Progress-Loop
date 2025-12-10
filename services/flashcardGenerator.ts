
import { GoogleGenAI, Type } from "@google/genai";
import { Node, Flashcard } from '../types';

export const generateFlashcards = async (node: Node): Promise<Flashcard[]> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Generate 6 study flashcards for the topic: "${node.title}".
            Content Context: ${node.content}
            
            Types required:
            1. Concept (Basic explanation)
            2. Definition (Formal definition)
            3. Reverse (Given definition, guess term)
            4. Example (Real-world application)
            5. Cloze (Fill in the blank)
            6. Key Fact (Important statistic or fact)
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
            return rawCards.map((c: any, i: number) => ({
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
