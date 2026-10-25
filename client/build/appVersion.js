import { randomUUID } from "node:crypto";

export function appVersion() {
  const version = randomUUID();
  return {
    name: "app-version",
    apply: "build",
    config: () => ({ define: { "import.meta.env.VITE_APP_VERSION": JSON.stringify(version) } }),
    generateBundle() {
      this.emitFile({ type: "asset", fileName: "version.json", source: JSON.stringify({ version }) });
    },
  };
}
