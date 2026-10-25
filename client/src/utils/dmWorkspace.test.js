import assert from "node:assert/strict";
import test from "node:test";
import {
  advanceTurn,
  armorClass,
  emptyWorkspace,
  makeCombatant,
  mergeTokenUpdates,
  orderedCombatants,
  removeCombatant,
  resizeMap,
} from "./dmWorkspace.js";

test("turn order preserves initiative ties, begins at the highest total and counts rounds in both directions", () => {
  const entries = [
    { id: "a", initiative: 8 },
    { id: "b", initiative: 18 },
    { id: "c", initiative: 18 },
  ];
  const initial = { combatants: entries, round: 1, activeId: "" };
  assert.deepEqual(
    orderedCombatants(initial).map((entry) => entry.id),
    ["b", "c", "a"],
  );
  let combat = advanceTurn(initial);
  assert.equal(combat.activeId, "b");
  assert.deepEqual(advanceTurn(combat, -1), combat);
  combat = advanceTurn(advanceTurn(advanceTurn(combat)));
  assert.equal(combat.activeId, "b");
  assert.equal(combat.round, 2);
  combat = advanceTurn(combat, -1);
  assert.equal(combat.activeId, "a");
  assert.equal(combat.round, 1);
  assert.equal(initial.activeId, "");
  assert.deepEqual(
    entries.map((entry) => entry.id),
    ["a", "b", "c"],
  );
});

test("removing the active combatant advances to the next participant and removes only their map token", () => {
  const workspace = emptyWorkspace();
  workspace.combat = {
    name: "Puente",
    round: 1,
    activeId: "b",
    combatants: [
      { id: "a", initiative: 20 },
      { id: "b", initiative: 10 },
      { id: "c", initiative: 5 },
    ],
  };
  workspace.map.tokens = [
    { combatantId: "b", x: 1, y: 1 },
    { combatantId: "a", x: 2, y: 2 },
  ];
  const next = removeCombatant(workspace, "b");
  assert.equal(next.combat.activeId, "c");
  assert.deepEqual(
    next.map.tokens.map((token) => token.combatantId),
    ["a"],
  );
  assert.equal(workspace.combat.combatants.length, 3);
  const last = removeCombatant(
    {
      ...next,
      combat: {
        ...next.combat,
        activeId: "c",
        combatants: [{ id: "c", initiative: 5 }],
      },
    },
    "c",
  );
  assert.equal(last.combat.activeId, "");
  assert.equal(last.combat.combatants.length, 0);
});

test("player snapshots use actual health and armor without mutating the original character", () => {
  const player = {
    _id: "pj",
    name: "Lyra",
    class: "Exploradora",
    level: 3,
    hp: { current: -2, max: 24 },
    stats: { Destreza: 16 },
    initiativeMisc: 4,
    armorClass: { armor: 3, shield: 1 },
  };
  const snapshot = makeCombatant(player, true, [], "combat-1");
  assert.equal(snapshot.hp, -2);
  assert.equal(snapshot.maxHp, 24);
  assert.equal(snapshot.initiativeBonus, 7);
  assert.equal(snapshot.ac, 17);
  snapshot.hp = 12;
  assert.equal(player.hp.current, -2);
  assert.equal(armorClass({}), 10);
});

test("copies of a creature have distinct identities and independent encounter data", () => {
  const actor = {
    id: "goblin",
    name: "Explorador",
    kind: "monster",
    hp: 8,
    maxHp: 8,
    ac: 13,
    initiativeBonus: 2,
    actions: "Arco",
    description: "Vigía",
  };
  const first = makeCombatant(actor, false, [], "one");
  const second = makeCombatant(actor, false, [first], "two");
  assert.equal(second.name, "Explorador · 2");
  second.hp = 1;
  assert.equal(first.hp, 8);
  assert.equal(actor.hp, 8);
});

test("shrinking a map removes off-grid terrain and tokens without changing retained cells", () => {
  const map = {
    ...emptyWorkspace().map,
    cells: [
      { x: 1, y: 1, terrain: "wall" },
      { x: 15, y: 11, terrain: "water" },
    ],
    tokens: [{ combatantId: "a", x: 14, y: 10 }],
  };
  const next = resizeMap(map, 12, 10);
  assert.equal(next.cells.length, 1);
  assert.equal(next.tokens.length, 0);
  assert.equal(map.cells.length, 2);
});

