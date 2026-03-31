import express from 'express';
import Character from '../models/Character.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

// 1. GET: Obtener TODOS los personajes del usuario
router.get('/', async (req, res) => {
  try {
    const characters = await Character.find({ user: req.user });
    res.json(characters);
  } catch (err) {
    res.status(500).json({ error: "Error al pedir la lista de aventureros" });
  }
});

// 2. POST: Crear un nuevo personaje
router.post('/', async (req, res) => {
  try {
    // Recibimos name y charClass (que viene del modal)
    const { name, charClass, stats } = req.body;
    
    const newChar = await Character.create({
      user: req.user,
      name: name || "Nuevo Aventurero",
      // Si quieres guardar la clase, asegúrate de tener el campo en tu Model (Character.js)
      // Si no lo tienes, Mongo simplemente lo ignorará por ahora.
      class: charClass || "Guerrero", 
      level: 1,
      stats: stats || { STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10 },
      inventory: [],
      spells: []
    });
    res.status(201).json(newChar);
  } catch (err) {
    res.status(400).json({ error: "No se pudo crear el personaje" });
  }
});

// 3. DELETE: Borrar un personaje completo
router.delete('/:charId', async (req, res) => {
  try {
    const result = await Character.findOneAndDelete({ _id: req.params.charId, user: req.user });
    if (!result) return res.status(404).json({ error: "No se encontró el personaje" });
    res.sendStatus(200);
  } catch (err) {
    res.status(400).json({ error: "Error al eliminar personaje" });
  }
});

// --- RUTAS DE INVENTARIO ---

router.post('/:charId/inventory', async (req, res) => {
  try {
    const char = await Character.findOne({ _id: req.params.charId, user: req.user });
    if (!char) return res.status(404).json({ error: "Personaje no encontrado" });

    char.inventory.push(req.body); 
    await char.save(); 
    res.status(201).json(char.inventory[char.inventory.length - 1]);
  } catch (err) { 
    res.status(400).json({ error: "No se pudo guardar el ítem" }); 
  }
});

router.delete('/:charId/inventory/:itemId', async (req, res) => {
  try {
    const char = await Character.findOne({ _id: req.params.charId, user: req.user });
    char.inventory = char.inventory.filter(item => item._id.toString() !== req.params.itemId);
    await char.save();
    res.sendStatus(200);
  } catch (err) { 
    res.status(400).json({ error: "No se pudo eliminar" }); 
  }
});

// --- RUTAS DE SPELLS ---

router.post('/:charId/spells', async (req, res) => {
  try {
    const char = await Character.findOne({ _id: req.params.charId, user: req.user });
    if (!char) return res.status(404).json({ error: "Personaje no encontrado" });

    char.spells.push(req.body); 
    await char.save();
    res.status(201).json(char.spells[char.spells.length - 1]);
  } catch (err) {
    res.status(400).json({ error: "Error al aprender el hechizo" });
  }
});

router.patch('/:charId/spells/:spellId', async (req, res) => {
    try {
      const char = await Character.findOne({ _id: req.params.charId, user: req.user });
      const spell = char.spells.id(req.params.spellId);
      spell.prepared = !spell.prepared;
      await char.save();
      res.json(spell);
    } catch (err) {
      res.status(400).json({ error: "No se pudo cambiar el estado" });
    }
});

router.delete('/:charId/spells/:spellId', async (req, res) => {
  try {
    const char = await Character.findOne({ _id: req.params.charId, user: req.user });
    char.spells = char.spells.filter(s => s._id.toString() !== req.params.spellId);
    await char.save();
    res.sendStatus(200);
  } catch (err) {
    res.status(400).json({ error: "No se pudo borrar" });
  }
});

// Actualizar stats o HP: /api/character/:id/update
router.patch('/:id/update', async (req, res) => {
  try {
    const { stats, hp } = req.body;
    const updatedChar = await Character.findByIdAndUpdate(
      req.params.id,
      { $set: { stats, hp } },
      { new: true }
    );
    res.json(updatedChar);
  } catch (err) {
    res.status(500).json({ error: "No se pudo actualizar el personaje" });
  }
});

export default router;