import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import test from "node:test";

// Execute the independent recovery page itself, including the code that must
// still work when the old React app or a cached worker is no longer usable.
const html = readFileSync(new URL("../public/actualizar.html", import.meta.url), "utf8");
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
async function recovery({ href = "https://dnd.example/actualizar.html", unsupported = false, failure = false, invalid = false } = {}) {
  const deleted = [], unregistered = [], requests = [], redirects = [];
  const timers = new Map();
  let nextId = 0;
  const status = { textContent: "" }, retry = { hidden: true, addEventListener(event, handler) { this.click = handler; } };
  const location = { href, origin: new URL(href).origin, replace: (url) => redirects.push(url) };
  const localStorage = { token: "keep-session", user: "keep-account" };
  const sessionStorage = { character: "keep-character" };
  const state = { failure, invalid };
  const window = { localStorage, sessionStorage };
  const navigator = {};
  if (!unsupported) {
    window.caches = { keys: async () => ["old-assets", "old-html"], delete: async (name) => { deleted.push(name); return true; } };
    navigator.serviceWorker = { getRegistrations: async () => [{ unregister: async () => { unregistered.push("old-worker"); return true; } }] };
  }
  runInNewContext(script, {
    window, navigator, location, URL, AbortController,
    document: { getElementById: (id) => id === "status" ? status : retry },
    setTimeout: (fn) => { const id = ++nextId; timers.set(id, fn); return id; },
    clearTimeout: (id) => timers.delete(id),
    fetch: async (url, options) => {
      requests.push({ url, options });
      if (state.failure) throw new Error("Offline");
      return { ok: true, json: async () => ({ version: state.invalid ? "javascript:alert(1)" : "release-new" }) };
    },
  });
  for (let i = 0; i < 30; i++) await Promise.resolve();
  return { state, deleted, unregistered, requests, redirects, localStorage, sessionStorage, status, retry, timers };
}

test("recovery clears downloaded caches and old workers, preserves login and reloads fresh assets", async () => {
  const target = "https://dnd.example/?table=yes#map";
  const h = await recovery({ href: `https://dnd.example/actualizar.html?volver=${encodeURIComponent(target)}` });
  assert.deepEqual(h.deleted, ["old-assets", "old-html"]);
  assert.deepEqual(h.unregistered, ["old-worker"]);
  assert.deepEqual(h.localStorage, { token: "keep-session", user: "keep-account" });
  assert.deepEqual(h.sessionStorage, { character: "keep-character" });
  assert.equal(h.requests[0].options.cache, "no-store");
  assert.equal(h.requests[0].options.credentials, "same-origin");
  assert.equal(h.redirects.length, 1);
  const url = new URL(h.redirects[0]);
  assert.equal(url.searchParams.get("__app_version"), "release-new");
  assert.ok(url.searchParams.has("__refresh"));
  assert.equal(url.searchParams.get("table"), "yes");
  assert.equal(url.hash, "#map");
  assert.equal(h.timers.size, 0);
});

test("recovery works without worker/cache APIs and never redirects outside this app", async () => {
  for (const target of ["https://other.example/", "/actualizar.html", "javascript:alert(1)"]) {
    const h = await recovery({ unsupported: true, href: `https://dnd.example/actualizar.html?volver=${encodeURIComponent(target)}` });
    assert.equal(h.redirects.length, 1);
    const url = new URL(h.redirects[0]);
    assert.equal(url.origin, "https://dnd.example");
    assert.equal(url.pathname, "/");
  }
});

test("failed or malformed version downloads show a retry instead of an endless reload", async () => {
  for (const options of [{ failure: true }, { invalid: true }]) {
    const h = await recovery(options);
    assert.equal(h.redirects.length, 0);
    assert.equal(h.retry.hidden, false);
    assert.ok(h.status.textContent.includes("Comprueba tu conexión"));
    assert.equal(h.timers.size, 0);
    h.state.failure = h.state.invalid = false;
    await h.retry.click();
    assert.equal(h.redirects.length, 1);
  }
});
