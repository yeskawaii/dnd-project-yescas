import { useState } from "react";
import api from "../../api/axios";

export default function LegacyRulesPanel({ character, onUpdate, saving }) {
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  if (character.saves?.mode === "calculated") return null;
  return <section className="surface">
    <h2>Vincular una ficha anterior</h2>
    <p className="helper-text">Tus valores manuales se conservan. Si creaste esta ficha con una plantilla inicial, puedes revisar una propuesta que mueve los bonos ya incluidos a su equipo y dotes para aplicarlos una sola vez.</p>
    <button className="button secondary compact" disabled={saving || loading} onClick={async () => {
      setLoading(true); setError("");
      try { const { data } = await api.get(`/character/${character._id}/rules-upgrade`); setProposal({ ...data, snapshot: JSON.stringify(character) }); }
      catch { setError("No se pudo preparar la propuesta. Inténtalo de nuevo."); }
      finally { setLoading(false); }
    }}>{loading ? "Preparando…" : "Revisar vinculación"}</button>
    {error && <p role="alert">{error}</p>}
    {proposal && (proposal.available ? <div className="rule-breakdown">
      <p>Plantilla reconocida: {proposal.template}. Se vincularán las dotes y la protección inicial, se retirarán sus bonos manuales anteriores y se activarán las salvaciones calculadas. Comprueba los resultados antes de aplicar.</p>
      <table><thead><tr><th>Valor</th><th>Actual</th><th>Vinculado</th></tr></thead><tbody>{proposal.changes.map((change) => <tr key={change.label}><td>{change.label}</td><td>{change.before}</td><td>{change.after}</td></tr>)}</tbody></table>
      <p className="helper-text">El límite de Destreza de la armadura puede corregir la CA. Los efectos descritos en texto siguen requiriendo configurarlos en el editor.</p>
      <button className="button primary compact" disabled={saving || proposal.snapshot !== JSON.stringify(character)} onClick={async () => { if (await onUpdate(proposal.patch)) setProposal(null); }}>Aplicar vinculación</button>
      {proposal.snapshot !== JSON.stringify(character) && <p>La ficha cambió. Prepara otra propuesta antes de aplicarla.</p>}
    </div> : <p role="status">{proposal.reason}</p>)}
  </section>;
}
