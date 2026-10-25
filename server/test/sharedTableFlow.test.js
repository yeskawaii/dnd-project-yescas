import assert from "node:assert/strict";
import { IncomingMessage, ServerResponse } from "node:http";
import { Duplex } from "node:stream";
import test from "node:test";
import express from "express";
import jwt from "jsonwebtoken";
import Campaign from "../models/Campaign.js";
import Character from "../models/Character.js";
import campaignRoutes from "../routes/campaignRoutes.js";
import characterRoutes from "../routes/characters.js";

const dm = "507f1f77bcf86cd799439011";
const firstUser = "507f1f77bcf86cd799439012";
const secondUser = "507f1f77bcf86cd799439013";
const campaignId = "507f1f77bcf86cd799439022";
const firstCharacter = "507f1f77bcf86cd799439033";
const secondCharacter = "507f1f77bcf86cd799439044";
const extraCharacter = "507f1f77bcf86cd799439055";
const signingKey = "isolated-test-key-for-in-memory-requests";

function mockMembers(context, members) {
  context.mock.method(Character, "find", (query) => ({ select: async () => {
    assert.equal(String(query.campaign), campaignId);
    return [...members].filter(([id, owner]) => query.user ? owner === query.user : query._id.$in.includes(id))
      .map(([_id]) => ({ _id }));
  } }));
}

// Full Express dispatch and JWT middleware, without binding a TCP port or using MongoDB.
function request(app, method, url, user, body = {}, headers = {}) {
  return new Promise((resolve, reject) => {
    const socket = new Duplex({ read() {}, write(chunk, encoding, done) { done(); } });
    const req = new IncomingMessage(socket);
    req.method = method;
    req.url = url;
    req.headers = { ...headers, ...(user ? { authorization: `Bearer ${jwt.sign({ id: user }, signingKey)}` } : {}) };
    req.body = body;
    const res = new ServerResponse(req);
    res.end = (data) => {
      socket.destroy();
      resolve({ status: res.statusCode, headers: res.getHeaders(), body: data ? JSON.parse(String(data)) : null });
      return res;
    };
    app.handle(req, res, reject);
  });
}

