import { useEffect, useRef, useState } from "react";
import Icon from "../ui/Icon";
import TacticalGrid from "../shared-table/TacticalGrid";
import TokenBadge from "../shared-table/TokenBadge";
import { cellDistance } from "../../utils/mapGeometry";
import { mapRoster, placeMapToken, placePartyOnMap, resizeMap } from "../../utils/dmWorkspace";
import { characterTokenVisual } from "../../../../shared/mapTokens.mjs";

const tools = {
  token: "Colocar o mover ficha",
  measure: "Medir distancia",
  floor: "Borrar terreno",
  wall: "Muro",
  water: "Agua",
  door: "Puerta",
  fog: "Niebla",
};
export default function BattleMap({
  map,
  combatants,
  players = [],
  onRefreshPlayers,
  refreshing,
  tokenIcons = {},
  tokenPortraits = {},
  activeId,
  onChange,
  onDelete,
}) {
  const [tool, setTool] = useState("token");
  const [selected, setSelected] = useState("");
  const [measurement, setMeasurement] = useState([]);
  const [notice, setNotice] = useState("");
  const paintMap = useRef(map);
  useEffect(() => { paintMap.current = map; }, [map]);
  const roster = mapRoster(map, combatants, players);
  const visualRoster = roster.map((entry) => {
    const visual = entry.kind === "player"
      ? characterTokenVisual(players.find((player) => player._id === entry.sourceId)?.appearance) : {};
    return { ...entry, icon: tokenIcons[entry.id] || visual.icon,
      portrait: Object.hasOwn(tokenIcons, entry.id) ? tokenPortraits[entry.id] : visual.portrait };
  });
  const selectedId = roster.some((entry) => entry.id === selected)
    ? selected
    : roster.find((entry) => entry.kind === "player")?.id || roster[0]?.id || "";
  const selectedEntry = roster.find((entry) => entry.id === selectedId);
  const unplacedPlayers = roster.filter((entry) => entry.kind === "player" &&
    players.some((player) => player._id === entry.sourceId) &&
    !map.tokens.some((token) => token.combatantId === entry.id));
  const click = (x, y) => {
    if (tool === "measure") {
      setMeasurement((previous) => previous.length === 1 ? [...previous, { x, y }] : [{ x, y }]);
      return;
    }
    if (tool === "token") {
      if (!selectedId) return;
      const occupant = map.tokens.find(
        (token) =>
          token.x === x && token.y === y && token.combatantId !== selectedId,
      );
      if (occupant) {
        setSelected(occupant.combatantId);
        return;
      }
      const next = placeMapToken(map, combatants, selectedEntry, x, y);
      if (next) { onChange(next); setNotice(""); }
      else setNotice("El mapa admite hasta 100 fichas. Retira una antes de colocar otra.");
    } else {
      // Pointer-enter events can arrive before React renders the previous stroke.
      const current = paintMap.current;
      const previous = current.cells.find((cell) => cell.x === x && cell.y === y);
      if ((tool === "floor" && !previous) || previous?.terrain === tool) return;
      const next = {
        ...current,
        cells: [
          ...current.cells.filter((cell) => cell.x !== x || cell.y !== y),
          ...(tool === "floor" ? [] : [{ x, y, terrain: tool }]),
        ],
      };
      paintMap.current = next;
      onChange(next);
    }
  };
  return (
    <section className="dm-map-editor">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Mapa táctico · Prepara el escenario</p>
          <h2 className="dm-map-scene-name">{map.name || "Escena sin nombre"}</h2>
        </div>
        <span className="edition-pill">Edición del DM</span>
      </div>
      <p className="helper-text">
        Explora con las fichas de personajes y acompañantes, sin iniciar un combate.
        Dibuja el terreno. Selecciona una ficha
        y toca su destino; toca otra para seleccionarla. Los movimientos son
        libres. En computadora, mantén pulsado y recorre el mapa para pintar. Usa las flechas y Enter para editar con teclado.
      </p>
      <div className="dm-map-settings">
        <label className="form-field dm-map-name-field">
          Nombre de la escena
          <input
            maxLength={120}
            value={map.name}
            onChange={(event) => onChange({ ...map, name: event.target.value })}
          />
        </label>
        <label className="form-field">Formato del mapa
          <select value={map.gridType || "square"} onChange={(event) => onChange({ ...map, gridType: event.target.value })}>
            <option value="hex">Hexágonos</option><option value="square">Cuadrícula</option>
          </select>
        </label>
        <label className="form-field">Escala por celda
          <select value={map.feetPerCell || 5} onChange={(event) => onChange({ ...map, feetPerCell: Number(event.target.value) })}>
            {[...new Set([5, 10, 30, map.feetPerCell || 5])].sort((a, b) => a - b).map((value) => <option key={value} value={value}>{value} ft</option>)}
          </select>
        </label>
        <label className="form-field">
          Tamaño
          <select
            value={`${map.width}x${map.height}`}
            onChange={(event) => {
              const [width, height] = event.target.value.split("x").map(Number);
              const apply = () => { setMeasurement([]); onChange(resizeMap(map, width, height)); };
              if (width < map.width || height < map.height)
                onDelete(
                  "Reducir mapa",
                  "Se retirarán las casillas y fichas que queden fuera del nuevo tamaño.",
                  apply,
                );
              else apply();
            }}
          >
            {[[map.width, map.height], ...[
              [12, 10],
              [16, 12],
              [20, 16],
              [24, 20],
              [30, 30],
            ].filter(([width, height]) => width !== map.width || height !== map.height)].map(([width, height]) => (
              <option key={width} value={`${width}x${height}`}>
                {width} × {height}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="dm-map-tools" aria-label="Herramientas del mapa">
        {Object.entries(tools).map(([key, label]) => (
          <button
            className={`button compact ${tool === key ? "primary" : "secondary"}`}
            aria-pressed={tool === key}
            key={key}
            onClick={() => setTool(key)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="dm-map-token-controls">
        <label className="form-field">
          Ficha para colocar o mover
          <select
            value={selectedId}
            disabled={!roster.length}
            onChange={(event) => {
              setSelected(event.target.value);
              setTool("token");
              setNotice("");
            }}
          >
            {!roster.length && <option value="">No hay fichas disponibles</option>}
            {[
              ["Personajes del grupo", roster.filter((entry) => entry.kind === "player")],
              ["Acompañantes y criaturas", roster.filter((entry) => entry.kind !== "player")],
            ].filter(([, entries]) => entries.length).map(([label, entries]) => (
              <optgroup key={label} label={label}>
                {entries.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.name} · {map.tokens.some((token) => token.combatantId === entry.id) ? "En el mapa" : "Sin colocar"}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
        <button className="button primary compact" disabled={!unplacedPlayers.length}
          onClick={() => {
            const next = placePartyOnMap(map, combatants, players);
            const count = next.tokens.length - map.tokens.length;
            if (count) { onChange(next); setTool("token"); }
            setNotice(count === unplacedPlayers.length
              ? `${count} ${count === 1 ? "personaje colocado" : "personajes colocados"} en el mapa. Puedes mover cada ficha a otra casilla.`
              : `${count} de ${unplacedPlayers.length} personajes colocados. Libera casillas sin muros ni niebla o amplía el mapa para colocar al resto.`);
          }}>
          <Icon name="plus" size={16} />Colocar grupo
        </button>
        <button
          className="button secondary compact"
          disabled={
            !map.tokens.some((token) => token.combatantId === selectedId)
          }
          onClick={() =>
            onChange({
              ...map,
              participants: (map.participants || []).filter((entry) => entry.id !== selectedId),
              tokens: map.tokens.filter(
                (token) => token.combatantId !== selectedId,
              ),
            })
          }
        >
          Retirar ficha
        </button>
      </div>
      {onRefreshPlayers && <button className="text-button" disabled={refreshing} onClick={onRefreshPlayers}>
        <Icon name="undo" size={16} />{refreshing ? "Actualizando…" : "Actualizar fichas del grupo"}
      </button>}
      {!roster.length && <p className="helper-text">Cuando los personajes se unan a la contienda, aparecerán aquí. Actualiza las fichas del grupo para consultarlos. También puedes añadir criaturas desde la biblioteca al encuentro.</p>}
      {tool === "token" && selectedEntry && <p className="helper-text dm-map-placement-hint">
        <strong>{selectedEntry.name}</strong>: toca una casilla libre para {map.tokens.some((token) => token.combatantId === selectedId) ? "mover su ficha" : "colocar su ficha"}. Colocar grupo distribuye los personajes en casillas libres.
      </p>}
      {notice && <p className="helper-text" role="status">{notice}</p>}
      {activeId && <button className="text-button" onClick={() => { setSelected(activeId); setTool("token"); }}>Seleccionar ficha del turno</button>}
      {tool === "measure" && <div className="dm-map-measurement" role="status">
        {measurement.length === 2 ? `Distancia: ${cellDistance(map, measurement[0], measurement[1]) * (map.feetPerCell || 5)} ft · ${cellDistance(map, measurement[0], measurement[1])} celdas` : measurement.length === 1 ? "Selecciona el destino." : "Toca el origen y el destino para medir."}
        <p className="helper-text">Distancia directa sin obstáculos ni terreno difícil.{map.gridType !== "hex" ? " Las diagonales alternan 1 y 2 celdas." : " Cada paso entre hexágonos vecinos cuenta una celda."}</p>
        {measurement.length > 0 && <button className="text-button" onClick={() => setMeasurement([])}>Borrar medición</button>}
      </div>}
      <TacticalGrid map={map} combatants={visualRoster} activeId={activeId} selectedId={selectedId}
        onCellClick={click} onPaint={!["token", "measure"].includes(tool) ? click : undefined}
        measurement={tool === "measure" ? measurement.filter((point) => point.x < map.width && point.y < map.height) : []} />
      <div className="dm-token-legend">
        {visualRoster.map((entry) => (
          <button
            className={`dm-legend-item ${selectedId === entry.id ? "active" : ""}`}
            aria-pressed={selectedId === entry.id}
            key={entry.id}
            onClick={() => {
              setSelected(entry.id);
              setTool("token");
            }}
          >
            <TokenBadge entry={entry} />
            <span>{entry.name}
            {!map.tokens.some((token) => token.combatantId === entry.id)
              ? " · sin colocar"
              : ""}</span>
          </button>
        ))}
      </div>
      <p className="helper-text">
        La niebla oculta las fichas de sus casillas a los jugadores. Activa
        Compartir el mapa táctico en Compartir para actualizar sus pantallas.
        Controla la visibilidad de cada criatura desde Combate; los acompañantes
        se añaden visibles y pueden colocarse sin combate.
      </p>
      <button
        className="text-button dm-danger"
        disabled={!map.cells.length && !map.tokens.length}
        onClick={() =>
          onDelete(
            "Limpiar mapa",
            "Se borrarán el terreno y las posiciones de las fichas.",
            () => onChange({ ...map, cells: [], tokens: [], participants: [] }),
          )
        }
      >
        <Icon name="trash" size={16} />
        Limpiar escena
      </button>
    </section>
  );
}
