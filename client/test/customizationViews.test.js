import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

let vite;
let GameTab;
let CharacterAvatar;
const noop = () => {};
before(async () => {
  vite = await createServer({
    server: { middlewareMode: true, hmr: false, ws: false },
    appType: "custom",
  });
  GameTab = (
    await vite.ssrLoadModule("/src/components/character-sheet/GameTab.jsx")
  ).default;
  CharacterAvatar = (
    await vite.ssrLoadModule("/src/components/ui/CharacterAvatar.jsx")
  ).default;
});
after(async () => {
  await vite?.close();
});

test("Partida renders saved widget order, visibility and density", () => {
  const character = {
    name: "Lyra",
    hp: { current: 8, max: 10 },
    playLayout: {
      order: ["favorites", "vitals", "shortcuts", "defenses"],
      hidden: ["defenses"],
      density: "compact",
    },
  };
  const html = renderToStaticMarkup(
    createElement(GameTab, {
      character,
      onUpdate: noop,
      onToggleFavorite: noop,
      onBrowse: noop,
    }),
  );
  assert.ok(html.includes("density-compact"));
  assert.ok(
    html.indexOf('data-widget="favorites"') <
      html.indexOf('data-widget="vitals"'),
  );
  assert.ok(!html.includes('data-widget="defenses"'));
  assert.ok(html.includes("Puntos de vida"));
  assert.ok(html.includes("Agregar a mi mesa"));
});

test("avatars use the saved theme and frame and discard unsafe image URLs", () => {
  const html = renderToStaticMarkup(
    createElement(CharacterAvatar, {
      character: {
        name: "Lyra",
        appearance: {
          theme: "arcane",
          frame: "rune",
          emblem: "leaf",
          portrait: "javascript:unsafe()",
        },
      },
      size: "large",
    }),
  );
  assert.ok(html.includes("frame-rune"));
  assert.ok(html.includes("#d7b9fb"));
  assert.ok(!html.includes("javascript:"));
  assert.ok(!html.includes("<img"));
});
