import assert from "node:assert/strict";
import test from "node:test";
import {
  armorBreakdown, armorClass, initiativeBonus, calculateAttackTotal, calculateDamageBonus,
  calculateSkillTotal, canUseSkill, calculateSaveTotal, convertSavesMode,
  weaponDamage, compareInitiative, initiativeTies, resolveInitiativeTies,
  equipInventory, renameModifierReferences,
} from "./conversions.js";
import { getActions, rollDice } from "./quickActions.js";

const base = () => ({ stats: { Fuerza: 16, Destreza: 22, Constitución: 14, Sabiduría: 12 }, size: "Mediano", baseAttack: 1, initiativeMisc: 4,
  inventory: [{ _id: "mail", name: "Camisote", equipmentSlot: "armor", equipped: true, defenseBonus: 4, maxDex: 4, armorCheckPenalty: -2 },
    { _id: "shield", name: "Escudo", equipmentSlot: "shield", equipped: true, defenseBonus: 2, armorCheckPenalty: -2 }] });
const effect = (name, target, value, bonusType = "untyped", extra = {}) => ({ name, active: true, modifiers: [{ target, value, bonusType, ...extra }] });

test("armor caps Dexterity only for AC and never adds initiative, BAB or metadata", () => {
  const character = base();
  assert.equal(armorClass(character), 20);
  assert.equal(initiativeBonus(character), 10);
  assert.equal(calculateAttackTotal({ type: "Ranged" }, character), 7);
  const { total, touch, flatFooted } = armorBreakdown(character);
  assert.deepEqual({ total, touch, flatFooted }, { total: 20, touch: 14, flatFooted: 16 });
  character.armorClass = { maxDex: 2, checkPenalty: -8, ignored: 99 };
  assert.equal(armorClass(character), 18);
  character.initiativeMisc = 99;
  character.baseAttack = 99;
  assert.equal(armorClass(character), 18);
});

test("unequipping or removing armor lifts its cap and removes protection and skill penalties", () => {
  const character = base();
  const climb = { name: "Trepar", stat: "Fuerza", ranks: 4 };
  assert.equal(calculateSkillTotal(climb, character), 3);
  assert.equal(calculateSkillTotal({ name: "Nadar", stat: "Fuerza" }, character), -5);
  character.inventory[0].equipped = false;
  assert.equal(armorClass(character), 18);
  assert.equal(calculateSkillTotal(climb, character), 5);
  character.inventory = [];
  assert.equal(armorClass(character), 16);
  assert.equal(calculateSkillTotal(climb, character), 7);
});

test("negative Dexterity remains on normal, touch and flat-footed AC, even with max Dex zero", () => {
  const character = { stats: { Destreza: 8 }, armorClass: { armor: 4, maxDex: 0 } };
  assert.equal(armorBreakdown(character).total, 13);
  assert.equal(armorBreakdown(character).touch, 9);
  assert.equal(armorBreakdown(character).flatFooted, 13);
  character.armorClass.dodge = -2;
  character.effects = [effect("Esquiva", "dodge", 1)];
  assert.equal(armorBreakdown(character).total, 12);
  assert.equal(armorBreakdown(character).flatFooted, 11);
});

test("all size categories modify both AC and attacks, including accents and legacy English", () => {
  for (const [size, modifier] of [["Minúsculo", 8], ["Diminuto", 4], ["Menudo", 2], ["Pequeño", 1], ["Mediano", 0], ["Grande", -1], ["Enorme", -2], ["Gargantuesco", -4], ["Colosal", -8], ["Small", 1]]) {
    assert.equal(armorClass({ size }), 10 + modifier);
    assert.equal(calculateAttackTotal({}, { size }), modifier);
  }
});

