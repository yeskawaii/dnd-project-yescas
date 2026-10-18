import { useState } from "react";
import Icon from "../ui/Icon";
import { resizeMap } from "../../utils/dmWorkspace";

const tools = {
  token: "Mover ficha",
  floor: "Borrar terreno",
  wall: "Muro",
  water: "Agua",
  door: "Puerta",
  fog: "Niebla",
};
const symbols = { wall: "▧", water: "≈", door: "▥", fog: "?" };
export default function BattleMap({
  map,
  combatants,
  activeId,
  onChange,
  onDelete,
}) {
  const [tool, setTool] = useState("token");
  const [selected, setSelected] = useState("");
  const selectedId = combatants.some((entry) => entry.id === selected)
    ? selected
    : combatants[0]?.id || "";
  const cells = new Map(
    map.cells.map((cell) => [`${cell.x}:${cell.y}`, cell.terrain]),
  );
  const click = (x, y) => {
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
      onChange({
        ...map,
        cells: [
          ...map.cells.filter((cell) => cell.x !== x || cell.y !== y),
          ...(tool === "floor" ? [] : [{ x, y, terrain: tool }]),
        ],
      });
    }
  };
  return (
    <section>
      <div className="section-heading">
        <div>
          <p className="eyebrow">Prepara el escenario</p>
          <h2>Mapa táctico</h2>
        </div>
        <span className="edition-pill">Solo DM</span>
      </div>
      <p className="helper-text">
        Dibuja casillas y coloca las fichas del encuentro. Selecciona una ficha
        y toca su destino; toca otra para seleccionarla. Los movimientos son
        libres.
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
        <label className="form-field">
          Tamaño
          <select
            value={`${map.width}x${map.height}`}
            onChange={(event) => {
              const [width, height] = event.target.value.split("x").map(Number);
              const apply = () => onChange(resizeMap(map, width, height));
              if (width < map.width || height < map.height)
                onDelete(
                  "Reducir mapa",
                  "Se retirarán las casillas y fichas que queden fuera del nuevo tamaño.",
                  apply,
                );
              else apply();
            }}
          >
            {[
              [12, 10],
              [16, 12],
              [20, 16],
              [24, 20],
              [30, 30],
            ].map(([width, height]) => (
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
      <div
        className="dm-map-scroll"
        tabIndex={0}
        role="region"
        aria-label="Mapa desplazable"
      >
        <div
          className="dm-map-grid"
          style={{ gridTemplateColumns: `repeat(${map.width}, 42px)` }}
        >
          {Array.from({ length: map.width * map.height }, (_, index) => {
            const x = index % map.width,
              y = Math.floor(index / map.width);
            const terrain = cells.get(`${x}:${y}`);
            const token = map.tokens.find(
              (entry) => entry.x === x && entry.y === y,
            );
            const actor = combatants.find(
              (entry) => entry.id === token?.combatantId,
            );
            return (
              <button
                key={index}
                type="button"
                className={`dm-map-cell ${terrain || "floor"} ${actor?.id === activeId ? "current-turn" : ""} ${actor?.id === selectedId ? "selected-token" : ""}`}
                aria-label={`Columna ${x + 1}, fila ${y + 1}: ${actor?.name || tools[terrain] || "suelo"}`}
                title={`${x + 1}, ${y + 1}${actor ? ` · ${actor.name}` : ""}`}
                onClick={() => click(x, y)}
              >
                {actor ? (
                  <span className={`dm-token ${actor.kind}`}>
                    {combatants.findIndex((entry) => entry.id === actor.id) + 1}
                  </span>
                ) : (
                  symbols[terrain]
                )}
              </button>
            );
          })}
        </div>
      </div>
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
        La niebla es una marca de preparación. Este mapa todavía no se comparte
        en vivo con los jugadores.
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
