import mongoose from 'mongoose';

// Definimos la estructura (Schema) para que Mongo sepa qué guardar
const characterSchema = new mongoose.Schema({
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
  // El inventario es un array de objetos
  inventory: [{
    name: String,
    weight: Number,
    desc: String,
    icon: { type: String, default: '📦' }
  }]
});

const Character = mongoose.model('Character', characterSchema);
export default Character;