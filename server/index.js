import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

app.get('/api/character', (req, res) => {
  res.json({
    name: "Kuro el Cuervo",
    level: 3,
    stats: { str: 10, dex: 18, con: 12, int: 14, wis: 10, cha: 12 }
  });
});

app.listen(PORT, () => console.log(`🚀 Server en puerto ${PORT}`));