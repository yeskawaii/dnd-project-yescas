import { useState } from "react";
import BottomSheet from "../ui/BottomSheet";
import Icon from "../ui/Icon";
import IconPicker from "../ui/IconPicker";
import ModifierEditor from "./ModifierEditor";
import { requiresTraining } from "../../utils/conversions";

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
  item: { name: "", weight: 0, desc: "", icon: "📦", equipped: false, equipmentSlot: "none", defenseBonus: 0, maxDex: null, armorCheckPenalty: 0, modifiers: [] },
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
    hands: "one", finesse: false, light: false, rangedDamage: "none", strengthRating: 0,
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
  feat: { name: "", type: "General", desc: "", active: true, modifiers: [] },
  effect: { name: "", desc: "", active: true, modifiers: [] },
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
    effect: "efecto",
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
        "defenseBonus", "armorCheckPenalty", "strengthRating",
      ])
        if (key in cleaned) cleaned[key] = Number(cleaned[key]) || 0;
      if ("maxDex" in cleaned) cleaned.maxDex = cleaned.maxDex == null || cleaned.maxDex === "" ? null : Number(cleaned.maxDex);
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
        {["attack", "spell", "item", "skill"].includes(kind) && (
          <details className="resource-icon-details">
            <summary>
              <Icon
                name={
                  data.visualIcon ||
                  {
                    attack: "sword",
                    spell: "magic",
                    item: "bag",
                    skill: "skill",
                  }[kind]
                }
                size={23}
              />
              <span>
                Icono de este recurso<small>Toca para elegir uno</small>
              </span>
              <Icon name="chevron" size={16} />
            </summary>
            <IconPicker
              value={data.visualIcon || ""}
              onChange={(value) => set("visualIcon", value)}
              allowDefault
              disabled={pending}
            />
          </details>
        )}
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
          <>
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
          <label className="checkbox-field"><input type="checkbox" checked={data.equipped} onChange={(event) => set("equipped", event.target.checked)} />Equipado · aplicar sus efectos</label>
          <label className="form-field">Protección
            <select value={data.equipmentSlot} onChange={(event) => set("equipmentSlot", event.target.value)}>
              <option value="none">Sin armadura ni escudo</option><option value="armor">Armadura</option><option value="shield">Escudo</option>
            </select>
          </label>
          {data.equipmentSlot !== "none" && <div className="form-grid">
            {field("defenseBonus", "Bono total de protección (incluye magia)", "number", { min: 0, max: 100 })}
            {field("maxDex", "Máximo de Destreza a CA (vacío: sin límite)", "number", { min: 0, max: 100 })}
            {field("armorCheckPenalty", "Penalización a habilidades", "number", { min: -100, max: 0 })}
          </div>}
          <p className="helper-text">Los bonos de armadura y escudo usan el mayor de sus fuentes. Si este objeto ya estaba incluido manualmente en tu ficha, retira el bono y las penalizaciones anteriores de sus ajustes manuales para que al quitarlo desaparezcan sus efectos.</p>
          </>
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
            <label className="checkbox-field"><input type="checkbox" checked={requiresTraining(data)} onChange={(event) => set("trainedOnly", event.target.checked)} />Requiere al menos 1 rango para usarla</label>
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
                  <option value="Thrown">Arrojadizo</option>
                  <option value="Finesse">Cuerpo a cuerpo con Sutileza</option>
                </select>
              </label>
              {field("damageDice", "Dados de daño", "text", {
                required: true,
                pattern: "[0-9]{1,2}[dD][0-9]{1,3}([+-][0-9]{1,4})?",
                placeholder: "1d8",
              })}
              {field("attackBonus", "Ajuste extra al ataque", "number")}
              {field("damageBonus", "Ajuste extra al daño", "number")}
              {field("critRange", "Rango crítico")}
              {field("critMultiplier", "Multiplicador crítico")}
              {field("damageType", "Tipo de daño")}
            </div>
            {!["Ranged", "Thrown"].includes(data.type) && <>
              <label className="form-field">Uso del arma<select value={data.hands} onChange={(event) => set("hands", event.target.value)}><option value="one">Una mano</option><option value="two">Dos manos</option><option value="offHand">Mano secundaria</option></select></label>
              <label className="checkbox-field"><input type="checkbox" checked={data.light} onChange={(event) => set("light", event.target.checked)} />Arma ligera (sin multiplicador por dos manos)</label>
              <label className="checkbox-field"><input type="checkbox" checked={data.finesse || data.type === "Finesse"} onChange={(event) => { set("finesse", event.target.checked); if (data.type === "Finesse") set("type", "Melee"); }} />Aplicar Sutileza: Destreza al ataque; Fuerza al daño</label>
              <p className="helper-text">Activa Sutileza solo si tienes la dote y el arma lo permite. Las penalizaciones por combatir con dos armas se registran en el ajuste extra.</p>
            </>}
            {data.type === "Ranged" && <>
              <label className="form-field">Fuerza al daño<select value={data.rangedDamage} onChange={(event) => set("rangedDamage", event.target.value)}><option value="none">Sin Fuerza (ballesta)</option><option value="bow">Arco: solo penalizador de Fuerza</option><option value="composite">Arco compuesto: Fuerza hasta su límite</option><option value="strength">Fuerza completa (honda)</option></select></label>
              {data.rangedDamage === "composite" && field("strengthRating", "Máximo bono de Fuerza del arco", "number", { min: 0, max: 100 })}
            </>}
            <p className="helper-text">Los ajustes son adicionales al ataque base, atributo y efectos vinculados. No repitas aquí esos bonos.</p>
          </>
        )}
        {["item", "feat", "effect"].includes(kind) && <>
          {kind !== "item" && <label className="checkbox-field"><input type="checkbox" checked={data.active !== false} onChange={(event) => set("active", event.target.checked)} />Activo · aplicar modificadores</label>}
          <ModifierEditor value={data.modifiers} onChange={(value) => set("modifiers", value)} disabled={pending} />
        </>}
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
