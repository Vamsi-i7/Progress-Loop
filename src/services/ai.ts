
import { GoogleGenAI, Modality, Type } from "@google/genai";

// Initialize Gemini client if key is present
const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
const aiClient = apiKey ? new GoogleGenAI({ apiKey }) : null;

// --- Helper for Mock Responses when no API Key ---
const mockResponse = (prompt: string): string => {
    const lower = prompt.toLowerCase();
    if (lower.includes("plan") || lower.includes("schedule")) return "Based on your goals, I recommend prioritizing Physics for 2 hours today.";
    if (lower.includes("explain")) return "Here is a simple explanation: The concept involves breaking down complex topics into smaller, manageable chunks.";
    return "I am a simulated AI mentor. Please configure a valid API_KEY in your environment to get real responses.";
};

// 1. General Chat / Content Generation
export const generateContent = async (prompt: string, context?: string): Promise<string> => {
    if (!aiClient) return mockResponse(prompt);
    
    try {
        // Default to Flash for general chat
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

// 2. Deep Reasoning (Thinking Mode)
export const generateThinkingContent = async (prompt: string, context?: string): Promise<string> => {
    if (!aiClient) return mockResponse(prompt);

    try {
        const response = await aiClient.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: `Context: ${context || 'None'}\n\nComplex Request: ${prompt}`,
            config: {
                thinkingConfig: { thinkingBudget: 32768 },
            }
        });
        return response.text || "I couldn't complete the reasoning task.";
    } catch (e) {
        console.error("Reasoning Error:", e);
        return "Deep reasoning service unavailable.";
    }
};

// 3. Fast Responses (Flash Lite)
export const generateFastContent = async (prompt: string): Promise<string> => {
    if (!aiClient) return mockResponse(prompt);

    try {
        const response = await aiClient.models.generateContent({
            model: 'gemini-2.5-flash-lite',
            contents: prompt,
        });
        return response.text || "";
    } catch (e) {
        console.error("Fast AI Error:", e);
        return "";
    }
};

// 4. Image Analysis
export const analyzeImage = async (file: File, prompt: string): Promise<string> => {
    if (!aiClient) return "Image analysis requires a valid API Key.";

    try {
        // Convert File to Base64
        const base64Data = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = (reader.result as string).split(',')[1];
                resolve(base64);
            };
            reader.readAsDataURL(file);
        });

        const response = await aiClient.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: {
                parts: [
                    { inlineData: { mimeType: file.type, data: base64Data } },
                    { text: prompt || "Analyze this image." }
                ]
            }
        });
        return response.text || "No analysis generated.";
    } catch (e) {
        console.error("Image Analysis Error:", e);
        return "Failed to analyze image.";
    }
};

// 5. Audio Transcription
export const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
    if (!aiClient) return "Audio transcription requires API Key.";

    try {
        const base64Data = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = (reader.result as string).split(',')[1];
                resolve(base64);
            };
            reader.readAsDataURL(audioBlob);
        });

        const response = await aiClient.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    { inlineData: { mimeType: 'audio/mp3', data: base64Data } }, // Assuming MP3/WAV from recorder
                    { text: "Transcribe this audio precisely." }
                ]
            }
        });
        return response.text || "";
    } catch (e) {
        console.error("Transcription Error:", e);
        return "Failed to transcribe.";
    }
};

// 6. Text to Speech
export const generateSpeech = async (text: string): Promise<string | null> => {
    if (!aiClient) return null;

    try {
        const response = await aiClient.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        return base64Audio || null;
    } catch (e) {
        console.error("TTS Error:", e);
        return null;
    }
};

// 7. Image Generation
export const generateImage = async (prompt: string, size: '1K' | '2K' | '4K' = '1K'): Promise<string | null> => {
    if (!aiClient) return null;

    try {
        const response = await aiClient.models.generateContent({
            model: 'gemini-3-pro-image-preview',
            contents: {
                parts: [{ text: prompt }],
            },
            config: {
                imageConfig: {
                    aspectRatio: "1:1",
                    imageSize: size
                }
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return `data:image/png;base64,${part.inlineData.data}`;
            }
        }
        return null;
    } catch (e) {
        console.error("Image Gen Error:", e);
        return null;
    }
};
