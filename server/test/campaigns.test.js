import assert from "node:assert/strict";
import test from "node:test";
import Campaign from "../models/Campaign.js";
import Character from "../models/Character.js";
import router from "../routes/campaignRoutes.js";

const owner = "507f1f77bcf86cd799439011";
const other = "507f1f77bcf86cd799439099";
const id = "507f1f77bcf86cd799439022";
const campaign = () =>
  new Campaign({ _id: id, name: "Bosque", dm: owner, inviteCode: "BOSQUE" });
const response = () => ({
  statusCode: 200,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(body) {
    this.body = body;
    return this;
  },
});
const handler = (method, path) =>
  router.stack
    .find((layer) => layer.route?.path === path && layer.route.methods[method])
    .route.stack.at(-1).handle;
const save = handler("put", "/:id/workspace");
const dashboard = handler("get", "/:id/dashboard");
const request = (workspace, revision = 0, user = owner) => ({
  user,
  params: { id },
  body: { workspace, revision },
});

test("legacy campaigns receive a usable empty private workspace without a migration", async () => {
  const doc = campaign();
  await doc.validate();
  assert.equal(doc.workspaceRevision, 0);
  assert.equal(doc.dmWorkspace.combat.round, 1);
  assert.deepEqual(doc.dmWorkspace.actors.toObject(), []);
  assert.equal(doc.dmWorkspace.map.width, 16);
});

test("dashboard rejects non-DMs before querying player details or exposing notes", async (context) => {
  context.mock.method(Campaign, "findById", async () => campaign());
  context.mock.method(Character, "find", () => {
    assert.fail("Must not query players");
  });
  const res = response();
  await dashboard({ user: other, params: { id } }, res);
  assert.equal(res.statusCode, 403);
  assert.equal(res.body.campaign, undefined);
});

test("dashboard handles missing and malformed campaigns", async (context) => {
  context.mock.method(Campaign, "findById", async () => null);
  for (const [requestedId, status] of [
    [id, 404],
    ["invalid", 400],
  ]) {
    const res = response();
    await dashboard({ user: owner, params: { id: requestedId } }, res);
    assert.equal(res.statusCode, status);
  }
});

test("only the campaign DM can save a workspace", async (context) => {
  context.mock.method(Campaign, "findById", async () => campaign());
  context.mock.method(Campaign, "findOneAndUpdate", () => {
    assert.fail("Must not write");
  });
  const res = response();
  await save(request({}, 0, other), res);
  assert.equal(res.statusCode, 403);
});

test("saving validates the full workspace, scopes to the DM and performs an atomic revision check", async (context) => {
  const doc = campaign();
  context.mock.method(Campaign, "findById", async () => doc);
  context.mock.method(Campaign, "findOneAndUpdate", async (query, update) => {
    assert.equal(String(query._id), id);
    assert.equal(query.dm, owner);
    assert.equal(query.workspaceRevision, 3);
    assert.deepEqual(Object.keys(update.$set), ["dmWorkspace"]);
    assert.equal(update.$inc.workspaceRevision, 1);
    assert.equal(
      update.$set.dmWorkspace.notes[0].content,
      "Secreto del guardián",
    );
    return { dmWorkspace: update.$set.dmWorkspace, workspaceRevision: 4 };
  });
  const res = response();
  await save(
    request(
      {
        ...doc.dmWorkspace.toObject(),
        notes: [
          {
            id: "n1",
            title: "Sesión 1",
            category: "secret",
            content: "Secreto del guardián",
          },
        ],
      },
      3,
    ),
    res,
  );
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.revision, 4);
});

test("first save also supports old records with no revision field", async (context) => {
  context.mock.method(Campaign, "findById", async () => campaign());
  context.mock.method(Campaign, "findOneAndUpdate", async (query) => {
    assert.deepEqual(query.$or, [
      { workspaceRevision: 0 },
      { workspaceRevision: { $exists: false } },
    ]);
    return { dmWorkspace: {}, workspaceRevision: 1 };
  });
  const res = response();
  await save(request({}), res);
  assert.equal(res.statusCode, 200);
});

test("stale saves return conflict instead of overwriting another session", async (context) => {
  context.mock.method(Campaign, "findById", async () => campaign());
  context.mock.method(Campaign, "findOneAndUpdate", async () => null);
  const res = response();
  await save(request({}, 2), res);
  assert.equal(res.statusCode, 409);
});

test("save rejects invalid revisions, fields, initiative, oversize notes and map coordinates", async (context) => {
  context.mock.method(Campaign, "findById", async () => campaign());
  context.mock.method(Campaign, "findOneAndUpdate", () => {
    assert.fail("Invalid workspace must not be written");
  });
  const base = campaign().dmWorkspace.toObject();
  const cases = [
    request(null),
    request({}, -1),
    request({}, "0"),
    request([]),
    request({ dm: other }),
    request({ ...base, combat: null }),
    request({ ...base, map: null }),
    request({ ...base, notes: null }),
    request({ ...base, actors: [null] }),
    request({ ...base, combat: { ...base.combat, combatants: null } }),
    request({ ...base, actors: [{ id: "a", name: "A", maxHp: 1.5 }] }),
    request({
      ...base,
      notes: [{ id: "a", title: "A", content: "x".repeat(20001) }],
    }),
    request({
      ...base,
      map: { ...base.map, cells: [{ x: 29, y: 0, terrain: "wall" }] },
    }),
    request({ ...base, combat: { ...base.combat, activeId: "missing" } }),
    request({
      ...base,
      map: { ...base.map, tokens: [{ combatantId: "missing", x: 1, y: 1 }] },
    }),
    request({
      ...base,
      notes: [
        { id: "a", title: "A" },
        { id: "a", title: "B" },
      ],
    }),
  ];
  for (const req of cases) {
    const res = response();
    await save(req, res);
    assert.equal(res.statusCode, 400, JSON.stringify(req.body).slice(0, 150));
  }
});

test("a valid encounter with an active turn and positioned token survives validation", async () => {
  const doc = campaign();
  doc.dmWorkspace.combat.combatants.push({
    id: "g1",
    name: "Guardián",
    kind: "monster",
    hp: -3,
    maxHp: 18,
    ac: 16,
    initiative: 22,
  });
  doc.dmWorkspace.combat.activeId = "g1";
  doc.dmWorkspace.map.tokens.push({ combatantId: "g1", x: 3, y: 4 });
  await doc.validate();
  assert.equal(doc.dmWorkspace.combat.combatants[0].hp, -3);
});
