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
const signingKey = "isolated-test-key-for-in-memory-requests";

// Full Express dispatch and JWT middleware, without binding a TCP port or using MongoDB.
function request(app, method, url, user, body = {}) {
  return new Promise((resolve, reject) => {
    const socket = new Duplex({ read() {}, write(chunk, encoding, done) { done(); } });
    const req = new IncomingMessage(socket);
    req.method = method;
    req.url = url;
    req.headers = user ? { authorization: `Bearer ${jwt.sign({ id: user }, signingKey)}` } : {};
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
  context.mock.method(Character, "findOne", (query) => ({
    select: async () => members.get(String(query._id)) === query.user && query.campaign === campaignId ? { _id: query._id } : null,
  }));
  context.mock.method(Character, "find", (query) => ({ select: async () =>
    query._id.$in.filter((id) => members.has(id)).map((_id) => ({ _id })) }));
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

test("authenticated players move their own tokens, everyone sees the result, and the DM retains control", async (context) => {
  const oldKey = process.env.JWT_SECRET;
  process.env.JWT_SECRET = signingKey;
  context.after(() => { if (oldKey === undefined) delete process.env.JWT_SECRET; else process.env.JWT_SECRET = oldKey; });
  const app = express();
  app.use("/api/campaign", campaignRoutes);
  let stored = new Campaign({ _id: campaignId, dm, name: "El puente", inviteCode: "BRIDGE", workspaceRevision: 1 });
  stored.dmWorkspace.presentation.enabled = true;
  stored.dmWorkspace.presentation.shareMap = true;
  stored.dmWorkspace.combat.combatants.push(
    { id: "lyra", sourceId: firstCharacter, name: "Lyra", kind: "player" },
    { id: "eldrin", sourceId: secondCharacter, name: "Eldrin", kind: "player" },
  );
  stored.dmWorkspace.map.tokens.push({ combatantId: "lyra", x: 1, y: 1 }, { combatantId: "eldrin", x: 2, y: 2 });
  const members = new Map([[firstCharacter, firstUser], [secondCharacter, secondUser]]);
  context.mock.method(Character, "findOne", (query) => ({ select: async () =>
    members.get(String(query._id)) === query.user && query.campaign === campaignId ? { _id: query._id } : null }));
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
  assert.equal((await request(app, "PATCH", `${url}/table/token`, null, move)).status, 401);
  assert.equal((await request(app, "PATCH", `${url}/table/token`, secondUser, move)).status, 403);
  assert.equal((await request(app, "PATCH", `${url}/table/token`, firstUser, { ...move, combatantId: "eldrin" })).status, 403);
  const moved = await request(app, "PATCH", `${url}/table/token`, firstUser, move);
  assert.equal(moved.status, 200);
  assert.equal(moved.body.revision, 2);
  const otherView = await request(app, "GET", `${url}/table?characterId=${secondCharacter}`, secondUser);
  assert.deepEqual(otherView.body.map.tokens.find((token) => token.combatantId === "lyra"), { combatantId: "lyra", x: 4, y: 4 });
  assert.deepEqual(otherView.body.map.movableTokenIds, ["eldrin"]);
  assert.equal((await request(app, "GET", `${url}/workspace`, firstUser)).status, 403);
  assert.equal((await request(app, "PUT", `${url}/workspace`, dm, { workspace: staleDMWorkspace, revision: 1 })).status, 409);
  const latest = await request(app, "GET", `${url}/workspace`, dm);
  assert.equal(latest.status, 200);
  const workspace = latest.body.workspace;
  workspace.map.tokens.find((token) => token.combatantId === "lyra").x = 6;
  workspace.map.tokens.find((token) => token.combatantId === "eldrin").x = 7;
  assert.equal((await request(app, "PUT", `${url}/workspace`, dm, { workspace, revision: latest.body.revision })).status, 200);
  assert.deepEqual(stored.dmWorkspace.map.tokens.map((token) => token.x), [6, 7]);
  members.delete(firstCharacter);
  assert.equal((await request(app, "PATCH", `${url}/table/token`, firstUser, { ...move, revision: 3 })).status, 403);
});
