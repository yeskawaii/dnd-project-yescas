import { generateCharacterStats } from "../services/geminiService.js";

/**
 * Endpoint para generar estadísticas usando IA.
 * POST /api/gemini/generate
 * Body esperado: { "prompt": "texto..." }
 */
export const generateStats = async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: "El campo 'prompt' es requerido." });
    }

    const generatedJson = await generateCharacterStats(prompt);
    
    // Retornamos el JSON puro que nos entregó Gemini
    return res.status(200).json(generatedJson);
  } catch (error) {
    console.error("Error en geminiController:", error.message);
    
    // Error si falta la key
    if (error.message.includes("GEMINI_API_KEY")) {
      return res.status(500).json({ error: "El servidor no tiene configurada la clave de API de Gemini." });
    }

    return res.status(500).json({ error: "Error interno al generar las estadísticas con IA." });
  }
};
