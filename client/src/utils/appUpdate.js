const returnKey = "app-update-return";
const pendingWrites = new Set();

export function trackAppWrite(config) {
  if (!["get", "head", "options"].includes(config.method?.toLowerCase() || "get")) pendingWrites.add(config);
}
export function finishAppWrite(config) { pendingWrites.delete(config); }
export function hasPendingAppWrites() { return pendingWrites.size > 0; }

export function updateUrl(href, version) {
  const url = new URL(href);
  url.searchParams.set("__app_version", version);
  return url.href;
}

export function recoveryUrl(href, version) {
  const url = new URL("/actualizar.html", href);
  url.searchParams.set("__app_version", version);
  url.searchParams.set("volver", updateUrl(href, version));
  return url.href;
}

export function updateBlocked(document) {
  if (hasPendingAppWrites()) return true;
  if (document.querySelector('[data-app-update-blocked="true"], [role="dialog"]')) return true;
  // A filled login/creation form also needs protection after focus moves away.
  return [...document.querySelectorAll("form input, form textarea")].some((input) => input.value !== input.defaultValue);
}

export function saveUpdateReturn(state, storage) {
  try { (storage || window.sessionStorage).setItem(returnKey, JSON.stringify(state)); } catch { /* Navigation still works without storage. */ }
}
export function readUpdateReturn(user, storage) {
  try {
    const state = JSON.parse((storage || window.sessionStorage).getItem(returnKey) || "null");
    return user && state?.user === user && ["lobby", "player", "dm"].includes(state.mode) ? state : null;
  } catch { return null; }
}
export function clearUpdateReturn(storage) {
  try { (storage || window.sessionStorage).removeItem(returnKey); } catch { /* Storage can be disabled. */ }
}

// Independent of React so frozen-page resumes, offline retries and deployment
// transitions can be tested with a deterministic clock and transport.
export function startAppUpdates({
  version, versionUrl = "/version.json", window, document, fetch,
  onAvailable = () => {}, beforeReload = () => {}, now = Date.now,
  interval = 15000, reloadDelay = 3000,
}) {
  let stopped = false, loading = false, verified = false, timer, request;
  let available = null, notified = null, attempted = null, forceRequested = false;
  let detectedAt = 0, nextCheck = 0;
  const visible = () => document.visibilityState !== "hidden" && window.navigator.onLine !== false;
  const notify = (value) => {
    if (value === notified) return;
    notified = value;
    onAvailable(value);
  };
  const forceReload = () => {
    if (!forceRequested || !visible() || hasPendingAppWrites()) return false;
    forceRequested = false;
    beforeReload();
    window.location.replace(recoveryUrl(window.location.href, available || version));
    return true;
  };
  const apply = () => {
    if (!available || !verified || !visible() || updateBlocked(document)) return false;
    if (now() - detectedAt < reloadDelay ||
        attempted === available || new URL(window.location.href).searchParams.get("__app_version") === available) return false;
    attempted = available;
    beforeReload();
    window.location.replace(recoveryUrl(window.location.href, available));
    return true;
  };
  const schedule = () => {
    if (!stopped) timer = window.setTimeout(check, (available || forceRequested) && visible() ? 1000 : interval);
  };
  async function check(force = false) {
    if (stopped || loading) return;
    window.clearTimeout(timer);
    if (!visible()) { schedule(); return; }
    if (force || now() >= nextCheck) {
      loading = true;
      request = new AbortController();
      // Mobile OSes can suspend timers. A resumed page rechecks immediately.
      const timeout = window.setTimeout(() => request.abort(), 10000);
      try {
        const url = new URL(versionUrl, window.location.href);
        url.searchParams.set("t", String(now()));
        const response = await fetch(url.href, { cache: "no-store", credentials: "same-origin", signal: request.signal });
        if (!response.ok) throw new Error("Version unavailable");
        const data = await response.json();
        if (typeof data.version !== "string" || !/^[a-zA-Z0-9._-]{1,100}$/.test(data.version)) throw new Error("Invalid version");
        if (!stopped) {
          verified = true;
          if (available !== data.version) detectedAt = now();
          available = data.version === version ? null : data.version;
          notify(available);
        }
      } catch { verified = false; /* Keep the running app usable through offline/deployment gaps. */ }
      finally {
        loading = false;
        window.clearTimeout(timeout);
        nextCheck = now() + interval;
      }
    }
    if (!stopped) { if (!forceReload()) apply(); schedule(); }
  }
  const resume = () => { check(true); };
  const events = ["pageshow", "focus", "online"];
  events.forEach((event) => window.addEventListener(event, resume));
  document.addEventListener("visibilitychange", resume);
  check();
  return {
    force() {
      forceRequested = true;
      const applied = forceReload();
      if (!applied) { window.clearTimeout(timer); schedule(); }
      return applied;
    },
    stop() {
      stopped = true;
      window.clearTimeout(timer);
      request?.abort();
      events.forEach((event) => window.removeEventListener(event, resume));
      document.removeEventListener("visibilitychange", resume);
    },
  };
}
