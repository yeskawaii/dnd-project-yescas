import assert from "node:assert/strict";
import test from "node:test";
import { characterTokenVisual, sharedMapParticipants, tokenIcon, tokenPortrait } from "../../../shared/mapTokens.mjs";

const lyra = { id: "lyra", name: "Lyra", kind: "player" };
const nimbo = { id: "nimbo", name: "Nimbo", kind: "ally", icon: "wing" };
const portrait = "data:image/png;base64,aGVsbG8=";

test("portraits require an explicit character preference and accept only bounded uploaded raster data", () => {
  assert.deepEqual(characterTokenVisual(), { icon: "sword", portrait: "" });
  assert.equal(characterTokenVisual({ portrait }).portrait, "");
  assert.equal(characterTokenVisual({ portrait, mapTokenStyle: "icon" }).portrait, "");
  assert.deepEqual(characterTokenVisual({ emblem: "moon", portrait, mapTokenStyle: "portrait" }), { icon: "moon", portrait });
  assert.equal(tokenPortrait({ ...lyra, portrait }), portrait);
  assert.equal(tokenPortrait({ ...nimbo, portrait }), "");
  for (const source of ["https://example.com/photo.jpg", "javascript:alert(1)", "data:image/svg+xml;base64,PHN2Zz4=", `data:image/png;base64,${"A".repeat(240000)}`, null]) {
    assert.equal(characterTokenVisual({ portrait: source, mapTokenStyle: "portrait" }).portrait, "");
    assert.equal(tokenPortrait({ ...lyra, portrait: source }), "");
  }
});

test("an empty or partial map roster never discards placed encounter characters", () => {
  for (const participants of [undefined, [], [nimbo]]) {
    const roster = sharedMapParticipants({ participants }, [lyra]);
    assert.ok(roster.some((entry) => entry.id === "lyra"));
    assert.equal(roster.length, participants?.length ? 2 : 1);
  }
});

test("exploration icons take precedence without duplicating a shared identity", () => {
  const map = { participants: [{ ...lyra, icon: "moon" }, nimbo] };
  assert.deepEqual(sharedMapParticipants(map, [lyra]), [{ ...lyra, icon: "moon" }, nimbo]);
  assert.deepEqual(sharedMapParticipants(map), map.participants);
});

test("legacy creatures have readable default icons and unknown or active markup is never used", () => {
  assert.equal(tokenIcon(lyra), "sword");
  assert.equal(tokenIcon(nimbo), "wing");
  assert.equal(tokenIcon({ kind: "monster" }), "skull");
  assert.equal(tokenIcon({ kind: "npc" }), "shield");
  for (const icon of ["<svg onload=alert(1)>", "javascript:alert(1)", "unknown", null]) {
    assert.equal(tokenIcon({ ...lyra, icon }), "sword");
  }
});
