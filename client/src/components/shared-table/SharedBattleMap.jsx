const symbols = { wall: "▧", water: "≈", door: "▥", fog: "?" };

export default function SharedBattleMap({ map, combatants, activeId }) {
  const cells = new Map(map.cells.map((cell) => [`${cell.x}:${cell.y}`, cell.terrain]));
  const tokens = new Map(map.tokens.map((token) => [`${token.x}:${token.y}`, token]));
  const actors = new Map(combatants.map((entry) => [entry.id, entry]));
  const placed = map.tokens.filter((token) => actors.has(token.combatantId));
  const description = placed.map((token) =>
    `${actors.get(token.combatantId).name}: columna ${token.x + 1}, fila ${token.y + 1}`).join(". ");
  return (
    <section className="surface shared-map">
      <div className="section-heading"><h2>{map.name}</h2><span className="edition-pill">Vista del grupo</span></div>
      <div className="dm-map-scroll" tabIndex={0} role="region" aria-label="Mapa compartido desplazable">
        <div className="dm-map-grid" style={{ gridTemplateColumns: `repeat(${map.width}, 42px)` }}
          role="img" aria-label={`${map.name}. ${description || "Sin fichas visibles."}`}>
          {Array.from({ length: map.width * map.height }, (_, index) => {
            const x = index % map.width, y = Math.floor(index / map.width);
            const terrain = cells.get(`${x}:${y}`);
            const token = tokens.get(`${x}:${y}`);
            const actor = actors.get(token?.combatantId);
            const number = combatants.findIndex((entry) => entry.id === actor?.id) + 1;
            return (
              <span key={index} aria-hidden="true"
                className={`dm-map-cell ${terrain || "floor"} ${actor?.id === activeId ? "current-turn" : ""}`}>
                {actor ? <span className={`dm-token ${actor.kind}`}>{number}</span> : symbols[terrain]}
              </span>
            );
          })}
        </div>
      </div>
      <div className="dm-token-legend">
        {combatants.filter((entry) => placed.some((token) => token.combatantId === entry.id)).map((entry) => (
          <span className="dm-legend-item" key={entry.id}>
            <span className={`dm-token ${entry.kind}`}>{combatants.indexOf(entry) + 1}</span>{entry.name}
          </span>
        ))}
      </div>
      <p className="helper-text">El DM mueve las fichas y revela el escenario. Las zonas con niebla ocultan sus fichas.</p>
    </section>
  );
}
