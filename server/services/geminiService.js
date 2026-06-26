import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Servicio para conectarse a Gemini y generar NPCs / Enemigos en D&D 3.5.
 * 
 * @param {string} promptText Descripción enviada desde el frontend.
 * @returns {object} JSON parseado con las estadísticas generadas.
 */
export const generateCharacterStats = async (promptText) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Falta configurar la variable de entorno GEMINI_API_KEY");
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  const model = genAI.getGenerativeModel({
    model: "gemini-flash-latest",
    // Configuración para forzar JSON Puro
    generationConfig: {
      responseMimeType: "application/json",
    },
    systemInstruction: `Eres un asistente experto en Dungeons & Dragons 3.5. 
El usuario te dará una idea o descripción de un monstruo, NPC o personaje (ej: "Lobo zombie para party nivel 3").
Debes calcular y generar sus estadísticas de D&D 3.5.

REGLA ABSOLUTA: Tu respuesta DEBE ser un objeto JSON válido con EXACTAMENTE esta estructura:
{
  "nombre": "string",
  "tipo": "string",
  "nivel_o_cr": "string",
  "hp": number,
  "ac": number,
  "stats": {
    "FUE": number,
    "DES": number,
    "CON": number,
    "INT": number,
    "SAB": number,
    "CAR": number
  },
  "ataques": [
    {
      "arma": "string",
      "bono": "string",
      "dano": "string"
    }
  ],
  "habilidades_clave": [
    "string"
  ]
}

No incluyas markdown, no incluyas backticks, no agregues llaves extras. SOLO devuelve el objeto JSON.`
  });

  const result = await model.generateContent(promptText);
  const responseText = result.response.text();

  try {
    return JSON.parse(responseText);
  } catch (error) {
    console.error("Error parseando JSON de Gemini:", responseText);
    throw new Error("El formato devuelto por Gemini no es un JSON válido.");
  }
};
