
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export async function generateProductDescription(productName: string, category: string) {
  if (!process.env.API_KEY) return "No API Key provided for AI features.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Escribe una descripción comercial corta y apetitosa (máximo 150 caracteres) para un producto llamado "${productName}" en la categoría de "${category}".`,
    });
    return response.text?.trim() || "Calidad superior garantizada.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Excelente producto para tu hogar.";
  }
}

export async function getCookingTip(productName: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Dame un tip rápido de cocina para preparar "${productName}". Máximo 100 caracteres.`,
    });
    return response.text?.trim() || "Cocina a fuego lento para mejores resultados.";
  } catch (error) {
    return "Mantener refrigerado.";
  }
}
