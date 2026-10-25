import mongoose from "mongoose";

const options = { _id: false, strict: "throw" };
export const visualIcon = () => ({
  type: String,
  maxlength: 32,
  default: "",
  validate: (value) => !value || /^[a-z][a-z-]{0,31}$/.test(value),
});

export const appearanceSchema = new mongoose.Schema(
  {
    theme: {
      type: String,
      enum: [
        "forest", "arcane", "ember", "ocean", "moon",
        "pink", "gray-light", "gray", "gray-dark", "white", "black",
      ],
      default: "forest",
      required: true,
    },
    backdrop: {
      type: String,
      enum: ["mist", "stars", "parchment", "plain"],
      default: "mist",
      required: true,
    },
    frame: {
      type: String,
      enum: ["round", "shield", "rune"],
      default: "shield",
      required: true,
    },
    emblem: { ...visualIcon(), default: "sword", required: true },
    portrait: {
      type: String,
      default: "",
      maxlength: 240000,
      validate: (value) =>
        !value ||
        /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(value),
    },
  },
  options,
);

const widgets = ["vitals", "defenses", "favorites", "shortcuts"];
export const playLayoutSchema = new mongoose.Schema(
  {
    order: {
      type: [String],
      default: () => [...widgets],
      required: true,
      validate: (value) =>
        value.length === widgets.length &&
        new Set(value).size === widgets.length &&
        value.every((id) => widgets.includes(id)),
    },
    hidden: {
      type: [String],
      default: [],
      required: true,
      validate: (value) =>
        new Set(value).size === value.length &&
        value.every((id) => ["defenses", "shortcuts"].includes(id)),
    },
    density: {
      type: String,
      enum: ["comfortable", "compact"],
      default: "comfortable",
      required: true,
    },
  },
  options,
);