test("armor sources do not stack; deflection applies to touch and dodge is lost when flat-footed", () => {
  const character = base();
  character.armorClass = { armor: 4, natural: 2 };
  character.effects = [effect("Armadura de mago", "armor", 4), effect("Escudo", "shield", 4), effect("Desvío", "deflection", 2), effect("Esquiva", "dodge", 1), effect("Otra esquiva", "ac", 1, "dodge")];
  const ac = armorBreakdown(character);
  assert.equal(ac.armor, 4);
  assert.equal(ac.shield, 4);
  assert.equal(ac.total, 28);
  assert.equal(ac.touch, 18);
  assert.equal(ac.flatFooted, 22);
});

test("bonuses of the same type use the highest and disabling or deleting the source removes its effects", () => {
  const character = { feats: [effect("Iniciativa mejorada", "initiative", 4)], effects: [effect("Moral", "attack", 1, "morale"), effect("Otra moral", "attack", 2, "morale")] };
  assert.equal(initiativeBonus(character), 4);
  assert.equal(calculateAttackTotal({}, character), 2);
  character.effects[1].active = false;
  assert.equal(calculateAttackTotal({}, character), 1);
  character.feats = [];
  assert.equal(initiativeBonus(character), 0);
});

test("source matching respects accented names and same-source modifiers never double count", () => {
  const character = { feats: [effect("Alerta", "skill", 2, "untyped", { skillName: "Avistar" })], effects: [effect("Soltura", "attack", 1, "untyped", { attackName: "Espada larga" })] };
  character.feats[0].modifiers.push({ ...character.feats[0].modifiers[0] });
  assert.equal(calculateSkillTotal({ name: "Avistar", stat: "Sabiduría" }, character), 2);
  assert.equal(calculateSkillTotal({ name: "Escuchar", stat: "Sabiduría" }, character), 0);
  assert.equal(calculateAttackTotal({ name: "ESPADA LARGA" }, character), 1);
  assert.equal(calculateAttackTotal({ name: "Daga" }, character), 0);
});

test("half ranks are retained but never produce fractional skill totals", () => {
  const skill = { name: "Esconderse", stat: "Destreza", ranks: 1.5 };
  assert.equal(calculateSkillTotal(skill, { Destreza: 15 }), 3);
  assert.equal(skill.ranks, 1.5);
});

test("trained-only skills cannot be rolled without one full rank and custom exceptions are explicit", () => {
  const skill = { _id: "lock", name: "Abrir Cerraduras", stat: "Destreza", ranks: 0.5 };
  assert.equal(canUseSkill(skill), false);
  assert.equal(getActions({ skills: [skill] })[0].usable, false);
  assert.equal(canUseSkill({ ...skill, ranks: 1 }), true);
  assert.equal(canUseSkill({ ...skill, trainedOnly: false }), true);
  assert.equal(canUseSkill({ name: "Avistar", ranks: 0 }), true);
});

test("legacy saves remain totals and changing modes preserves totals including linked bonuses", () => {
  const character = { stats: { Constitución: 14, Destreza: 8, Sabiduría: 15 }, saves: { fort: 4, ref: -1, will: 4 }, effects: [effect("Resistencia", "fort", 1, "resistance")] };
  const before = ["fort", "ref", "will"].map((key) => calculateSaveTotal(character, key));
  character.saves = convertSavesMode(character, "calculated");
  assert.deepEqual(["fort", "ref", "will"].map((key) => calculateSaveTotal(character, key)), before);
  assert.deepEqual(character.saves, { mode: "calculated", fort: 2, ref: 0, will: 2 });
  character.stats.Constitución = 18;
  assert.equal(calculateSaveTotal(character, "fort"), 7);
  character.saves = convertSavesMode(character, "manual");
  assert.equal(calculateSaveTotal(character, "fort"), 7);
  character.stats.Constitución = 10;
  assert.equal(calculateSaveTotal(character, "fort"), 7);
});

test("weapon modes handle handedness, light weapons and full Strength penalties", () => {
  const character = { stats: { Fuerza: 16 } };
  assert.equal(calculateDamageBonus({ hands: "two" }, character), 4);
  assert.equal(calculateDamageBonus({ hands: "two", light: true }, character), 3);
  assert.equal(calculateDamageBonus({ hands: "offHand" }, character), 1);
  character.stats.Fuerza = 7;
  assert.equal(calculateDamageBonus({ hands: "two" }, character), -2);
  assert.equal(calculateDamageBonus({ hands: "offHand" }, character), -2);
});

