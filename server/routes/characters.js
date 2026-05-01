import express from 'express';
import Character from '../models/Character.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

// 1. GET: Obtener TODOS los personajes
router.get('/', async (req, res) => {
  try {
    const characters = await Character.find({ user: req.user })
                                      .populate('campaign', 'name'); 
    res.json(characters);
  } catch (err) {
    res.status(500).json({ error: "Error al pedir la lista de aventureros" });
  }
});

// 2. POST: Crear personaje
router.post('/', async (req, res) => {
  try {
    const { name, charClass, stats } = req.body;
    
    const newChar = await Character.create({
      user: req.user,
      name: name || "Nuevo Aventurero",
      class: charClass || "Guerrero", 
      level: 1,
      race: "Humano",
      experience: 0, 
      physicalWeight: 150, 
      alignment: "N",
      deity: "Ninguna",
      baseAttack: 0,
      initiativeMisc: 0,
      speed: "30 ft",
      saves: { fort: 0, ref: 0, will: 0 },
      armorClass: { armor: 0, shield: 0, natural: 0, misc: 0 },
      stats: stats || { 
        Fuerza: 10, 
        Destreza: 10, 
        Constitución: 10, 
        Inteligencia: 10, 
        Sabiduría: 10, 
        Carisma: 10 
      },
      hp: { current: 10, max: 10 },
      inventory: [],
      spells: [],
      notes: []
    });
    res.status(201).json(newChar);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "No se pudo crear el personaje" });
  }
});

// 3. DELETE: Borrar personaje
router.delete('/:charId', async (req, res) => {
  try {
    const result = await Character.findOneAndDelete({ _id: req.params.charId, user: req.user });
    if (!result) return res.status(404).json({ error: "No se encontró el personaje" });
    res.sendStatus(200);
  } catch (err) {
    res.status(400).json({ error: "Error al eliminar personaje" });
  }
});

// 4. PATCH: ACTUALIZACIÓN MAESTRA
router.patch('/:charId/update', async (req, res) => {
  try {
    const updates = req.body;
    
    const updatedChar = await Character.findByIdAndUpdate(
      req.params.charId,
      { $set: updates },
      { 
        new: true,
        runValidators: true,
        context: 'query'
      }
    ).populate('campaign', 'name');

    if (!updatedChar) return res.status(404).json({ error: "No se encontró el personaje" });
    
    res.json(updatedChar); 
  } catch (err) {
    res.status(500).json({ error: "No se pudo actualizar el personaje" });
  }
});

// --- INVENTARIO ---
router.post('/:charId/inventory', async (req, res) => {
  try {
    const char = await Character.findOne({ _id: req.params.charId, user: req.user });
    char.inventory.push(req.body); 
    await char.save(); 
    res.status(201).json(char.inventory[char.inventory.length - 1]);
  } catch (err) { 
    res.status(400).json({ error: "No se pudo guardar el ítem" }); 
  }
});

router.patch('/:charId/inventory/:itemId', async (req, res) => {
  try {
    const char = await Character.findOne({ _id: req.params.charId, user: req.user });
    const item = char.inventory.id(req.params.itemId);
    if (!item) return res.status(404).json({ message: 'Objeto no encontrado' });
    
    Object.assign(item, req.body);
    await char.save();
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar objeto' });
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

// --- SPELLS ---
router.post('/:charId/spells', async (req, res) => {
  try {
    const char = await Character.findOne({ _id: req.params.charId, user: req.user });
    char.spells.push(req.body); 
    await char.save();
    res.status(201).json(char.spells[char.spells.length - 1]);
  } catch (err) {
    res.status(400).json({ error: "Error al aprender el hechizo" });
  }
});

// UNIFICADA: Editar hechizo O Preparar hechizo
router.patch('/:charId/spells/:spellId', async (req, res) => {
  try {
    const char = await Character.findOne({ _id: req.params.charId, user: req.user });
    const spell = char.spells.id(req.params.spellId);
    
    if (!spell) return res.status(404).json({ message: 'Hechizo no encontrado' });
    
    // Si la petición viene sin datos, es el botón de Preparar (Toggle)
    if (Object.keys(req.body).length === 0) {
      spell.prepared = !spell.prepared;
    } else {
      // Si trae datos (desde el modal), actualiza los valores
      Object.assign(spell, req.body);
    }
    
    await char.save();
    res.json(spell);
  } catch (err) {
    res.status(500).json({ error: "No se pudo actualizar el hechizo" });
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

// --- NOTAS ---
router.post('/:charId/notes', async (req, res) => {
  try {
    const { title, content, color } = req.body;
    const char = await Character.findById(req.params.charId);
    char.notes.push({ title, content, color: color || 'cyan' });
    await char.save();
    res.json(char.notes[char.notes.length - 1]);
  } catch (err) {
    res.status(400).json({ error: "Error al crear nota" });
  }
});

router.delete('/:charId/notes/:noteId', async (req, res) => {
  try {
    const char = await Character.findById(req.params.charId);
    char.notes = char.notes.filter(n => n._id.toString() !== req.params.noteId);
    await char.save();
    res.json({ message: "Nota eliminada" });
  } catch (err) {
    res.status(400).json({ error: "Error al borrar nota" });
  }
});

// 🗡️ ARMAS Y ATAQUES
router.post('/:charId/attacks', async (req, res) => {
  try {
    const character = await Character.findById(req.params.charId);
    if (!character) return res.status(404).json({ message: 'Aventurero no encontrado' });

    character.attacks.push(req.body);
    await character.save();
    const newAttack = character.attacks[character.attacks.length - 1];
    res.status(201).json(newAttack);
  } catch (error) {
    res.status(500).json({ message: 'Error en la forja (DB Error)' });
  }
});

router.delete('/:charId/attacks/:attackId', async (req, res) => {
  try {
    const character = await Character.findById(req.params.charId);
    if (!character) return res.status(404).json({ message: 'Aventurero no encontrado' });

    character.attacks.pull(req.params.attackId);
    await character.save();
    res.status(200).json({ message: 'Arma destruida exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al tirar el arma' });
  }
});

// 🌟 DOTES Y RASGOS
router.post('/:charId/feats', async (req, res) => {
  try {
    const character = await Character.findById(req.params.charId);
    if (!character) return res.status(404).json({ message: 'Aventurero no encontrado' });

    character.feats.push(req.body);
    await character.save();
    res.status(201).json(character.feats[character.feats.length - 1]);
  } catch (error) {
    res.status(500).json({ message: 'Error al memorizar la dote' });
  }
});

router.delete('/:charId/feats/:featId', async (req, res) => {
  try {
    const character = await Character.findById(req.params.charId);
    if (!character) return res.status(404).json({ message: 'Aventurero no encontrado' });

    character.feats.pull(req.params.featId);
    await character.save();
    res.status(200).json({ message: 'Dote olvidada' });
  } catch (error) {
    res.status(500).json({ message: 'Error al borrar la dote' });
  }
});

// 📝 EDITAR NOTA
router.patch('/:charId/notes/:noteId', async (req, res) => {
  try {
    const char = await Character.findOne({ _id: req.params.charId, user: req.user });
    const note = char.notes.id(req.params.noteId);
    if (!note) return res.status(404).json({ message: 'Nota no encontrada' });
    
    Object.assign(note, req.body);
    await char.save();
    res.json(note);
  } catch (err) {
    res.status(500).json({ error: "Error al actualizar nota" });
  }
});

export default router;