
import { GoogleGenAI } from "@google/genai";

// Función auxiliar para obtener el cliente de IA de forma segura
const getAIClient = () => {
  const apiKey = process.env.API_KEY || (window as any).process?.env?.API_KEY;
  if (!apiKey) {
    console.warn("Gemini API Key no configurada.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export async function generateProductDescription(productName: string, category: string) {
  const ai = getAIClient();
  if (!ai) return "Calidad superior seleccionada por JX4.";
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Escribe una descripción comercial corta y apetitosa (máximo 150 caracteres) para un producto llamado "${productName}" en la categoría de "${category}".`,
    });
    return response.text || "Excelente producto garantizado.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Excelente producto seleccionado por JX4 para ti.";
  }
}

export async function getCookingTip(productName: string) {
  const ai = getAIClient();
  if (!ai) return "Mantener en un lugar fresco.";

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
