import mongoose from "mongoose";
import { modifierTargets, bonusTypes } from "../../shared/characterRules.mjs";

const integer = (min, max, extra = {}) => ({ type: Number, min, max, validate: (value) => value == null || Number.isInteger(value), ...extra });
export const modifierSchema = new mongoose.Schema({
  target: { type: String, enum: Object.keys(modifierTargets), required: true },
  value: integer(-100, 100, { required: true }),
  bonusType: { type: String, enum: bonusTypes, default: "untyped" },
  skillName: { type: String, maxlength: 150, default: "" },
  attackName: { type: String, maxlength: 150, default: "" },
}, { _id: false, strict: "throw" });
export const modifiers = () => ({ type: [modifierSchema], default: [], validate: (entries) => entries.length <= 30 });
export const defenseFields = {
  equipmentSlot: { type: String, enum: ["none", "armor", "shield"], default: "none" },
  equipped: { type: Boolean, default: false },
  defenseBonus: integer(0, 100, { default: 0 }),
  maxDex: integer(0, 100, { default: null }),
  armorCheckPenalty: integer(-100, 0, { default: 0 }),
};
