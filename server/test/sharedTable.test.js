import assert from "node:assert/strict";
import test from "node:test";
import Campaign from "../models/Campaign.js";
import Character from "../models/Character.js";
import router from "../routes/campaignRoutes.js";
import { playerTable } from "../utils/sharedTable.js";

const dm = "507f1f77bcf86cd799439011";
const user = "507f1f77bcf86cd799439012";
const campaignId = "507f1f77bcf86cd799439022";
const characterId = "507f1f77bcf86cd799439033";
const otherCharacter = "507f1f77bcf86cd799439044";
const campaign = () => new Campaign({ _id: campaignId, name: "Bosque", dm, inviteCode: "ABC123" });
const response = () => ({
  statusCode: 200, headers: {},
  set(key, value) { this.headers[key] = value; return this; },
  status(code) { this.statusCode = code; return this; },
  json(body) { this.body = body; return this; },
});
const handler = (method, path) => router.stack.find((layer) => layer.route?.path === path && layer.route.methods[method]).route.stack.at(-1).handle;
const table = handler("get", "/:id/table");
const save = handler("put", "/:id/workspace");
const request = (workspace) => ({ user: dm, params: { id: campaignId }, body: { workspace, revision: 0 } });
const scene = () => ({ id: "scene-one", title: "La torre", description: "La puerta se abre.", mood: "ruins", imageUrl: "" });
const secret = (extra = {}) => ({ id: "secret-one", title: "Un recuerdo", content: "Solo tú reconoces el medallón.", recipientId: characterId, released: true, ...extra });

function populatedCampaign() {
  const doc = campaign();
  const workspace = doc.dmWorkspace;
  workspace.notes.push({ id: "dm-note", title: "DM_ONLY_NOTE", content: "THE_KING_IS_EVIL" });
  workspace.actors.push({ id: "boss", name: "SECRET_BOSS", description: "SECRET_MOTIVE", actions: "SECRET_ATTACKS" });
  workspace.combat.combatants.push(
    { id: "player-one", sourceId: characterId, name: "Lyra", kind: "player", hp: 7, maxHp: 12, initiative: 18 },
    { id: "revealed", name: "Guardián", kind: "monster", hp: 43, maxHp: 99, ac: 28, initiative: 12, visibleToPlayers: true, conditions: "SECRET_CONDITION", actions: "SECRET_TACTICS" },
    { id: "hidden-enemy", name: "SECRET_HIDDEN_ENEMY", kind: "monster", initiative: 20 },
  );
  workspace.combat.activeId = "hidden-enemy";
  workspace.map.cells.push({ x: 2, y: 2, terrain: "fog" });
  workspace.map.tokens.push(
    { combatantId: "player-one", x: 1, y: 1 },
    { combatantId: "revealed", x: 2, y: 2 },
    { combatantId: "hidden-enemy", x: 3, y: 3 },
  );
  workspace.presentation.enabled = true;
  workspace.presentation.shareMap = true;
  workspace.presentation.scenes.push({ ...scene(), description: "UNPUBLISHED_SCENE_TEXT" });
  workspace.presentation.activeScene = { ...scene(), presentationId: "show-one" };
  workspace.presentation.secrets.push(
    secret(),
    secret({ id: "other-secret", recipientId: otherCharacter, content: "OTHER_CHARACTER_SECRET" }),
    secret({ id: "draft-secret", released: false, content: "UNSENT_SECRET" }),
  );
  return doc;
}

test("legacy campaigns start with private sharing and no published scene or messages", async () => {
  const doc = campaign();
  await doc.validate();
  const result = playerTable(doc, characterId);
  assert.equal(result.enabled, false);
  assert.equal(result.map, null);
  assert.equal(result.combat, null);
  assert.equal(result.scene, null);
  assert.deepEqual(result.secrets, []);
});

