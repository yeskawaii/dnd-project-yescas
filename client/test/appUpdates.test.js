import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

let vite, api, state, AppUpdateNotice;
const flush = async () => { for (let i = 0; i < 8; i++) await Promise.resolve(); };
before(async () => {
  globalThis.localStorage = { getItem: () => null };
  vite = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: "custom" });
  api = (await vite.ssrLoadModule("/src/api/axios.js")).default;
  state = await vite.ssrLoadModule("/src/utils/appUpdate.js");
  AppUpdateNotice = (await vite.ssrLoadModule("/src/components/ui/AppUpdateNotice.jsx")).default;
});
after(async () => { await vite?.close(); delete globalThis.localStorage; });

test("real Axios writes block reloads until both successful and failed requests finish", async () => {
  for (const failure of [false, true]) {
    let settle;
    api.defaults.adapter = (config) => new Promise((resolve, reject) => {
      settle = () => failure ? reject(Object.assign(new Error("Save failed"), { config })) :
        resolve({ config, data: {}, status: 200, statusText: "OK", headers: {} });
    });
    const pending = api.patch("/character/test/update", { name: "Lyra" });
    const observed = pending.catch((error) => error);
    await flush();
    assert.equal(state.hasPendingAppWrites(), true);
    settle();
    const result = await observed;
    assert.equal(result instanceof Error, failure);
    assert.equal(state.hasPendingAppWrites(), false);
  }
});

test("normal table polling does not postpone a version update", async () => {
  let settle;
  api.defaults.adapter = (config) => new Promise((resolve) => {
    settle = () => resolve({ config, data: {}, status: 200, statusText: "OK", headers: {} });
  });
  const pending = api.get("/campaign/test/table");
  await flush();
  assert.equal(state.hasPendingAppWrites(), false);
  settle();
  await pending;
});

test("the update notice is quiet on the current version and explains deferred updates", () => {
  assert.equal(renderToStaticMarkup(createElement(AppUpdateNotice, { update: { available: null } })), "");
  const html = renderToStaticMarkup(createElement(AppUpdateNotice, { update: { available: "release-b", apply: () => {} } }));
  assert.ok(html.includes('role="status"'));
  assert.ok(html.includes("Hay una nueva versión"));
  assert.ok(html.includes("al terminar tus cambios"));
  assert.ok(html.includes(">Actualizar</button>"));
});
