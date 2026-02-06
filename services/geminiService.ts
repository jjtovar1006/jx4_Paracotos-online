import { GoogleGenAI } from "@google/genai";

// Initialize the Google GenAI client with the API key from environment variables
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates an engaging product description using Gemini 3 Flash.
 * @param productName Name of the product to describe.
 * @param category Category of the product.
 * @returns A promise resolving to the generated text.
 */
export async function generateProductDescription(productName: string, category: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Escribe una descripción corta (máximo 120 caracteres) y llamativa para un producto de carnicería/charcutería llamado "${productName}" en la categoría "${category}". Destaca la frescura y el origen local de JX4 Paracotos.`,
    });
    return response.text?.trim() || "Calidad y frescura garantizada en JX4 Paracotos.";
  } catch (error) {
    console.error("Error generating description:", error);
    return "El mejor sabor para tu mesa, con la calidad de JX4.";
  }
}

/**
 * Provides a quick culinary tip for the given product.
 * @param productName Name of the product.
 * @returns A promise resolving to a short cooking tip.
 */
export async function getCookingTip(productName: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Dame un tip de cocina rápido y profesional para preparar "${productName}". Máximo 100 caracteres.`,
    });
    return response.text?.trim() || "Cocina a temperatura media para mantener la jugosidad.";
  } catch (error) {
    console.error("Error getting cooking tip:", error);
    return "Sellar bien la pieza antes de terminar la cocción para resaltar los sabores.";
  }
}