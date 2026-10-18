import { useState } from "react";
import BottomSheet from "../ui/BottomSheet";
import Icon from "../ui/Icon";

const schools = [
  "Abjuración",
  "Adivinación",
  "Conjuración",
  "Encantamiento",
  "Evocación",
  "Ilusión",
  "Necromancia",
  "Transmutación",
];
const defaults = {
  item: { name: "", weight: 0, desc: "", icon: "📦" },
  spell: { name: "", level: 0, school: "Evocación", desc: "", prepared: false },
  attack: {
    name: "",
    type: "Melee",
    damageDice: "1d8",
    attackBonus: 0,
    damageBonus: 0,
    critRange: "20",
    critMultiplier: "x2",
    damageType: "Cortante",
  },
  note: { title: "", content: "", color: "cyan" },
  skill: {
    name: "",
    stat: "Inteligencia",
    ranks: 0,
    miscModifier: 0,
    isClassSkill: false,
  },
  trait: { name: "", description: "", source: "" },
  feat: { name: "", type: "General", desc: "" },
};

export default function ResourceEditor({ kind, item, onClose, onSave }) {
  const [data, setData] = useState(() => ({ ...defaults[kind], ...item }));
  const [pending, setPending] = useState(false);
  const names = {
    item: "objeto",
    spell: "hechizo",
    attack: "ataque",
    note: "nota",
    skill: "habilidad",
    trait: "rasgo",
    feat: "dote",
  };
  const set = (field, value) =>
    setData((previous) => ({ ...previous, [field]: value }));
  const field = (key, label, type = "text", extra = {}) => (
    <label className="form-field">
      {label}
      <input
        type={type}
        value={data[key] ?? ""}
        onChange={(event) =>
          set(
            key,
            type === "number"
              ? event.target.value === ""
                ? ""
                : Number(event.target.value)
              : event.target.value,
          )
        }
        {...extra}
      />
    </label>
  );
  const save = async (event) => {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    try {
      const cleaned = { ...data };
      for (const key of ["name", "title", "desc", "content"])
        if (typeof cleaned[key] === "string")
          cleaned[key] = cleaned[key].trim();
      for (const key of [
        "weight",
        "level",
        "attackBonus",
        "damageBonus",
        "ranks",
        "miscModifier",
      ])
        if (key in cleaned) cleaned[key] = Number(cleaned[key]) || 0;
      const result = await onSave(cleaned);
      if (result) onClose();
    } finally {
      setPending(false);
    }
  };
  return (
    <BottomSheet
      title={`${item ? "Editar" : "Nuevo"} ${names[kind]}`}
      subtitle="Hazlo parte de tu aventura"
      onClose={() => {
        if (!pending) onClose();
      }}
    >
      <form className="resource-form" onSubmit={save}>
        {kind === "note"
          ? field("title", "Título", "text", {
              required: true,
              maxLength: 120,
              placeholder: "Una pista, un encuentro, una idea…",
            })
          : field("name", "Nombre", "text", {
              required: true,
              maxLength: 150,
              placeholder: `Nombre del ${names[kind]}`,
            })}
        {kind === "item" && (
          <div className="form-grid">
            {field("weight", "Peso en libras", "number", {
              min: 0,
              step: "any",
            })}
            <label className="form-field">
              Categoría
              <select
                value={data.icon}
                onChange={(event) => set("icon", event.target.value)}
              >
                <option value="📦">Objeto</option>
                <option value="⚔️">Arma</option>
                <option value="🛡️">Armadura</option>
                <option value="🧪">Poción</option>
                <option value="📜">Documento</option>
              </select>
            </label>
          </div>
        )}
        {kind === "spell" && (
          <>
            <div className="form-grid">
              {field("level", "Nivel", "number", { min: 0, max: 9 })}
              <label className="form-field">
                Escuela
                <select
                  value={data.school}
                  onChange={(event) => set("school", event.target.value)}
                >
                  {schools.map((school) => (
                    <option key={school}>{school}</option>
                  ))}
                </select>
              </label>
            </div>
            <label className="checkbox-field">
              <input
                type="checkbox"
                checked={data.prepared}
                onChange={(event) => set("prepared", event.target.checked)}
              />
              Preparado para la partida
            </label>
          </>
        )}
        {kind === "skill" && (
          <>
            <div className="form-grid">
              <label className="form-field">
                Atributo
                <select
                  value={data.stat}
                  onChange={(event) => set("stat", event.target.value)}
                >
                  {[
                    "Fuerza",
                    "Destreza",
                    "Constitución",
                    "Inteligencia",
                    "Sabiduría",
                    "Carisma",
                  ].map((stat) => (
                    <option key={stat}>{stat}</option>
                  ))}
                </select>
              </label>
              {field("ranks", "Rangos", "number", { min: 0, step: "any" })}
              {field("miscModifier", "Otros bonos", "number")}
            </div>
            <label className="checkbox-field">
              <input
                type="checkbox"
                checked={data.isClassSkill}
                onChange={(event) => set("isClassSkill", event.target.checked)}
              />
              Es una habilidad de clase
            </label>
          </>
        )}
        {kind === "trait" &&
          field("source", "Origen", "text", { placeholder: "Raza, clase…" })}
        {kind === "feat" &&
          field("type", "Tipo de dote", "text", { required: true })}
        {kind === "attack" && (
          <>
            <div className="form-grid">
              <label className="form-field">
                Tipo
                <select
                  value={data.type}
                  onChange={(event) => set("type", event.target.value)}
                >
                  <option value="Melee">Cuerpo a cuerpo</option>
                  <option value="Ranged">A distancia</option>
                </select>
              </label>
              {field("damageDice", "Dados de daño", "text", {
                required: true,
                pattern: "[0-9]{1,2}[dD][0-9]{1,3}([+-][0-9]{1,4})?",
                placeholder: "1d8",
              })}
              {field("attackBonus", "Bono al ataque", "number")}
              {field("damageBonus", "Bono al daño", "number")}
              {field("critRange", "Rango crítico")}
              {field("critMultiplier", "Multiplicador crítico")}
              {field("damageType", "Tipo de daño")}
            </div>
          </>
        )}
        {kind !== "attack" && kind !== "skill" && (
          <label className="form-field">
            {kind === "note" ? "Tu historia" : "Descripción y efectos"}
            <textarea
              rows={5}
              value={
                kind === "note"
                  ? data.content
                  : kind === "trait"
                    ? data.description
                    : data.desc
              }
              required={kind === "note" || kind === "feat"}
              onChange={(event) =>
                set(
                  kind === "note"
                    ? "content"
                    : kind === "trait"
                      ? "description"
                      : "desc",
                  event.target.value,
                )
              }
              placeholder={
                kind === "note"
                  ? "Escribe lo que quieras recordar…"
                  : "Lo que necesitas recordar durante la partida…"
              }
            />
          </label>
        )}
        <button
          type="submit"
          className="button primary full-width"
          disabled={pending}
        >
          <Icon name="check" />
          {pending ? "Guardando…" : "Guardar"}
        </button>
      </form>
    </BottomSheet>
  );
}
