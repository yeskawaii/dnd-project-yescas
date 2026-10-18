import assert from "node:assert/strict";
import test from "node:test";
import {
  advanceTurn,
  armorClass,
  emptyWorkspace,
  makeCombatant,
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
