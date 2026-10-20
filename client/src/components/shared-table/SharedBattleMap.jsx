import TacticalGrid from "./TacticalGrid";

export default function SharedBattleMap({ map, combatants, activeId }) {
  const actors = new Map(combatants.map((entry) => [entry.id, entry]));
  const placed = map.tokens.filter((token) => actors.has(token.combatantId));
  return (
    <section className="surface shared-map">
      <div className="section-heading"><h2>{map.name}</h2><span className="edition-pill">Vista del grupo</span></div>
      <TacticalGrid map={map} combatants={combatants} activeId={activeId} />
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
