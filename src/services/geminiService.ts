import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const SYSTEM_INSTRUCTION = `You are "Coach", a highly efficient, supportive, and slightly firm daily task coach. 
Your goal is to help the user plan their day, break down complex tasks, and stay motivated.
Keep your responses concise, actionable, and encouraging.
If the user mentions a task, help them estimate how long it will take and suggest a priority.
Always try to end with a motivational micro-nudge.`;

export async function getCoachResponse(message: string, history: { role: 'user' | 'model', parts: { text: string }[] }[]) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        ...history.map(h => ({ role: h.role, parts: h.parts })),
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    return response.text || "I'm here to help you conquer your day! What's on your mind?";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm having a bit of trouble connecting to my brain right now. Let's try again in a moment!";
  }
}
