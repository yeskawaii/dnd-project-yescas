import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

let vite;
let CompanionsTab, PartyCompanions, BattleMap, SharedBattleMap;
const noop = () => {};
const companion = { _id: "c1", name: "Nimbo", kind: "homunculus", hp: { current: 4, max: 12 }, ac: 16, initiativeBonus: 3, active: true, speed: "20 ft", duration: "Permanente", actions: "Mordisco +3, 1d4", description: "<script>private</script>" };
const player = { _id: "p1", name: "Lyra", companions: [companion] };
const map = { name: "Bosque", gridType: "hex", feetPerCell: 10, width: 8, height: 8, cells: [{ x: 2, y: 3, terrain: "water" }], tokens: [{ combatantId: "ally1", x: 3, y: 4 }] };
const combatants = [{ id: "ally1", sourceId: "p1:c1", name: "Nimbo", kind: "ally" }];
const render = (component, props) => renderToStaticMarkup(createElement(component, props));
before(async () => {
  vite = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: "custom" });
  CompanionsTab = (await vite.ssrLoadModule("/src/components/character-sheet/CompanionsTab.jsx")).default;
  PartyCompanions = (await vite.ssrLoadModule("/src/components/dm/PartyCompanions.jsx")).default;
  BattleMap = (await vite.ssrLoadModule("/src/components/dm/BattleMap.jsx")).default;
  SharedBattleMap = (await vite.ssrLoadModule("/src/components/shared-table/SharedBattleMap.jsx")).default;
});
after(async () => { await vite?.close(); });

test("companion cards expose life, presence, abilities and edit controls while escaping text", () => {
  const html = render(CompanionsTab, { character: player, onUpdate: noop });
  for (const text of ["Nimbo", "Homúnculo", "4 / 12 PV", "CA 16", "Mordisco +3, 1d4", "Desinvocar / ausentar", "Editar ficha", "Eliminar", "Permanente"]) assert.ok(html.includes(text), text);
  assert.ok(!html.includes("<script>"));
  assert.ok(html.includes("&lt;script&gt;"));
  const empty = render(CompanionsTab, { character: { name: "Legacy" }, onUpdate: noop });
  assert.ok(empty.includes("La aventura se comparte"));
  const absent = render(CompanionsTab, { character: { companions: [{ ...companion, active: false }] }, onUpdate: noop });
  assert.ok(absent.includes("Invocar / traer"));
});

test("DM companions cannot be added twice or while absent, and encounter capacity is respected", () => {
  const props = { player, combatants: [], onAdd: noop };
  const available = render(PartyCompanions, props);
  assert.ok(available.includes("Añadir acompañante al encuentro"));
  assert.ok(!available.includes("disabled"));
  const included = render(PartyCompanions, { ...props, combatants });
  assert.match(included, /disabled="">En el encuentro/);
  const absent = render(PartyCompanions, { ...props, player: { ...player, companions: [{ ...companion, active: false }] } });
  assert.match(absent, /disabled="">Añadir acompañante al encuentro/);
  const full = render(PartyCompanions, { ...props, combatants: Array.from({ length: 100 }, (_, i) => ({ sourceId: `other-${i}` })) });
  assert.match(full, /disabled="">Añadir acompañante al encuentro/);
});

