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
  const roll = (damage = false) => {
    let expression = "1d20";
    let modifier = 0;
    if (action.kind === "attack") {
      expression = damage ? item.damageDice : "1d20";
      modifier = damage
        ? calculateDamageBonus(item, character)
        : calculateAttackTotal(item, character);
    } else if (action.kind === "skill")
      modifier = calculateSkillTotal(item, character.stats || {});
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
      total: rolled.total + modifier,
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
      {(action.kind === "attack" || action.kind === "skill") && (
        <>
          <div className="button-row">
            <button
              className="button primary"
              onClick={() => roll()}
              disabled={rolling}
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
        <p className="helper-text">
          Consulta sus efectos y aplícalos en la ficha. Los objetos no se
          consumen automáticamente.
        </p>
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
