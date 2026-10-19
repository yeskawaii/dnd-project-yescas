import { modifierTargets, bonusTypes, bonusTypeLabels } from "../../utils/conversions";

export default function ModifierEditor({ value = [], onChange, disabled = false }) {
  const defenseTypes = ["armor", "shield", "natural", "deflection", "dodge"];
  const update = (index, patch) => onChange(value.map((entry, i) => i === index ? { ...entry, ...patch, ...(defenseTypes.includes(patch.target) ? { bonusType: patch.target } : {}) } : entry));
  return (
    <fieldset className="modifier-editor" disabled={disabled}>
      <legend>Modificadores vinculados</legend>
      <p className="helper-text">Se aplican mientras este recurso esté activo o equipado. Los bonos del mismo tipo usan el mayor; esquiva y bonos sin tipo de fuentes distintas se acumulan.</p>
      {value.map((entry, index) => (
        <div className="modifier-row" key={index}>
          <label className="form-field">Afecta a
            <select value={entry.target} onChange={(event) => update(index, { target: event.target.value, skillName: "", attackName: "" })}>
              {Object.entries(modifierTargets).map(([target, label]) => <option key={target} value={target}>{label}</option>)}
            </select>
          </label>
          <label className="form-field">Valor
            <input type="number" min={-100} max={100} required value={entry.value} onChange={(event) => update(index, { value: event.target.value === "" ? "" : Number(event.target.value) })} />
          </label>
          <label className="form-field">Tipo de bono
            <select disabled={defenseTypes.includes(entry.target)} value={defenseTypes.includes(entry.target) ? entry.target : entry.bonusType || "untyped"} onChange={(event) => update(index, { bonusType: event.target.value })}>
              {bonusTypes.map((type) => <option key={type} value={type}>{bonusTypeLabels[type]}</option>)}
            </select>
          </label>
          {defenseTypes.includes(entry.target) && <p className="helper-text">Registra el bono total de esta fuente, incluida su mejora mágica.</p>}
          {entry.target === "skill" && <label className="form-field">Habilidad (vacío: todas)
            <input value={entry.skillName || ""} maxLength={150} onChange={(event) => update(index, { skillName: event.target.value })} />
          </label>}
          {["attack", "damage"].includes(entry.target) && <label className="form-field">Ataque (vacío: todos)
            <input value={entry.attackName || ""} maxLength={150} onChange={(event) => update(index, { attackName: event.target.value })} />
          </label>}
          <button type="button" className="text-button" onClick={() => onChange(value.filter((_, i) => i !== index))} aria-label={`Quitar modificador ${index + 1}`}>Quitar</button>
        </div>
      ))}
      <button type="button" className="button secondary compact" disabled={value.length >= 30} onClick={() => onChange([...value, { target: "initiative", value: 0, bonusType: "untyped", skillName: "", attackName: "" }])}>Agregar modificador</button>
    </fieldset>
  );
}
