
import { GoogleGenAI } from "@google/genai";

// Acceso seguro al objeto process shimmed en index.html
const getApiKey = () => {
  try {
    return (window as any).process?.env?.API_KEY || "";
  } catch (e) {
    return "";
  }
};

const ai = new GoogleGenAI({ apiKey: getApiKey() });

export async function generateProductDescription(productName: string, category: string) {
  try {
    const apiKey = getApiKey();
    if (!apiKey) return "Calidad superior garantizada.";

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
    const apiKey = getApiKey();
    if (!apiKey) return "Cocina con amor para mejores resultados.";

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Dame un tip rápido de cocina para preparar "${productName}". Máximo 100 caracteres.`,
    });
    return response.text?.trim() || "Cocina a fuego lento para mejores resultados.";
  } catch (error) {
    console.error("Gemini Tip Error:", error);
    return "Mantener refrigerado.";
  }
}
