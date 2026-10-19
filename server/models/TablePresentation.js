import mongoose from "mongoose";

const options = { _id: false, strict: "throw" };
const text = (maxlength, extra = {}) => ({ type: String, maxlength, ...extra });
const id = () => text(80, { required: true, match: /^[a-zA-Z0-9_-]+$/ });
const sceneFields = {
  id: id(),
  title: text(160, { required: true, trim: true }),
  description: text(12000, { default: "" }),
  imageUrl: text(2000, {
    default: "",
    validate: (value) => {
      if (!value) return true;
      try {
        const url = new URL(value);
        return url.protocol === "https:" && !url.username && !url.password;
      } catch { return false; }
    },
  }),
  mood: { type: String, enum: ["forest", "ruins", "tavern", "storm"], default: "forest" },
};
const scene = new mongoose.Schema(sceneFields, options);
const presentedScene = new mongoose.Schema({
  ...sceneFields,
  presentationId: id(),
}, options);
const secret = new mongoose.Schema({
  id: id(),
  title: text(160, { required: true, trim: true }),
  content: text(12000, { required: true, trim: true }),
  recipientId: text(24, { required: true, lowercase: true, match: /^[a-f0-9]{24}$/ }),
  released: { type: Boolean, default: false },
}, options);
const list = (schema, max) => ({
  type: [schema], default: [], required: true,
  validate: (entries) => Array.isArray(entries) && entries.length <= max &&
    entries.every(Boolean) && new Set(entries.map((entry) => entry.id)).size === entries.length,
});

export const tablePresentationSchema = new mongoose.Schema({
  enabled: { type: Boolean, default: false },
  shareMap: { type: Boolean, default: false },
  showEnemyHp: { type: Boolean, default: false },
  scenes: list(scene, 50),
  activeScene: { type: presentedScene, default: null },
  secrets: list(secret, 200),
}, options);
