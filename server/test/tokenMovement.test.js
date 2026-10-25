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
const handler = (method, path) => router.stack.find((layer) =>
  layer.route?.path === path && layer.route.methods[method]).route.stack.at(-1).handle;
const move = handler("patch", "/:id/table/token");
const readWorkspace = handler("get", "/:id/workspace");
const response = () => ({
  statusCode: 200, headers: {},
  set(key, value) { this.headers[key] = value; return this; },
  status(code) { this.statusCode = code; return this; },
  json(body) { this.body = body; return this; },
});
const request = (extra = {}) => ({
  user, params: { id: campaignId },
  body: { characterId, combatantId: "mine", x: 4, y: 4, revision: 0, ...extra },
});
function campaign() {
  const doc = new Campaign({ _id: campaignId, dm, name: "Bosque", inviteCode: "ABC123" });
  const w = doc.dmWorkspace;
  w.presentation.enabled = true;
  w.presentation.shareMap = true;
  w.notes.push({ id: "note", title: "DM_PRIVATE_NOTE", content: "DM_PRIVATE_PLOT" });
  w.combat.combatants.push(
    { id: "mine", sourceId: characterId, name: "Lyra", kind: "player" },
    { id: "other", sourceId: otherCharacter, name: "Eldrin", kind: "player" },
    { id: "hidden", name: "SECRET_ENEMY", kind: "monster" },
    { id: "companion", sourceId: `${characterId}:pet`, name: "Nimbo", kind: "ally", visibleToPlayers: true },
  );
  w.map.cells.push({ x: 5, y: 5, terrain: "fog" }, { x: 6, y: 6, terrain: "wall" });
  w.map.tokens.push(
    { combatantId: "mine", x: 1, y: 1 }, { combatantId: "other", x: 2, y: 2 },
    { combatantId: "hidden", x: 3, y: 3 }, { combatantId: "companion", x: 7, y: 7 },
  );
  return doc;
}
function mockMember(context, doc) {
  context.mock.method(Character, "findOne", (query) => ({ select: async () =>
    query._id === characterId && query.user === user && query.campaign === campaignId ? { _id: characterId } : null }));
  context.mock.method(Campaign, "findById", async () => doc);
}

test("public map advertises only this character's visible, placed player tokens", () => {
  const doc = campaign();
  assert.deepEqual(playerTable(doc, characterId).map.movableTokenIds, ["mine"]);
  assert.deepEqual(playerTable(doc, otherCharacter).map.movableTokenIds, ["other"]);
  doc.dmWorkspace.map.tokens[0].x = 5;
  doc.dmWorkspace.map.tokens[0].y = 5;
  assert.deepEqual(playerTable(doc, characterId).map.movableTokenIds, []);
});

test("an owner moves only their token atomically; secrets and arbitrary payload fields stay private", async (context) => {
  const doc = campaign();
  mockMember(context, doc);
  context.mock.method(Campaign, "findOneAndUpdate", async (filter, update, options) => {
    assert.equal(String(filter._id), campaignId);
    assert.deepEqual(filter.$or, [{ workspaceRevision: 0 }, { workspaceRevision: { $exists: false } }]);
    assert.deepEqual(update, { $set: {
      "dmWorkspace.map.tokens.$[token].x": 4, "dmWorkspace.map.tokens.$[token].y": 4,
    }, $inc: { workspaceRevision: 1 } });
    assert.deepEqual(options, { new: true, arrayFilters: [{ "token.combatantId": "mine" }] });
    const updated = new Campaign(doc.toObject());
    updated.dmWorkspace.map.tokens[0].x = 4;
    updated.dmWorkspace.map.tokens[0].y = 4;
    updated.workspaceRevision = 1;
    return updated;
  });
  const res = response();
  await move(request({ workspace: { notes: [] }, dm: user, hp: 999 }), res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.headers["Cache-Control"], "private, no-store");
  assert.equal(res.body.revision, 1);
  assert.deepEqual(res.body.map.tokens.find((token) => token.combatantId === "mine"), { combatantId: "mine", x: 4, y: 4 });
  assert.deepEqual(res.body.map.tokens.find((token) => token.combatantId === "other"), { combatantId: "other", x: 2, y: 2 });
  for (const secret of ["DM_PRIVATE", "SECRET_ENEMY", "sourceId", "inviteCode"])
    assert.ok(!JSON.stringify(res.body).includes(secret));
});