test("the public response excludes DM notes, drafts, hidden enemies, stats and other recipients", async () => {
  const doc = populatedCampaign();
  await doc.validate();
  const result = playerTable(doc, characterId);
  const json = JSON.stringify(result);
  for (const privateValue of ["DM_ONLY_NOTE", "THE_KING_IS_EVIL", "SECRET_BOSS", "SECRET_MOTIVE", "SECRET_ATTACKS", "SECRET_HIDDEN_ENEMY", "hidden-enemy", "SECRET_CONDITION", "SECRET_TACTICS", "UNPUBLISHED_SCENE_TEXT", "OTHER_CHARACTER_SECRET", "UNSENT_SECRET", "inviteCode", "sourceId", "recipientId", "armorClass"]) {
    assert.ok(!json.includes(privateValue), `Must not disclose ${privateValue}`);
  }
  assert.deepEqual(result.combat.combatants.map((entry) => entry.name), ["Lyra", "Guardián"]);
  assert.equal(result.combat.activeId, "");
  assert.equal(result.combat.hiddenTurn, true);
  assert.equal(result.combat.combatants[0].hp, 7);
  assert.equal(result.combat.combatants[1].hp, undefined);
  assert.equal(result.combat.combatants[1].maxHp, undefined);
  assert.equal(result.combat.combatants[1].ac, undefined);
  assert.deepEqual(result.secrets, [{ id: "secret-one", title: "Un recuerdo", content: "Solo tú reconoces el medallón." }]);
  assert.equal(result.scene.description, "La puerta se abre.");
});

test("fog and unrevealed combatants never send their token coordinates", () => {
  const doc = populatedCampaign();
  const result = playerTable(doc, characterId);
  assert.deepEqual(result.map.tokens, [{ combatantId: "player-one", x: 1, y: 1 }]);
  assert.deepEqual(result.map.cells, [{ x: 2, y: 2, terrain: "fog" }]);
  doc.dmWorkspace.map.cells = [];
  assert.deepEqual(playerTable(doc, characterId).map.tokens.map((token) => token.combatantId), ["player-one", "revealed"]);
});

test("the DM can opt into enemy HP, hide the map, and withdraw scenes without mutating drafts", () => {
  const doc = populatedCampaign();
  doc.dmWorkspace.presentation.showEnemyHp = true;
  doc.dmWorkspace.presentation.shareMap = false;
  const result = playerTable(doc, characterId);
  assert.equal(result.combat.combatants[1].hp, 43);
  assert.equal(result.map, null);
  doc.dmWorkspace.presentation.activeScene = null;
  assert.equal(playerTable(doc, characterId).scene, null);
  assert.equal(doc.dmWorkspace.presentation.scenes.length, 1);
});

test("messages and presented scenes remain available when tactical sharing is disabled", () => {
  const doc = populatedCampaign();
  doc.dmWorkspace.presentation.enabled = false;
  const result = playerTable(doc, characterId);
  assert.equal(result.combat, null);
  assert.equal(result.map, null);
  assert.equal(result.scene.title, "La torre");
  assert.equal(result.secrets.length, 1);
  assert.equal(playerTable(doc, otherCharacter).secrets[0].content, "OTHER_CHARACTER_SECRET");
});

test("every public read checks character ownership and current membership before loading the campaign", async (context) => {
  context.mock.method(Character, "findOne", (query) => {
    assert.deepEqual(query, { _id: characterId, user, campaign: campaignId });
    return { select: async (fields) => { assert.equal(fields, "_id"); return { _id: characterId }; } };
  });
  context.mock.method(Campaign, "findById", async (id) => {
    assert.equal(id, campaignId);
    return populatedCampaign();
  });
  const res = response();
  await table({ user, params: { id: campaignId }, query: { characterId } }, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.headers["Cache-Control"], "private, no-store");
  assert.equal(res.body.secrets.length, 1);
});

test("foreign characters and former members cannot load scenes or secrets", async (context) => {
  context.mock.method(Character, "findOne", () => ({ select: async () => null }));
  context.mock.method(Campaign, "findById", () => assert.fail("Must not query private campaign"));
  const res = response();
  await table({ user, params: { id: campaignId }, query: { characterId } }, res);
  assert.equal(res.statusCode, 403);
  assert.equal(res.body.scene, undefined);
});

test("malformed campaign and character IDs are rejected before database queries", async (context) => {
  context.mock.method(Character, "findOne", () => assert.fail("Must not query members"));
  for (const [id, query] of [["bad", { characterId }], [campaignId, {}], [campaignId, { characterId: { $ne: null } }], [campaignId, { characterId: "invalid" }]]) {
    const res = response();
    await table({ user, params: { id }, query }, res);
    assert.equal(res.statusCode, 400);
  }
});

