
import { GoogleGenAI } from "@google/genai";

// Fix: Refactor to strictly follow GenAI initialization and text extraction guidelines
export async function generateProductDescription(productName: string, category: string) {
  try {
    // Correct initialization using named parameter and direct process.env.API_KEY access
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Using gemini-3-flash-preview for basic text tasks as per guidelines
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Escribe una descripción comercial corta y apetitosa (máximo 150 caracteres) para un producto llamado "${productName}" en la categoría de "${category}".`,
    });
    
    // Correct: response.text is a property, not a method
    return response.text || "Excelente producto garantizado.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Excelente producto seleccionado por JX4 para ti.";
  }
}

export async function getCookingTip(productName: string) {
  try {
    // Correct initialization using named parameter and direct process.env.API_KEY access
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Dame un tip rápido de cocina o uso para el producto "${productName}". Máximo 80 caracteres. Sé creativo y amable.`,
    });
    
    // Correct: response.text is a property, not a method
    return response.text || "Cocina con pasión para obtener los mejores resultados.";
  } catch (error) {
    console.error("Gemini Tip Error:", error);
    return "Mantener en un lugar fresco y seco.";
  }
}
