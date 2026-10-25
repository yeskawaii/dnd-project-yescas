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

export function tokenIcon(entry) {
  if (characterIcons.some(([id]) => id === entry?.icon)) return entry.icon;
  return { player: "sword", ally: "paw", monster: "skull", npc: "shield" }[entry?.kind] || "dice";
}

export function safePortrait(value) {
  return typeof value === "string" && value.length <= 240000 &&
    /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(value) ? value : "";
}

export function tokenPortrait(entry) {
  return entry?.kind === "player" ? safePortrait(entry.portrait) : "";
}

export function characterTokenVisual(appearance = {}) {
  return {
    icon: tokenIcon({ kind: "player", icon: appearance.emblem }),
    portrait: appearance.mapTokenStyle === "portrait" ? safePortrait(appearance.portrait) : "",
  };
}

// Both lists contain public identities. Neither an empty map list nor a partial
// one should erase the encounter's placed characters on older table snapshots.
export function sharedMapParticipants(map, encounterCombatants = []) {
  return [...new Map([...encounterCombatants, ...(map.participants || [])]
    .map((entry) => [entry.id, entry])).values()];
}
