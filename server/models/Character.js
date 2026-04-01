import mongoose from 'mongoose';

const defaultSkills = [
  { name: "Acrobacia", stat: "Destreza" },
  { name: "Artesanía", stat: "Inteligencia" },
  { name: "Atletismo", stat: "Fuerza" },
  { name: "Averiguar Intenciones", stat: "Sabiduría" },
  { name: "Conocimiento de Conjuros", stat: "Inteligencia" },
  { name: "Diplomacia", stat: "Carisma" },
  { name: "Engaño", stat: "Carisma" },
  { name: "Escapismo", stat: "Destreza" },
  { name: "Intimidar", stat: "Carisma" },
  { name: "Inutilizar Mecanismo", stat: "Destreza" },
  { name: "Juego de Manos", stat: "Destreza" },
  { name: "Lingüística", stat: "Inteligencia" },
  { name: "Montar", stat: "Destreza" },
  { name: "Nadar", stat: "Fuerza" },
  { name: "Percepción", stat: "Sabiduría" },
  { name: "Persuasión", stat: "Carisma" },
  { name: "Saber (Arcano)", stat: "Inteligencia" },
  { name: "Saber (Naturaleza)", stat: "Inteligencia" },
  { name: "Saber (Religión)", stat: "Inteligencia" },
  { name: "Sanar", stat: "Sabiduría" },
  { name: "Sigilo", stat: "Destreza" },
  { name: "Supervivencia", stat: "Sabiduría" },
  { name: "Trato con Animales", stat: "Carisma" },
  { name: "Usar Objeto Mágico", stat: "Carisma" }
];

const characterSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // BIOGRAFÍA
  name: { type: String, required: true },
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
  baseAttack: { type: Number, default: 0 },   // BAB
  speed: { type: String, default: "30 ft" },  // Velocidad
  initiativeMisc: { type: Number, default: 0 }, // Para dotes como Iniciativa Mejorada

  // ATAQUES Y ARMAS
  attacks: [{
    name: { type: String, required: true }, // "Espada Larga de Hierro Frío"
    attackBonus: { type: Number, default: 0 }, // El +1 mágico o bonos extra
    damageDice: { type: String, default: "1d8" }, // "1d8", "2d6", etc.
    damageBonus: { type: Number, default: 0 }, // Daño mágico extra
    critRange: { type: String, default: "20" }, // "19-20" o "20"
    critMultiplier: { type: String, default: "x2" }, // "x2", "x3"
    type: { type: String, default: "Melee" }, // "Melee", "Ranged", "Finesse"
    damageType: { type: String, default: "Cortante" } // "Cortante", "Perforante"
  }],

  // BILLETERA
  money: {
    cp: { type: Number, default: 0 }, // Cobre (Copper)
    sp: { type: Number, default: 0 }, // Plata (Silver)
    gp: { type: Number, default: 0 }, // Oro (Gold)
    pp: { type: Number, default: 0 }  // Platino (Platinum)
  },

  saves: {
    fort: { type: Number, default: 0 },
    ref: { type: Number, default: 0 },
    will: { type: Number, default: 0 }
  },

  armorClass: {
    armor: { type: Number, default: 0 },
    shield: { type: Number, default: 0 },
    natural: { type: Number, default: 0 },
    misc: { type: Number, default: 0 }
  },
  
  hp: {
    current: { type: Number, default: 10 },
    max: { type: Number, default: 10 }
  },

  // DOTES Y RASGOS (Feats & Traits)
  feats: [{
    name: { type: String, required: true },
    type: { type: String, default: "General" }, // Ej: Combate, Magia, Racial, Clase
    desc: { type: String, required: true }
  }],

  // STATS (Usando los nombres que ya tienes en tu frontend)
  stats: {
    Fuerza: { type: Number, default: 10 },
    Destreza: { type: Number, default: 10 },
    Constitución: { type: Number, default: 10 },
    Inteligencia: { type: Number, default: 10 },
    Sabiduría: { type: Number, default: 10 },
    Carisma: { type: Number, default: 10 }
  },

  // HABILIDADES (SKILLS)
  skills: {
    type: [{
      name: String,
      stat: String,
      ranks: { type: Number, default: 0 },
      miscModifier: { type: Number, default: 0 },
      isClassSkill: { type: Boolean, default: false }
    }],
    default: defaultSkills
  },

  // CARGA Y PESO
  weight: {
    current: { type: Number, default: 0 },
    max: { type: Number, default: 100 } // Basado en Fuerza usualmente
  },

  inventory: [{
    name: String,
    weight: { type: Number, default: 0 },
    desc: String,
    icon: { type: String, default: '📦' }
  }],

  spells: [{
    name: String,
    level: Number,
    school: String,
    desc: String,
    prepared: { type: Boolean, default: false }
  }],

  notes: [{
    title: String,
    content: String,
    color: { type: String, default: 'cyan' }, // Para tus post-its de colores
    date: { type: Date, default: Date.now }
  }]
}, { 
  timestamps: true 
});

const Character = mongoose.model('Character', characterSchema);
export default Character;