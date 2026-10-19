import assert from "node:assert/strict";
import test from "node:test";
import Character from "../models/Character.js";
import router from "../routes/characters.js";
import { getCharacterTemplate, listCharacterTemplates } from "../data/characterTemplates.js";

const owner = "507f1f77bcf86cd799439011";
const otherUser = "507f1f77bcf86cd799439022";
const handler = (method, path) => router.stack.find((layer) => layer.route?.path === path && layer.route.methods[method]).route.stack[0].handle;
const response = () => ({
  statusCode: 200,
  status(code) { this.statusCode = code; return this; },
  json(body) { this.body = body; return this; },
});

test("catalog previews agree with the persisted level-one builds and all favorites resolve", async (context) => {
  context.mock.method(Character, "create", async (character) => {
    await character.validate();
    return character;
  });
  const expected = {
    fighter: { hp: 12, ca: 17, ranks: 12, saves: [4, 1, 1], feats: 3 },
    rogue: { hp: 7, ca: 14, ranks: 44, saves: [1, 4, 1], feats: 2 },
    wizard: { hp: 5, ca: 12, ranks: 20, saves: [3, 2, 3], feats: 3 },
    cleric: { hp: 10, ca: 14, ranks: 12, saves: [4, -1, 4], feats: 2 },
  };
  const catalog = response();
  handler("get", "/templates")({}, catalog);
  assert.equal(catalog.body.length, 4);
  for (const preview of catalog.body) {
    const res = response();
    await handler("post", "/")({ user: owner, body: { templateId: preview.id, name: "  Lyra  " } }, res);
    assert.equal(res.statusCode, 201);
    const character = res.body;
    const rules = expected[preview.id];
    assert.equal(character.name, "Lyra");
    assert.equal(String(character.user), owner);
    assert.equal(character.class, preview.name);
    assert.equal(character.level, 1);
    assert.equal(character.race, "Humano");
    assert.deepEqual(Object.values(character.stats.toObject()).sort((a, b) => a - b), [8, 10, 12, 13, 14, 15]);
    assert.deepEqual(character.stats.toObject(), preview.stats);
    assert.equal(character.hp.max, rules.hp);
    assert.equal(character.hp.current, preview.hp);
    const armor = 10 + Math.floor((character.stats.Destreza - 10) / 2) + character.armorClass.armor + character.armorClass.shield;
    assert.equal(armor, rules.ca);
    assert.equal(armor, preview.armorClass);
    assert.deepEqual([character.saves.fort, character.saves.ref, character.saves.will], rules.saves);
    assert.equal(character.feats.length, rules.feats);
    assert.equal(character.skills.reduce((sum, skill) => sum + skill.ranks, 0), rules.ranks);
    assert.ok(character.skills.every((skill) => !skill.ranks || (skill.isClassSkill && skill.ranks <= 4)));
    assert.deepEqual(character.skills.filter((skill) => skill.ranks).map((skill) => skill.name).sort(), [...preview.trainedSkills].sort());
    assert.deepEqual(character.spells.filter((spell) => spell.prepared).map((spell) => spell.name), preview.spells);
    assert.equal(character.weight.current, character.inventory.reduce((sum, item) => sum + item.weight, 0));
    assert.ok(character.weight.current <= character.weight.max / 3, "Starting equipment stays within a light load");
    assert.ok(character.notes[0].content.includes(preview.source));
    const collections = { attack: character.attacks, spell: character.spells, skill: character.skills };
    assert.ok(character.quickActions.length >= 3);
    for (const favorite of character.quickActions) assert.ok(collections[favorite.kind].id(favorite.itemId));
  }
});

test("creation accepts only server template values and uses fresh IDs and arrays each time", async (context) => {
  context.mock.method(Character, "create", async (character) => character);
  const first = response();
  await handler("post", "/")({ user: owner, body: {
    templateId: "wizard", user: otherUser, class: "Guerrero", charClass: "Guerrero", level: 20,
    stats: { Inteligencia: 99 }, hp: { max: 999 }, quickActions: [{ kind: "attack", itemId: "foreign-id" }],
  } }, first);
  const second = response();
  await handler("post", "/")({ user: otherUser, body: { templateId: "wizard" } }, second);
  assert.equal(String(first.body.user), owner);
  assert.equal(first.body.class, "Mago");
  assert.equal(first.body.level, 1);
  assert.equal(first.body.stats.Inteligencia, 15);
  assert.equal(first.body.hp.max, 5);
  assert.notEqual(String(first.body.attacks[0]._id), String(second.body.attacks[0]._id));
  assert.notEqual(first.body.quickActions[0].itemId, second.body.quickActions[0].itemId);
  first.body.inventory[0].name = "Cambio local";
  assert.equal(second.body.inventory[0].name, "Ballesta ligera");
  const metadata = getCharacterTemplate("wizard");
  metadata.sheet.inventory[0].name = "Cambio en catálogo";
  assert.equal(getCharacterTemplate("wizard").sheet.inventory[0].name, "Ballesta ligera");
  assert.equal(listCharacterTemplates().find((entry) => entry.id === "wizard").equipment[0], "Ballesta ligera");
});

test("unknown or malformed templates return 400 without saving a blank character", async (context) => {
  let creations = 0;
  context.mock.method(Character, "create", async () => { creations += 1; });
  for (const templateId of ["missing", "", "__proto__", 42, {}, []]) {
    const res = response();
    await handler("post", "/")({ user: owner, body: { templateId } }, res);
    assert.equal(res.statusCode, 400);
    assert.match(res.body.error, /plantilla/);
  }
  assert.equal(creations, 0);
});

test("armor penalties and feat bonuses are included without changing allocated ranks", async (context) => {
  context.mock.method(Character, "create", async (character) => character);
  const res = response();
  await handler("post", "/")({ user: owner, body: { templateId: "fighter" } }, res);
  const skill = (name) => res.body.skills.find((entry) => entry.name === name);
  assert.equal(skill("Trepar").miscModifier, -4);
  assert.equal(skill("Nadar").miscModifier, -8);
  assert.equal(skill("Montar").miscModifier, 0);
  assert.equal(skill("Avistar").miscModifier, 2);
  assert.equal(skill("Escuchar").miscModifier, 2);
  assert.equal(skill("Trepar").ranks, 4);
});
