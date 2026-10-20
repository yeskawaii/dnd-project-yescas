import { companionKinds } from "../../utils/companions";
import { companionSourceId } from "../../utils/dmWorkspace";

export default function PartyCompanions({ player, combatants, onAdd }) {
  const companions = player.companions || [];
  return <section className="dm-companions">
    <h3>Acompañantes de {player.name}</h3>
    {!companions.length && <p className="helper-text">Este personaje aún no tiene acompañantes.</p>}
    {companions.map((entry) => {
      const included = combatants.some((actor) => actor.sourceId === companionSourceId(player, entry));
      return <div className="dm-detail-item" key={entry._id}>
        <strong>{entry.name}</strong><p className="helper-text">{companionKinds[entry.kind]} · {entry.active ? "Presente" : "Ausente / desinvocado"} · {entry.hp.current}/{entry.hp.max} PV · CA {entry.ac}</p>
        <details><summary>Consultar capacidades</summary><p>Velocidad: {entry.speed || "—"}{entry.duration ? ` · Duración: ${entry.duration}` : ""}</p><p className="dm-prose">{entry.actions || "Sin acciones registradas."}</p><p className="dm-prose">{entry.description}</p></details>
        <button className="button secondary compact" disabled={!entry.active || included || combatants.length >= 100} onClick={() => onAdd(player, entry)}>{included ? "En el encuentro" : "Añadir acompañante al encuentro"}</button>
      </div>;
    })}
    {companions.length > 0 && <p className="helper-text">Se añade una copia con turno y ficha propios. La vida y la presencia de la ficha original no cambian el encuentro. Usa Actualizar fichas para consultar cambios del jugador.</p>}
  </section>;
}
