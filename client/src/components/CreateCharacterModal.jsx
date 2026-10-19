import { useEffect, useState } from "react";
import api from "../api/axios";
import BottomSheet from "./ui/BottomSheet";
import Icon from "./ui/Icon";

const abbreviations = {
  Fuerza: "FUE",
  Destreza: "DES",
  Constitución: "CON",
  Inteligencia: "INT",
  Sabiduría: "SAB",
  Carisma: "CAR",
};

export default function CreateCharacterModal({ onClose, onCreate, creating }) {
  const [templates, setTemplates] = useState([]);
  const [status, setStatus] = useState("loading");
  const [attempt, setAttempt] = useState(0);
  const [selectedId, setSelectedId] = useState("fighter");
  const [name, setName] = useState("");
  const selected = templates.find((template) => template.id === selectedId);
  const blank = selectedId === "blank";

  useEffect(() => {
    const controller = new AbortController();
    api
      .get("/character/templates", { signal: controller.signal })
      .then(({ data }) => {
        if (controller.signal.aborted) return;
        if (!Array.isArray(data) || !data.length) throw new Error("Sin plantillas");
        setTemplates(data);
        setStatus("ready");
      })
      .catch(() => {
        if (!controller.signal.aborted) setStatus("error");
      });
    return () => controller.abort();
  }, [attempt]);

  const submit = (event) => {
    event.preventDefault();
    if (creating || (!blank && !selected)) return;
    onCreate({
      name: name.trim(),
      ...(blank ? {} : { templateId: selected.id }),
    });
  };

  return (
    <BottomSheet
      title="Tu personaje, listo para jugar"
      subtitle="Creación rápida · D&D 3.5"
      onClose={() => { if (!creating) onClose(); }}
    >
      <form className="character-creator" onSubmit={submit}>
        <p className="creator-intro">
          Elige cómo quieres jugar. Nosotros preparamos los números y el equipo;
          después puedes cambiar cada detalle.
        </p>
        <fieldset className="creator-options" disabled={creating}>
          <legend>1. Elige tu estilo</legend>
          {status === "loading" && (
            <p role="status" className="helper-text">Cargando estilos de juego…</p>
          )}
          {status === "error" && (
            <div className="creator-error" role="alert">
              <p>No se pudieron cargar las plantillas.</p>
              <button
                type="button"
                className="text-button"
                onClick={() => {
                  setStatus("loading");
                  setAttempt((value) => value + 1);
                }}
              >
                Volver a intentar
              </button>
            </div>
          )}
          <div className="creator-template-grid">
            {templates.map((template) => (
              <label
                className={`creator-template ${selectedId === template.id ? "is-selected" : ""}`}
                key={template.id}
              >
                <input
                  type="radio"
                  name="template"
                  value={template.id}
                  checked={selectedId === template.id}
                  onChange={() => setSelectedId(template.id)}
                />
                <span className="creator-template-icon">
                  <Icon name={template.icon} size={23} />
                </span>
                <strong>{template.name}</strong>
                <span>{template.role}</span>
                <small>{template.difficulty}</small>
              </label>
            ))}
          </div>
          <label className="creator-blank">
            <input
              type="radio"
              name="template"
              value="blank"
              checked={blank}
              onChange={() => setSelectedId("blank")}
            />
            <span>
              <strong>Empezar desde cero</strong>
              <small>Ficha básica, para quienes prefieren elegir todo.</small>
            </span>
          </label>
        </fieldset>
        {selected && !blank && (
          <section
            className="creator-preview"
            aria-label={`Vista previa de ${selected.name}`}
          >
            <div className="creator-preview-heading">
              <h3>{selected.name}</h3>
              <span>Humano · Nivel 1</span>
            </div>
            <p>{selected.description}</p>
            <dl className="creator-stats">
              {Object.entries(selected.stats).map(([stat, value]) => (
                <div key={stat}>
                  <dt title={stat}>{abbreviations[stat]}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            <div className="creator-combat">
              <span><Icon name="heart" size={16} />{selected.hp} puntos de vida</span>
              <span><Icon name="shield" size={16} />CA {selected.armorClass}</span>
            </div>
            <details className="creator-includes">
              <summary>Ver equipo, habilidades y dotes</summary>
              <p>
                <strong>Equipo:</strong> {selected.equipment.join(", ")}, mochila y provisiones.
              </p>
              <p>
                <strong>Habilidades entrenadas:</strong> {selected.trainedSkills.join(", ")}.
              </p>
              <p><strong>Dotes:</strong> {selected.feats.join(", ")}.</p>
              {selected.spells.length > 0 && (
                <p><strong>Conjuros preparados:</strong> {selected.spells.join(", ")}.</p>
              )}
              <p>Incluye accesos rápidos y una guía en tu Diario.</p>
            </details>
            <a className="creator-source" href={selected.source} target="_blank" rel="noreferrer">
              Consultar clase en el SRD 3.5 <Icon name="book" size={14} />
            </a>
          </section>
        )}
        {blank && (
          <p className="helper-text">
            Crearás una ficha editable con atributos en 10 y sin equipo. Puedes
            configurar tu clase, vida y habilidades en Personaje.
          </p>
        )}
        <label className="form-field">
          2. Nombre de tu personaje
          <span className="creator-optional">Opcional; puedes cambiarlo después</span>
          <input
            value={name}
            maxLength={80}
            onChange={(event) => setName(event.target.value)}
            disabled={creating}
            placeholder={blank ? "Nuevo Aventurero" : `${selected?.name || "Tu personaje"} aventurero`}
            autoComplete="off"
          />
        </label>
        <p className="creator-footnote">
          Plantillas de humano de nivel 1. Usamos 15, 14, 13, 12, 10 y 8,
          repartidos según la clase. Puedes ajustar la ficha con tu DM.
        </p>
        <button
          type="submit"
          className="button primary full-width"
          disabled={creating || (!blank && !selected)}
          aria-busy={creating}
        >
          <Icon name={blank ? "plus" : "dice"} size={19} />
          {creating ? "Preparando personaje…" : blank ? "Crear ficha en blanco" : `Jugar con ${selected?.name || "este personaje"}`}
        </button>
      </form>
    </BottomSheet>
  );
}
