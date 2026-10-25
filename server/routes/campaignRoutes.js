import express from "express";
import mongoose from "mongoose";
import Campaign from "../models/Campaign.js";
import Character from "../models/Character.js";
import { protect } from "../middleware/authMiddleware.js";
import { playerTable } from "../utils/sharedTable.js";
import { campaignTokenIcons } from "../utils/tokenIcons.js";

const router = express.Router();

router.get("/", protect, async (req, res) => {
  try {
    const characters = await Character.find({ user: req.user._id || req.user }).populate(
      "campaign",
      "name",
    );
    res.json(characters);
  } catch (error) {
    res.status(500).json({ message: "Error" });
  }
});

// 1. CREAR UNA CONTIENDA (Modo DM)
router.post("/create", protect, async (req, res) => {
  try {
    const { name } = req.body;

    // Generamos un código chido de 6 letras mayúsculas
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Aseguramos sacar el ID correcto sin importar cómo venga del middleware
    const dmId = req.user._id || req.user;

    const campaign = await Campaign.create({
      name,
      dm: dmId,
      inviteCode,
      dmWorkspace: { map: { gridType: "hex" } },
    });

    res.status(201).json(campaign);
  } catch (error) {
    console.error("🚨 Error al crear contienda:", error);
    res.status(500).json({ message: "Error al crear la contienda" });
  }
});

// routes/campaignRoutes.js -> Cambia la ruta /join así:
router.post("/join", protect, async (req, res) => {
  try {
    const { inviteCode, characterId } = req.body;
    const userId = req.user._id || req.user;

    const campaign = await Campaign.findOne({ inviteCode });
    if (!campaign) return res.status(404).json({ message: "Código inválido" });

    // LA CLAVE ESTÁ AQUÍ: Agregamos .populate() al final
    const character = await Character.findOneAndUpdate(
      { _id: characterId, user: userId },
      { campaign: campaign._id },
      { new: true },
    ).populate("campaign", "name"); // <--- AGREGA ESTO

    if (!character)
      return res.status(404).json({ message: "No se encontró el PJ" });

    res.json({ message: "Te uniste con éxito", character }); // Mandamos el character poblado
  } catch (error) {
    res.status(500).json({ message: "Error al unirse" });
  }
});

// Ruta para abandonar campaña
router.post("/leave", protect, async (req, res) => {
  try {
    const { characterId } = req.body;
    const userId = req.user._id || req.user;

    const character = await Character.findOneAndUpdate(
      { _id: characterId, user: userId },
      { campaign: null },
      { new: true },
    );

    res.json({ message: "Has abandonado la contienda", character });
  } catch (error) {
    res.status(500).json({ message: "Error al salir" });
  }
});

// 3. MIS CONTIENDAS (ESTA SIEMPRE DEBE IR ANTES DE LAS RUTAS CON :id)
router.get("/my-campaigns", protect, async (req, res) => {
  try {
    const dmId = req.user._id || req.user;
    const campaigns = await Campaign.find({ dm: dmId });
    res.json(campaigns);
  } catch (error) {
    console.error("🚨 Error en mis contiendas:", error);
    res.status(500).json({ message: "Error al obtener tus contiendas" });
  }
});

// 4. TABLERO DEL DM (Ver a los jugadores)
router.get("/:id/dashboard", protect, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).json({ message: "Contienda inválida" });
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign)
      return res.status(404).json({ message: "Contienda no encontrada" });
    const dmId = req.user._id || req.user;

    if (campaign.dm.toString() !== dmId.toString()) {
      return res
        .status(403)
        .json({ message: "No eres el Dungeon Master de esta contienda" });
    }

    const players = await Character.find({ campaign: campaign._id }).select(
      "name class race size level hp armorClass initiativeMisc baseAttack saves stats speed attacks spells feats skills traits inventory effects companions appearance.emblem",
    );

    res.json({ campaign, players });
  } catch (error) {
    console.error("🚨 Error al cargar tablero:", error);
    res.status(500).json({ message: "Error al cargar el tablero" });
  }
});

