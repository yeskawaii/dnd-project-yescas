import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

let vite;
let GameTab;
let CharacterAvatar;
let StatsTab;
let ModifierEditor;
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
  StatsTab = (await vite.ssrLoadModule("/src/components/character-sheet/StatsTab.jsx")).default;
  ModifierEditor = (await vite.ssrLoadModule("/src/components/character-sheet/ModifierEditor.jsx")).default;
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

test("stats distinguish manual AC bonuses, calculated saves and the independent combat totals", () => {
  const html = renderToStaticMarkup(createElement(StatsTab, {
    character: { stats: { Destreza: 22, Constitución: 14 }, armorClass: { armor: 4, shield: 2, maxDex: 4 }, saves: { mode: "calculated", fort: 2 }, initiativeMisc: 4, baseAttack: 1 },
    onUpdate: noop, onToggleFavorite: noop, setUnitSystem: noop, unitSystem: "imp",
  }));
  for (const text of ["CA total", "Bono manual de armadura", "Iniciativa y ataque", "CA de toque", "Desprevenido", "Máximo de Destreza a CA", "Recalcular salvaciones al cambiar atributos", "Efectos y bonos temporales", "Fortaleza"]) assert.ok(html.includes(text), text);
  assert.match(html, /<strong>20<\/strong>/);
  assert.match(html, /<strong>\+10<\/strong>/);
});

test("modifier editors distinguish the source bonus type and explicit attack/skill scopes", () => {
  const html = renderToStaticMarkup(createElement(ModifierEditor, { value: [{ target: "skill", value: 2, skillName: "Avistar", bonusType: "competence" }, { target: "attack", value: 1, attackName: "Espada", bonusType: "untyped" }], onChange: noop }));
  for (const text of ["Modificadores vinculados", "Tipo de bono", "Avistar", "Espada", "Agregar modificador"]) assert.ok(html.includes(text), text);
});
