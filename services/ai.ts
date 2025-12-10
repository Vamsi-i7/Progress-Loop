
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini client if key is present
const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
const aiClient = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const generateContent = async (prompt: string, context?: string): Promise<string> => {
    if (!aiClient) {
        return mockResponse(prompt);
    }
    
    try {
        const response = await aiClient.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Context: ${context || 'None'}\n\nPrompt: ${prompt}`,
        });
        return response.text || "No response generated.";
    } catch (e) {
        console.error("AI Error:", e);
        return "Sorry, I'm having trouble connecting to the AI service right now.";
    }
};

const mockResponse = (prompt: string): string => {
    const lower = prompt.toLowerCase();
    if (lower.includes("plan") || lower.includes("schedule")) return "Based on your goals, I recommend prioritizing Physics for 2 hours today.";
    if (lower.includes("explain")) return "Here is a simple explanation: The concept involves breaking down complex topics into smaller, manageable chunks.";
    return "I am a simulated AI mentor. Please configure a valid API_KEY in your environment to get real responses.";
};
