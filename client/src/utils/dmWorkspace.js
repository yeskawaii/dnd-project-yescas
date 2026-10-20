import { armorClass, initiativeBonus, compareInitiative } from "./conversions.js";
export { armorClass, initiativeBonus } from "./conversions.js";
import { emptyPresentation } from "./tablePresentation.js";

export const kindLabels = {
  player: "Jugador",
  monster: "Monstruo",
  npc: "NPC",
  ally: "Aliado",
};
export const noteLabels = {
  session: "Sesión",
  quest: "Misión",
  place: "Lugar",
  secret: "Secreto",
};
export const newId = () => crypto.randomUUID();
export const emptyWorkspace = () => ({
  presentation: emptyPresentation(),
  actors: [],
  combat: { name: "Nuevo encuentro", round: 1, activeId: "", combatants: [] },
  notes: [],
  map: {
    name: "Escena de batalla",
    gridType: "hex",
    feetPerCell: 5,
    width: 16,
    height: 12,
    cells: [],
    tokens: [],
  },
});
export const orderedCombatants = (combat) =>
  [...combat.combatants].sort(compareInitiative);
export function makeCombatant(entity, isPlayer, existing, id = newId()) {
  const count = existing.filter(
    (entry) => entry.sourceId === (entity._id || entity.id),
  ).length;
  return {
    id,
    sourceId: entity._id || entity.id,
    name: `${entity.name}${!isPlayer && count ? ` · ${count + 1}` : ""}`,
    kind: isPlayer ? "player" : entity.kind,
    hp: isPlayer ? (entity.hp?.current ?? 0) : entity.hp,
    maxHp: isPlayer ? Math.max(1, entity.hp?.max ?? 1) : entity.maxHp,
    ac: isPlayer ? armorClass(entity) : entity.ac,
    initiativeBonus: isPlayer
      ? initiativeBonus(entity)
      : entity.initiativeBonus,
    initiative: 0,
    tieBreaker: 0,
    conditions: "",
    visibleToPlayers: isPlayer,
    actions: isPlayer ? "" : entity.actions,
    description: isPlayer
      ? `${entity.class} · Nivel ${entity.level}`
      : entity.description,
  };
}
export function advanceTurn(combat, direction = 1) {
  const ordered = orderedCombatants(combat);
  if (!ordered.length) return { ...combat, activeId: "" };
  const current = ordered.findIndex((entry) => entry.id === combat.activeId);
  if (current < 0) return { ...combat, activeId: ordered[0].id };
  if (direction < 0 && current === 0 && combat.round === 1) return combat;
  const next = (current + direction + ordered.length) % ordered.length;
  const round =
    combat.round +
    (direction > 0 && next === 0 ? 1 : direction < 0 && current === 0 ? -1 : 0);
  return { ...combat, round, activeId: ordered[next].id };
}
export function removeCombatant(workspace, id) {
  const combat = workspace.combat;
  const advanced = combat.activeId === id ? advanceTurn(combat) : combat;
  const combatants = combat.combatants.filter((entry) => entry.id !== id);
  return {
    ...workspace,
    combat: {
      ...advanced,
      combatants,
      activeId: combatants.length ? advanced.activeId : "",
    },
    map: {
      ...workspace.map,
      tokens: workspace.map.tokens.filter((entry) => entry.combatantId !== id),
    },
  };
}
export function resizeMap(map, width, height) {
  return {
    ...map,
    width,
    height,
    cells: map.cells.filter((cell) => cell.x < width && cell.y < height),
    tokens: map.tokens.filter((token) => token.x < width && token.y < height),
  };
}

// A stable, character-scoped reference prevents two owners' companions from colliding.
export const companionSourceId = (player, companion) => `${player._id}:${companion._id}`;
export function makeCompanionCombatant(player, companion, existing, id = newId()) {
  const entry = makeCombatant({
    id: companionSourceId(player, companion),
    name: companion.name,
    kind: "ally",
    hp: companion.hp.current,
    maxHp: companion.hp.max,
    ac: companion.ac,
    initiativeBonus: companion.initiativeBonus,
    actions: companion.actions,
    description: [`Acompañante de ${player.name}`, `Velocidad: ${companion.speed || "—"}`,
      companion.duration && `Duración: ${companion.duration}`, companion.description].filter(Boolean).join("\n").slice(0, 12000),
  }, false, existing, id);
  return { ...entry, visibleToPlayers: true };
}