test("DM and player maps share exact hex polygons, token positions, scale and turn highlighting", () => {
  const dm = render(BattleMap, { map, combatants, activeId: "ally1", onChange: noop, onDelete: noop });
  const shared = render(SharedBattleMap, { map, combatants, activeId: "ally1" });
  const polygons = (html) => [...html.matchAll(/<polygon points="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(polygons(dm).length, 64);
  assert.deepEqual(polygons(dm), polygons(shared));
  assert.ok(polygons(dm).every((value) => value.split(" ").length === 6));
  for (const html of [dm, shared]) {
    assert.ok(html.includes("Mapa hexagonal"));
    assert.ok(html.includes("10 ft por celda"));
    assert.ok(html.includes("current-turn"));
    assert.ok(html.includes("Nimbo"));
    assert.ok(html.includes("Centrar"));
  }
  assert.ok(dm.includes("Medir distancia"));
  assert.ok(dm.includes("Formato del mapa"));
  assert.ok(dm.includes('role="button"'));
  assert.ok(!shared.includes('role="button"'));
});

test("saved square maps retain four-sided cells when geometry fields are missing", () => {
  const legacy = { ...map };
  delete legacy.gridType;
  delete legacy.feetPerCell;
  const html = render(SharedBattleMap, { map: legacy, combatants, activeId: "" });
  assert.ok(html.includes("Cuadrícula"));
  assert.ok(html.includes("5 ft por celda"));
  assert.ok([...html.matchAll(/<polygon points="([^"]+)"/g)].every((match) => match[1].split(" ").length === 4));
});

test("players get movement controls only for their own placed tokens in either map geometry", () => {
  const players = [{ id: "mine", kind: "player", name: "Lyra" }, { id: "other", kind: "player", name: "Eldrin" }];
  for (const gridType of ["hex", "square"]) {
    const sharedMap = { ...map, gridType, movableTokenIds: ["mine"], tokens: [
      { combatantId: "mine", x: 1, y: 1 }, { combatantId: "other", x: 2, y: 2 },
    ] };
    const html = render(SharedBattleMap, { map: sharedMap, combatants: players, onMoveToken: noop });
    assert.ok(html.includes("Mueves a Lyra"));
    assert.ok(html.includes("Tu ficha"));
    assert.ok(html.includes("Centrar mi ficha"));
    assert.ok(html.includes("flechas y Enter"));
    assert.ok(html.includes('role="button"'));
    assert.match(html, /<span class="dm-legend-item"><span class="dm-token player"[\s\S]*?<\/span>Eldrin<\/span>/);
    const unplaced = render(SharedBattleMap, { map: { ...sharedMap, tokens: sharedMap.tokens.slice(1) }, combatants: players, onMoveToken: noop });
    assert.ok(!unplaced.includes('role="button"'));
    assert.ok(unplaced.includes("colocar tu personaje en una zona visible"));
    assert.ok(!unplaced.includes("selected-token"));
  }
});

test("DM map offers the party and active companions without asking for a combat first", () => {
  const name = "Una escena con un nombre muy largo para reconocerla en pantallas pequeñas";
  const html = render(BattleMap, { map: { ...map, name, tokens: [] }, combatants: [], players: [player], onChange: noop, onDelete: noop, onRefreshPlayers: noop });
  for (const text of [name, "Personajes del grupo", "Lyra", "Nimbo", "Colocar grupo", "Sin colocar", "Actualizar fichas del grupo", "sin iniciar un combate"]) assert.ok(html.includes(text), text);
  assert.ok(!html.includes("Agrega participantes en Combate"));
  assert.match(html, /<h2 class="dm-map-scene-name">/);
  const empty = render(BattleMap, { map: { ...map, tokens: [] }, combatants: [], onChange: noop, onDelete: noop });
  assert.ok(empty.includes("No hay fichas disponibles"));
  assert.ok(empty.includes("Cuando los personajes se unan a la contienda"));
});

test("shared exploration maps display and move participants outside the encounter", () => {
  const html = render(SharedBattleMap, { map: { ...map, participants: [{ id: "ally1", kind: "player", name: "Lyra" }], movableTokenIds: ["ally1"] }, combatants: [], onMoveToken: noop });
  assert.ok(html.includes("Mueves a Lyra"));
  assert.ok(html.includes("Tu ficha"));
  assert.ok(html.includes('data-combatant="ally1"'));
});

test("an empty or partial map roster still renders encounter tokens and their legend", () => {
  const lyra = { id: "lyra", name: "Lyra", kind: "player", icon: "bow" };
  for (const participants of [[], combatants]) {
    const html = render(SharedBattleMap, { map: { ...map, participants,
      tokens: [{ combatantId: "lyra", x: 1, y: 1 }], movableTokenIds: ["lyra"] },
    combatants: [lyra], onMoveToken: noop });
    assert.ok(html.includes('data-combatant="lyra"'));
    assert.ok(html.includes("Lyra · Tu ficha"));
    assert.ok(html.includes("Mueves a Lyra"));
    assert.equal([...html.matchAll(/data-token-icon="bow"/g)].length, 2);
  }
});

test("DM and player tokens use the same chosen emblem in the grid and legend, without numbers", () => {
  const lyra = { id: "lyra", sourceId: "p1", name: "Lyra", kind: "player" };
  const sharedMap = { ...map, participants: [{ ...lyra, icon: "moon" }], movableTokenIds: ["lyra"],
    tokens: [{ combatantId: "lyra", x: 4, y: 5 }] };
  for (const html of [
    render(BattleMap, { map: sharedMap, combatants: [lyra], players: [{ ...player, appearance: { emblem: "moon" } }], onChange: noop, onDelete: noop }),
    render(SharedBattleMap, { map: sharedMap, combatants: [lyra], character: player, onMoveToken: noop, onChangeIcon: noop }),
  ]) {
    assert.equal([...html.matchAll(/data-token-icon="moon"/g)].length, 2);
    assert.ok(!html.includes("tactical-token-number"));
  }
  const html = render(SharedBattleMap, { map: sharedMap, combatants: [], character: player, onChangeIcon: noop });
  assert.ok(html.includes("Elegir mi icono"));
  assert.ok(html.includes('aria-expanded="false"'));
});

test("an empty shared map explains missing visible data and offers a refresh", () => {
  const html = render(SharedBattleMap, { map: { ...map, participants: [], tokens: [] }, combatants: [], onRefresh: noop });
  assert.ok(html.includes("No se recibieron fichas visibles"));
  assert.ok(html.includes("Actualizar fichas"));
  assert.ok(!html.includes("selected-token"));
});
