import mongoose from "mongoose";
import { tablePresentationSchema } from "./TablePresentation.js";

const text = (maxlength, extra = {}) => ({ type: String, maxlength, ...extra });
const integer = (min, max, extra = {}) => ({
  type: Number,
  min,
  max,
  required: true,
  validate: Number.isInteger,
  ...extra,
});
const options = { _id: false, strict: "throw" };
const actor = new mongoose.Schema(
  {
    id: text(80, { required: true }),
    name: text(120, { required: true, trim: true }),
    kind: {
      type: String,
      enum: ["monster", "npc", "ally"],
      required: true,
      default: "monster",
    },
    hp: integer(-9999, 99999, { default: 10 }),
    maxHp: integer(1, 99999, { default: 10 }),
    ac: integer(-100, 1000, { default: 10 }),
    initiativeBonus: integer(-100, 100, { default: 0 }),
    actions: text(12000, { default: "" }),
    description: text(12000, { default: "" }),
  },
  options,
);
const combatant = new mongoose.Schema(
  {
    ...actor.obj,
    kind: {
      type: String,
      enum: ["monster", "npc", "ally", "player"],
      required: true,
    },
    sourceId: text(80),
    initiative: integer(-100, 200, { default: 0 }),
    tieBreaker: integer(0, 999999, { default: 0 }),
    conditions: text(500, { default: "" }),
    visibleToPlayers: { type: Boolean, default: false },
  },
  options,
);
const note = new mongoose.Schema(
  {
    id: text(80, { required: true }),
    title: text(160, { required: true, trim: true }),
    category: {
      type: String,
      enum: ["session", "quest", "place", "secret"],
      default: "session",
    },
    content: text(20000, { default: "" }),
    pinned: { type: Boolean, default: false },
  },
  options,
);
const cell = new mongoose.Schema(
  {
    x: integer(0, 29, { required: true }),
    y: integer(0, 29, { required: true }),
    terrain: {
      type: String,
      enum: ["wall", "water", "door", "fog"],
      required: true,
    },
  },
  options,
);
const token = new mongoose.Schema(
  {
    combatantId: text(80, { required: true }),
    x: integer(0, 29, { required: true }),
    y: integer(0, 29, { required: true }),
  },
  options,
);
const limited = (schema, max) => ({
  type: [schema],
  default: [],
  required: true,
  validate: {
    validator: (entries) =>
      Array.isArray(entries) && entries.length <= max && entries.every(Boolean),
    message: `Máximo ${max} elementos`,
  },
});

export const dmWorkspaceSchema = new mongoose.Schema(
  {
    presentation: { type: tablePresentationSchema, default: () => ({}), required: true },
    actors: limited(actor, 200),
    combat: {
      type: new mongoose.Schema(
        {
          name: text(160, { default: "Nuevo encuentro" }),
          round: integer(1, 99999, { default: 1 }),
          activeId: text(80, { default: "" }),
          combatants: limited(combatant, 100),
        },
        options,
      ),
      default: () => ({}),
    },
    notes: limited(note, 300),
    map: {
      type: new mongoose.Schema(
        {
          name: text(120, { default: "Escena de batalla" }),
          gridType: { type: String, enum: ["square", "hex"], default: "square", required: true },
          feetPerCell: integer(1, 100, { default: 5 }),
          width: integer(8, 30, { default: 16 }),
          height: integer(8, 30, { default: 12 }),
          cells: limited(cell, 900),
          tokens: limited(token, 100),
          participants: limited(combatant, 100),
        },
        options,
      ),
      default: () => ({}),
    },
  },
  options,
);

dmWorkspaceSchema.pre("validate", function () {
  if (!this.combat || !this.map) {
    this.invalidate("combat", "La mesa necesita un encuentro y un mapa");
    return;
  }
  for (const key of ["actors", "notes"]) {
    const ids = (this[key] || []).map((entry) => entry?.id);
    if (new Set(ids).size !== ids.length)
      this.invalidate(key, "Los identificadores no pueden repetirse");
  }
  const ids = (this.combat.combatants || []).map((entry) => entry?.id);
  if (new Set(ids).size !== ids.length)
    this.invalidate("combat", "Los combatientes no pueden repetirse");
  if (this.combat.activeId && !ids.includes(this.combat.activeId))
    this.invalidate("combat.activeId", "Turno inválido");
  const mapIds = [...ids, ...(this.map.participants || []).map((entry) => entry?.id)];
  if (new Set(mapIds).size !== mapIds.length)
    this.invalidate("map.participants", "Las fichas del mapa no pueden repetirse ni duplicar participantes del combate");
  const positions = new Set();
  const tokenIds = new Set();
  for (const entry of [...(this.map.cells || []), ...(this.map.tokens || [])]) {
    if (!entry) continue;
    if (entry.x >= this.map.width || entry.y >= this.map.height)
      this.invalidate("map", "Posición fuera del mapa");
    if (entry.combatantId) {
      if (!mapIds.includes(entry.combatantId) || tokenIds.has(entry.combatantId))
        this.invalidate("map.tokens", "Ficha inválida o repetida");
      tokenIds.add(entry.combatantId);
    } else {
      const key = `${entry.x}:${entry.y}`;
      if (positions.has(key)) this.invalidate("map.cells", "Casilla repetida");
      positions.add(key);
    }
  }
});
