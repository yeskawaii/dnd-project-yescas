import { useRef, useState } from "react";
import TacticalGrid from "./TacticalGrid";

export default function SharedBattleMap({ map, combatants: encounterCombatants, activeId, onMoveToken }) {
  const combatants = map.participants || encounterCombatants;
  const [selected, setSelected] = useState("");
  const [moving, setMoving] = useState(false);
  const [error, setError] = useState("");
  const moveLock = useRef(false);
  const actors = new Map(combatants.map((entry) => [entry.id, entry]));
  const placed = map.tokens.filter((token) => actors.has(token.combatantId));
  const owned = onMoveToken ? placed.filter((token) => map.movableTokenIds?.includes(token.combatantId)) : [];
  const selectedId = owned.some((token) => token.combatantId === selected) ? selected : owned[0]?.combatantId;
  const click = async (x, y) => {
    if (!selectedId || moveLock.current) return;
    const occupant = placed.find((token) => token.x === x && token.y === y);
    if (occupant) {
      if (owned.some((token) => token.combatantId === occupant.combatantId)) {
        setSelected(occupant.combatantId);
        setError("");
      } else setError("Esa casilla ya tiene una ficha. Elige otro destino.");
      return;
    }
    if (map.cells.some((cell) => cell.x === x && cell.y === y && ["wall", "fog"].includes(cell.terrain))) {
      setError("Elige una casilla sin muro ni niebla.");
      return;
    }
    moveLock.current = true;
    setMoving(true);
    setError("");
    try {
      await onMoveToken(selectedId, x, y);
    } catch (error) {
      setError(error.response?.data?.message || "No se pudo mover tu ficha. Revisa la conexión y vuelve a intentarlo.");
    } finally {
      moveLock.current = false;
      setMoving(false);
    }
  };
  return (
    <section className="surface shared-map" aria-busy={moving}>
      <div className="section-heading"><h2>{map.name}</h2><span className="edition-pill">Vista del grupo</span></div>
      {selectedId && <>
        <p className="helper-text">Mueves a {actors.get(selectedId).name}. Toca una casilla libre para mover tu ficha. También puedes usar las flechas y Enter.</p>
        <p className="helper-text" role="status">{moving ? "Moviendo ficha…" : "Movimiento libre según lo acordado con el DM; no se descuenta velocidad ni se limita por turno."}</p>
      </>}
      {error && <p className="table-error" role="alert">{error}</p>}
      <TacticalGrid map={map} combatants={combatants} activeId={activeId} selectedId={selectedId}
        onCellClick={selectedId ? click : undefined} />
      <div className="dm-token-legend">
        {combatants.filter((entry) => placed.some((token) => token.combatantId === entry.id)).map((entry) => (
          owned.some((token) => token.combatantId === entry.id) ?
            <button className={`dm-legend-item ${selectedId === entry.id ? "active" : ""}`} key={entry.id}
              disabled={moving} aria-pressed={selectedId === entry.id} onClick={() => { setSelected(entry.id); setError(""); }}>
              <span className={`dm-token ${entry.kind}`}>{combatants.indexOf(entry) + 1}</span>{entry.name} · Tu ficha
            </button> :
            <span className="dm-legend-item" key={entry.id}>
              <span className={`dm-token ${entry.kind}`}>{combatants.indexOf(entry) + 1}</span>{entry.name}
            </span>
        ))}
      </div>
      <p className="helper-text">{selectedId ? "El DM también puede mover todas las fichas y revelar el escenario." : "El DM debe añadir tu personaje al encuentro y colocar tu ficha en una zona visible para que puedas moverla."} Las zonas con niebla ocultan sus fichas.</p>
    </section>
  );
}