test("companions of different characters have distinct sources and independent health snapshots", async () => {
  const { makeCompanionCombatant, companionSourceId } = await import("./dmWorkspace.js");
  const companion = { _id: "c1", name: "Nimbo", hp: { current: 4, max: 12 }, ac: 16, initiativeBonus: 3, speed: "40 ft", duration: "5 asaltos", actions: "Mordisco +3, 1d4", description: "Familiar" };
  const player = { _id: "p1", name: "Lyra" };
  const snapshot = makeCompanionCombatant(player, companion, [], "ally1");
  assert.equal(snapshot.kind, "ally");
  assert.equal(snapshot.visibleToPlayers, true);
  assert.equal(snapshot.sourceId, "p1:c1");
  assert.notEqual(companionSourceId({ _id: "p2" }, companion), snapshot.sourceId);
  assert.equal(snapshot.hp, 4);
  assert.equal(snapshot.maxHp, 12);
  assert.equal(snapshot.ac, 16);
  assert.equal(snapshot.initiativeBonus, 3);
  assert.match(snapshot.description, /Lyra/);
  assert.match(snapshot.description, /5 asaltos/);
  assert.equal(snapshot.actions, companion.actions);
  snapshot.hp = -2;
  assert.equal(companion.hp.current, 4);
});

const positionedWorkspace = () => ({
  ...emptyWorkspace(),
  combat: { ...emptyWorkspace().combat, combatants: [{ id: "a" }, { id: "b" }] },
  map: { ...emptyWorkspace().map, tokens: [{ combatantId: "a", x: 1, y: 1 }, { combatantId: "b", x: 2, y: 2 }] },
});

test("incoming player movement preserves pending DM notes and other token edits", () => {
  const base = positionedWorkspace();
  const local = structuredClone(base), remote = structuredClone(base);
  local.notes = [{ id: "pending", title: "Sin guardar" }];
  local.map.tokens[1].x = 6;
  remote.map.tokens[0].x = 4;
  const merged = mergeTokenUpdates(base, local, remote);
  assert.deepEqual(merged.notes, local.notes);
  assert.deepEqual(merged.map.tokens, [{ combatantId: "a", x: 4, y: 1 }, { combatantId: "b", x: 6, y: 2 }]);
  assert.equal(base.map.tokens[0].x, 1);
  assert.equal(local.map.tokens[0].x, 1);
});

test("the DM's own move or token removal takes priority over concurrent player movement", () => {
  const base = positionedWorkspace();
  const local = structuredClone(base), remote = structuredClone(base);
  local.map.tokens[0].x = 6;
  local.map.tokens.splice(1, 1);
  remote.map.tokens[0].x = 4;
  remote.map.tokens[1].x = 5;
  assert.deepEqual(mergeTokenUpdates(base, local, remote).map.tokens, [{ combatantId: "a", x: 6, y: 1 }]);
});

test("rebasing respects map resizing and removing combatants, and rejects occupied destinations", () => {
  const base = positionedWorkspace();
  const local = structuredClone(base), remote = structuredClone(base);
  local.map.width = 8;
  remote.map.tokens[0].x = 10;
  assert.deepEqual(mergeTokenUpdates(base, local, remote).map.tokens, [base.map.tokens[1]]);
  local.combat.combatants = [{ id: "a" }];
  assert.deepEqual(mergeTokenUpdates(base, local, remote).map.tokens, []);
  local.combat.combatants = base.combat.combatants;
  local.map.tokens[1] = { combatantId: "b", x: 4, y: 4 };
  remote.map.tokens[0] = { combatantId: "a", x: 4, y: 4 };
  assert.equal(mergeTokenUpdates(base, local, remote), null);
});

test("remote changes to combat, terrain or notes still trigger the workspace conflict guard", () => {
  const base = positionedWorkspace();
  for (const mutate of [
    (remote) => { remote.combat.round += 1; },
    (remote) => { remote.map.cells.push({ x: 3, y: 3, terrain: "wall" }); },
    (remote) => { remote.notes.push({ id: "n", title: "Otra pestaña" }); },
  ]) {
    const remote = structuredClone(base);
    mutate(remote);
    assert.equal(mergeTokenUpdates(base, base, remote), null);
  }
});
