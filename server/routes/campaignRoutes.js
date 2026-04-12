import express from 'express';
import Campaign from '../models/Campaign.js';
import Character from '../models/Character.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// 1. CREAR UNA CONTIENDA (Modo DM)
router.post('/create', protect, async (req, res) => {
  try {
    const { name } = req.body;
    
    // Generamos un código chido de 6 letras mayúsculas
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Aseguramos sacar el ID correcto sin importar cómo venga del middleware
    const dmId = req.user._id || req.user;

    const campaign = await Campaign.create({
      name,
      dm: dmId,
      inviteCode
    });

    res.status(201).json(campaign);
  } catch (error) {
    console.error("🚨 Error al crear contienda:", error);
    res.status(500).json({ message: 'Error al crear la contienda' });
  }
});

// 2. UNIRSE A UNA CONTIENDA (Modo Jugador)
router.post('/join', protect, async (req, res) => {
  try {
    const { inviteCode, characterId } = req.body;
    const userId = req.user._id || req.user;

    // Buscamos si existe una campaña con ese código
    const campaign = await Campaign.findOne({ inviteCode });
    if (!campaign) {
      return res.status(404).json({ message: 'Código de invitación inválido o expirado' });
    }

    // Le pegamos el ID de la campaña al personaje del jugador
    const character = await Character.findOneAndUpdate(
      { _id: characterId, user: userId }, 
      { campaign: campaign._id },
      { new: true }
    );

    if (!character) {
      return res.status(404).json({ message: 'Personaje no encontrado o no es tuyo' });
    }

    res.json({ message: 'Te uniste a la contienda con éxito', campaign });
  } catch (error) {
    console.error("🚨 Error al unirse:", error);
    res.status(500).json({ message: 'Error al unirse a la contienda' });
  }
});

// 3. MIS CONTIENDAS (ESTA SIEMPRE DEBE IR ANTES DE LAS RUTAS CON :id)
router.get('/my-campaigns', protect, async (req, res) => {
  try {
    const dmId = req.user._id || req.user;
    const campaigns = await Campaign.find({ dm: dmId });
    res.json(campaigns);
  } catch (error) {
    console.error("🚨 Error en mis contiendas:", error);
    res.status(500).json({ message: 'Error al obtener tus contiendas' });
  }
});

// 4. TABLERO DEL DM (Ver a los jugadores)
router.get('/:id/dashboard', protect, async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    const dmId = req.user._id || req.user;
    
    if (campaign.dm.toString() !== dmId.toString()) {
      return res.status(403).json({ message: 'No eres el Dungeon Master de esta contienda' });
    }

    const players = await Character.find({ campaign: campaign._id })
      .select('name class level hp armorClass initiativeMisc baseAttack saves stats');

    res.json({ campaign, players });
  } catch (error) {
    console.error("🚨 Error al cargar tablero:", error);
    res.status(500).json({ message: 'Error al cargar el tablero' });
  }
});

export default router;