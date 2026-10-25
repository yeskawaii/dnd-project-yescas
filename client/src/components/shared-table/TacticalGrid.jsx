import { useLayoutEffect, useRef, useState } from "react";
import { cellCenter, cellPolygon, mapBounds, tokenViewport } from "../../utils/mapGeometry";
import TokenVisual from "./TokenVisual";
import { tokenPortrait } from "../../../../shared/mapTokens.mjs";

const symbols = { wall: "▧", water: "≈", door: "▥", fog: "?" };
const terrainNames = { wall: "muro", water: "agua", door: "puerta", fog: "niebla" };
function centerToken(container, map, token, zoom, behavior) {
  if (!container || !token) return;
  container.scrollTo({
    ...tokenViewport(map, token, { width: container.clientWidth, height: container.clientHeight }, zoom),
    behavior,
  });
}

export default function TacticalGrid({ map, combatants, activeId, selectedId, onCellClick, onPaint, measurement, autoCenter = false }) {
  const [zoom, setZoom] = useState(1);
  const container = useRef(null);
  const centeredView = useRef(null);
  const bounds = mapBounds(map);
  const cells = new Map(map.cells.map((cell) => [`${cell.x}:${cell.y}`, cell.terrain]));
  const tokens = new Map(map.tokens.map((token) => [`${token.x}:${token.y}`, token]));
  const actors = new Map(combatants.map((entry) => [entry.id, entry]));
  const focusId = selectedId || activeId;
  const focusToken = map.tokens.find((token) => token.combatantId === focusId);
  const focusX = focusToken?.x, focusY = focusToken?.y;
  const { gridType, width, height } = map;
  useLayoutEffect(() => {
    if (!autoCenter || focusX == null || focusY == null) {
      centeredView.current = null;
      return;
    }
    const view = JSON.stringify([focusId, gridType, width, height, zoom]);
    // Reveal newly placed/selected tokens and zoom changes, but let players pan
    // freely while polling delivers new positions for an existing token.
    if (centeredView.current === view) return;
    centerToken(container.current, { gridType, width, height }, { x: focusX, y: focusY }, zoom, "instant");
    centeredView.current = view;
  }, [autoCenter, focusId, focusX, focusY, gridType, width, height, zoom]);
  const points = measurement?.map((point) => cellCenter(map, point.x, point.y)) || [];
  return <>
    <div className="dm-map-toolbar">
      <label className="form-field">Zoom<select value={zoom} onChange={(event) => setZoom(Number(event.target.value))}>{[0.65, 0.8, 1, 1.25, 1.5].map((value) => <option key={value} value={value}>{Math.round(value * 100)}%</option>)}</select></label>
      <button className="button secondary compact" disabled={!focusToken} onClick={() => {
        centerToken(container.current, map, focusToken, zoom, "smooth");
      }}>Centrar {autoCenter && selectedId ? "mi ficha" : selectedId ? "selección" : "turno"}</button>
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
            className={`tactical-cell ${terrain || "floor"} ${actor && actor.id === activeId ? "current-turn" : ""} ${actor && actor.id === selectedId ? "selected-token" : ""} ${marked ? "measured" : ""}`}
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
            {actor ? <><circle className={`tactical-token ${actor.kind}`} cx={center.x} cy={center.y} r={16} />
              <TokenVisual entry={actor} x={center.x - (tokenPortrait(actor) ? 15 : 10)}
                y={center.y - (tokenPortrait(actor) ? 15 : 10)} size={tokenPortrait(actor) ? 30 : 20} svg /></>
              : <text x={center.x} y={center.y} className="tactical-terrain">{symbols[terrain]}</text>}
          </g>;
        })}
        {points.length > 0 && <g className="tactical-measure" aria-hidden="true">{points.length === 2 && <line x1={points[0].x} y1={points[0].y} x2={points[1].x} y2={points[1].y} />}{points.map((point, i) => <circle key={i} cx={point.x} cy={point.y} r={6} />)}</g>}
      </svg>
    </div>
  </>;
}
