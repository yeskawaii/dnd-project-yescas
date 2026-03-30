import mongoose from 'mongoose';

const characterSchema = new mongoose.Schema({
  // EL DUEÑO: Esto vincula al personaje con un usuario de tu tabla de Users
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  name: { type: String, required: true },
  level: { type: Number, default: 1 },
  
  hp: {
    current: { type: Number, default: 20 },
    max: { type: Number, default: 20 }
  },

  stats: {
    STR: { type: Number, default: 10 },
    DEX: { type: Number, default: 10 },
    CON: { type: Number, default: 10 },
    INT: { type: Number, default: 10 },
    WIS: { type: Number, default: 10 },
    CHA: { type: Number, default: 10 }
  },

  // INVENTARIO
  inventory: [{
    name: String,
    weight: Number,
    desc: String,
    icon: { type: String, default: '📦' }
  }],

  // SECCIÓN DE SPELLS (HECHIZOS)
  spells: [{
    name: String,
    level: Number,
    school: String,
    desc: String,
    prepared: { type: Boolean, default: false }
  }],

  // SECCIÓN DE NOTAS (BITÁCORA)
  notes: [{
    title: String,
    content: String,
    date: { type: Date, default: Date.now }
  }]
}, { 
  timestamps: true // Esto te crea automáticamente campos de "Creado el" y "Actualizado el"
});

const Character = mongoose.model('Character', characterSchema);
export default Character;