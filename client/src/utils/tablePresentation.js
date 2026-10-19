export const sceneMoods = {
  forest: { label: "Bosque encantado", icon: "✦" },
  ruins: { label: "Ruinas antiguas", icon: "◇" },
  tavern: { label: "Refugio y taberna", icon: "☷" },
  storm: { label: "Tormenta y misterio", icon: "ϟ" },
};

export const emptyPresentation = () => ({
  enabled: false, shareMap: false, showEnemyHp: false,
  scenes: [], activeScene: null, secrets: [],
});

export function presentScene(presentation, scene, presentationId) {
  return { ...presentation, activeScene: { ...scene, presentationId } };
}

// Storage contains only read IDs; private message text stays out of browser storage.
export const secretReadKey = (campaignId, characterId) =>
  `grimorio:secrets:${campaignId}:${characterId}`;

export function readSecretIds(storage, key) {
  try {
    const value = JSON.parse(storage.getItem(key) || "[]");
    return Array.isArray(value) ? value.filter((id) => typeof id === "string").slice(-200) : [];
  } catch { return []; }
}

export function markSecretRead(storage, key, ids, id) {
  const next = [...new Set([...ids, id])].slice(-200);
  try { storage.setItem(key, JSON.stringify(next)); } catch { /* Reading works without storage. */ }
  return next;
}
