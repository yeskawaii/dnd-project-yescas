import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

let vite;
let PlayerTable;
let CinematicScene;
let PresentationPanel;
const scene = { id: "forest", presentationId: "show-one", title: "El bosque", description: "Una puerta entre los árboles", mood: "forest", imageUrl: "" };
const character = { _id: "player-one", name: "Lyra", campaign: { _id: "campaign-one", name: "El bosque" } };
const noop = () => {};
const snapshot = () => ({
  campaign: { name: "El bosque" }, enabled: true, scene,
  combat: { name: "El puente", round: 2, activeId: "guard", hiddenTurn: false, combatants: [
    { id: "lyra", name: "Lyra", kind: "player", hp: 7, maxHp: 12, initiative: 17 },
    { id: "guard", name: "Guardián", kind: "monster", initiative: 10 },
  ] },
  map: { name: "El puente", width: 8, height: 8, cells: [{ x: 2, y: 2, terrain: "fog" }], tokens: [{ combatantId: "lyra", x: 0, y: 0 }] },
  secrets: [{ id: "secret-one", title: "Un medallón conocido", content: "PRIVATE_MESSAGE_BODY" }],
});

before(async () => {
  globalThis.localStorage = { getItem: () => null, setItem: noop };
  vite = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: "custom" });
  PlayerTable = (await vite.ssrLoadModule("/src/components/shared-table/PlayerTable.jsx")).default;
  CinematicScene = (await vite.ssrLoadModule("/src/components/shared-table/CinematicScene.jsx")).default;
  PresentationPanel = (await vite.ssrLoadModule("/src/components/dm/PresentationPanel.jsx")).default;
});
after(async () => { await vite?.close(); delete globalThis.localStorage; });

test("player view renders the published scene, turn, map and unopened secret envelopes", () => {
  const html = renderToStaticMarkup(createElement(PlayerTable, { character, table: { data: snapshot(), updatedAt: 1, error: "", refresh: noop } }));
  for (const text of ["El bosque", "Una puerta entre los árboles", "Turno de", "Guardián", "Ronda 2", "Mapa compartido desplazable", "Solo para Lyra", "Un medallón conocido", "Mensaje nuevo del DM"]) assert.ok(html.includes(text), text);
  assert.ok(!html.includes("PRIVATE_MESSAGE_BODY"), "Private content stays behind the envelope");
  assert.ok(html.includes("columna 1, fila 1"));
});

test("waiting, connection failure and absent membership remain useful states", () => {
  const waiting = renderToStaticMarkup(createElement(PlayerTable, { character, table: { data: { ...snapshot(), enabled: false, scene: null, combat: null, map: null }, error: "", refresh: noop } }));
  assert.ok(waiting.includes("El telón está a punto de abrirse"));
  const denied = renderToStaticMarkup(createElement(PlayerTable, { character, table: { data: null, error: "Este personaje no tiene acceso", refresh: noop } }));
  assert.ok(denied.includes('role="alert"'));
  assert.ok(!denied.includes("Un medallón conocido"));
  const absent = renderToStaticMarkup(createElement(PlayerTable, { character: { ...character, campaign: null }, table: {} }));
  assert.ok(absent.includes("Une este personaje a una contienda"));
});

test("the player's table connects its movement action to the shared map", () => {
  const data = snapshot();
  data.map.movableTokenIds = ["lyra"];
  const html = renderToStaticMarkup(createElement(PlayerTable, {
    character, table: { data, updatedAt: 1, error: "", refresh: noop, moveToken: noop },
  }));
  assert.ok(html.includes("Mueves a Lyra"));
  assert.ok(html.includes("Tu ficha"));
});

test("cinematic prose is plain text, and a remote illustration does not send a referrer", () => {
  const html = renderToStaticMarkup(createElement(CinematicScene, { scene: { ...scene, title: "<script>unsafe()</script>", description: "<img src=x onerror=unsafe()>", imageUrl: "https://example.com/forest.jpg" } }));
  assert.ok(!html.includes("<script>"));
  assert.ok(!html.includes("<img src=x"));
  assert.ok(html.includes("&lt;script&gt;"));
  assert.ok(html.includes('referrerPolicy="no-referrer"'));
});

test("DM sharing panel identifies drafts and recipients, while presented scene remains separate", () => {
  const workspace = {
    combat: { combatants: [] },
    presentation: { enabled: false, shareMap: false, showEnemyHp: false, scenes: [scene], activeScene: null,
      secrets: [{ id: "s1", title: "La pista", content: "Borrador del DM", recipientId: "player-one", released: false }] },
  };
  const html = renderToStaticMarkup(createElement(PresentationPanel, { workspace, players: [{ _id: "player-one", name: "Lyra", class: "Pícara" }], onChange: noop, onPublish: noop, onDelete: noop, onRefreshPlayers: noop }));
  for (const text of ["Compartir con el grupo", "Presentar", "Borrador privado", "Lyra", "Enviar al personaje"]) assert.ok(html.includes(text), text);
  assert.ok(!html.includes("En las pantallas del grupo"));
});
