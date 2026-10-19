import { useState } from "react";
import ResourceEditor from "./ResourceEditor";
import DeleteSheet from "../ui/DeleteSheet";
import { bonus } from "../../utils/quickActions";
import { modifierTargets } from "../../utils/conversions";

export default function EffectsPanel({ character, onUpdate, saving }) {
  const [editor, setEditor] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const effects = character.effects || [];
  return (
    <section className="surface">
      <div className="section-heading"><h2>Efectos y bonos temporales</h2><button className="button primary compact" disabled={saving} onClick={() => setEditor({ item: null })}>Agregar efecto</button></div>
      <p className="helper-text">Registra el origen del bono, por ejemplo Armadura de mago o Bendecir. Actívalo al aplicarlo y desactívalo cuando termine. La duración se controla con la mesa.</p>
      {effects.map((effect) => <div className="effect-row" key={effect._id}>
        <label className="checkbox-field"><input type="checkbox" checked={effect.active !== false} disabled={saving} onChange={(event) => onUpdate({ effects: effects.map((entry) => entry._id === effect._id ? { ...entry, active: event.target.checked } : entry) })} />{effect.name}</label>
        <small>{(effect.modifiers || []).map((entry) => `${bonus(entry.value)} ${modifierTargets[entry.target]}`).join(" · ")}</small>
        <div className="button-row"><button className="text-button" disabled={saving} onClick={() => setEditor({ item: effect })}>Editar</button><button className="text-button" disabled={saving} onClick={() => setDeleting(effect)}>Eliminar</button></div>
      </div>)}
      {editor && <ResourceEditor kind="effect" item={editor.item} onClose={() => setEditor(null)} onSave={(data) => onUpdate({ effects: editor.item ? effects.map((entry) => entry._id === data._id ? data : entry) : [...effects, data] })} />}
      {deleting && <DeleteSheet name={deleting.name} onClose={() => setDeleting(null)} onConfirm={() => onUpdate({ effects: effects.filter((entry) => entry._id !== deleting._id) })} />}
    </section>
  );
}
