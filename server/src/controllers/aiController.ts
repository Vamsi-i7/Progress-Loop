import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
// import { GoogleGenerativeAI } from '@google/genai';
// note: the user installed @google/genai, let's verify usage. 
// Actually the new SDK might be distinct. Let's use standard REST or the one installed.
// Assuming the user wants to keep the same logic as frontend but server-side.

const GENAI_API_KEY = process.env.GEMINI_API_KEY;

export const chatWithPro = async (req: AuthRequest, res: Response) => {
    try {
        const { message, history } = req.body;

        if (!GENAI_API_KEY) {
            res.status(500).json({ message: 'AI Service User Config Error' });
            return;
        }

        // Simple fetch to Gemini REST API for now to avoid SDK version conflicts if any,
        // OR usage of the installed SDK if we are sure.
        // Let's use the REST endpoint for maximum compatibility as a proxy.

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GENAI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [
                    ...history.map((h: any) => ({ role: h.sender === 'user' ? 'user' : 'model', parts: [{ text: h.text }] })),
                    { role: 'user', parts: [{ text: message }] }
                ]
            })
        });

        const data = await response.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm having trouble processing that.";

        res.json({ reply });

    } catch (err: any) {
        console.error("AI Error", err);
        res.status(500).send('AI Service Error');
    }
};