// Every poll rechecks both ownership and current campaign membership.
router.get("/:id/table", protect, async (req, res) => {
  res.set("Cache-Control", "private, no-store");
  try {
    const { characterId } = req.query;
    if (!mongoose.isValidObjectId(req.params.id) ||
        typeof characterId !== "string" || !mongoose.isValidObjectId(characterId)) {
      return res.status(400).json({ message: "Mesa o personaje inválido" });
    }
    const members = await Character.find({
      user: req.user._id || req.user, campaign: req.params.id,
    }).select("_id");
    const ownedCharacterIds = members.map((member) => String(member._id));
    if (!ownedCharacterIds.includes(characterId)) return res.status(403).json({ message: "Este personaje no tiene acceso a la contienda." });
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ message: "Contienda no encontrada" });
    const icons = campaign.dmWorkspace?.presentation?.enabled && campaign.dmWorkspace?.presentation?.shareMap
      ? await campaignTokenIcons(campaign) : {};
    res.json(playerTable(campaign, characterId, icons, ownedCharacterIds));
  } catch {
    res.status(500).json({ message: "No se pudo actualizar la mesa compartida." });
  }
});

// Players send a position, never a workspace. Recheck ownership and sharing on every move.
router.patch("/:id/table/token", protect, async (req, res) => {
  res.set("Cache-Control", "private, no-store");
  try {
    const { characterId, combatantId, x, y, revision } = req.body ?? {};
    if (!mongoose.isValidObjectId(req.params.id) ||
        typeof characterId !== "string" || !mongoose.isValidObjectId(characterId) ||
        typeof combatantId !== "string" || !combatantId || combatantId.length > 80 ||
        !Number.isInteger(x) || !Number.isInteger(y) || x < 0 || y < 0 ||
        !Number.isInteger(revision) || revision < 0) {
      return res.status(400).json({ message: "Movimiento inválido." });
    }
    const members = await Character.find({
      user: req.user._id || req.user, campaign: req.params.id,
    }).select("_id");
    const ownedCharacterIds = members.map((member) => String(member._id));
    if (!ownedCharacterIds.includes(characterId)) return res.status(403).json({ message: "Este personaje no tiene acceso a la contienda." });
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ message: "Contienda no encontrada" });
    const view = playerTable(campaign, characterId, {}, ownedCharacterIds);
    if (!view.map?.movableTokenIds.includes(combatantId))
      return res.status(403).json({ message: "Solo puedes mover las fichas visibles de tus personajes en esta contienda." });
    if (revision !== (campaign.workspaceRevision || 0))
      return res.status(409).json({ message: "El mapa cambió. Actualiza la mesa y vuelve a elegir el destino." });
    const map = campaign.dmWorkspace.map;
    if (x >= map.width || y >= map.height)
      return res.status(400).json({ message: "El destino está fuera del mapa." });
    if (map.cells.some((cell) => cell.x === x && cell.y === y && ["wall", "fog"].includes(cell.terrain)) ||
        map.tokens.some((token) => token.x === x && token.y === y && token.combatantId !== combatantId))
      return res.status(400).json({ message: "Ese destino no está disponible." });
    const filter = { _id: campaign._id };
    if (revision === 0) filter.$or = [{ workspaceRevision: 0 }, { workspaceRevision: { $exists: false } }];
    else filter.workspaceRevision = revision;
    const saved = await Campaign.findOneAndUpdate(filter, {
      $set: {
        "dmWorkspace.map.tokens.$[token].x": x,
        "dmWorkspace.map.tokens.$[token].y": y,
      },
      $inc: { workspaceRevision: 1 },
    }, { new: true, arrayFilters: [{ "token.combatantId": combatantId }] });
    if (!saved) return res.status(409).json({ message: "El mapa cambió. Actualiza la mesa y vuelve a elegir el destino." });
    res.json(playerTable(saved, characterId, await campaignTokenIcons(saved), ownedCharacterIds));
  } catch {
    res.status(500).json({ message: "No se pudo mover la ficha. Inténtalo de nuevo." });
  }
});