test("players cannot move another character, enemies, companions, missing or unplaced tokens", async (context) => {
  const doc = campaign();
  mockMember(context, doc);
  context.mock.method(Campaign, "findOneAndUpdate", () => assert.fail("Forbidden movement must not write"));
  for (const combatantId of ["other", "hidden", "companion", "missing"]) {
    const res = response();
    await move(request({ combatantId }), res);
    assert.equal(res.statusCode, 403, combatantId);
  }
  doc.dmWorkspace.map.tokens = doc.dmWorkspace.map.tokens.filter((token) => token.combatantId !== "mine");
  const res = response();
  await move(request(), res);
  assert.equal(res.statusCode, 403);
});

test("ownership, membership, map sharing and fog are checked on every move", async (context) => {
  const doc = campaign();
  mockMember(context, doc);
  context.mock.method(Campaign, "findOneAndUpdate", () => assert.fail("Revoked access must not write"));
  for (const req of [request({ characterId: otherCharacter }), { ...request(), user: dm }]) {
    const res = response();
    await move(req, res);
    assert.equal(res.statusCode, 403);
  }
  for (const field of ["enabled", "shareMap"]) {
    doc.dmWorkspace.presentation[field] = false;
    const res = response();
    await move(request(), res);
    assert.equal(res.statusCode, 403);
    doc.dmWorkspace.presentation[field] = true;
  }
  doc.dmWorkspace.map.tokens[0].x = 5;
  doc.dmWorkspace.map.tokens[0].y = 5;
  const fogged = response();
  await move(request(), fogged);
  assert.equal(fogged.statusCode, 403);
  context.mock.method(Character, "findOne", () => ({ select: async () => null }));
  const departed = response();
  await move(request(), departed);
  assert.equal(departed.statusCode, 403);
});

test("invalid positions, occupied cells, walls, fog, malformed inputs and stale revisions never write", async (context) => {
  mockMember(context, campaign());
  context.mock.method(Campaign, "findOneAndUpdate", () => assert.fail("Invalid movement must not write"));
  for (const extra of [
    { x: -1 }, { x: 16 }, { y: 12 }, { x: 1.5 }, { x: "4" }, { y: null },
    { x: 2, y: 2 }, { x: 3, y: 3 }, { x: 5, y: 5 }, { x: 6, y: 6 },
    { characterId: { $ne: null } }, { combatantId: { $ne: null } },
    { revision: -1 }, { revision: "0" }, { revision: undefined },
  ]) {
    const res = response();
    await move(request(extra), res);
    assert.equal(res.statusCode, 400, JSON.stringify(extra));
  }
  const stale = response();
  await move(request({ revision: 1 }), stale);
  assert.equal(stale.statusCode, 409);
});

test("concurrent moves from the same revision allow exactly one write", async (context) => {
  let stored = campaign();
  mockMember(context, stored);
  context.mock.method(Campaign, "findOneAndUpdate", async (filter, update) => {
    if ((filter.workspaceRevision ?? 0) !== stored.workspaceRevision) return null;
    stored = new Campaign(stored.toObject());
    stored.dmWorkspace.map.tokens[0].x = update.$set["dmWorkspace.map.tokens.$[token].x"];
    stored.dmWorkspace.map.tokens[0].y = update.$set["dmWorkspace.map.tokens.$[token].y"];
    stored.workspaceRevision += 1;
    return stored;
  });
  const first = response(), second = response();
  await Promise.all([move(request(), first), move(request({ x: 8, y: 8 }), second)]);
  assert.deepEqual([first.statusCode, second.statusCode].sort(), [200, 409]);
  assert.equal(stored.workspaceRevision, 1);
});

test("DM synchronization exposes the full workspace only to its DM", async (context) => {
  context.mock.method(Campaign, "findById", async () => campaign());
  const denied = response();
  await readWorkspace(request(), denied);
  assert.equal(denied.statusCode, 403);
  assert.equal(denied.body.workspace, undefined);
  const allowed = response();
  await readWorkspace({ ...request(), user: dm }, allowed);
  assert.equal(allowed.statusCode, 200);
  assert.equal(allowed.headers["Cache-Control"], "private, no-store");
  assert.equal(allowed.body.workspace.notes[0].title, "DM_PRIVATE_NOTE");
});
