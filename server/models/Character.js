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