test("authenticated DM publishes, players receive individual views, and revocation takes effect on the next read", async (context) => {
  const oldKey = process.env.JWT_SECRET;
  process.env.JWT_SECRET = signingKey;
  context.after(() => { if (oldKey === undefined) delete process.env.JWT_SECRET; else process.env.JWT_SECRET = oldKey; });
  const app = express();
  app.use("/api/campaign", campaignRoutes);
  app.use("/api/character", characterRoutes);
  let stored = new Campaign({ _id: campaignId, dm, name: "El bosque", inviteCode: "FOREST" });
  const members = new Map([[firstCharacter, firstUser], [secondCharacter, secondUser]]);
  context.mock.method(Campaign, "findById", async () => stored);
  mockMembers(context, members);
  context.mock.method(Campaign, "findOneAndUpdate", async (filter, update) => {
    const expectedRevision = filter.workspaceRevision ?? 0;
    if (filter.dm !== dm || expectedRevision !== stored.workspaceRevision) return null;
    stored = new Campaign({ ...stored.toObject(), dmWorkspace: update.$set.dmWorkspace, workspaceRevision: stored.workspaceRevision + 1 });
    return stored;
  });
  const baseUrl = `/api/campaign/${campaignId}`;
  assert.equal((await request(app, "GET", `${baseUrl}/table?characterId=${firstCharacter}`)).status, 401);
  const workspace = stored.dmWorkspace.toObject();
  workspace.presentation = {
    enabled: true, shareMap: true, showEnemyHp: false, scenes: [],
    activeScene: { id: "scene", presentationId: "show-one", title: "La torre", description: "El portón se abre", mood: "ruins", imageUrl: "" },
    secrets: [
      { id: "first", title: "Para Lyra", content: "FIRST_PRIVATE_TEXT", recipientId: firstCharacter, released: true },
      { id: "second", title: "Para Eldrin", content: "SECOND_PRIVATE_TEXT", recipientId: secondCharacter, released: true },
    ],
  };
  workspace.notes = [{ id: "dm-note", title: "PRIVATE_DM_NOTE", content: "PRIVATE_DM_PLOT" }];
  const saved = await request(app, "PUT", `${baseUrl}/workspace`, dm, { workspace, revision: 0 });
  assert.equal(saved.status, 200);
  assert.equal(saved.body.revision, 1);
  const first = await request(app, "GET", `${baseUrl}/table?characterId=${firstCharacter}`, firstUser);
  assert.equal(first.status, 200);
  assert.equal(first.headers["cache-control"], "private, no-store");
  assert.equal(first.body.scene.title, "La torre");
  assert.deepEqual(first.body.secrets.map((entry) => entry.content), ["FIRST_PRIVATE_TEXT"]);
  assert.ok(!JSON.stringify(first.body).includes("SECOND_PRIVATE_TEXT"));
  assert.ok(!JSON.stringify(first.body).includes("PRIVATE_DM"));
  const second = await request(app, "GET", `${baseUrl}/table?characterId=${secondCharacter}`, secondUser);
  assert.deepEqual(second.body.secrets.map((entry) => entry.content), ["SECOND_PRIVATE_TEXT"]);
  assert.equal((await request(app, "GET", `${baseUrl}/table?characterId=${firstCharacter}`, secondUser)).status, 403);
  assert.equal((await request(app, "PUT", `${baseUrl}/workspace`, firstUser, { workspace, revision: 1 })).status, 403);
  assert.equal((await request(app, "PATCH", `/api/character/${secondCharacter}/update`, secondUser, { campaign: campaignId })).status, 400);
  const withdrawn = stored.dmWorkspace.toObject();
  withdrawn.presentation.activeScene = null;
  withdrawn.presentation.secrets[0].released = false;
  assert.equal((await request(app, "PUT", `${baseUrl}/workspace`, dm, { workspace: withdrawn, revision: 1 })).status, 200);
  const updated = await request(app, "GET", `${baseUrl}/table?characterId=${firstCharacter}`, firstUser);
  assert.equal(updated.body.scene, null);
  assert.deepEqual(updated.body.secrets, []);
  assert.equal((await request(app, "PUT", `${baseUrl}/workspace`, dm, { workspace, revision: 0 })).status, 409);
  members.delete(firstCharacter);
  assert.equal((await request(app, "GET", `${baseUrl}/table?characterId=${firstCharacter}`, firstUser)).status, 403);
});

