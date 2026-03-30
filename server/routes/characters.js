import express from 'express';
import Character from '../models/Character.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// 🛡️ Aplicamos el middleware de protección a todas las rutas de este archivo
router.use(protect);

// GET: Obtener personaje DEL USUARIO LOGUEADO
router.get('/', async (req, res) => {
  try {
    // Buscamos el personaje que le pertenece a ESTE usuario (sacado del token)
    let char = await Character.findOne({ user: req.user }); 
    
    if (!char) {
      // Si no tiene uno, se lo creamos vinculado a su ID único
      char = await Character.create({
        user: req.user, 
        name: "Nuevo Aventurero", 
        level: 1,
        stats: { STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10 },
        inventory: []
      });
    }
    res.json(char);
  } catch (err) { 
    res.status(500).json({ error: "Error al pedir datos" }); 
  }
});

// POST: Guardar ítem (Solo en MI personaje)
router.post('/inventory', async (req, res) => {
  try {
    const char = await Character.findOne({ user: req.user });
    if (!char) return res.status(404).json({ error: "Personaje no encontrado" });

    char.inventory.push(req.body); 
    await char.save(); 
    
    // Devolvemos el último ítem agregado (el que tiene el _id de Mongo)
    res.status(201).json(char.inventory[char.inventory.length - 1]);
  } catch (err) { 
    res.status(400).json({ error: "No se pudo guardar" }); 
  }
});

// DELETE: Borrar ítem (Solo en MI personaje)
router.delete('/inventory/:id', async (req, res) => {
  try {
    const char = await Character.findOne({ user: req.user });
    if (!char) return res.status(404).json({ error: "Personaje no encontrado" });

    // Filtramos para quitar el objeto específico
    char.inventory = char.inventory.filter(item => item._id.toString() !== req.params.id);
    await char.save();
    
    res.sendStatus(200);
  } catch (err) { 
    res.status(400).json({ error: "No se pudo eliminar" }); 
  }
});

export default router;