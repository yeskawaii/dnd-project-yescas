import assert from "node:assert/strict";
import test from "node:test";
import { actionKey, getActions, moveAction, rollDice } from "./quickActions.js";
import { calculateMod } from "./conversions.js";

test("reordering supports drag and arrow positions without mutating saved preferences", () => {
  const saved = ["attack:1", "spell:2", "item:3"];
  assert.deepEqual(moveAction(saved, 0, 2), ["spell:2", "item:3", "attack:1"]);
  assert.deepEqual(moveAction(saved, 2, 0), ["item:3", "attack:1", "spell:2"]);
  assert.deepEqual(moveAction(saved, 1, -1), saved);
  assert.deepEqual(moveAction(saved, 1, 3), saved);
  assert.deepEqual(saved, ["attack:1", "spell:2", "item:3"]);
});

test("dice honor die boundaries, signed modifiers and unsupported formulas", () => {
  assert.deepEqual(
    rollDice("2d6+3", () => 0),
    { rolls: [1, 1], modifier: 3, total: 5 },
  );
  assert.deepEqual(
    rollDice("1D20 - 2", () => 0.999),
    { rolls: [20], modifier: -2, total: 18 },
  );
  for (const formula of [
    "0d20",
    "31d6",
    "1d1",
    "2d6+oops",
    "alert(1)",
    "2d6 + 3 + 4",
  ])
    assert.equal(rollDice(formula), null);
});

test("resource identities survive renaming and character modifiers update their summaries", () => {
  const character = {
    stats: { Fuerza: 14, Destreza: 18, Sabiduría: 12 },
    baseAttack: 4,
    attacks: [
      {
        _id: "a1",
        name: "Espada",
        damageDice: "1d8",
        attackBonus: 1,
        damageBonus: 2,
      },
    ],
    spells: [
      { _id: "s1", name: "Luz", level: 0, prepared: true, school: "Evocación" },
    ],
    inventory: [{ _id: "i1", name: "Poción", icon: "🧪", desc: "Curación" }],
    skills: [{ _id: "h1", name: "Avistar", stat: "Sabiduría", ranks: 2 }],
  };
  const actions = getActions(character);
  assert.deepEqual(
    actions.map((action) => action.key),
    ["attack:a1", "spell:s1", "item:i1", "skill:h1"],
  );
  assert.equal(actions[0].value, "+7");
  assert.equal(actions[0].caption, "1d8 +4 de daño");
  assert.equal(actions[1].caption, "Evocación · Preparado");
  assert.equal(actions[3].value, "+3");
  character.attacks[0].name = "Espada larga";
  character.stats.Fuerza = 18;
  assert.equal(getActions(character)[0].key, actions[0].key);
  assert.equal(getActions(character)[0].value, "+9");
  assert.equal(actionKey({ kind: "attack", itemId: "a1" }), "attack:a1");
});

test("new or legacy sheets with missing collections remain usable and zero attributes are preserved", () => {
  assert.deepEqual(getActions({}), []);
  assert.equal(calculateMod(0), -5);
  assert.equal(calculateMod(undefined), 0);
});
