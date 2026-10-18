import { useState } from "react";
import EditableText from "../ui/EditableText";
import EditableNumber from "../ui/EditableNumber";
import Icon from "../ui/Icon";
import FavoriteButton from "../ui/FavoriteButton";
import DeleteSheet from "../ui/DeleteSheet";
import ResourceEditor from "./ResourceEditor";
import ActionDetails from "./ActionDetails";
import { calculateMod, lbToKg, inToCm } from "../../utils/conversions";
import { actionKey, bonus, getActions } from "../../utils/quickActions";

export default function StatsTab({
  character,
  onUpdate,
  unitSystem,
  setUnitSystem,
  onToggleFavorite,
  saving,
}) {
  const [editor, setEditor] = useState(null);
  const [selected, setSelected] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const attacks = getActions(character).filter(
    (action) => action.kind === "attack",
  );
  const selectedAction = attacks.find((action) => action.key === selected);
  const favorites = (character.quickActions || []).map(actionKey);
  const numeric = (key, label, value, extra = {}) => (
    <div className="bio-field">
      <span>{label}</span>
      <EditableNumber
        label={label}
        value={value}
        onSave={(next) => onUpdate({ [key]: next })}
        {...extra}
      />
    </div>
  );
  const text = (key, label, value) => (
    <div className="bio-field">
      <span>{label}</span>
      <EditableText
        label={label}
        value={value}
        onSave={(next) => onUpdate({ [key]: next })}
      />
    </div>
  );
  return (
    <div className="sheet-stats">
      <section className="surface">
        <div className="section-heading">
          <h2>Atributos</h2>
          <Icon name="skill" size={18} />
        </div>
        <div className="attribute-grid">
          {Object.entries(character.stats || {}).map(([name, value]) => (
            <div className="attribute" key={name}>
              <span>{name}</span>
              <EditableNumber
                label={name}
                value={value}
                min={0}
                onSave={(next) => onUpdate({ [`stats.${name}`]: next })}
              />
              <strong>{bonus(calculateMod(value))}</strong>
            </div>
          ))}
        </div>
        <p className="stats-caption">
          Toca un valor para editarlo. Sus bonos se calculan automáticamente.
        </p>
      </section>
      <section className="surface">
        <div className="section-heading">
          <h2>Tu historia</h2>
          <button
            className="text-button"
            onClick={() =>
              setUnitSystem(unitSystem === "imp" ? "metric" : "imp")
            }
          >
            {unitSystem === "imp" ? "LB / FT" : "KG / CM"}
          </button>
        </div>
        <div className="biography-grid">
          {text("race", "Raza", character.race)}
          {text("alignment", "Alineamiento", character.alignment)}
          {text("deity", "Deidad", character.deity)}
          {text("size", "Tamaño", character.size)}
          {numeric("experience", "Experiencia", character.experience, {
            min: 0,
          })}
          {text("speed", "Velocidad", character.speed)}
          {numeric(
            "height",
            `Altura (pulgadas)${unitSystem === "metric" ? ` · ${inToCm(character.height || 0)} cm` : ""}`,
            character.height,
            { min: 0 },
          )}
          {numeric(
            "physicalWeight",
            `Peso (lb)${unitSystem === "metric" ? ` · ${lbToKg(character.physicalWeight || 0)} kg` : ""}`,
            character.physicalWeight,
            { min: 0 },
          )}
        </div>
      </section>
      <section className="surface">
        <div className="section-heading">
          <h2>Defensa y combate</h2>
          <Icon name="shield" size={18} />
        </div>
        <div className="combat-edit-grid">
          {numeric("armorClass.armor", "Armadura", character.armorClass?.armor)}
          {numeric("armorClass.shield", "Escudo", character.armorClass?.shield)}
          {numeric(
            "armorClass.natural",
            "Armadura natural",
            character.armorClass?.natural,
          )}
          {numeric(
            "armorClass.misc",
            "Otros bonos de CA",
            character.armorClass?.misc,
          )}
          {numeric("baseAttack", "Ataque base", character.baseAttack)}
          {numeric(
            "initiativeMisc",
            "Bono de iniciativa",
            character.initiativeMisc,
          )}
        </div>
      </section>
      <section className="surface">
        <div className="section-heading">
          <h2>Salvaciones y vida</h2>
          <Icon name="heart" size={18} />
        </div>
        <div className="combat-edit-grid">
          {numeric("saves.fort", "Fortaleza", character.saves?.fort)}
          {numeric("saves.ref", "Reflejos", character.saves?.ref)}
          {numeric("saves.will", "Voluntad", character.saves?.will)}
          {numeric("hp.max", "Vida máxima", character.hp?.max, { min: 1 })}
        </div>
        <p className="stats-caption">
          Puedes aplicar daño y curación desde Partida.
        </p>
      </section>
      <section className="surface attacks-surface">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Prepara tu siguiente movimiento</p>
            <h2>Ataques y armas</h2>
          </div>
          <button
            className="button primary compact"
            disabled={saving}
            onClick={() => setEditor({ item: null })}
          >
            <Icon name="plus" size={17} />
            Agregar
          </button>
        </div>
        <div className="attack-list">
          {attacks.map((action) => (
            <article className="attack-tile" key={action.key}>
              <button
                className="attack-tile-main"
                onClick={() => setSelected(action.key)}
              >
                <span className="action-emblem tone-amber">
                  <Icon name="sword" />
                </span>
                <span className="action-copy">
                  <strong>{action.name}</strong>
                  <small>{action.caption}</small>
                </span>
                <span className="action-value tone-text-amber">
                  {action.value}
                </span>
              </button>
              <div className="attack-tile-footer">
                <span>
                  Crítico {action.item.critRange} / {action.item.critMultiplier}
                </span>
                <FavoriteButton
                  active={favorites.includes(action.key)}
                  disabled={saving}
                  name={action.name}
                  onClick={() => onToggleFavorite(action)}
                />
              </div>
            </article>
          ))}
        </div>
        {!attacks.length && (
          <div className="empty-state">
            <Icon name="sword" size={28} />
            <h3>Prepara tu equipo</h3>
            <p>
              Agrega un ataque y márcalo como favorito para usarlo desde
              Partida.
            </p>
          </div>
        )}
      </section>
      {selectedAction && (
        <ActionDetails
          key={selectedAction.key}
          action={selectedAction}
          character={character}
          onUpdate={onUpdate}
          onToggleFavorite={onToggleFavorite}
          saving={saving}
          onClose={() => setSelected(null)}
          onEdit={() => {
            setEditor({ item: selectedAction.item });
            setSelected(null);
          }}
          onDelete={() => {
            setDeleting(selectedAction);
            setSelected(null);
          }}
        />
      )}
      {editor && (
        <ResourceEditor
          kind="attack"
          item={editor.item}
          onClose={() => setEditor(null)}
          onSave={(data) =>
            onUpdate({
              attacks: editor.item
                ? character.attacks.map((item) =>
                    item._id === data._id ? data : item,
                  )
                : [...(character.attacks || []), data],
            })
          }
        />
      )}
      {deleting && (
        <DeleteSheet
          name={deleting.name}
          onClose={() => setDeleting(null)}
          onConfirm={() =>
            onUpdate({
              attacks: character.attacks.filter(
                (item) => item._id !== deleting.itemId,
              ),
              quickActions: (character.quickActions || []).filter(
                (entry) => actionKey(entry) !== deleting.key,
              ),
            })
          }
        />
      )}
    </div>
  );
}