for (const exploration of [false, true]) test(`one open character controls all the account's campaign tokens ${exploration ? "without a combat" : "in combat"}, everyone sees the result, and the DM retains control`, async (context) => {
  const oldKey = process.env.JWT_SECRET;
  process.env.JWT_SECRET = signingKey;
  context.after(() => { if (oldKey === undefined) delete process.env.JWT_SECRET; else process.env.JWT_SECRET = oldKey; });
  const app = express();
  app.use("/api/campaign", campaignRoutes);
  let stored = new Campaign({ _id: campaignId, dm, name: "El puente", inviteCode: "BRIDGE", workspaceRevision: 1 });
  stored.dmWorkspace.presentation.enabled = true;
  stored.dmWorkspace.presentation.shareMap = true;
  const participants = exploration ? stored.dmWorkspace.map.participants : stored.dmWorkspace.combat.combatants;
  participants.push(
    { id: "lyra", sourceId: firstCharacter, name: "Lyra", kind: "player" },
    { id: "eldrin", sourceId: secondCharacter, name: "Eldrin", kind: "player" },
    { id: "runa", sourceId: extraCharacter, name: "Runa", kind: "player" },
  );
  stored.dmWorkspace.map.tokens.push({ combatantId: "lyra", x: 1, y: 1 }, { combatantId: "eldrin", x: 2, y: 2 },
    { combatantId: "runa", x: 8, y: 8 });
  const members = new Map([[firstCharacter, firstUser], [secondCharacter, secondUser], [extraCharacter, firstUser]]);
  mockMembers(context, members);
  context.mock.method(Campaign, "findById", async () => stored);
  context.mock.method(Campaign, "findOneAndUpdate", async (filter, update, options) => {
    if ((filter.workspaceRevision ?? 0) !== stored.workspaceRevision) return null;
    if (update.$set.dmWorkspace) {
      assert.equal(filter.dm, dm);
      stored = new Campaign({ ...stored.toObject(), dmWorkspace: update.$set.dmWorkspace, workspaceRevision: stored.workspaceRevision + 1 });
    } else {
      const next = new Campaign(stored.toObject());
      const token = next.dmWorkspace.map.tokens.find((entry) => entry.combatantId === options.arrayFilters[0]["token.combatantId"]);
      token.x = update.$set["dmWorkspace.map.tokens.$[token].x"];
      token.y = update.$set["dmWorkspace.map.tokens.$[token].y"];
      next.workspaceRevision += 1;
      stored = next;
    }
    await stored.validate();
    return stored;
  });
  const url = `/api/campaign/${campaignId}`;
  const move = { characterId: firstCharacter, combatantId: "lyra", x: 4, y: 4, revision: 1 };
  const staleDMWorkspace = stored.dmWorkspace.toObject();
  const initial = await request(app, "GET", `${url}/table?characterId=${firstCharacter}`, firstUser);
  assert.equal(initial.status, 200);
  assert.deepEqual(initial.body.map.movableTokenIds, ["lyra", "runa"]);
  assert.equal((await request(app, "PATCH", `${url}/table/token`, null, move)).status, 401);
  assert.equal((await request(app, "PATCH", `${url}/table/token`, secondUser, move)).status, 403);
  assert.equal((await request(app, "PATCH", `${url}/table/token`, firstUser, { ...move, combatantId: "eldrin" })).status, 403);
  const moved = await request(app, "PATCH", `${url}/table/token`, firstUser, move);
  assert.equal(moved.status, 200);
  assert.equal(moved.body.revision, 2);
  assert.deepEqual(moved.body.map.movableTokenIds, ["lyra", "runa"]);
  if (exploration) {
    assert.equal(moved.body.combat.combatants.length, 0);
    assert.deepEqual(moved.body.map.participants.map((entry) => entry.name), ["Lyra", "Eldrin", "Runa"]);
    assert.equal(moved.body.combat.activeId, "");
  }
  const extraMove = { ...move, combatantId: "runa", x: 5, y: 4, revision: 2 };
  const movedExtra = await request(app, "PATCH", `${url}/table/token`, firstUser, extraMove);
  assert.equal(movedExtra.status, 200);
  assert.equal(movedExtra.body.revision, 3);
  assert.deepEqual(movedExtra.body.map.movableTokenIds, ["lyra", "runa"]);
  assert.deepEqual(movedExtra.body.map.tokens.find((token) => token.combatantId === "runa"), { combatantId: "runa", x: 5, y: 4 });
  const otherView = await request(app, "GET", `${url}/table?characterId=${secondCharacter}`, secondUser);
  assert.deepEqual(otherView.body.map.tokens.find((token) => token.combatantId === "lyra"), { combatantId: "lyra", x: 4, y: 4 });
  assert.deepEqual(otherView.body.map.movableTokenIds, ["eldrin"]);
  assert.deepEqual(otherView.body.map.tokens.find((token) => token.combatantId === "runa"), { combatantId: "runa", x: 5, y: 4 });
  assert.equal((await request(app, "GET", `${url}/workspace`, firstUser)).status, 403);
  assert.equal((await request(app, "PUT", `${url}/workspace`, dm, { workspace: staleDMWorkspace, revision: 1 })).status, 409);
  const latest = await request(app, "GET", `${url}/workspace`, dm);
  assert.equal(latest.status, 200);
  const workspace = latest.body.workspace;
  workspace.map.tokens.find((token) => token.combatantId === "lyra").x = 6;
  workspace.map.tokens.find((token) => token.combatantId === "eldrin").x = 7;
  assert.equal((await request(app, "PUT", `${url}/workspace`, dm, { workspace, revision: latest.body.revision })).status, 200);
  assert.deepEqual(stored.dmWorkspace.map.tokens.map((token) => token.x), [6, 7, 5]);
  // A stale placed token grants no control after its owner or membership changes.
  for (const revoke of [() => members.set(extraCharacter, secondUser), () => members.delete(extraCharacter)]) {
    revoke();
    const refreshed = await request(app, "GET", `${url}/table?characterId=${firstCharacter}`, firstUser);
    assert.deepEqual(refreshed.body.map.movableTokenIds, ["lyra"]);
    assert.equal((await request(app, "PATCH", `${url}/table/token`, firstUser, { ...extraMove, revision: 4 })).status, 403);
    assert.equal(stored.workspaceRevision, 4);
  }
  members.delete(firstCharacter);
  assert.equal((await request(app, "PATCH", `${url}/table/token`, firstUser, { ...move, revision: 3 })).status, 403);
});