// Solo el DM puede leer (dashboard) y guardar su mesa completa, incluyendo los secretos.
router.get("/:id/workspace", protect, async (req, res) => {
  res.set("Cache-Control", "private, no-store");
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).json({ message: "Contienda inválida" });
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ message: "Contienda no encontrada" });
    if (String(campaign.dm) !== String(req.user._id || req.user))
      return res.status(403).json({ message: "Solo el DM puede leer esta mesa" });
    res.json({ workspace: campaign.dmWorkspace, revision: campaign.workspaceRevision || 0,
      tokenIcons: await campaignTokenIcons(campaign) });
  } catch {
    res.status(500).json({ message: "No se pudo actualizar la mesa." });
  }
});

router.put("/:id/workspace", protect, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).json({ message: "Contienda inválida" });
    const dm = req.user._id || req.user;
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign)
      return res.status(404).json({ message: "Contienda no encontrada" });
    if (String(campaign.dm) !== String(dm))
      return res
        .status(403)
        .json({ message: "Solo el DM puede guardar esta mesa" });
    const { workspace, revision } = req.body ?? {};
    if (
      !workspace ||
      typeof workspace !== "object" ||
      Array.isArray(workspace) ||
      !Number.isInteger(revision) ||
      revision < 0
    ) {
      return res.status(400).json({ message: "Mesa o versión inválida" });
    }
    // Construir un documento independiente valida listas, campos y referencias antes de escribir.
    const candidate = new Campaign({
      name: campaign.name,
      dm,
      inviteCode: campaign.inviteCode,
      dmWorkspace: {
        ...workspace,
        ...(workspace.map && typeof workspace.map === "object" && !Array.isArray(workspace.map) ? {
          map: { gridType: campaign.dmWorkspace?.map?.gridType || "square",
            feetPerCell: campaign.dmWorkspace?.map?.feetPerCell || 5,
            participants: campaign.dmWorkspace?.map?.participants?.map((entry) => entry.toObject()) || [],
            ...workspace.map },
        } : {}),
        // Cached older clients must not erase newly introduced scenes and messages.
        ...(workspace.presentation === undefined && campaign.dmWorkspace?.presentation
          ? { presentation: campaign.dmWorkspace.presentation.toObject() } : {}),
      },
    });
    await candidate.validate();
    // Validate new deliveries without making departed recipients block unrelated saves.
    const previous = new Map((campaign.dmWorkspace?.presentation?.secrets || [])
      .map((secret) => [secret.id, secret]));
    const recipients = [...new Set(candidate.dmWorkspace.presentation.secrets
      .filter((secret) => {
        const old = previous.get(secret.id);
        return !old || old.recipientId !== secret.recipientId ||
          (!old.released && secret.released) || old.content !== secret.content;
      }).map((secret) => secret.recipientId))];
    if (recipients.length) {
      const members = await Character.find({ campaign: campaign._id, _id: { $in: recipients } }).select("_id");
      const memberIds = new Set(members.map((member) => String(member._id)));
      if (recipients.some((recipient) => !memberIds.has(recipient)))
        return res.status(400).json({ message: "El destinatario del secreto ya no pertenece a esta contienda. Actualiza el grupo." });
    }
    const filter = { _id: campaign._id, dm };
    if (revision === 0)
      filter.$or = [
        { workspaceRevision: 0 },
        { workspaceRevision: { $exists: false } },
      ];
    else filter.workspaceRevision = revision;
    const saved = await Campaign.findOneAndUpdate(
      filter,
      {
        $set: { dmWorkspace: candidate.dmWorkspace.toObject() },
        $inc: { workspaceRevision: 1 },
      },
      { new: true },
    );
    if (!saved)
      return res
        .status(409)
        .json({
          message:
            "La mesa cambió en otra pestaña. Copia tus notas pendientes y vuelve a abrir la contienda para cargar la última versión.",
        });
    res.json({
      workspace: saved.dmWorkspace,
      revision: saved.workspaceRevision,
    });
  } catch (error) {
    if (
      ["ValidationError", "StrictModeError", "CastError"].includes(error.name)
    ) {
      return res
        .status(400)
        .json({
          message:
            "Revisa los datos de la mesa: hay valores inválidos o demasiado largos.",
        });
    }
    res.status(500).json({ message: "No se pudo guardar la mesa" });
  }
});

export default router;
