import mongoose from 'mongoose';

const characterSchema = new mongoose.Schema({
  userId: String,
  name: { type: String, default: "Nuevo Aventurero" },
  class: String,
  level: { type: Number, default: 1 },
  stats: {
    str: { type: Number, default: 10 },
    dex: { type: Number, default: 10 },
    con: { type: Number, default: 10 },
    int: { type: Number, default: 10 },
    wis: { type: Number, default: 10 },
    cha: { type: Number, default: 10 }
  },

  features: [{ title: String, description: String }], 
  spells: [{ name: String, level: Number, desc: String }],
  inventory: [{ item: String, weight: Number, desc: String }]
});

export const Character = mongoose.model('Character', characterSchema);