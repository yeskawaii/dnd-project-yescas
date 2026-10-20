import { useRef, useState } from "react";
import { cellCenter, cellPolygon, mapBounds } from "../../utils/mapGeometry";

const symbols = { wall: "▧", water: "≈", door: "▥", fog: "?" };
const terrainNames = { wall: "muro", water: "agua", door: "puerta", fog: "niebla" };
export default function TacticalGrid({ map, combatants, activeId, selectedId, onCellClick, onPaint, measurement }) {
  const [zoom, setZoom] = useState(1);
  const container = useRef(null);
  const bounds = mapBounds(map);
  const cells = new Map(map.cells.map((cell) => [`${cell.x}:${cell.y}`, cell.terrain]));
  const tokens = new Map(map.tokens.map((token) => [`${token.x}:${token.y}`, token]));
  const actors = new Map(combatants.map((entry, index) => [entry.id, { ...entry, number: index + 1 }]));
  const focusId = selectedId || activeId;
  const placed = map.tokens.some((token) => token.combatantId === focusId);
  const points = measurement?.map((point) => cellCenter(map, point.x, point.y)) || [];
  return <>
    <div className="dm-map-toolbar">
      <label className="form-field">Zoom<select value={zoom} onChange={(event) => setZoom(Number(event.target.value))}>{[0.65, 0.8, 1, 1.25, 1.5].map((value) => <option key={value} value={value}>{Math.round(value * 100)}%</option>)}</select></label>
      <button className="button secondary compact" disabled={!placed} onClick={() => {
        const token = [...container.current.querySelectorAll("[data-combatant]")].find((element) => element.dataset.combatant === focusId);
        token?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }}>Centrar {selectedId ? "selección" : "turno"}</button>
      <span className="helper-text">{map.gridType === "hex" ? "Hexágonos" : "Cuadrícula"} · {map.feetPerCell || 5} ft por celda</span>
    </div>
    <div ref={container} className="dm-map-scroll" tabIndex={0} role="region" aria-label={onCellClick ? "Mapa táctico desplazable" : "Mapa compartido desplazable"}>
      <svg className="tactical-grid" width={bounds.width * zoom} height={bounds.height * zoom} viewBox={`0 0 ${bounds.width} ${bounds.height}`}
        role={onCellClick ? "group" : "img"} aria-label={`${map.name}. ${map.gridType === "hex" ? "Mapa hexagonal" : "Cuadrícula"}${!onCellClick ? `. ${map.tokens.filter((token) => actors.has(token.combatantId)).map((token) => `${actors.get(token.combatantId).name}: columna ${token.x + 1}, fila ${token.y + 1}`).join(". ") || "Sin fichas visibles"}` : ""}`}>
        {Array.from({ length: map.width * map.height }, (_, index) => {
          const x = index % map.width, y = Math.floor(index / map.width);
          const terrain = cells.get(`${x}:${y}`);
          const actor = actors.get(tokens.get(`${x}:${y}`)?.combatantId);
          const center = cellCenter(map, x, y);
          const label = `Columna ${x + 1}, fila ${y + 1}: ${actor ? `${actor.name}, ` : ""}${terrainNames[terrain] || "suelo"}`;
          const marked = measurement?.some((point) => point.x === x && point.y === y);
          return <g key={index} data-combatant={actor?.id} data-x={x} data-y={y}
            className={`tactical-cell ${terrain || "floor"} ${actor?.id === activeId ? "current-turn" : ""} ${actor?.id === selectedId ? "selected-token" : ""} ${marked ? "measured" : ""}`}
            role={onCellClick ? "button" : undefined} tabIndex={onCellClick ? 0 : undefined} aria-label={onCellClick ? label : undefined} aria-hidden={!onCellClick || undefined}
            onClick={onCellClick ? () => onCellClick(x, y) : undefined}
            onPointerDown={onPaint ? (event) => { if (event.button === 0) onPaint(x, y); } : undefined}
            onPointerEnter={onPaint ? (event) => { if (event.pointerType === "mouse" && event.buttons === 1) onPaint(x, y); } : undefined}
            onKeyDown={onCellClick ? (event) => {
              if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onCellClick(x, y); }
              const step = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[event.key];
              if (step) {
                event.preventDefault();
                const nextX = Math.max(0, Math.min(map.width - 1, x + step[0]));
                const nextY = Math.max(0, Math.min(map.height - 1, y + step[1]));
                container.current.querySelector(`[data-x="${nextX}"][data-y="${nextY}"]`)?.focus();
              }
            } : undefined}>
            <title>{label}</title>
            <polygon points={cellPolygon(map, x, y)} />
            {actor ? <><circle className={`tactical-token ${actor.kind}`} cx={center.x} cy={center.y} r={14} /><text x={center.x} y={center.y} className="tactical-token-number">{actor.number}</text></>
              : <text x={center.x} y={center.y} className="tactical-terrain">{symbols[terrain]}</text>}
          </g>;
        })}
        {points.length > 0 && <g className="tactical-measure" aria-hidden="true">{points.length === 2 && <line x1={points[0].x} y1={points[0].y} x2={points[1].x} y2={points[1].y} />}{points.map((point, i) => <circle key={i} cx={point.x} cy={point.y} r={6} />)}</g>}
      </svg>
    </div>
  </>;
}
