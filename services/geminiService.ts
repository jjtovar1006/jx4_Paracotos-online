
import { GoogleGenAI } from "@google/genai";

// Always initialize with an object containing the apiKey from process.env.API_KEY.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateProductDescription(productName: string, category: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Escribe una descripción comercial corta y apetitosa (máximo 150 caracteres) para un producto llamado "${productName}" en la categoría de "${category}".`,
    });
    // The text output is available directly as a property, not a method.
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
    // The text output is available directly as a property.
    return response.text?.trim() || "Cocina a fuego lento para mejores resultados.";
  } catch (error) {
    console.error("Gemini Tip Error:", error);
    return "Mantener refrigerado.";
  }
}
