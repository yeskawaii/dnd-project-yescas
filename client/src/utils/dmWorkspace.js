import { calculateMod } from "./conversions.js";
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
    width: 16,
    height: 12,
    cells: [],
    tokens: [],
  },
});
export const armorClass = (player) =>
  10 +
  calculateMod(player.stats?.Destreza) +
  Object.values(player.armorClass || {}).reduce(
    (sum, value) => sum + (Number(value) || 0),
    0,
  );
export const initiativeBonus = (player) =>
  calculateMod(player.stats?.Destreza) + (player.initiativeMisc || 0);
export const orderedCombatants = (combat) =>
  [...combat.combatants].sort((a, b) => b.initiative - a.initiative);
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
