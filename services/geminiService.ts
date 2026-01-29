
import { GoogleGenAI } from "@google/genai";

// Inicialización de la IA usando la variable de entorno directamente como indica la guía
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateProductDescription(productName: string, category: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Escribe una descripción comercial corta y apetitosa (máximo 150 caracteres) para un producto llamado "${productName}" en la categoría de "${category}".`,
    });
    return response.text || "Calidad superior garantizada para tu hogar.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Excelente producto seleccionado por JX4 para ti.";
  }
}

export async function getCookingTip(productName: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Dame un tip rápido de cocina o uso para el producto "${productName}". Máximo 80 caracteres. Sé creativo y amable.`,
    });
    return response.text || "Cocina con pasión para obtener los mejores resultados.";
  } catch (error) {
    console.error("Gemini Tip Error:", error);
    return "Mantener en un lugar fresco y seco.";
  }
}
