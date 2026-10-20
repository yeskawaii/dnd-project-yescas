import { useRef, useState } from "react";
import BottomSheet from "../ui/BottomSheet";
import Icon from "../ui/Icon";
import { companionKinds, emptyCompanion } from "../../utils/companions";

export default function CompanionsTab({ character, onUpdate, saving }) {
  const companions = character.companions || [];
  const [editing, setEditing] = useState(null);
  const [removing, setRemoving] = useState(null);
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const disabled = saving || busy;
  const persist = async (entries, done = () => {}) => {
    if (saving || lock.current) return;
    lock.current = true;
    setBusy(true);
    try {
      if (await onUpdate({ companions: entries })) done();
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };
  const patch = (entry, values) => persist(companions.map((item) => item._id === entry._id ? { ...item, ...values } : item));
  const field = (key, value) => setEditing((previous) => ({ ...previous, [key]: value }));
  return (
    <section>
      <div className="section-heading">
        <div><p className="eyebrow">A tu lado en la aventura</p><h2>Acompañantes <span className="count-badge">{companions.length}</span></h2></div>
        <button className="button primary compact" disabled={disabled || companions.length >= 50} onClick={() => setEditing(emptyCompanion())}><Icon name="plus" size={17} />Añadir</button>
      </div>
      <p className="helper-text">Familiares, invocaciones, homúnculos y compañeros con su propia ficha. Marca quién está presente para que el DM pueda añadirlo al encuentro.</p>
      {!companions.length && <div className="empty-state"><Icon name="paw" size={32} /><h3>La aventura se comparte</h3><p>Añade una criatura y registra sus capacidades según lo acordado con tu DM.</p></div>}
      <div className="companion-grid">
        {companions.map((entry) => (
          <article className={`surface companion-card ${entry.active ? "" : "companion-inactive"}`} key={entry._id}>
            <div className="section-heading"><div><p className="eyebrow">{companionKinds[entry.kind]}</p><h3>{entry.name}</h3></div><Icon name={entry.kind === "summon" ? "magic" : "paw"} size={26} /></div>
            <p className="helper-text">{entry.active ? "Presente" : "Ausente / desinvocado"}{entry.duration ? ` · ${entry.duration}` : ""}</p>
            <div className="companion-vitals"><strong>{entry.hp.current} / {entry.hp.max} PV</strong><span>CA {entry.ac}</span><span>Inic. {entry.initiativeBonus >= 0 ? "+" : ""}{entry.initiativeBonus}</span></div>
            <div className="dm-actions">
              <button className="button secondary compact" aria-label={`Restar un punto de vida a ${entry.name}`} disabled={disabled || entry.hp.current <= -9999} onClick={() => patch(entry, { hp: { ...entry.hp, current: entry.hp.current - 1 } })}>−1 PV</button>
              <button className="button secondary compact" aria-label={`Curar un punto de vida a ${entry.name}`} disabled={disabled || entry.hp.current >= entry.hp.max} onClick={() => patch(entry, { hp: { ...entry.hp, current: entry.hp.current + 1 } })}>+1 PV</button>
              <button className="button secondary compact" disabled={disabled} onClick={() => patch(entry, { active: !entry.active })}>{entry.active ? "Desinvocar / ausentar" : "Invocar / traer"}</button>
            </div>
            <details className="dm-detail-item"><summary>Acciones y detalles</summary><p>Velocidad: {entry.speed || "—"}</p><p className="dm-prose">{entry.actions || "Sin acciones registradas."}</p><p className="dm-prose">{entry.description}</p></details>
            <div className="dm-actions">
              <button className="text-button" disabled={disabled} onClick={() => setEditing({ ...entry, hp: { ...entry.hp } })}><Icon name="edit" size={16} />Editar ficha</button>
              <button className="text-button dm-danger" disabled={disabled} onClick={() => setRemoving(entry)} aria-label={`Eliminar ${entry.name}`}><Icon name="trash" size={16} />Eliminar</button>
            </div>
          </article>
        ))}
      </div>
      <p className="helper-text">Las capacidades y duraciones se registran manualmente. El DM usa una copia para el combate: los cambios de vida del encuentro y de esta ficha son independientes.</p>
      {editing && <BottomSheet title={editing._id ? "Editar acompañante" : "Nuevo acompañante"} subtitle="Una ficha propia" onClose={() => { if (!disabled) setEditing(null); }}>
        <form onSubmit={(event) => {
          event.preventDefault();
          const entry = { ...editing, name: editing.name.trim() };
          if (!entry.name) return;
          persist(entry._id ? companions.map((item) => item._id === entry._id ? entry : item) : [...companions, entry], () => setEditing(null));
        }}>
          <fieldset className="companion-form" disabled={disabled}>
            <label className="form-field">Nombre<input autoFocus required maxLength={120} value={editing.name} onChange={(event) => field("name", event.target.value)} /></label>
            <label className="form-field">Vínculo<select value={editing.kind} onChange={(event) => field("kind", event.target.value)}>{Object.entries(companionKinds).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
            <div className="companion-form-stats">
              {[["current", "PV actuales", -9999, 99999], ["max", "PV máximos", 1, 99999]].map(([key, label, min, max]) => <label className="form-field" key={key}>{label}<input type="number" required min={min} max={max} step="1" value={editing.hp[key]} onChange={(event) => field("hp", { ...editing.hp, [key]: event.target.value === "" ? "" : Number(event.target.value) })} /></label>)}
              {[["ac", "Clase de armadura", -100, 1000], ["initiativeBonus", "Bono de iniciativa", -100, 100]].map(([key, label, min, max]) => <label className="form-field" key={key}>{label}<input type="number" required min={min} max={max} step="1" value={editing[key]} onChange={(event) => field(key, event.target.value === "" ? "" : Number(event.target.value))} /></label>)}
            </div>
            <label className="form-field">Velocidad<input maxLength={120} value={editing.speed} onChange={(event) => field("speed", event.target.value)} placeholder="30 ft, volar 60 ft…" /></label>
            <label className="form-field">Duración o condición de permanencia<input maxLength={200} value={editing.duration} onChange={(event) => field("duration", event.target.value)} placeholder="Permanente, 5 asaltos, hasta descansar…" /></label>
            <label className="form-field">Ataques, acciones y habilidades<textarea rows={5} maxLength={12000} value={editing.actions} onChange={(event) => field("actions", event.target.value)} placeholder="Ataque, bonificador, daño, salvaciones y capacidades especiales…" /></label>
            <label className="form-field">Descripción y notas<textarea rows={3} maxLength={12000} value={editing.description} onChange={(event) => field("description", event.target.value)} /></label>
            <label className="companion-presence"><input type="checkbox" checked={editing.active} onChange={(event) => field("active", event.target.checked)} />Presente / invocado</label>
            <button type="submit" className="button primary">{disabled ? "Guardando…" : "Guardar acompañante"}</button>
          </fieldset>
        </form>
      </BottomSheet>}
      {removing && <BottomSheet title="Eliminar acompañante" onClose={() => { if (!disabled) setRemoving(null); }}><p>Se eliminará la ficha de {removing.name}. Puedes marcarlo ausente para conservarla. Las copias en encuentros del DM se conservan.</p><div className="button-row"><button className="button secondary" disabled={disabled} onClick={() => setRemoving(null)}>Cancelar</button><button className="button primary" disabled={disabled} onClick={() => persist(companions.filter((entry) => entry._id !== removing._id), () => setRemoving(null))}>Eliminar ficha</button></div></BottomSheet>}
    </section>
  );
}
