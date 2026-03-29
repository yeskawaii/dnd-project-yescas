import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Mock Data (Esto vendrá de MongoDB después)
// server/index.js
const characterData = {
  name: "Kuro el Cuervo",
  level: 3,
  stats: { STR: 10, DEX: 18, CON: 14, INT: 12, WIS: 10, CHA: 14 },
  inventory: [
    { id: 1, name: "Daga de Cristal", weight: 1, desc: "Brilla con un color azul tenue cuando hay trasgos cerca." },
    { id: 2, name: "Cuerda de Cáñamo (15m)", weight: 5, desc: "Cuerda resistente, algo desgastada en las puntas." },
    { id: 3, name: "Poción de Curación", weight: 0.5, desc: "Recupera 2d4 + 2 puntos de vida." }
  ]
};

app.get('/api/character', (req, res) => {
  res.json(characterData);
});

app.listen(PORT, () => console.log(`🚀 Server en puerto ${PORT}`));