import { useEffect, useEffectEvent, useRef, useState } from "react";
import { startAppUpdates } from "../utils/appUpdate";

export default function useAppUpdate(beforeReload) {
  const [available, setAvailable] = useState(null);
  const updater = useRef(null);
  const prepare = useEffectEvent(beforeReload);
  useEffect(() => {
    if (!import.meta.env.PROD || !import.meta.env.VITE_APP_VERSION) return;
    updater.current = startAppUpdates({
      version: import.meta.env.VITE_APP_VERSION,
      versionUrl: `${import.meta.env.BASE_URL}version.json`,
      window, document, fetch: window.fetch.bind(window),
      onAvailable: setAvailable, beforeReload: prepare,
    });
    return () => updater.current?.stop();
  }, []);
  return { available, apply: () => updater.current?.apply() };
}
