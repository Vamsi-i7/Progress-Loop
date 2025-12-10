
import { Node } from '../types';
import { GoogleGenAI, Type } from "@google/genai";
import { addMinutes } from '../utils/dateMath';

export const parseContentToNodes = async (content: string, title: string): Promise<Node[]> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Analyze the following course content and break it down into a hierarchical learning roadmap.
            Estimate time (minutes) for each node based on complexity. Weight is 1-100 importance.
            Use deterministic logic for estimation if possible.
            
            Course Title: ${title}
            Content: ${content.substring(0, 30000)} ... (truncated)`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING },
                            title: { type: Type.STRING },
                            content: { type: Type.STRING, description: "Brief description of topics covered" },
                            level: { type: Type.INTEGER, description: "0 for Module, 1 for Topic, 2 for Subtopic" },
                            estimatedMinutes: { type: Type.INTEGER },
                            difficulty: { type: Type.STRING, enum: ["easy", "medium", "hard"] },
                            weight: { type: Type.INTEGER }
                        },
                        required: ["id", "title", "content", "level", "estimatedMinutes", "difficulty", "weight"]
                    }
                }
            }
        });

        if (response.text) {
            const rawNodes = JSON.parse(response.text) as any[];
            return rawNodes.map((n: any, idx: number) => ({
                ...n,
                id: `node_${Date.now()}_${idx}`,
                parentId: undefined // Re-linked in roadmapGenerator
            }));
        }
        return [];
    } catch (error) {
        console.error("AI Parsing Error", error);
        return [];
    }
};

export const parseSyllabus = async (file: File): Promise<any> => {
   const text = await readFileAsText(file);
   return {
       id: `p_syllabus_${Date.now()}`,
       title: file.name,
       subject: 'General',
       startDate: new Date().toISOString().split('T')[0],
       endDate: addMinutes(new Date(), 30*24*60).toISOString().split('T')[0],
       priority: 'high',
       tasks: []
   }
}

export const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsText(file);
    });
};
