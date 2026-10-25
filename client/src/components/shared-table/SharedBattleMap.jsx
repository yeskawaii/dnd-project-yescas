import { useRef, useState } from "react";
import TacticalGrid from "./TacticalGrid";
import TokenBadge from "./TokenBadge";
import IconPicker from "../ui/IconPicker";
import Icon from "../ui/Icon";
import { sharedMapParticipants } from "../../../../shared/mapTokens.mjs";

export default function SharedBattleMap({ map, combatants: encounterCombatants, activeId, onMoveToken, character, onChangeIcon, onRefresh }) {
  const combatants = sharedMapParticipants(map, encounterCombatants);
  const [selected, setSelected] = useState("");
  const [moving, setMoving] = useState(false);
  const [error, setError] = useState("");
  const [choosingIcon, setChoosingIcon] = useState(false);
  const [savingIcon, setSavingIcon] = useState(false);
  const iconLock = useRef(false);
  const moveLock = useRef(false);
  const actors = new Map(combatants.map((entry) => [entry.id, entry]));
  const placed = map.tokens.filter((token) => actors.has(token.combatantId));
  const owned = onMoveToken ? placed.filter((token) => map.movableTokenIds?.includes(token.combatantId)) : [];
  const selectedId = owned.some((token) => token.combatantId === selected) ? selected : owned[0]?.combatantId;
  const changeIcon = async (icon) => {
    if (iconLock.current) return;
    iconLock.current = true;
    setSavingIcon(true);
    setError("");
    try {
      const saved = await onChangeIcon(icon);
      if (!saved) throw new Error("No se guardó el icono. Inténtalo de nuevo.");
      setChoosingIcon(false);
    } catch (error) {
      setError(error.response?.data?.error || error.message || "No se pudo guardar el icono.");
    } finally {
      iconLock.current = false;
      setSavingIcon(false);
    }
  };
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
        {owned.length > 1 && <label className="form-field">
          Ficha que quieres mover
          <select value={selectedId} disabled={moving} onChange={(event) => { setSelected(event.target.value); setError(""); }}>
            {owned.map((token) => <option key={token.combatantId} value={token.combatantId}>{actors.get(token.combatantId).name}</option>)}
          </select>
          <small>Puedes mover todos tus personajes de esta campaña desde aquí. También puedes tocar una de tus fichas en el mapa para seleccionarla.</small>
        </label>}
        <p className="helper-text">Mueves a {actors.get(selectedId).name}. Toca una casilla libre para mover tu ficha. También puedes usar las flechas y Enter.</p>
        <p className="helper-text" role="status">{moving ? "Moviendo ficha…" : "Movimiento libre según lo acordado con el DM; no se descuenta velocidad ni se limita por turno."}</p>
      </>}
      {error && <p className="table-error" role="alert">{error}</p>}
      {onChangeIcon && <div className="map-icon-choice">
        <button className="button secondary compact" disabled={savingIcon}
          aria-expanded={choosingIcon} onClick={() => setChoosingIcon((value) => !value)}>
          <Icon name="palette" size={18} />{savingIcon ? "Guardando icono…" : "Elegir mi icono"}
        </button>
        {choosingIcon && <>
          <p className="helper-text">Tu emblema identifica a {character?.name || "tu personaje"} en el mapa y en su ficha. Lo ve todo el grupo.</p>
          <IconPicker label="Icono de tu personaje" value={character?.appearance?.emblem || "sword"}
            disabled={savingIcon} onChange={changeIcon} />
        </>}
      </div>}
      <TacticalGrid map={map} combatants={combatants} activeId={activeId} selectedId={selectedId}
        autoCenter={Boolean(selectedId)} onCellClick={selectedId ? click : undefined} />
      <div className="dm-token-legend" role="group" aria-label="Fichas visibles del mapa">
        {combatants.filter((entry) => placed.some((token) => token.combatantId === entry.id)).map((entry) => (
          owned.some((token) => token.combatantId === entry.id) ?
            <button className={`dm-legend-item ${selectedId === entry.id ? "active" : ""}`} key={entry.id}
              disabled={moving} aria-pressed={selectedId === entry.id} onClick={() => { setSelected(entry.id); setError(""); }}>
              <TokenBadge entry={entry} />{entry.name} · Tu ficha
            </button> :
            <span className="dm-legend-item" key={entry.id}>
              <TokenBadge entry={entry} />{entry.name}
            </span>
        ))}
      </div>
      {!placed.length && <p className="helper-text" role="status">No se recibieron fichas visibles para este mapa. El DM debe guardar la mesa y comprobar que las fichas estén fuera de la niebla.
        {onRefresh && <> <button className="text-button" onClick={onRefresh}>Actualizar fichas</button></>}
      </p>}
      <p className="helper-text">{selectedId ? "El DM también puede mover todas las fichas y revelar el escenario." : "El DM debe colocar tu personaje en una zona visible y guardar la mesa para que puedas moverlo, incluso sin combate."} Las zonas con niebla ocultan sus fichas.</p>
    </section>
  );
}
