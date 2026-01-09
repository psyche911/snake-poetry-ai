
import { GoogleGenAI } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generatePoem = async (words: string[]): Promise<string> => {
  const ai = getAI();
  const prompt = `Write a short, evocative poem using these 8 words: ${words.join(', ')}. Keep it under 6 lines.`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
  });
  
  return response.text || "Failed to generate poem.";
};

export const remixPoem = async (originalPoem: string, instruction: string): Promise<string> => {
  const ai = getAI();
  const prompt = `Here is a poem:\n"${originalPoem}"\n\nPlease remix it based on this instruction: ${instruction}. Keep the new poem short.`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
  });
  
  return response.text || originalPoem;
};

export const generatePoemImage = async (poem: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: `A cinematic, artistic digital painting representing the mood and imagery of this poem: "${poem}"` }]
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1"
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  
  throw new Error("No image generated");
};
