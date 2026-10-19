import assert from "node:assert/strict";
import test from "node:test";
import Character from "../models/Character.js";
import router from "../routes/characters.js";

const owner = "507f1f77bcf86cd799439011";
const characterId = "507f1f77bcf86cd799439022";
const handler = (method, path) =>
  router.stack.find(
    (layer) => layer.route?.path === path && layer.route.methods[method],
  ).route.stack[0].handle;
const response = () => ({
  statusCode: 200,
  body: null,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(data) {
    this.body = data;
    return this;
  },
});

test("existing characters default to an empty quick-action list and preserve their resource IDs", async () => {
  const character = new Character({
    user: owner,
    name: "Lyra",
    attacks: [{ name: "Espada" }],
  });
  await character.validate();
  assert.deepEqual(character.quickActions.toObject(), []);
  const reference = {
    kind: "attack",
    itemId: String(character.attacks[0]._id),
  };
  character.quickActions.push(reference);
  await character.validate();
  assert.deepEqual(character.toObject().quickActions, [reference]);
  assert.equal(character.quickActions[0]._id, undefined);
});

test("quick-action validation rejects duplicates and unknown resource types", async () => {
  const reference = { kind: "spell", itemId: "spell-1" };
  const duplicate = new Character({
    user: owner,
    name: "Lyra",
    quickActions: [reference, reference],
  });
  await assert.rejects(duplicate.validate(), /no pueden repetirse/);
  const invalid = new Character({
    user: owner,
    name: "Lyra",
    quickActions: [{ kind: "unknown", itemId: "1" }],
  });
  await assert.rejects(invalid.validate(), /not a valid enum/);
});

test("creation remains immediate and ignores the removed AI prompt", async (context) => {
  context.mock.method(Character, "create", async (data) => new Character(data));
  const res = response();
  await handler("post", "/")(
    { user: owner, body: { prompt: "Descripción antigua" } },
    res,
  );
  assert.equal(res.statusCode, 201);
  assert.equal(res.body.name, "Nuevo Aventurero");
  assert.equal(res.body.class, "Guerrero");
  assert.equal(res.body.hp.max, 10);
  assert.deepEqual(res.body.quickActions.toObject(), []);
});

test("saving the ordered favorites and dotted health updates always scopes the query to the owner", async (context) => {
  const data = {
    quickActions: [
      { kind: "item", itemId: "potion-1" },
      { kind: "attack", itemId: "sword-1" },
    ],
    "hp.current": -3,
  };
  context.mock.method(
    Character,
    "findOneAndUpdate",
    (query, update, options) => {
      assert.deepEqual(query, { _id: characterId, user: owner });
      assert.deepEqual(update, { $set: data });
      assert.equal(options.runValidators, true);
      assert.equal(options.new, true);
      return { populate: async () => ({ _id: characterId, ...data }) };
    },
  );
  const res = response();
  await handler("patch", "/:charId/update")(
    { user: owner, params: { charId: characterId }, body: data },
    res,
  );
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body.quickActions, data.quickActions);
  assert.equal(res.body["hp.current"], -3);
});

test("an inaccessible character returns 404 instead of being updated", async (context) => {
  context.mock.method(Character, "findOneAndUpdate", () => ({
    populate: async () => null,
  }));
  const res = response();
  await handler("patch", "/:charId/update")(
    { user: owner, params: { charId: characterId }, body: { name: "Otro" } },
    res,
  );
  assert.equal(res.statusCode, 404);
});

test("character updates cannot forge campaign membership or change ownership", async (context) => {
  context.mock.method(Character, "findOneAndUpdate", () => assert.fail("Must not write reserved fields"));
  for (const data of [{ campaign: characterId }, { user: owner }, { "campaign._id": characterId }, { _id: owner }, { "stats.__proto__.admin": true }, { "$set": { campaign: characterId } }]) {
    const res = response();
    await handler("patch", "/:charId/update")({ user: owner, params: { charId: characterId }, body: data }, res);
    assert.equal(res.statusCode, 400);
  }
});

test("legacy note, attack and feat routes also enforce ownership", async (context) => {
  context.mock.method(Character, "findOne", async (query) => {
    assert.deepEqual(query, { _id: characterId, user: owner });
    return null;
  });
  context.mock.method(Character, "findById", () => assert.fail("Must not use an unscoped lookup"));
  for (const [method, path] of [
    ["post", "/:charId/notes"], ["delete", "/:charId/notes/:noteId"],
    ["post", "/:charId/attacks"], ["delete", "/:charId/attacks/:attackId"],
    ["post", "/:charId/feats"], ["delete", "/:charId/feats/:featId"],
  ]) {
    const res = response();
    await handler(method, path)({ user: owner, params: { charId: characterId }, body: {} }, res);
    assert.equal(res.statusCode, 404);
  }
});
