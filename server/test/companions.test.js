import assert from "node:assert/strict";
import test from "node:test";
import Character from "../models/Character.js";
import Campaign from "../models/Campaign.js";
import characterRouter from "../routes/characters.js";
import campaignRouter from "../routes/campaignRoutes.js";
import { playerTable } from "../utils/sharedTable.js";

const owner = "507f1f77bcf86cd799439011";
const id = "507f1f77bcf86cd799439022";
const companionId = "507f1f77bcf86cd799439033";
const character = (companions = []) => new Character({ user: owner, name: "Lyra", companions });
const campaign = () => new Campaign({ _id: id, dm: owner, name: "Bosque", inviteCode: "BOSQUE" });
const handler = (router, method, path) => router.stack.find((layer) => layer.route?.path === path && layer.route.methods[method]).route.stack.at(-1).handle;
const response = () => ({ statusCode: 200, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } });

test("legacy characters default to no companions; each companion persists its identity and own stats", async () => {
  assert.deepEqual(character().companions.toObject(), []);
  const kinds = ["familiar", "summon", "homunculus", "animal", "mount", "other"];
  const doc = character(kinds.map((kind) => ({ name: kind, kind, hp: { current: -2, max: 18 }, active: false, ac: 14, initiativeBonus: 2, duration: "3 asaltos", actions: "Mordisco +2, 1d4" })));
  await doc.validate();
  const saved = character(doc.toObject().companions);
  assert.equal(new Set(saved.companions.map((entry) => String(entry._id))).size, 6);
  assert.equal(String(saved.companions[0]._id), String(doc.companions[0]._id));
  assert.equal(saved.companions[0].hp.current, -2);
  assert.equal(saved.companions[0].active, false);
  assert.equal(saved.hp.current, 10);
});

test("companion validation rejects missing names, bad types, fractional stats, unknown fields and oversized collections", async () => {
  const cases = [
    [{ name: " " }], [{ name: "A", kind: "dragon" }], [{ name: "A", ac: 1.5 }],
    [{ name: "A", hp: { max: 0 } }], [{ name: "A", initiativeBonus: 101 }],
    [{ name: "A", description: "x".repeat(12001) }], [{ name: "A", user: owner }], [null],
    Array.from({ length: 51 }, () => ({ name: "A" })),
    [{ _id: companionId, name: "A" }, { _id: companionId, name: "B" }],
  ];
  for (const entries of cases) await assert.rejects(character(entries).validate());
});

test("the character update saves companion edits only on the owner's sheet, and validates arrays", async (context) => {
  const entries = [{ _id: companionId, name: "Nimbo", kind: "familiar", active: true, hp: { current: 2, max: 8 } }];
  context.mock.method(Character, "findOneAndUpdate", (query, update, options) => {
    assert.deepEqual(query, { _id: id, user: owner });
    assert.deepEqual(update.$set.companions, entries);
    assert.equal(options.runValidators, true);
    return { populate: async () => character(entries) };
  });
  const res = response();
  await handler(characterRouter, "patch", "/:charId/update")({ user: owner, params: { charId: id }, body: { companions: entries } }, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.companions[0].name, "Nimbo");
});

test("dotted companion inserts cannot bypass collection limits", async (context) => {
  context.mock.method(Character, "findOneAndUpdate", () => assert.fail("Must not write"));
  const res = response();
  await handler(characterRouter, "patch", "/:charId/update")({ user: owner, params: { charId: id }, body: { "companions.51": { name: "A" } } }, res);
  assert.equal(res.statusCode, 400);
});

test("the authorized DM dashboard includes companions alongside the owner", async (context) => {
  context.mock.method(Campaign, "findById", async () => campaign());
  context.mock.method(Character, "find", () => ({ select: async (fields) => {
    assert.ok(fields.split(" ").includes("companions"));
    return [character([{ name: "Nimbo" }])];
  } }));
  const res = response();
  await handler(campaignRouter, "get", "/:id/dashboard")({ user: owner, params: { id } }, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.players[0].companions[0].name, "Nimbo");
});

test("new campaigns start hexagonal and existing campaigns keep square geometry", async (context) => {
  assert.equal(campaign().dmWorkspace.map.gridType, "square");
  context.mock.method(Campaign, "create", async (data) => new Campaign(data));
  const res = response();
  await handler(campaignRouter, "post", "/create")({ user: owner, body: { name: "Hex" } }, res);
  assert.equal(res.statusCode, 201);
  assert.equal(res.body.dmWorkspace.map.gridType, "hex");
});

test("hex geometry and scale reach players while fog still hides companion positions and actions", async () => {
  const doc = campaign();
  const w = doc.dmWorkspace;
  w.presentation.enabled = true;
  w.presentation.shareMap = true;
  w.map.gridType = "hex";
  w.map.feetPerCell = 10;
  w.combat.combatants.push({ id: "ally1", kind: "ally", name: "Nimbo", sourceId: `${id}:${companionId}`, visibleToPlayers: true, actions: "PRIVATE_ACTION" });
  w.map.tokens.push({ combatantId: "ally1", x: 3, y: 3 });
  w.map.cells.push({ x: 3, y: 3, terrain: "fog" });
  await doc.validate();
  const hidden = playerTable(doc, id);
  assert.equal(hidden.map.gridType, "hex");
  assert.equal(hidden.map.feetPerCell, 10);
  assert.deepEqual(hidden.map.tokens, []);
  assert.ok(!JSON.stringify(hidden).includes("PRIVATE_ACTION"));
  w.map.cells = [];
  assert.equal(playerTable(doc, id).map.tokens[0].combatantId, "ally1");
});

test("old clients cannot reset saved hex geometry or scale when saving another workspace change", async (context) => {
  const doc = campaign();
  doc.dmWorkspace.map.gridType = "hex";
  doc.dmWorkspace.map.feetPerCell = 30;
  const workspace = doc.dmWorkspace.toObject();
  delete workspace.map.gridType;
  delete workspace.map.feetPerCell;
  context.mock.method(Campaign, "findById", async () => doc);
  context.mock.method(Campaign, "findOneAndUpdate", async (query, update) => {
    assert.equal(update.$set.dmWorkspace.map.gridType, "hex");
    assert.equal(update.$set.dmWorkspace.map.feetPerCell, 30);
    return { dmWorkspace: update.$set.dmWorkspace, workspaceRevision: 1 };
  });
  const res = response();
  await handler(campaignRouter, "put", "/:id/workspace")({ user: owner, params: { id }, body: { workspace, revision: 0 } }, res);
  assert.equal(res.statusCode, 200);
});
