import { GoogleGenAI } from '@google/genai';

let genAIClient: GoogleGenAI | null = null;

export const initGemini = (): GoogleGenAI => {
  if (genAIClient) {
    return genAIClient;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined');
  }

  genAIClient = new GoogleGenAI({ apiKey });
  console.log('✅ Gemini AI initialized');
  return genAIClient;
};

export const getGeminiClient = (): GoogleGenAI => {
  if (!genAIClient) {
    return initGemini();
  }
  return genAIClient;
};

export { genAIClient };
