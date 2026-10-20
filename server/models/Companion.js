import mongoose from "mongoose";

const integer = (min, max, value) => ({
  type: Number, min, max, default: value, required: true, validate: Number.isInteger,
});
export const companionSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  kind: { type: String, enum: ["familiar", "summon", "homunculus", "animal", "mount", "other"], default: "familiar", required: true },
  active: { type: Boolean, default: true, required: true },
  hp: {
    current: integer(-9999, 99999, 10),
    max: integer(1, 99999, 10),
  },
  ac: integer(-100, 1000, 10),
  initiativeBonus: integer(-100, 100, 0),
  speed: { type: String, maxlength: 120, default: "30 ft" },
  duration: { type: String, maxlength: 200, default: "" },
  actions: { type: String, maxlength: 12000, default: "" },
  description: { type: String, maxlength: 12000, default: "" },
}, { strict: "throw" });
