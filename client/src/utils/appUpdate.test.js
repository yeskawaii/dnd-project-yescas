import assert from "node:assert/strict";
import test from "node:test";
import { appVersion } from "../../build/appVersion.js";
import {
  clearUpdateReturn, finishAppWrite, hasPendingAppWrites, readUpdateReturn,
  saveUpdateReturn, startAppUpdates, trackAppWrite, updateBlocked, updateUrl,
} from "./appUpdate.js";

class Target {
  events = new Map();
  addEventListener(name, handler) {
    if (!this.events.has(name)) this.events.set(name, new Set());
    this.events.get(name).add(handler);
  }
  removeEventListener(name, handler) { this.events.get(name)?.delete(handler); }
  emit(name) { this.events.get(name)?.forEach((handler) => handler()); }
}
const flush = async () => { for (let i = 0; i < 8; i++) await Promise.resolve(); };
async function harness({ remote = "release-a", fetcher } = {}) {
  let time = 100000, nextId = 0;
  const timers = new Map(), requests = [], reloads = [], notices = [];
  const document = Object.assign(new Target(), {
    visibilityState: "visible", blocked: false, focused: false, inputs: [],
    querySelector() { return this.blocked ? {} : null; },
    querySelectorAll() { return this.inputs; },
  });
  document.activeElement = { matches: () => document.focused };
  const window = Object.assign(new Target(), {
    navigator: { onLine: true },
    location: { href: "https://dnd.example/?table=yes#map", replace(url) { reloads.push(url); this.href = url; } },
    setTimeout(fn, delay) { const id = ++nextId; timers.set(id, { fn, at: time + delay }); return id; },
    clearTimeout(id) { timers.delete(id); },
  });
  const state = { remote, prepared: 0, broken: false };
  const updater = startAppUpdates({
    version: "release-a", window, document, now: () => time,
    fetch: async (url, options) => {
      requests.push({ url, options });
      if (state.broken) throw new Error("Offline");
      return fetcher ? fetcher(url, options) : { ok: true, json: async () => ({ version: state.remote }) };
    },
    onAvailable: (value) => notices.push(value), beforeReload: () => state.prepared++,
  });
  await flush();
  return { state, window, document, updater, requests, reloads, notices, timers,
    async advance(ms) {
      const end = time + ms;
      while (true) {
        const next = [...timers.entries()].filter(([, timer]) => timer.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
        if (!next) break;
        time = next[1].at;
        timers.delete(next[0]);
        next[1].fn();
        await flush();
      }
      time = end;
      await flush();
    },
  };
}

test("each frontend build publishes the same unique version it embeds in the app", () => {
  const first = appVersion(), second = appVersion();
  const files = [];
  first.generateBundle.call({ emitFile: (file) => files.push(file) });
  const version = JSON.parse(files[0].source).version;
  assert.equal(files[0].fileName, "version.json");
  assert.equal(JSON.parse(first.config().define["import.meta.env.VITE_APP_VERSION"]), version);
  assert.notEqual(first.config().define["import.meta.env.VITE_APP_VERSION"], second.config().define["import.meta.env.VITE_APP_VERSION"]);
});

test("the current app checks every minute without reloading or showing a notice", async () => {
  const h = await harness();
  await h.advance(120000);
  assert.equal(h.requests.length, 3);
  assert.equal(h.requests[0].options.cache, "no-store");
  assert.equal(h.requests[0].options.credentials, "same-origin");
  assert.notEqual(h.requests[0].url, h.requests[1].url);
  assert.deepEqual(h.reloads, []);
  assert.deepEqual(h.notices, []);
  h.updater.stop();
});

test("a restored phone page checks immediately and reloads the new version after idle time", async () => {
  const h = await harness();
  h.state.remote = "release-b";
  h.window.emit("pageshow");
  await flush();
  assert.equal(h.requests.length, 2);
  assert.deepEqual(h.notices, ["release-b"]);
  await h.advance(4000);
  assert.equal(h.reloads.length, 0);
  await h.advance(1000);
  assert.equal(h.reloads.length, 1);
  assert.equal(h.state.prepared, 1);
  assert.equal(h.reloads[0], "https://dnd.example/?table=yes&__app_version=release-b#map");
  await h.advance(60000);
  assert.equal(h.reloads.length, 1, "A proxy returning stale assets must not cause a reload loop");
  h.updater.stop();
});

test("unsaved DM edits, open editors and pending character/map writes defer the automatic update", async () => {
  const h = await harness({ remote: "release-b" });
  h.document.blocked = true;
  await h.advance(10000);
  assert.equal(h.reloads.length, 0);
  assert.equal(h.updater.apply(), false, "The update button also protects unfinished edits");
  h.document.blocked = false;
  const write = { method: "patch" };
  trackAppWrite(write);
  try {
    await h.advance(2000);
    assert.equal(h.reloads.length, 0);
    finishAppWrite(write);
    await h.advance(1000);
    assert.equal(h.reloads.length, 1);
  } finally { finishAppWrite(write); h.updater.stop(); }
});

test("typing and focused or changed form fields postpone the reload until work is finished", async () => {
  const h = await harness({ remote: "release-b" });
  await h.advance(4000);
  h.document.emit("input");
  await h.advance(4000);
  assert.equal(h.reloads.length, 0);
  h.document.focused = true;
  await h.advance(2000);
  assert.equal(h.reloads.length, 0);
  h.document.focused = false;
  h.document.inputs = [{ value: "draft", defaultValue: "" }];
  await h.advance(2000);
  assert.equal(h.reloads.length, 0);
  h.document.inputs = [];
  await h.advance(1000);
  assert.equal(h.reloads.length, 1);
  h.updater.stop();
});

test("offline and hidden apps wait, then check immediately when they return", async () => {
  const h = await harness();
  h.document.visibilityState = "hidden";
  h.state.remote = "release-b";
  await h.advance(120000);
  assert.equal(h.requests.length, 1);
  h.document.visibilityState = "visible";
  h.window.navigator.onLine = false;
  h.document.emit("visibilitychange");
  await flush();
  assert.equal(h.requests.length, 1);
  h.window.navigator.onLine = true;
  h.window.emit("online");
  await flush();
  assert.equal(h.requests.length, 2);
  assert.equal(h.reloads.length, 1);
  h.updater.stop();
});

test("errors, unavailable version files and a deployment gap never trigger a reload", async () => {
  for (const fetcher of [
    async () => ({ ok: false }),
    async () => ({ ok: true, json: async () => { throw new SyntaxError("HTML"); } }),
    async () => ({ ok: true, json: async () => ({ version: "https://other.example/" }) }),
  ]) {
    const h = await harness({ fetcher });
    await h.advance(60000);
    assert.equal(h.requests.length, 2);
    assert.deepEqual(h.reloads, []);
    h.updater.stop();
  }
  const h = await harness({ remote: "release-b" });
  h.document.blocked = true;
  await h.advance(6000);
  h.state.broken = true;
  h.window.emit("focus");
  await flush();
  h.document.blocked = false;
  await h.advance(1000);
  assert.equal(h.reloads.length, 0);
  h.state.broken = false;
  h.window.emit("online");
  await flush();
  assert.equal(h.reloads.length, 1);
  h.updater.stop();
});

test("stopping aborts an outstanding check and removes all listeners and timers", async () => {
  let finish;
  const h = await harness({ fetcher: () => new Promise((resolve) => { finish = resolve; }) });
  h.updater.stop();
  assert.equal(h.requests[0].options.signal.aborted, true);
  finish({ ok: true, json: async () => ({ version: "release-b" }) });
  await flush();
  h.window.emit("pageshow");
  h.document.emit("visibilitychange");
  await h.advance(120000);
  assert.equal(h.requests.length, 1);
  assert.deepEqual(h.notices, []);
  assert.deepEqual(h.reloads, []);
  assert.equal(h.timers.size, 0);
});

test("only writes block updates and tracking tolerates duplicate finalization", () => {
  const get = { method: "get" }, patch = { method: "PATCH" };
  trackAppWrite(get);
  assert.equal(hasPendingAppWrites(), false);
  trackAppWrite(patch);
  assert.equal(hasPendingAppWrites(), true);
  finishAppWrite(patch);
  finishAppWrite(patch);
  assert.equal(hasPendingAppWrites(), false);
  assert.equal(updateBlocked({ querySelector: () => null, querySelectorAll: () => [] }), false);
});

test("automatic updates restore only this account's selected character and tolerate denied storage", () => {
  const data = new Map();
  const storage = { setItem: (key, value) => data.set(key, value), getItem: (key) => data.get(key), removeItem: (key) => data.delete(key) };
  const state = { user: "account-one", mode: "player", characterId: "lyra" };
  saveUpdateReturn(state, storage);
  assert.deepEqual(readUpdateReturn("account-one", storage), state);
  assert.equal(readUpdateReturn("account-two", storage), null);
  clearUpdateReturn(storage);
  assert.equal(readUpdateReturn("account-one", storage), null);
  const denied = { getItem() { throw Error("Denied"); }, setItem() { throw Error("Denied"); }, removeItem() { throw Error("Denied"); } };
  assert.doesNotThrow(() => saveUpdateReturn(state, denied));
  assert.equal(readUpdateReturn("account-one", denied), null);
  assert.doesNotThrow(() => clearUpdateReturn(denied));
  assert.equal(updateUrl("https://dnd.example/?__app_version=old#map", "new"), "https://dnd.example/?__app_version=new#map");
});
