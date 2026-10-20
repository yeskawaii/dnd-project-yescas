import mongoose from "mongoose";
import { companionSchema } from "./Companion.js";
import { modifiers, defenseFields } from "./RuleModifier.js";
import {
  appearanceSchema,
  playLayoutSchema,
  visualIcon,
} from "./CharacterCustomization.js";

export const defaultSkills = [
  { name: "Abrir Cerraduras", stat: "Destreza" },
  { name: "Acrobacias", stat: "Destreza" },
  { name: "Artesanía", stat: "Inteligencia" },
  { name: "Averiguar Intenciones", stat: "Sabiduría" },
  { name: "Avistar", stat: "Sabiduría" },
  { name: "Buscar", stat: "Inteligencia" },
  { name: "Concentración", stat: "Constitución" },
  { name: "Conocimiento de Conjuros", stat: "Inteligencia" },
  { name: "Descifrar Escritura", stat: "Inteligencia" },
  { name: "Diplomacia", stat: "Carisma" },
  { name: "Disfrazarse", stat: "Carisma" },
  { name: "Engañar", stat: "Carisma" },
  { name: "Equilibrio", stat: "Destreza" },
  { name: "Escapismo", stat: "Destreza" },
  { name: "Escuchar", stat: "Sabiduría" },
  { name: "Esconderse", stat: "Destreza" },
  { name: "Falsificar", stat: "Inteligencia" },
  { name: "Interpretar", stat: "Carisma" },
  { name: "Intimidar", stat: "Carisma" },
  { name: "Inutilizar Mecanismo", stat: "Inteligencia" },
  { name: "Juego de Manos", stat: "Destreza" },
  { name: "Montar", stat: "Destreza" },
  { name: "Moverse Sigilosamente", stat: "Destreza" },
  { name: "Nadar", stat: "Fuerza" },
  { name: "Reunir Información", stat: "Carisma" },
  { name: "Saber (Arcano)", stat: "Inteligencia" },
  { name: "Saber (Naturaleza)", stat: "Inteligencia" },
  { name: "Saber (Religión)", stat: "Inteligencia" },
  { name: "Saltar", stat: "Fuerza" },
  { name: "Sanar", stat: "Sabiduría" },
  { name: "Supervivencia", stat: "Sabiduría" },
  { name: "Tasación", stat: "Inteligencia" },
  { name: "Trato con Animales", stat: "Carisma" },
  { name: "Trepar", stat: "Fuerza" },
  { name: "Usar Objeto Mágico", stat: "Carisma" },
  { name: "Usar Cuerda", stat: "Destreza" },
];

const characterSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // BIOGRAFÍA
    name: { type: String, required: true },
    appearance: { type: appearanceSchema, default: () => ({}), required: true },
    playLayout: { type: playLayoutSchema, default: () => ({}), required: true },
    class: { type: String, default: "Guerrero" },
    level: { type: Number, default: 1 },
    race: { type: String, default: "Humano" },
    deity: { type: String, default: "Ninguno" },
    alignment: { type: String, default: "Neutral" },
    size: { type: String, default: "Mediano" },
    experience: { type: Number, default: 0 },
    physicalWeight: { type: Number, default: 150 },
    height: { type: Number, default: 70 },

    // COMBATE BÁSICO
    baseAttack: { type: Number, default: 0 }, // BAB
    speed: { type: String, default: "30 ft" }, // Velocidad
    initiativeMisc: { type: Number, default: 0 }, // Para dotes como Iniciativa Mejorada

    // Orden de los accesos rápidos de cada personaje, sincronizado entre dispositivos.
    quickActions: {
      type: [
        {
          _id: false,
          kind: {
            type: String,
            enum: ["attack", "spell", "item", "skill"],
            required: true,
          },
          itemId: { type: String, required: true },
        },
      ],
      default: [],
      validate: {
        validator: (entries) =>
          new Set(entries.map((entry) => `${entry.kind}:${entry.itemId}`))
            .size === entries.length,
        message: "Los accesos rápidos no pueden repetirse",
      },
    },

    traits: [
      {
        name: String,
        description: String,
        source: String,
      },
    ],

    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign",
      default: null,
    },

    companions: {
      type: [companionSchema],
      default: [],
      validate: {
        validator: (entries) => entries.length <= 50 && entries.every(Boolean) &&
          new Set(entries.map((entry) => String(entry._id))).size === entries.length,
        message: "Máximo 50 acompañantes con identificadores únicos",
      },
    },

    // ATAQUES Y ARMAS
    attacks: [
      {
        name: { type: String, required: true }, // "Espada Larga de Hierro Frío"
        visualIcon: visualIcon(),
        attackBonus: { type: Number, default: 0 }, // El +1 mágico o bonos extra
        damageDice: { type: String, default: "1d8" }, // "1d8", "2d6", etc.
        damageBonus: { type: Number, default: 0 }, // Daño mágico extra
        critRange: { type: String, default: "20" }, // "19-20" o "20"
        critMultiplier: { type: String, default: "x2" }, // "x2", "x3"
        type: { type: String, default: "Melee" }, // "Melee", "Ranged", "Finesse"
        hands: { type: String, enum: ["one", "two", "offHand"], default: "one" },
        finesse: { type: Boolean, default: false },
        light: { type: Boolean, default: false },
        rangedDamage: { type: String, enum: ["none", "bow", "composite", "strength"], default: "none" },
        strengthRating: { type: Number, min: 0, max: 100, default: 0, validate: Number.isInteger },
        damageType: { type: String, default: "Cortante" }, // "Cortante", "Perforante"
      },
    ],

    // BILLETERA
    money: {
      cp: { type: Number, default: 0 }, // Cobre (Copper)
      sp: { type: Number, default: 0 }, // Plata (Silver)
      gp: { type: Number, default: 0 }, // Oro (Gold)
      pp: { type: Number, default: 0 }, // Platino (Platinum)
    },

    saves: {
      mode: { type: String, enum: ["manual", "calculated"], default: "manual" },
      fort: { type: Number, default: 0 },
      ref: { type: Number, default: 0 },
      will: { type: Number, default: 0 },
    },

    armorClass: {
      armor: { type: Number, default: 0 },
      shield: { type: Number, default: 0 },
      natural: { type: Number, default: 0 },
      misc: { type: Number, default: 0 },
      deflection: { type: Number, default: 0 },
      dodge: { type: Number, default: 0 },
      maxDex: { type: Number, min: 0, max: 100, default: null, validate: (value) => value == null || Number.isInteger(value) },
      checkPenalty: { type: Number, min: -100, max: 0, default: 0, validate: Number.isInteger },
    },

    hp: {
      current: { type: Number, default: 10 },
      max: { type: Number, default: 10 },
    },

    // DOTES Y RASGOS (Feats & Traits)
    feats: [
      {
        name: { type: String, required: true },
        type: { type: String, default: "General" }, // Ej: Combate, Magia, Racial, Clase
        desc: { type: String, required: true },
        active: { type: Boolean, default: true },
        modifiers: modifiers(),
      },
    ],

    effects: [{
      name: { type: String, required: true, maxlength: 150 },
      desc: { type: String, maxlength: 5000, default: "" },
      active: { type: Boolean, default: true },
      modifiers: modifiers(),
    }],

    // STATS (Usando los nombres que ya tienes en tu frontend)
    stats: {
      Fuerza: { type: Number, default: 10 },
      Destreza: { type: Number, default: 10 },
      Constitución: { type: Number, default: 10 },
      Inteligencia: { type: Number, default: 10 },
      Sabiduría: { type: Number, default: 10 },
      Carisma: { type: Number, default: 10 },
    },

    // HABILIDADES (SKILLS)
    skills: {
      type: [
        {
          name: String,
          visualIcon: visualIcon(),
          stat: String,
          ranks: { type: Number, default: 0 },
          miscModifier: { type: Number, default: 0 },
          isClassSkill: { type: Boolean, default: false },
          trainedOnly: { type: Boolean, default: undefined },
        },
      ],
      default: defaultSkills,
    },

    // CARGA Y PESO
    weight: {
      current: { type: Number, default: 0 },
      max: { type: Number, default: 100 }, // Basado en Fuerza usualmente
    },

    inventory: [
      {
        name: String,
        visualIcon: visualIcon(),
        weight: { type: Number, default: 0 },
        desc: String,
        icon: { type: String, default: "📦" },
        ...defenseFields,
        modifiers: modifiers(),
      },
    ],

    spells: [
      {
        name: String,
        visualIcon: visualIcon(),
        level: Number,
        school: String,
        desc: String,
        prepared: { type: Boolean, default: false },
      },
    ],

    notes: [
      {
        title: String,
        content: String,
        color: { type: String, default: "cyan" }, // Para tus post-its de colores
        date: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  },
);

const Character = mongoose.model("Character", characterSchema);
export default Character;
