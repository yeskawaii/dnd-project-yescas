import assert from "node:assert/strict";
import test from "node:test";
import { emptyPresentation, presentScene, secretReadKey, readSecretIds, markSecretRead } from "./tablePresentation.js";

test("presenting a scene captures a separate snapshot so later draft edits remain private", () => {
  const draft = { id: "forest", title: "El bosque", description: "Una puerta", imageUrl: "", mood: "forest" };
  const original = { ...emptyPresentation(), scenes: [draft] };
  const first = presentScene(original, draft, "first-show");
  draft.description = "Todavía no revelar al dragón";
  assert.equal(original.activeScene, null);
  assert.equal(first.activeScene.description, "Una puerta");
  assert.equal(first.activeScene.presentationId, "first-show");
  const second = presentScene(first, draft, "second-show");
  assert.equal(second.activeScene.description, "Todavía no revelar al dragón");
  assert.notEqual(second.activeScene.presentationId, first.activeScene.presentationId);
});

test("secret read state is scoped to character and campaign and persists only IDs", () => {
  const values = new Map();
  const storage = { getItem: (key) => values.get(key), setItem: (key, value) => values.set(key, value) };
  const key = secretReadKey("campaign-a", "character-a");
  assert.deepEqual(readSecretIds(storage, key), []);
  const ids = markSecretRead(storage, key, [], "secret-one");
  assert.deepEqual(markSecretRead(storage, key, ids, "secret-one"), ["secret-one"]);
  assert.deepEqual(readSecretIds(storage, key), ["secret-one"]);
  assert.deepEqual(readSecretIds(storage, secretReadKey("campaign-a", "character-b")), []);
  assert.deepEqual(readSecretIds(storage, secretReadKey("campaign-b", "character-a")), []);
  assert.equal(values.get(key), '["secret-one"]');
});

test("private messages remain readable when local storage is unavailable or corrupted", () => {
  const unavailable = { getItem: () => { throw new Error("blocked"); }, setItem: () => { throw new Error("blocked"); } };
  assert.deepEqual(readSecretIds(unavailable, "key"), []);
  assert.deepEqual(markSecretRead(unavailable, "key", [], "secret-one"), ["secret-one"]);
  for (const value of ['{"not":"an array"}', "broken", '[null,1,"valid"]']) {
    const result = readSecretIds({ getItem: () => value }, "key");
    assert.deepEqual(result, value.includes("valid") ? ["valid"] : []);
  }
});
