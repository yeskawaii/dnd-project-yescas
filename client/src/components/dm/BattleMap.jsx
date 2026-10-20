import { useEffect, useRef, useState } from "react";
import Icon from "../ui/Icon";
import TacticalGrid from "../shared-table/TacticalGrid";
import { cellDistance } from "../../utils/mapGeometry";
import { resizeMap } from "../../utils/dmWorkspace";

const tools = {
  token: "Mover ficha",
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
  activeId,
  onChange,
  onDelete,
}) {
  const [tool, setTool] = useState("token");
  const [selected, setSelected] = useState("");
  const [measurement, setMeasurement] = useState([]);
  const paintMap = useRef(map);
  useEffect(() => { paintMap.current = map; }, [map]);
  const selectedId = combatants.some((entry) => entry.id === selected)
    ? selected
    : combatants[0]?.id || "";
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
      onChange({
        ...map,
        tokens: [
          ...map.tokens.filter((token) => token.combatantId !== selectedId),
          { combatantId: selectedId, x, y },
        ],
      });
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
    <section>
      <div className="section-heading">
        <div>
          <p className="eyebrow">Prepara el escenario</p>
          <h2>Mapa táctico</h2>
        </div>
        <span className="edition-pill">Edición del DM</span>
      </div>
      <p className="helper-text">
        Dibuja el terreno y coloca las fichas del encuentro. Selecciona una ficha
        y toca su destino; toca otra para seleccionarla. Los movimientos son
        libres. En computadora, mantén pulsado y recorre el mapa para pintar. Usa las flechas y Enter para editar con teclado.
      </p>
      <div className="dm-filter-row">
        <label className="form-field">
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
      <div className="dm-filter-row">
        <label className="form-field">
          Ficha del encuentro
          <select
            value={selectedId}
            onChange={(event) => {
              setSelected(event.target.value);
              setTool("token");
            }}
          >
            <option value="" disabled>
              Agrega participantes en Combate
            </option>
            {combatants.map((entry, i) => (
              <option key={entry.id} value={entry.id}>
                {i + 1}. {entry.name}
              </option>
            ))}
          </select>
        </label>
        <button
          className="button secondary compact"
          disabled={
            !map.tokens.some((token) => token.combatantId === selectedId)
          }
          onClick={() =>
            onChange({
              ...map,
              tokens: map.tokens.filter(
                (token) => token.combatantId !== selectedId,
              ),
            })
          }
        >
          Retirar ficha
        </button>
      </div>
      {activeId && <button className="text-button" onClick={() => { setSelected(activeId); setTool("token"); }}>Seleccionar ficha del turno</button>}
      {tool === "measure" && <div className="dm-map-measurement" role="status">
        {measurement.length === 2 ? `Distancia: ${cellDistance(map, measurement[0], measurement[1]) * (map.feetPerCell || 5)} ft · ${cellDistance(map, measurement[0], measurement[1])} celdas` : measurement.length === 1 ? "Selecciona el destino." : "Toca el origen y el destino para medir."}
        <p className="helper-text">Distancia directa sin obstáculos ni terreno difícil.{map.gridType !== "hex" ? " Las diagonales alternan 1 y 2 celdas." : " Cada paso entre hexágonos vecinos cuenta una celda."}</p>
        {measurement.length > 0 && <button className="text-button" onClick={() => setMeasurement([])}>Borrar medición</button>}
      </div>}
      <TacticalGrid map={map} combatants={combatants} activeId={activeId} selectedId={selectedId}
        onCellClick={click} onPaint={!["token", "measure"].includes(tool) ? click : undefined}
        measurement={tool === "measure" ? measurement.filter((point) => point.x < map.width && point.y < map.height) : []} />
      <div className="dm-token-legend">
        {combatants.map((entry, i) => (
          <button
            className={`dm-legend-item ${selectedId === entry.id ? "active" : ""}`}
            key={entry.id}
            onClick={() => {
              setSelected(entry.id);
              setTool("token");
            }}
          >
            <span className={`dm-token ${entry.kind}`}>{i + 1}</span>
            {entry.name}
            {!map.tokens.some((token) => token.combatantId === entry.id)
              ? " · sin colocar"
              : ""}
          </button>
        ))}
      </div>
      <p className="helper-text">
        La niebla oculta las fichas de sus casillas a los jugadores. Activa
        Compartir el mapa táctico en Compartir para actualizar sus pantallas.
        Controla la visibilidad de cada criatura desde Combate; los acompañantes
        se añaden visibles.
      </p>
      <button
        className="text-button dm-danger"
        disabled={!map.cells.length && !map.tokens.length}
        onClick={() =>
          onDelete(
            "Limpiar mapa",
            "Se borrarán el terreno y las posiciones de las fichas.",
            () => onChange({ ...map, cells: [], tokens: [] }),
          )
        }
      >
        <Icon name="trash" size={16} />
        Limpiar escena
      </button>
    </section>
  );
}
