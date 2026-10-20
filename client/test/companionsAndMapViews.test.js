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
