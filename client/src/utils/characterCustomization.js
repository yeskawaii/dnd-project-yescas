import { characterIcons } from "../../../shared/mapTokens.mjs";
export { characterIcons } from "../../../shared/mapTokens.mjs";

export const characterThemes = [
  {
    id: "forest",
    name: "Bosque",
    hint: "Musgo y luz de luna",
    accent: "#b7ddc4",
    bg: "#101918",
    panel: "#192523",
    raised: "#20302c",
    line: "#34473e",
    muted: "#a4b4ab",
  },
  {
    id: "arcane",
    name: "Arcano",
    hint: "Tinta y amatista",
    accent: "#d7b9fb",
    bg: "#181321",
    panel: "#241d31",
    raised: "#342745",
    line: "#4a3a60",
    muted: "#b8abc8",
  },
  {
    id: "ember",
    name: "Ascua",
    hint: "Cobre y fuego",
    accent: "#f5bc96",
    bg: "#211713",
    panel: "#30221d",
    raised: "#443026",
    line: "#604336",
    muted: "#c6afa0",
  },
  {
    id: "ocean",
    name: "Marea",
    hint: "Sal y aguas profundas",
    accent: "#9edce7",
    bg: "#101b23",
    panel: "#192b35",
    raised: "#233c48",
    line: "#365464",
    muted: "#a2bbc8",
  },
  {
    id: "moon",
    name: "Luna",
    hint: "Plata y medianoche",
    accent: "#d1d6ef",
    bg: "#171923",
    panel: "#232734",
    raised: "#32394c",
    line: "#46516a",
    muted: "#aeb6ca",
  },
  {
    id: "pink",
    name: "Rosa",
    hint: "Pétalos y cuarzo",
    accent: "#f4b8d1",
    bg: "#21151c",
    panel: "#30212a",
    raised: "#442d3b",
    line: "#614255",
    muted: "#c5abb8",
  },
  {
    id: "gray-light",
    name: "Gris claro",
    hint: "Plata suave",
    accent: "#dedede",
    bg: "#242424",
    panel: "#303030",
    raised: "#3c3c3c",
    line: "#595959",
    muted: "#bebebe",
  },
  {
    id: "gray",
    name: "Gris medio",
    hint: "Acero pulido",
    accent: "#bcbcbc",
    bg: "#1b1b1b",
    panel: "#272727",
    raised: "#343434",
    line: "#505050",
    muted: "#b3b3b3",
  },
  {
    id: "gray-dark",
    name: "Gris oscuro",
    hint: "Grafito y ceniza",
    accent: "#a0a0a0",
    bg: "#121212",
    panel: "#1e1e1e",
    raised: "#2b2b2b",
    line: "#454545",
    muted: "#a8a8a8",
  },
  {
    id: "white",
    name: "Blanco",
    hint: "Tiza y luz",
    accent: "#ffffff",
    bg: "#202020",
    panel: "#2c2c2c",
    raised: "#383838",
    line: "#555555",
    muted: "#c4c4c4",
  },
  {
    id: "black",
    name: "Negro",
    hint: "Ónix y sombras",
    accent: "#d0d0d0",
    bg: "#000000",
    panel: "#0e0e0e",
    raised: "#1c1c1c",
    line: "#383838",
    muted: "#a6a6a6",
  },
];
export const playWidgets = [
  { id: "vitals", name: "Puntos de vida", icon: "heart", required: true },
  { id: "defenses", name: "Defensa e iniciativa", icon: "shield" },
  { id: "favorites", name: "Acciones rápidas", icon: "star", required: true },
  { id: "shortcuts", name: "Accesos al personaje", icon: "book" },
];
export const defaultAppearance = {
  theme: "forest",
  backdrop: "mist",
  frame: "shield",
  emblem: "sword",
  mapTokenStyle: "icon",
  portrait: "",
};
export function getAppearance(character) {
  const input = character?.appearance || {};
  return {
    theme: characterThemes.some((theme) => theme.id === input.theme)
      ? input.theme
      : "forest",
    backdrop: ["mist", "stars", "parchment", "plain"].includes(input.backdrop)
      ? input.backdrop
      : "mist",
    frame: ["round", "shield", "rune"].includes(input.frame)
      ? input.frame
      : "shield",
    emblem: characterIcons.some(([id]) => id === input.emblem)
      ? input.emblem
      : "sword",
    mapTokenStyle: input.mapTokenStyle === "portrait" ? "portrait" : "icon",
    portrait:
      typeof input.portrait === "string" &&
      /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(
        input.portrait,
      )
        ? input.portrait
        : "",
  };
}
export function appearanceStyle(appearance) {
  const theme =
    characterThemes.find((entry) => entry.id === appearance?.theme) ||
    characterThemes[0];
  return {
    "--mint": theme.accent,
    "--accent": theme.accent,
    "--bg": theme.bg,
    "--panel": theme.panel,
    "--panel-raised": theme.raised,
    "--line": theme.line,
    "--muted": theme.muted,
  };
}
export function getPlayLayout(character) {
  const input = character?.playLayout || {};
  const ids = playWidgets.map((widget) => widget.id);
  const order = [
    ...new Set(
      (Array.isArray(input.order) ? input.order : []).filter((id) =>
        ids.includes(id),
      ),
    ),
  ];
  return {
    order: [...order, ...ids.filter((id) => !order.includes(id))],
    hidden: [
      ...new Set(
        (Array.isArray(input.hidden) ? input.hidden : []).filter((id) =>
          playWidgets.some((widget) => widget.id === id && !widget.required),
        ),
      ),
    ],
    density: input.density === "compact" ? "compact" : "comfortable",
  };
}
export function resourceIcon(item, fallback) {
  if (characterIcons.some(([id]) => id === item.visualIcon))
    return item.visualIcon;
  // Preserve the familiar categories of existing inventories.
  return (
    { "🧪": "potion", "⚔️": "sword", "🛡️": "shield", "📜": "scroll" }[
      item.icon
    ] || fallback
  );
}

export function portraitCrop(width, height, zoom = 1, x = 50, y = 50) {
  const side = Math.min(width, height) / Math.max(1, Math.min(3, zoom));
  return {
    x: ((width - side) * Math.max(0, Math.min(100, x))) / 100,
    y: ((height - side) * Math.max(0, Math.min(100, y))) / 100,
    side,
  };
}
