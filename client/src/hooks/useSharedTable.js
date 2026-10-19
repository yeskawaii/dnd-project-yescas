import { useEffect, useState } from "react";
import api from "../api/axios";

export default function useSharedTable(campaignId, characterId) {
  const [snapshot, setSnapshot] = useState(null);
  const [retry, setRetry] = useState(0);
  const scope = `${campaignId}:${characterId}`;

  useEffect(() => {
    if (!campaignId || !characterId) return;
    let stopped = false;
    let timer;
    let request;
    let loading = false;
    const update = async () => {
      if (stopped || loading || document.visibilityState === "hidden") return;
      loading = true;
      request = new AbortController();
      try {
        const { data } = await api.get(`/campaign/${campaignId}/table`, {
          params: { characterId }, signal: request.signal, timeout: 15000,
        });
        if (!stopped) setSnapshot({ scope, data, error: "", updatedAt: Date.now() });
      } catch (error) {
        if (!stopped && !request.signal.aborted) {
          const denied = [403, 404].includes(error.response?.status);
          setSnapshot((previous) => ({
            scope,
            data: denied || previous?.scope !== scope ? null : previous.data,
            updatedAt: previous?.scope === scope ? previous.updatedAt : null,
            error: error.response?.data?.message || "Se interrumpió la conexión. Volveremos a intentarlo automáticamente.",
          }));
        }
      } finally {
        loading = false;
        if (!stopped) timer = window.setTimeout(update, 4000);
      }
    };
    const resume = () => {
      window.clearTimeout(timer);
      if (document.visibilityState === "visible") update();
    };
    update();
    document.addEventListener("visibilitychange", resume);
    window.addEventListener("online", resume);
    return () => {
      stopped = true;
      window.clearTimeout(timer);
      request?.abort();
      document.removeEventListener("visibilitychange", resume);
      window.removeEventListener("online", resume);
    };
  }, [campaignId, characterId, scope, retry]);

  return {
    data: snapshot?.scope === scope ? snapshot.data : null,
    error: snapshot?.scope === scope ? snapshot.error : "",
    updatedAt: snapshot?.scope === scope ? snapshot.updatedAt : null,
    refresh: () => setRetry((value) => value + 1),
  };
}
