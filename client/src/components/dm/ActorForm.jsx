import { useState } from "react";
import BottomSheet from "../ui/BottomSheet";
import { newId } from "../../utils/dmWorkspace";

export default function ActorForm({ actor, onSave, onClose }) {
  const [draft, setDraft] = useState(
    actor || {
      id: newId(),
      name: "",
      kind: "monster",
      hp: 10,
      maxHp: 10,
      ac: 10,
      initiativeBonus: 0,
      actions: "",
      description: "",
    },
  );
  const change = (key, value) =>
    setDraft((previous) => ({ ...previous, [key]: value }));
  return (
    <BottomSheet
      title={actor ? "Editar criatura" : "Nueva criatura"}
      subtitle="Biblioteca privada del DM"
      onClose={onClose}
    >
      <form
        className="resource-form"
        onSubmit={(event) => {
          event.preventDefault();
          onSave({ ...draft, name: draft.name.trim(), hp: draft.maxHp });
        }}
      >
        <label className="form-field">
          Nombre
          <input
            required
            maxLength={120}
            value={draft.name}
            onChange={(event) => change("name", event.target.value)}
            placeholder="Ej. Guardián de la cripta"
          />
        </label>
        <label className="form-field">
          Tipo
          <select
            value={draft.kind}
            onChange={(event) => change("kind", event.target.value)}
          >
            <option value="monster">Monstruo</option>
            <option value="npc">NPC</option>
            <option value="ally">Aliado</option>
          </select>
        </label>
        <div className="form-grid">
          {[
            ["maxHp", "Vida máxima", 1, 99999],
            ["ac", "Clase de armadura", -100, 1000],
            ["initiativeBonus", "Bono de iniciativa", -100, 100],
          ].map(([key, label, min, max]) => (
            <label className="form-field" key={key}>
              {label}
              <input
                required
                type="number"
                min={min}
                max={max}
                step="1"
                value={draft[key]}
                onChange={(event) =>
                  change(
                    key,
                    event.target.value === "" ? "" : Number(event.target.value),
                  )
                }
              />
            </label>
          ))}
        </div>
        <label className="form-field">
          Acciones y habilidades
          <textarea
            rows={5}
            maxLength={12000}
            value={draft.actions}
            onChange={(event) => change("actions", event.target.value)}
            placeholder="Espada: +5 al ataque, 1d8+3 de daño. Añade aquí resistencias, habilidades y conjuros."
          />
        </label>
        <label className="form-field">
          Historia, voz y motivaciones
          <textarea
            rows={4}
            maxLength={12000}
            value={draft.description}
            onChange={(event) => change("description", event.target.value)}
            placeholder="Qué quiere, qué sabe y cómo interpretarlo…"
          />
        </label>
        <p className="helper-text">
          Cada copia entra al combate con su propia vida. Editar la biblioteca
          no modifica los encuentros en curso.
        </p>
        <button
          className="button primary"
          disabled={!draft.name.trim()}
          type="submit"
        >
          Guardar en biblioteca
        </button>
      </form>
    </BottomSheet>
  );
}
