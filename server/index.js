import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Character from './models/Character.js';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// 1. CONEXIÓN A TU MONGO ATLAS
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('🔥 ¡CONECTADO A MONGO ATLAS, YESCAS!'))
  .catch(err => console.error('❌ ERROR:', err));

// 2. RUTA PARA OBTENER AL PERSONAJE (GET)
app.get('/api/character', async (req, res) => {
  try {
    let char = await Character.findOne();
    if (!char) {
      // Si la DB está vacía, creamos a Kuro por primera vez
      char = await Character.create({
        name: "Kuro el Cuervo",
        level: 3,
        stats: { STR: 10, DEX: 18, CON: 14, INT: 12, WIS: 10, CHA: 14 },
        inventory: []
      });
    }
    res.json(char);
  } catch (err) {
    res.status(500).json({ error: "Error al pedir datos" });
  }
});

// 3. RUTA PARA GUARDAR ÍTEM (POST) <-- ¡AQUÍ ESTÁ EL SAVE!
app.post('/api/inventory', async (req, res) => {
  try {
    const char = await Character.findOne();
    // Metemos lo que mandó React (req.body) al array
    char.inventory.push(req.body); 
    
    // ESTA LÍNEA ES LA QUE ESCRIBE EN LA NUBE:
    await char.save(); 
    
    // Le regresamos a React el último ítem (ya con su _id de Mongo)
    res.status(201).json(char.inventory[char.inventory.length - 1]);
  } catch (err) {
    res.status(400).json({ error: "No se pudo guardar" });
  }
});

// 4. RUTA PARA BORRAR ÍTEM (DELETE)
app.delete('/api/inventory/:id', async (req, res) => {
  try {
    const char = await Character.findOne();
    // Filtramos el inventario para quitar el ID que mandó React
    char.inventory = char.inventory.filter(item => item._id.toString() !== req.params.id);
    
    // GUARDAMOS LOS CAMBIOS EN LA NUBE:
    await char.save();
    
    res.sendStatus(200);
  } catch (err) {
    res.status(400).json({ error: "No se pudo eliminar" });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server volando en el puerto ${PORT}`));