import assert from "node:assert/strict";
import test from "node:test";
import {
  appearanceStyle,
  getAppearance,
  getPlayLayout,
  portraitCrop,
  resourceIcon,
} from "./characterCustomization.js";
import { getActions } from "./quickActions.js";

test("legacy and malformed appearance data use safe, usable defaults", () => {
  assert.deepEqual(getAppearance({}), {
    theme: "forest",
    backdrop: "mist",
    frame: "shield",
    emblem: "sword",
    mapTokenStyle: "icon",
    portrait: "",
  });
  const appearance = getAppearance({
    appearance: {
      theme: "bogus",
      backdrop: "bogus",
      frame: "bogus",
      emblem: "bogus",
      mapTokenStyle: "bogus",
      portrait: "javascript:unsafe()",
    },
  });
  assert.equal(appearance.theme, "forest");
  assert.equal(appearance.portrait, "");
  assert.equal(appearance.mapTokenStyle, "icon");
  assert.equal(appearanceStyle({ theme: "arcane" })["--mint"], "#d7b9fb");
});

test("layout normalization preserves custom order while recovering essential widgets", () => {
  assert.deepEqual(
    getPlayLayout({
      playLayout: {
        order: ["favorites", "favorites", "unknown"],
        hidden: ["vitals", "favorites", "defenses", "defenses"],
        density: "tiny",
      },
    }),
    {
      order: ["favorites", "vitals", "defenses", "shortcuts"],
      hidden: ["defenses"],
      density: "comfortable",
    },
  );
});

test("custom icons propagate to quick actions and legacy inventory categories remain available", () => {
  assert.equal(resourceIcon({ icon: "🧪" }, "bag"), "potion");
  assert.equal(resourceIcon({ visualIcon: "bogus" }, "skill"), "skill");
  const hero = {
    attacks: [
      { _id: "a", name: "Espada", visualIcon: "flame", damageDice: "1d8" },
    ],
    inventory: [{ _id: "i", name: "Poción", icon: "🧪", visualIcon: "heart" }],
    spells: [{ _id: "s", name: "Luz", visualIcon: "sun" }],
    skills: [{ _id: "k", name: "Avistar", visualIcon: "eye" }],
  };
  const actions = getActions(hero);
  assert.deepEqual(
    actions.map((action) => action.icon),
    ["flame", "sun", "heart", "eye"],
  );
  assert.deepEqual(
    actions.map((action) => action.itemId),
    ["a", "s", "i", "k"],
  );
  assert.equal(hero.inventory[0].icon, "🧪");
});

test("portrait crops stay inside landscape and portrait sources at all slider extremes", () => {
  assert.deepEqual(portraitCrop(800, 400), { x: 200, y: 0, side: 400 });
  assert.deepEqual(portraitCrop(400, 800, 2, 100, 100), {
    x: 200,
    y: 600,
    side: 200,
  });
  for (const [width, height] of [
    [800, 400],
    [400, 800],
  ]) {
    for (const [zoom, x, y] of [
      [0, -1, 101],
      [4, 101, -1],
      [2, 50, 50],
    ]) {
      const crop = portraitCrop(width, height, zoom, x, y);
      assert.ok(crop.x >= 0 && crop.y >= 0 && crop.side > 0);
      assert.ok(crop.x + crop.side <= width && crop.y + crop.side <= height);
    }
  }
});
