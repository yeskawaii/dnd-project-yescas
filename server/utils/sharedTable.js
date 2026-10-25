import { compareInitiative } from "../../shared/characterRules.mjs";
// An allowlist, not a serialized DM workspace: private data never enters the response.
export function playerTable(campaign, characterId) {
  const workspace = campaign.dmWorkspace;
  const presentation = workspace?.presentation;
  const enabled = presentation?.enabled === true;
  const visible = enabled ? (workspace.combat?.combatants || [])
    .filter((entry) => entry.kind === "player" || entry.visibleToPlayers === true)
    .sort(compareInitiative) : [];
  const visibleIds = new Set(visible.map((entry) => entry.id));
  const combatants = visible.map((entry) => ({
    id: entry.id, name: entry.name, kind: entry.kind, initiative: entry.initiative,
    ...(entry.kind === "player" || presentation.showEnemyHp
      ? { hp: entry.hp, maxHp: entry.maxHp } : {}),
  }));
  let map = null;
  if (enabled && presentation.shareMap && workspace.map) {
    const source = workspace.map;
    const fog = new Set(source.cells.filter((cell) => cell.terrain === "fog")
      .map((cell) => `${cell.x}:${cell.y}`));
    map = {
      gridType: source.gridType || "square", feetPerCell: source.feetPerCell || 5,
      name: source.name, width: source.width, height: source.height,
      cells: source.cells.map(({ x, y, terrain }) => ({ x, y, terrain })),
      tokens: source.tokens
        .filter((token) => visibleIds.has(token.combatantId) && !fog.has(`${token.x}:${token.y}`))
        .map(({ combatantId, x, y }) => ({ combatantId, x, y })),
    };
    // Only expose control of this character's placed, visible player tokens.
    const owned = new Set(visible.filter((entry) => entry.kind === "player" &&
      entry.sourceId === String(characterId)).map((entry) => entry.id));
    map.movableTokenIds = map.tokens.filter((token) => owned.has(token.combatantId))
      .map((token) => token.combatantId);
  }
  const activeScene = presentation?.activeScene;
  return {
    campaign: { id: String(campaign._id), name: campaign.name },
    revision: campaign.workspaceRevision || 0,
    enabled,
    combat: enabled ? {
      name: workspace.combat.name, round: workspace.combat.round,
      activeId: visibleIds.has(workspace.combat.activeId) ? workspace.combat.activeId : "",
      hiddenTurn: Boolean(workspace.combat.activeId) && !visibleIds.has(workspace.combat.activeId),
      combatants,
    } : null,
    map,
    scene: activeScene ? {
      id: activeScene.id, presentationId: activeScene.presentationId,
      title: activeScene.title, description: activeScene.description,
      imageUrl: activeScene.imageUrl, mood: activeScene.mood,
    } : null,
    secrets: (presentation?.secrets || [])
      .filter((secret) => secret.released === true && secret.recipientId === String(characterId))
      .map(({ id, title, content }) => ({ id, title, content })),
  };
}