test("thrown, bow, composite bow, sling and crossbow damage use their own Strength rules", () => {
  const character = { stats: { Fuerza: 16, Destreza: 18 }, baseAttack: 1 };
  assert.equal(calculateAttackTotal({ type: "Thrown" }, character), 5);
  assert.equal(calculateDamageBonus({ type: "Thrown" }, character), 3);
  assert.equal(calculateDamageBonus({ type: "Ranged", rangedDamage: "strength" }, character), 3);
  assert.equal(calculateDamageBonus({ type: "Ranged", rangedDamage: "composite", strengthRating: 2 }, character), 2);
  assert.equal(calculateDamageBonus({ type: "Ranged", rangedDamage: "bow" }, character), 0);
  assert.equal(calculateDamageBonus({ type: "Ranged" }, character), 0);
  character.stats.Fuerza = 8;
  assert.equal(calculateAttackTotal({ type: "Ranged", rangedDamage: "composite", strengthRating: 2 }, character), 3);
  assert.equal(calculateDamageBonus({ type: "Ranged", rangedDamage: "bow" }, character), -1);
  assert.equal(calculateDamageBonus({ type: "Ranged", rangedDamage: "composite", strengthRating: 2 }, character), -1);
  assert.equal(calculateDamageBonus({ type: "Ranged" }, character), 0);
});

test("equipping protection replaces the same slot and renaming attacks preserves linked feat references", () => {
  const character = base();
  const inventory = [...character.inventory, { _id: "plate", equipmentSlot: "armor", defenseBonus: 8 }];
  const equipped = equipInventory(inventory, "plate", true);
  assert.equal(equipped[0].equipped, false);
  assert.equal(equipped[1].equipped, true);
  assert.equal(equipped[2].equipped, true);
  assert.equal(inventory[0].equipped, true);
  character.feats = [effect("Soltura", "attack", 1, "untyped", { attackName: "Espada" })];
  const updated = { ...character, ...renameModifierReferences(character, "attackName", "Espada", "Espada +1") };
  assert.equal(calculateAttackTotal({ name: "Espada +1" }, updated), 5);
  assert.equal(character.feats[0].modifiers[0].attackName, "Espada");
});

test("Finesse uses Dexterity for attack, Strength for damage and shield check penalties", () => {
  const character = base();
  const attack = { type: "Finesse", hands: "one" };
  assert.equal(calculateAttackTotal(attack, character), 5);
  assert.equal(calculateDamageBonus(attack, character), 3);
  character.inventory[1].equipped = false;
  assert.equal(calculateAttackTotal(attack, character), 7);
});

test("weapon minimum damage is enforced after all penalties without changing general dice rolls", () => {
  const character = { stats: { Fuerza: 8 } };
  const dice = rollDice("1d4-2", () => 0);
  assert.equal(dice.total, -1);
  assert.equal(weaponDamage(dice.total, {}, character), 1);
  assert.equal(weaponDamage(4, {}, character), 3);
});

test("initiative ties use total bonus, then persisted tie resolution, without mutating inputs", () => {
  const entries = [{ id: "slow", initiative: 18, initiativeBonus: 2 }, { id: "fast", initiative: 18, initiativeBonus: 8 }, { id: "peer", initiative: 18, initiativeBonus: 8 }];
  assert.deepEqual([...entries].sort(compareInitiative).map((entry) => entry.id), ["fast", "peer", "slow"]);
  assert.equal(initiativeTies(entries).length, 2);
  const resolved = resolveInitiativeTies(entries, () => 0);
  assert.equal(initiativeTies(resolved).length, 0);
  assert.deepEqual([...resolved].sort(compareInitiative).map((entry) => entry.id), ["peer", "fast", "slow"]);
  assert.equal(entries[1].tieBreaker, undefined);
  assert.deepEqual(resolveInitiativeTies(resolved), resolved);
});
