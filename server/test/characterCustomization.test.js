import assert from "node:assert/strict";
import test from "node:test";
import Character from "../models/Character.js";
import router from "../routes/characters.js";

const owner = "507f1f77bcf86cd799439011";
const portrait =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aD1sAAAAASUVORK5CYII=";
const character = (extra = {}) =>
  new Character({ user: owner, name: "Lyra", ...extra });
const defaultOrder = ["vitals", "defenses", "favorites", "shortcuts"];

test("legacy sheets receive independent appearance and play layout defaults", async () => {
  const first = character();
  const second = character();
  await first.validate();
  assert.equal(first.appearance.theme, "forest");
  assert.equal(first.appearance.portrait, "");
  assert.deepEqual(first.playLayout.order.toObject(), defaultOrder);
  first.playLayout.order.reverse();
  first.appearance.theme = "arcane";
  assert.equal(second.appearance.theme, "forest");
  assert.deepEqual(second.playLayout.order.toObject(), defaultOrder);
});

test("portraits, layout and resource icons survive serialization without changing resource identities", async () => {
  const original = character({
    appearance: {
      theme: "arcane",
      backdrop: "stars",
      frame: "rune",
      emblem: "leaf",
      portrait,
    },
    playLayout: {
      order: ["favorites", "vitals", "shortcuts", "defenses"],
      hidden: ["defenses"],
      density: "compact",
    },
    attacks: [{ name: "Espada", visualIcon: "flame" }],
    spells: [{ name: "Luz", visualIcon: "sun" }],
    inventory: [{ name: "Poción", icon: "🧪", visualIcon: "heart" }],
    skills: [{ name: "Avistar", visualIcon: "eye" }],
  });
  original.quickActions = [
    { kind: "attack", itemId: String(original.attacks[0]._id) },
  ];
  await original.validate();
  const reloaded = new Character(JSON.parse(JSON.stringify(original)));
  await reloaded.validate();
  assert.deepEqual(
    reloaded.appearance.toObject(),
    original.appearance.toObject(),
  );
  assert.deepEqual(
    reloaded.playLayout.toObject(),
    original.playLayout.toObject(),
  );
  for (const collection of ["attacks", "spells", "inventory", "skills"]) {
    assert.equal(
      reloaded[collection][0].visualIcon,
      original[collection][0].visualIcon,
    );
    assert.equal(
      String(reloaded[collection][0]._id),
      String(original[collection][0]._id),
    );
  }
  assert.equal(
    reloaded.quickActions[0].itemId,
    String(reloaded.attacks[0]._id),
  );
  assert.equal(reloaded.inventory[0].icon, "🧪");
});

test("appearance rejects unsupported themes, remote or active image sources and oversized portraits", async () => {
  for (const appearance of [
    { theme: "unknown" },
    { frame: "unknown" },
    { backdrop: "unknown" },
    { portrait: "https://example.com/image.jpg" },
    { portrait: "data:image/svg+xml;base64,PHN2Zz4=" },
    { portrait: "javascript:alert(1)" },
    { portrait: `data:image/jpeg;base64,${"A".repeat(240000)}` },
    { emblem: "<script>" },
  ])
    await assert.rejects(character({ appearance }).validate());
});

test("layouts reject missing, repeated and unknown cards and cannot hide essential cards", async () => {
  for (const playLayout of [
    { order: [] },
    { order: ["vitals", "vitals", "favorites", "shortcuts"] },
    { order: ["vitals", "defenses", "favorites", "unknown"] },
    { hidden: ["vitals"] },
    { hidden: ["favorites"] },
    { hidden: ["defenses", "defenses"] },
    { density: "tiny" },
  ])
    await assert.rejects(character({ playLayout }).validate());
});

test("the character update endpoint persists customization only within the owner's sheet", async (context) => {
  const stored = character();
  const updates = {
    appearance: { theme: "ocean", portrait },
    playLayout: {
      order: [...defaultOrder].reverse(),
      hidden: ["shortcuts"],
      density: "compact",
    },
  };
  context.mock.method(
    Character,
    "findOneAndUpdate",
    (filter, update, options) => {
      assert.deepEqual(filter, { _id: String(stored._id), user: owner });
      assert.equal(options.runValidators, true);
      stored.set(update.$set);
      return {
        populate: async () => {
          await stored.validate();
          return stored;
        },
      };
    },
  );
  const handler = router.stack.find(
    (layer) => layer.route?.path === "/:charId/update",
  ).route.stack[0].handle;
  const res = {
    statusCode: 200,
    status(value) {
      this.statusCode = value;
      return this;
    },
    json(value) {
      this.body = value;
      return this;
    },
  };
  await handler(
    { user: owner, params: { charId: String(stored._id) }, body: updates },
    res,
  );
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.appearance.theme, "ocean");
  assert.equal(res.body.appearance.portrait, portrait);
  assert.deepEqual(res.body.playLayout.hidden.toObject(), ["shortcuts"]);
});
