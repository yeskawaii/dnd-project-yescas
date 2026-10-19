import express from 'express';
import Character from '../models/Character.js';
import { protect } from '../middleware/authMiddleware.js';
import { proposeLegacyRulesUpgrade } from '../utils/legacyRules.js';
import {
  applyTemplateFavorites,
  buildTemplateData,
  getCharacterTemplate,
  listCharacterTemplates,
} from '../data/characterTemplates.js';

const router = express.Router();

router.use(protect);

router.get('/templates', (req, res) => {
  res.json(listCharacterTemplates());
});

router.get('/:charId/rules-upgrade', async (req, res) => {
  try {
    const character = await Character.findOne({ _id: req.params.charId, user: req.user });
    if (!character) return res.status(404).json({ error: "No se encontró el personaje" });
    res.json(proposeLegacyRulesUpgrade(character));
  } catch {
    res.status(400).json({ error: "No se pudo preparar la vinculación" });
  }
});

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

// 2. POST: Crear desde una plantilla del servidor o una ficha en blanco.
router.post('/', async (req, res) => {
  try {
    const { name, charClass, templateId } = req.body ?? {};
    const template = templateId == null ? null : getCharacterTemplate(templateId);
    if (templateId != null && !template) {
      return res.status(400).json({ error: "La plantilla no existe. Vuelve a elegir un estilo de juego." });
    }
    const character = new Character({
      ...(template ? buildTemplateData(template) : { saves: { mode: "calculated" } }),
      user: req.user,
      name: typeof name === "string" && name.trim() ? name.trim() : template ? `${template.name} aventurero` : "Nuevo Aventurero",
      class: template ? template.name : typeof charClass === "string" && charClass.trim() ? charClass.trim() : "Guerrero",
    });
    // Los subdocumentos ya tienen IDs antes de guardar; los favoritos se persisten juntos.
    if (template) applyTemplateFavorites(character, template);
    const newChar = await Character.create(character);
    res.status(201).json(newChar);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message || "No se pudo crear el personaje" });
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
    const editable = new Set([
      'name', 'appearance', 'playLayout', 'class', 'level', 'race', 'deity', 'alignment', 'size', 'experience',
      'physicalWeight', 'height', 'baseAttack', 'speed', 'initiativeMisc', 'quickActions',
      'traits', 'attacks', 'money', 'saves', 'armorClass', 'hp', 'feats', 'stats',
      'skills', 'weight', 'inventory', 'spells', 'notes', 'effects',
    ]);
    if (!updates || typeof updates !== 'object' || Array.isArray(updates) ||
        Object.keys(updates).some(key => !editable.has(key.split('.')[0]) ||
          key.split('.').some(part => !part || part.startsWith('$') ||
            ['__proto__', 'constructor', 'prototype'].includes(part)))) {
      return res.status(400).json({ error: "Hay campos que no se pueden modificar desde la ficha" });
    }
    
    const updatedChar = await Character.findOneAndUpdate(
      { _id: req.params.charId, user: req.user },
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
    const char = await Character.findOne({ _id: req.params.charId, user: req.user });
    if (!char) return res.status(404).json({ error: "No se encontró el personaje" });
    char.notes.push({ title, content, color: color || 'cyan' });
    await char.save();
    res.json(char.notes[char.notes.length - 1]);
  } catch (err) {
    res.status(400).json({ error: "Error al crear nota" });
  }
});

router.delete('/:charId/notes/:noteId', async (req, res) => {
  try {
    const char = await Character.findOne({ _id: req.params.charId, user: req.user });
    if (!char) return res.status(404).json({ error: "No se encontró el personaje" });
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
    const character = await Character.findOne({ _id: req.params.charId, user: req.user });
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
    const character = await Character.findOne({ _id: req.params.charId, user: req.user });
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
    const character = await Character.findOne({ _id: req.params.charId, user: req.user });
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
    const character = await Character.findOne({ _id: req.params.charId, user: req.user });
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
