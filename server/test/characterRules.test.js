import assert from "node:assert/strict";
import test from "node:test";
import Character from "../models/Character.js";
import router from "../routes/characters.js";
import { buildTemplateData, getCharacterTemplate, applyTemplateFavorites } from "../data/characterTemplates.js";
import { proposeLegacyRulesUpgrade } from "../utils/legacyRules.js";
import { armorClass, calculateAttackTotal, calculateSaveTotal, calculateSkillTotal, initiativeBonus, modifierTotal, skillArmorPenalty } from "../../shared/characterRules.mjs";
import { playerTable } from "../utils/sharedTable.js";

const owner = "507f1f77bcf86cd799439011";
const create = (data = {}) => new Character({ user: owner, name: "Lyra", ...data });
function legacyStarter(id) {
  const template = getCharacterTemplate(id);
  const modern = create(buildTemplateData(template));
  applyTemplateFavorites(modern, template);
  const character = JSON.parse(JSON.stringify(modern));
  character.initiativeMisc = 4;
  for (const key of ["fort", "ref", "will"]) character.saves[key] = calculateSaveTotal(character, key);
  character.saves.mode = "manual";
  character.attacks = character.attacks.map((attack) => ({ ...attack, attackBonus: modifierTotal(character, "attack", { attackName: attack.name }) }));
  character.skills = character.skills.map((skill) => ({ ...skill, miscModifier: modifierTotal(character, "skill", { skillName: skill.name }) + skillArmorPenalty(skill, template.armorPenalty) }));
  for (const item of character.inventory) {
    if (item.equipmentSlot === "armor") character.armorClass.armor = item.defenseBonus;
    if (item.equipmentSlot === "shield") character.armorClass.shield = item.defenseBonus;
    item.equipmentSlot = "none"; item.equipped = false; item.modifiers = [];
  }
  character.feats.forEach((feat) => { feat.modifiers = []; });
  return character;
}

test("link proposals preserve all legacy starter totals, IDs and favorites and can only be applied once", async () => {
  for (const id of ["fighter", "rogue", "wizard", "cleric"]) {
    const legacy = legacyStarter(id);
    const snapshot = JSON.stringify(legacy);
    const proposal = proposeLegacyRulesUpgrade(legacy);
    assert.equal(proposal.available, true, id);
    for (const change of proposal.changes) assert.equal(change.after, change.before, `${id}: ${change.label}`);
    const linked = create({ ...legacy, ...proposal.patch });
    await linked.validate();
    assert.equal(proposeLegacyRulesUpgrade(linked).available, false);
    assert.equal(JSON.stringify(legacy), snapshot);
    assert.deepEqual(linked.quickActions.toObject(), legacy.quickActions);
    assert.deepEqual(linked.attacks.map((attack) => String(attack._id)), legacy.attacks.map((attack) => attack._id));
    assert.deepEqual(linked.inventory.map((item) => String(item._id)), legacy.inventory.map((item) => item._id));
    for (const skill of linked.skills) assert.equal(calculateSkillTotal(skill, linked), calculateSkillTotal(legacy.skills.find((entry) => entry.name === skill.name), legacy));
  }
});

test("linked starter equipment and feats can be removed independently without leaving baked bonuses", () => {
  const legacy = legacyStarter("fighter");
  const linked = { ...legacy, ...proposeLegacyRulesUpgrade(legacy).patch };
  assert.equal(armorClass(linked), 17);
  assert.equal(initiativeBonus(linked), 5);
  assert.equal(calculateAttackTotal(linked.attacks[0], linked), 4);
  linked.inventory = linked.inventory.filter((item) => item.equipmentSlot !== "shield");
  assert.equal(armorClass(linked), 15);
  linked.feats = [];
  assert.equal(initiativeBonus(linked), 1);
  assert.equal(calculateAttackTotal(linked.attacks[0], linked), 3);
});

test("proposals refuse unknown sheets, changed protection, missing gear and already linked sources", () => {
  assert.equal(proposeLegacyRulesUpgrade(create()).available, false);
  for (const mutate of [
    (sheet) => { sheet.armorClass.armor = 8; },
    (sheet) => { sheet.inventory = []; },
    (sheet) => { sheet.feats = []; },
    (sheet) => { sheet.inventory[0].equipped = true; },
    (sheet) => { sheet.effects = [{ name: "Custom" }]; },
  ]) {
    const sheet = legacyStarter("fighter"); mutate(sheet);
    assert.equal(proposeLegacyRulesUpgrade(sheet).available, false);
  }
});

test("new rule fields survive Mongoose serialization and calculations agree with browser plain data", async () => {
  const character = create(buildTemplateData(getCharacterTemplate("fighter")));
  character.effects.push({ name: "Moral menor", modifiers: [{ target: "attack", value: 1, bonusType: "morale" }] }, { name: "Moral mayor", modifiers: [{ target: "attack", value: 2, bonusType: "morale" }] });
  await character.validate();
  const plain = JSON.parse(JSON.stringify(character));
  assert.equal(calculateAttackTotal(character.attacks[0], character), 6);
  assert.equal(calculateAttackTotal(plain.attacks[0], plain), 6);
  assert.equal(armorClass(character), armorClass(plain));
  assert.equal(calculateSaveTotal(character, "fort"), calculateSaveTotal(plain, "fort"));
});

test("schemas reject invalid modifier targets, types, fractions and protection limits", async () => {
  for (const modifier of [{ target: "level", value: 1 }, { target: "attack", value: 1, bonusType: "fake" }, { target: "initiative", value: 0.5 }, { target: "initiative", value: 101 }]) {
    await assert.rejects(create({ effects: [{ name: "Invalid", modifiers: [modifier] }] }).validate());
  }
  for (const armorClass of [{ maxDex: -1 }, { maxDex: 1.5 }, { checkPenalty: 2 }]) await assert.rejects(create({ armorClass }).validate());
  await create({ armorClass: { maxDex: null }, inventory: [{ name: "Armadura", maxDex: null }] }).validate();
});

test("upgrade preview scopes the lookup to the owner and never writes", async (context) => {
  const handler = router.stack.find((layer) => layer.route?.path === "/:charId/rules-upgrade").route.stack[0].handle;
  const res = { statusCode: 200, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } };
  context.mock.method(Character, "findOne", async (query) => { assert.deepEqual(query, { _id: "character", user: owner }); return null; });
  context.mock.method(Character, "findOneAndUpdate", () => assert.fail("Preview must not write"));
  await handler({ user: owner, params: { charId: "character" } }, res);
  assert.equal(res.statusCode, 404);
});

test("the public table shares the resolved initiative order without exposing bonus or tie metadata", () => {
  const campaign = { _id: "campaign", dmWorkspace: { presentation: { enabled: true }, combat: { name: "Test", round: 1, activeId: "", combatants: [
    { id: "slow", name: "Slow", kind: "player", initiative: 18, initiativeBonus: 1 },
    { id: "fast", name: "Fast", kind: "player", initiative: 18, initiativeBonus: 4, tieBreaker: 1 },
    { id: "first", name: "First", kind: "player", initiative: 18, initiativeBonus: 4, tieBreaker: 2 },
  ] } } };
  const result = playerTable(campaign, "player");
  assert.deepEqual(result.combat.combatants.map((entry) => entry.id), ["first", "fast", "slow"]);
  assert.equal(JSON.stringify(result).includes("initiativeBonus"), false);
  assert.equal(JSON.stringify(result).includes("tieBreaker"), false);
});
