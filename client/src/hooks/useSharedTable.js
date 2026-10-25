import { useEffect, useRef, useState } from "react";
import api from "../api/axios";

export default function useSharedTable(campaignId, characterId) {
  const [snapshot, setSnapshot] = useState(null);
  const [retry, setRetry] = useState(0);
  const moveLock = useRef(false);
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
        if (!stopped) setSnapshot((previous) =>
          previous?.scope === scope && previous.data?.revision > data.revision ? previous :
            { scope, data, error: "", updatedAt: Date.now() });
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
    window.addEventListener("pageshow", resume);
    window.addEventListener("focus", resume);
    return () => {
      stopped = true;
      window.clearTimeout(timer);
      request?.abort();
      document.removeEventListener("visibilitychange", resume);
      window.removeEventListener("online", resume);
      window.removeEventListener("pageshow", resume);
      window.removeEventListener("focus", resume);
    };
  }, [campaignId, characterId, scope, retry]);

  const moveToken = async (combatantId, x, y) => {
    if (moveLock.current) return;
    moveLock.current = true;
    try {
      const { data } = await api.patch(`/campaign/${campaignId}/table/token`, {
        characterId, combatantId, x, y, revision: snapshot?.data?.revision,
      }, { timeout: 15000 });
      setSnapshot((previous) =>
        previous?.scope === scope && previous.data?.revision > data.revision ? previous :
          { scope, data, error: "", updatedAt: Date.now() });
    } catch (error) {
      setRetry((value) => value + 1);
      throw error;
    } finally {
      moveLock.current = false;
    }
  };

  return {
    data: snapshot?.scope === scope ? snapshot.data : null,
    error: snapshot?.scope === scope ? snapshot.error : "",
    updatedAt: snapshot?.scope === scope ? snapshot.updatedAt : null,
    refresh: () => setRetry((value) => value + 1),
    moveToken,
  };
}
