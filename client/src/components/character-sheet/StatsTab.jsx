import { useState } from "react";
import EditableText from "../ui/EditableText";
import EditableNumber from "../ui/EditableNumber";
import Icon from "../ui/Icon";
import FavoriteButton from "../ui/FavoriteButton";
import DeleteSheet from "../ui/DeleteSheet";
import ResourceEditor from "./ResourceEditor";
import ActionDetails from "./ActionDetails";
import CombatStats from "./CombatStats";
import EffectsPanel from "./EffectsPanel";
import LegacyRulesPanel from "./LegacyRulesPanel";
import { calculateMod, lbToKg, inToCm, sizeOptions, calculateSaveTotal, saveBreakdown, convertSavesMode, renameModifierReferences } from "../../utils/conversions";
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
      <LegacyRulesPanel character={character} onUpdate={onUpdate} saving={saving} />
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
          Toca un valor para editarlo. Ataques, habilidades, CA e iniciativa se recalculan. Las salvaciones siguen el modo elegido abajo; vida máxima y ataque base se ajustan manualmente al subir de nivel.
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
          <label className="bio-field">Tamaño<select value={character.size || "Mediano"} disabled={saving} onChange={(event) => onUpdate({ size: event.target.value })}>
            {!sizeOptions.includes(character.size || "Mediano") && <option value={character.size}>{character.size}</option>}
            {sizeOptions.map((size) => <option key={size}>{size}</option>)}
          </select></label>
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
          <h2>Clase de armadura</h2>
          <Icon name="shield" size={18} />
        </div>
        <CombatStats character={character} />
        <p className="stats-caption">Ajustes manuales. El equipo equipado, las dotes y los efectos aportan sus propios bonos. Retira de estos ajustes cualquier bono que hayas vinculado a un recurso.</p>
        <div className="combat-edit-grid">
          {numeric("armorClass.armor", "Bono manual de armadura", character.armorClass?.armor)}
          {numeric("armorClass.shield", "Bono manual de escudo", character.armorClass?.shield)}
          {numeric(
            "armorClass.natural",
            "Armadura natural",
            character.armorClass?.natural,
          )}
          {numeric(
            "armorClass.misc",
            "Otros bonos manuales de CA",
            character.armorClass?.misc,
          )}
          {numeric("armorClass.deflection", "Desvío manual", character.armorClass?.deflection)}
          {numeric("armorClass.dodge", "Esquiva manual", character.armorClass?.dodge)}
          {numeric("armorClass.checkPenalty", "Penalización manual a habilidades", character.armorClass?.checkPenalty, { min: -100, max: 0 })}
          <div className="bio-field"><span>Límite manual de Destreza a CA</span>
            <label className="checkbox-field"><input type="checkbox" disabled={saving} checked={character.armorClass?.maxDex != null} onChange={(event) => onUpdate({ "armorClass.maxDex": event.target.checked ? 0 : null })} />Aplicar límite</label>
            {character.armorClass?.maxDex != null && <EditableNumber label="Máximo manual de Destreza" value={character.armorClass.maxDex} min={0} max={100} onSave={(value) => onUpdate({ "armorClass.maxDex": value })} />}
          </div>
        </div>
      </section>
      <section className="surface">
        <h2>Iniciativa y ataque</h2>
        <div className="combat-edit-grid">
          {numeric("baseAttack", "Ataque base (BAB)", character.baseAttack)}
          {numeric(
            "initiativeMisc",
            "Ajuste manual de iniciativa",
            character.initiativeMisc,
          )}
        </div>
        <p className="stats-caption">Estos valores no se suman a la CA. El bono de iniciativa añade Destreza y efectos; el ataque base se añade a cada ataque.</p>
      </section>
      <section className="surface">
        <div className="section-heading">
          <h2>Salvaciones y vida</h2>
          <Icon name="heart" size={18} />
        </div>
        <div className="combat-edit-grid">
          {[["fort", "Fortaleza"], ["ref", "Reflejos"], ["will", "Voluntad"]].map(([key, label]) => {
            const parts = saveBreakdown(character, key);
            return <div key={key}>
              <strong>{label}: {bonus(calculateSaveTotal(character, key))}</strong>
              {numeric(`saves.${key}`, character.saves?.mode === "calculated" ? `${label}: base y ajustes manuales` : `${label}: total manual sin efectos vinculados`, character.saves?.[key])}
              <small>{character.saves?.mode === "calculated" ? `Base ${bonus(parts.base)} · atributo ${bonus(parts.ability)} · efectos ${bonus(parts.effects)}` : `Manual ${bonus(parts.base)} · efectos ${bonus(parts.effects)}`}</small>
            </div>;
          })}
          {numeric("hp.max", "Vida máxima", character.hp?.max, { min: 1 })}
        </div>
        <label className="checkbox-field"><input type="checkbox" disabled={saving} checked={character.saves?.mode === "calculated"} onChange={(event) => onUpdate({ saves: convertSavesMode(character, event.target.checked ? "calculated" : "manual") })} />Recalcular salvaciones al cambiar atributos</label>
        <p className="stats-caption">
          Cambiar de modo conserva los totales actuales. En modo automático se suman base, atributo y efectos. La base se ajusta al subir de nivel. Puedes aplicar daño y curación desde Partida.
        </p>
      </section>
      <EffectsPanel character={character} onUpdate={onUpdate} saving={saving} />
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
              ...renameModifierReferences(character, "attackName", editor.item?.name, data.name),
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