test("schema rejects unsafe image URLs, malformed recipients, unknown fields and duplicate messages", async () => {
  const cases = [
    { scenes: [{ ...scene(), imageUrl: "javascript:alert(1)" }] },
    { scenes: [{ ...scene(), imageUrl: "data:image/svg+xml,<svg/>" }] },
    { scenes: [{ ...scene(), imageUrl: "http://example.com/image.jpg" }] },
    { scenes: [{ ...scene(), imageUrl: "https://user:pass@example.com/image.jpg" }] },
    { scenes: [{ ...scene(), mood: "unknown" }] },
    { scenes: [{ ...scene(), title: " " }] },
    { scenes: [{ ...scene(), description: "x".repeat(12001) }] },
    { secrets: [secret({ recipientId: "not-a-character" })] },
    { secrets: [secret(), secret()] },
    { secrets: [null] },
    { secrets: [secret({ admin: true })] },
    { activeScene: { ...scene(), presentationId: "" } },
    { presentation: "unknown" },
  ];
  for (const presentation of cases) {
    const doc = campaign();
    doc.dmWorkspace.presentation = presentation;
    await assert.rejects(doc.validate(), { name: "ValidationError" });
  }
});

test("saving delivered secrets validates recipients against this campaign before writing", async (context) => {
  const doc = campaign();
  const workspace = doc.dmWorkspace.toObject();
  workspace.presentation.secrets = [secret()];
  context.mock.method(Campaign, "findById", async () => doc);
  context.mock.method(Character, "find", (query) => {
    assert.equal(String(query.campaign), campaignId);
    assert.deepEqual(query._id.$in, [characterId]);
    return { select: async () => [{ _id: characterId }] };
  });
  context.mock.method(Campaign, "findOneAndUpdate", async (filter, update) => {
    assert.equal(filter.dm, dm);
    assert.equal(update.$set.dmWorkspace.presentation.secrets[0].released, true);
    return { dmWorkspace: update.$set.dmWorkspace, workspaceRevision: 1 };
  });
  const res = response();
  await save(request(workspace), res);
  assert.equal(res.statusCode, 200);
});

test("sending to a character outside this campaign fails without saving", async (context) => {
  context.mock.method(Campaign, "findById", async () => campaign());
  context.mock.method(Character, "find", () => ({ select: async () => [] }));
  context.mock.method(Campaign, "findOneAndUpdate", () => assert.fail("Must not write"));
  const workspace = campaign().dmWorkspace.toObject();
  workspace.presentation.secrets = [secret({ recipientId: otherCharacter })];
  const res = response();
  await save(request(workspace), res);
  assert.equal(res.statusCode, 400);
  assert.match(res.body.message, /destinatario/);
});

test("a departed recipient does not block saving turns or withdrawing an old message", async (context) => {
  const doc = populatedCampaign();
  context.mock.method(Campaign, "findById", async () => doc);
  context.mock.method(Character, "find", () => assert.fail("Unchanged old recipients need not be members"));
  context.mock.method(Campaign, "findOneAndUpdate", async (filter, update) => ({ dmWorkspace: update.$set.dmWorkspace, workspaceRevision: 1 }));
  const workspace = doc.dmWorkspace.toObject();
  workspace.combat.round += 1;
  workspace.presentation.secrets[0].released = false;
  const res = response();
  await save(request(workspace), res);
  assert.equal(res.statusCode, 200);
});

test("an older client saving without presentation fields preserves existing scenes and messages", async (context) => {
  const doc = populatedCampaign();
  context.mock.method(Campaign, "findById", async () => doc);
  context.mock.method(Character, "find", () => assert.fail("Existing recipients need no new check"));
  context.mock.method(Campaign, "findOneAndUpdate", async (filter, update) => {
    assert.equal(update.$set.dmWorkspace.presentation.activeScene.title, "La torre");
    assert.equal(update.$set.dmWorkspace.presentation.secrets.length, 3);
    return { dmWorkspace: update.$set.dmWorkspace, workspaceRevision: 1 };
  });
  const workspace = doc.dmWorkspace.toObject();
  delete workspace.presentation;
  const res = response();
  await save(request(workspace), res);
  assert.equal(res.statusCode, 200);
});