test("a player's saved icon reaches phone, desktop, other players and the DM without replacing any token", async (context) => {
  const oldKey = process.env.JWT_SECRET;
  process.env.JWT_SECRET = signingKey;
  context.after(() => { if (oldKey === undefined) delete process.env.JWT_SECRET; else process.env.JWT_SECRET = oldKey; });
  const app = express();
  app.use("/api/campaign", campaignRoutes);
  app.use("/api/character", characterRoutes);
  const stored = new Campaign({ _id: campaignId, dm, name: "El bosque", inviteCode: "FOREST", workspaceRevision: 3 });
  const workspace = stored.dmWorkspace;
  workspace.presentation.enabled = workspace.presentation.shareMap = true;
  workspace.map.participants.push(
    { id: "lyra", sourceId: firstCharacter, name: "Lyra", kind: "player" },
    { id: "eldrin", sourceId: secondCharacter, name: "Eldrin", kind: "player" },
    { id: "hidden", name: "SECRET_ENEMY", kind: "monster" },
  );
  workspace.map.tokens.push({ combatantId: "lyra", x: 1, y: 1 }, { combatantId: "eldrin", x: 2, y: 2 },
    { combatantId: "hidden", x: 3, y: 3 });
  const characters = new Map([
    [firstCharacter, new Character({ _id: firstCharacter, user: firstUser, campaign: campaignId, name: "Lyra", appearance: { emblem: "bow" } })],
    [secondCharacter, new Character({ _id: secondCharacter, user: secondUser, campaign: campaignId, name: "Eldrin", appearance: { emblem: "magic" } })],
  ]);
  context.mock.method(Campaign, "findById", async () => stored);
  context.mock.method(Character, "find", (query) => ({ select: async (fields) => {
    assert.equal(String(query.campaign), campaignId);
    if (query.user) {
      assert.equal(fields, "_id");
      return [...characters.values()].filter((entry) => String(entry.user) === query.user && String(entry.campaign) === query.campaign);
    }
    assert.equal(fields, "_id appearance.emblem appearance.portrait appearance.mapTokenStyle");
    return query._id.$in.map((id) => characters.get(String(id))).filter(Boolean);
  } }));
  context.mock.method(Character, "findOneAndUpdate", (query, update) => ({ populate: async () => {
    const character = characters.get(String(query._id));
    if (!character || String(character.user) !== query.user) return null;
    character.set(update.$set);
    await character.validate();
    return character;
  } }));
  const url = `/api/campaign/${campaignId}`;
  const read = (user, id, agent) => request(app, "GET", `${url}/table?characterId=${id}`, user, {}, { "user-agent": agent });
  const desktop = await read(firstUser, firstCharacter, "Mozilla/5.0 (Macintosh) Chrome/130");
  const iphone = await read(firstUser, firstCharacter, "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) Mobile Safari");
  const android = await read(firstUser, firstCharacter, "Mozilla/5.0 (Linux; Android 15) Chrome/130 Mobile");
  for (const response of [desktop, iphone, android]) {
    assert.equal(response.status, 200);
    assert.deepEqual(response.body.map.participants.map(({ name, icon }) => ({ name, icon })), [
      { name: "Lyra", icon: "bow" }, { name: "Eldrin", icon: "magic" },
    ]);
    assert.deepEqual(response.body.map.movableTokenIds, ["lyra"]);
    assert.ok(!JSON.stringify(response.body).includes("SECRET_ENEMY"));
    assert.ok(!JSON.stringify(response.body).includes('"sourceId"'));
  }
  assert.deepEqual(iphone.body, desktop.body);
  assert.deepEqual(android.body, desktop.body);
  const foreign = await request(app, "PATCH", `/api/character/${firstCharacter}/update`, secondUser, { "appearance.emblem": "skull" });
  assert.equal(foreign.status, 404);
  const saved = await request(app, "PATCH", `/api/character/${firstCharacter}/update`, firstUser, { "appearance.emblem": "moon" });
  assert.equal(saved.status, 200);
  assert.equal(saved.body.appearance.emblem, "moon");
  for (const [user, id] of [[firstUser, firstCharacter], [secondUser, secondCharacter]]) {
    const updated = await read(user, id, "Mobile Safari");
    assert.equal(updated.body.map.participants.find((entry) => entry.id === "lyra").icon, "moon");
    assert.deepEqual(updated.body.map.tokens, desktop.body.map.tokens);
    assert.equal(updated.body.revision, 3);
  }
  const dmView = await request(app, "GET", `${url}/workspace`, dm);
  assert.equal(dmView.status, 200);
  assert.equal(dmView.body.tokenIcons.lyra, "moon");
  assert.equal(dmView.body.tokenIcons.eldrin, "magic");
  assert.equal(dmView.body.revision, 3);
  const portrait = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aD1sAAAAASUVORK5CYII=";
  const savePortrait = await request(app, "PATCH", `/api/character/${firstCharacter}/update`, firstUser, { "appearance.portrait": portrait });
  assert.equal(savePortrait.status, 200);
  const iconView = await read(firstUser, firstCharacter, "Mobile Safari");
  assert.equal(iconView.body.map.participants.find((entry) => entry.id === "lyra").portrait, undefined);
  assert.equal((await request(app, "PATCH", `/api/character/${firstCharacter}/update`, secondUser, { "appearance.mapTokenStyle": "portrait" })).status, 404);
  const choosePortrait = await request(app, "PATCH", `/api/character/${firstCharacter}/update`, firstUser, { "appearance.mapTokenStyle": "portrait" });
  assert.equal(choosePortrait.status, 200);
  assert.equal(choosePortrait.body.appearance.mapTokenStyle, "portrait");
  for (const [user, id, agent] of [[firstUser, firstCharacter, "Mobile Safari"], [secondUser, secondCharacter, "Desktop Chrome"]]) {
    const updated = await read(user, id, agent);
    assert.equal(updated.status, 200);
    assert.equal(updated.body.map.participants.find((entry) => entry.id === "lyra").portrait, portrait);
    assert.equal(updated.body.map.participants.find((entry) => entry.id === "lyra").icon, "moon");
    assert.deepEqual(updated.body.map.tokens, desktop.body.map.tokens);
    assert.equal(updated.body.revision, 3);
  }
  const dmPortrait = await request(app, "GET", `${url}/workspace`, dm);
  assert.equal(dmPortrait.body.tokenPortraits.lyra, portrait);
  assert.equal(dmPortrait.body.tokenIcons.lyra, "moon");
  stored.dmWorkspace.map.cells.push({ x: 1, y: 1, terrain: "fog" });
  const fogged = await read(firstUser, firstCharacter, "Mobile Safari");
  assert.ok(!JSON.stringify(fogged.body).includes(portrait), "Fog must also hide the portrait data");
  stored.dmWorkspace.map.cells = [];
  const chooseIcon = await request(app, "PATCH", `/api/character/${firstCharacter}/update`, firstUser, { "appearance.mapTokenStyle": "icon" });
  assert.equal(chooseIcon.status, 200);
  assert.equal(chooseIcon.body.appearance.portrait, portrait, "Switching to an icon keeps the uploaded portrait");
  const reverted = await read(firstUser, firstCharacter, "Mobile Safari");
  assert.ok(!JSON.stringify(reverted.body).includes(portrait));
  assert.deepEqual((await request(app, "GET", `${url}/workspace`, dm)).body.tokenPortraits, {});
  assert.equal((await request(app, "PATCH", `/api/character/${firstCharacter}/update`, firstUser, {
    "appearance.mapTokenStyle": "portrait", "appearance.portrait": "",
  })).status, 200);
  const noPortrait = await read(firstUser, firstCharacter, "Mobile Safari");
  assert.equal(noPortrait.body.map.participants.find((entry) => entry.id === "lyra").icon, "moon");
  assert.equal(noPortrait.body.map.participants.find((entry) => entry.id === "lyra").portrait, undefined);
});
