import { useState } from "react";
import BottomSheet from "../ui/BottomSheet";
import Icon from "../ui/Icon";
import FavoriteButton from "../ui/FavoriteButton";
import IconPicker from "../ui/IconPicker";
import { actionKey, bonus, rollDice } from "../../utils/quickActions";
import {
  calculateAttackTotal,
  calculateDamageBonus,
  calculateSkillTotal,
  canUseSkill,
  weaponDamage,
  attackBreakdown,
  skillBreakdown,
  equipInventory,
} from "../../utils/conversions";

export default function ActionDetails({
  action,
  character,
  onClose,
  onToggleFavorite,
  saving,
  onUpdate,
  onEdit,
  onDelete,
}) {
  const [result, setResult] = useState(null);
  const [rolling, setRolling] = useState(false);
  const favorite = (character.quickActions || []).some(
    (entry) => actionKey(entry) === action.key,
  );
  const item = action.item;
  const usable = action.kind !== "skill" || canUseSkill(item);
  const attackParts = action.kind === "attack" ? attackBreakdown(item, character) : null;
  const skillParts = action.kind === "skill" ? skillBreakdown(item, character) : null;
  const roll = (damage = false) => {
    if (!usable) return;
    let expression = "1d20";
    let modifier = 0;
    if (action.kind === "attack") {
      expression = damage ? item.damageDice : "1d20";
      modifier = damage
        ? calculateDamageBonus(item, character)
        : calculateAttackTotal(item, character);
    } else if (action.kind === "skill")
      modifier = calculateSkillTotal(item, character);
    const rolled = rollDice(expression);
    if (!rolled) {
      setResult({
        error:
          "La fórmula de daño no es válida. Usa un formato como 1d8 o 2d6+2.",
      });
      return;
    }
    setRolling(true);
    setResult({
      ...rolled,
      modifier: rolled.modifier + modifier,
      total: damage ? weaponDamage(rolled.total, item, character) : rolled.total + modifier,
      minimumDamage: damage && rolled.total + modifier < 1,
      expression,
      damage,
    });
    window.setTimeout(() => setRolling(false), 240);
  };

  return (
    <BottomSheet
      title={action.name}
      subtitle={action.singular}
      onClose={onClose}
    >
      <div className="detail-summary">
        <span className={`action-emblem tone-${action.tone}`}>
          <Icon name={action.icon} size={26} />
        </span>
        <div>
          <strong>{action.caption}</strong>
          <p>
            {action.kind === "attack"
              ? `${item.damageType} · Crítico ${item.critRange} / ${item.critMultiplier}`
              : action.kind === "item"
                ? `${item.weight || 0} lb · Objeto de tu mochila`
                : action.kind === "skill"
                  ? `Rangos: ${item.ranks || 0} · Otros bonos: ${item.miscModifier || 0}`
                  : `Nivel ${item.level || 0}`}
          </p>
        </div>
        <FavoriteButton
          active={favorite}
          name={action.name}
          disabled={saving}
          onClick={() => onToggleFavorite(action)}
        />
      </div>
      <p className="detail-description">
        {item.desc ||
          item.description ||
          (action.kind === "attack"
            ? "Consulta tus bonos y realiza tus tiradas desde aquí. La mesa decide cómo aplicar el resultado."
            : action.kind === "skill"
              ? "Tira un d20 con el bono de tu ficha. Consulta con tu DM la dificultad de la prueba."
              : "Todavía no hay una descripción para este recurso.")}
      </p>
      {attackParts && <p className="helper-text">Ataque {bonus(attackParts.total)} = BAB {bonus(attackParts.base)} · {attackParts.stat} {bonus(attackParts.ability)} · tamaño {bonus(attackParts.size)} · ajuste {bonus(attackParts.extra)} · efectos {bonus(attackParts.effects)} · escudo con Sutileza {bonus(attackParts.shieldPenalty)} · arco compuesto {bonus(attackParts.compositePenalty)}. Daño: {item.damageDice} {bonus(calculateDamageBonus(item, character))}.</p>}
      {skillParts && <p className="helper-text">Atributo {bonus(skillParts.ability)} · rangos completos {skillParts.ranks} · ajuste {bonus(skillParts.misc)} · armadura {bonus(skillParts.penalty)} · efectos {bonus(skillParts.effects)}. Los medios rangos se conservan, pero solo los rangos completos mejoran la tirada.</p>}
      {!usable && <p className="helper-text" role="status">Esta habilidad requiere al menos 1 rango para usarla.</p>}
      {action.kind === "skill" && item.name?.startsWith("Saber (") && item.ranks < 1 && <p className="helper-text">Sin entrenamiento, Saber solo permite conocimientos comunes de CD 10 o menor.</p>}
      {(action.kind === "attack" || action.kind === "skill") && (
        <>
          <div className="button-row">
            <button
              className="button primary"
              onClick={() => roll()}
              disabled={rolling || !usable}
            >
              <Icon name="dice" />
              {action.kind === "attack" ? "Tirar ataque" : "Tirar habilidad"}
            </button>
            {action.kind === "attack" && (
              <button
                className="button secondary"
                onClick={() => roll(true)}
                disabled={rolling}
              >
                Tirar daño
              </button>
            )}
          </div>
          {result && (
            <div
              className={`dice-result ${rolling ? "is-rolling" : ""}`}
              role="status"
              aria-live="polite"
            >
              {result.error ? (
                <p>{result.error}</p>
              ) : (
                <>
                  <span className="eyebrow">
                    {result.damage ? "Daño" : "Resultado de la tirada"}
                  </span>
                  <strong>{result.total}</strong>
                  <p>
                    {result.rolls.join(" + ")} {bonus(result.modifier)} ·{" "}
                    {result.expression}
                  </p>
                  {result.minimumDamage && <p>Daño mínimo de un impacto: 1. Aplica después resistencia, reducción de daño u otros efectos con tu DM.</p>}
                </>
              )}
            </div>
          )}
        </>
      )}
      {action.kind === "spell" && (
        <button
          className="button primary full-width"
          disabled={saving}
          onClick={() =>
            onUpdate({
              spells: character.spells.map((spell) =>
                spell._id === item._id
                  ? { ...spell, prepared: !spell.prepared }
                  : spell,
              ),
            })
          }
        >
          <Icon name={item.prepared ? "check" : "magic"} />
          {item.prepared
            ? "Preparado · Quitar preparación"
            : "Preparar hechizo"}
        </button>
      )}
      {action.kind === "item" && (
        <>
          <label className="checkbox-field"><input type="checkbox" disabled={saving} checked={Boolean(item.equipped)} onChange={(event) => onUpdate({ inventory: equipInventory(character.inventory, item._id, event.target.checked) })} />Equipado · aplicar protección y modificadores</label>
          <p className="helper-text">Solo la protección y los modificadores registrados en el editor se aplican automáticamente. Las descripciones son recordatorios. Los objetos no se consumen automáticamente.</p>
        </>
      )}
      {onUpdate && (
        <details className="resource-icon-details action-icon-customizer">
          <summary>
            <Icon name={action.icon} size={23} />
            <span>
              Icono de este recurso<small>Dale un símbolo propio</small>
            </span>
            <Icon name="chevron" size={16} />
          </summary>
          <IconPicker
            value={item.visualIcon || ""}
            allowDefault
            disabled={saving}
            onChange={(visualIcon) => {
              const collection = {
                attack: "attacks",
                spell: "spells",
                item: "inventory",
                skill: "skills",
              }[action.kind];
              onUpdate({
                [collection]: character[collection].map((entry) =>
                  String(entry._id) === String(item._id)
                    ? { ...entry, visualIcon }
                    : entry,
                ),
              });
            }}
          />
        </details>
      )}
      {(onEdit || onDelete) && (
        <div className="detail-footer">
          {onEdit && (
            <button className="button secondary" onClick={onEdit}>
              <Icon name="edit" />
              Editar
            </button>
          )}
          {onDelete && (
            <button
              className="button danger"
              disabled={saving}
              onClick={onDelete}
            >
              <Icon name="trash" />
              Eliminar
            </button>
          )}
        </div>
      )}
    </BottomSheet>
  );
}
