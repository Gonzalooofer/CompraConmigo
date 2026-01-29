
import { GoogleGenAI, Type } from "@google/genai";
import { ScanResult, PriceComparisonResult } from "../types";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

export const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const analyzeImageOrText = async (
  inputText: string, 
  imageBase64?: string, 
  mimeType: string = 'image/jpeg'
): Promise<ScanResult> => {
  try {
    const parts: any[] = [];
    if (imageBase64) parts.push({ inlineData: { data: imageBase64, mimeType } });

    let prompt = "Analiza esta entrada de compra. Extrae ítems, categorías y precios estimados en EUR.";
    if (inputText) prompt += ` Contexto: "${inputText}".`;
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts: [{ text: prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  category: { type: Type.STRING },
                  estimatedPrice: { type: Type.NUMBER },
                  quantity: { type: Type.NUMBER }
                }
              }
            }
          }
        }
      }
    });
    return JSON.parse(response.text) as ScanResult;
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
};

export const comparePrices = async (productName: string): Promise<PriceComparisonResult> => {
  try {
    const prompt = `Como experto en ahorro, compara el precio de "${productName}" en los principales supermercados de España (Mercadona, Carrefour, Lidl, Dia). Devuelve precios estimados reales por unidad/kg y una nota breve sobre ofertas comunes.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ text: prompt }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            product: { type: Type.STRING },
            comparisons: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  store: { type: Type.STRING },
                  price: { type: Type.NUMBER },
                  note: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });
    return JSON.parse(response.text) as PriceComparisonResult;
  } catch (error) {
    console.error("Price Compare Error:", error);
    throw error;
  }
};
