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
];
export const characterIcons = [
  ["sword", "Espada"],
  ["bow", "Arco"],
  ["axe", "Hacha"],
  ["dagger", "Daga"],
  ["shield", "Escudo"],
  ["helmet", "Yelmo"],
  ["magic", "Magia"],
  ["flame", "Fuego"],
  ["snow", "Hielo"],
  ["bolt", "Rayo"],
  ["moon", "Luna"],
  ["sun", "Sol"],
  ["leaf", "Naturaleza"],
  ["paw", "Bestia"],
  ["skull", "Calavera"],
  ["wing", "Ala"],
  ["eye", "Ojo"],
  ["heart", "Corazón"],
  ["potion", "Poción"],
  ["gem", "Gema"],
  ["book", "Libro"],
  ["scroll", "Pergamino"],
  ["bag", "Mochila"],
  ["dice", "Dados"],
  ["skill", "Habilidad"],
  ["star", "Estrella"],
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
