import {
  calculateAttackTotal,
  calculateDamageBonus,
  calculateSkillTotal,
} from "./conversions.js";
import { resourceIcon } from "./characterCustomization.js";

export const actionTypes = {
  attack: {
    label: "Ataques",
    singular: "Ataque",
    icon: "sword",
    tone: "amber",
  },
  spell: {
    label: "Hechizos",
    singular: "Hechizo",
    icon: "magic",
    tone: "violet",
  },
  item: { label: "Objetos", singular: "Objeto", icon: "bag", tone: "mint" },
  skill: {
    label: "Habilidades",
    singular: "Habilidad",
    icon: "skill",
    tone: "blue",
  },
};
export const actionKey = ({ kind, itemId }) => `${kind}:${itemId}`;
export const bonus = (value) => `${value >= 0 ? "+" : ""}${value}`;

export function getActions(character) {
  return Object.entries({
    attack: character.attacks,
    spell: character.spells,
    item: character.inventory,
    skill: character.skills,
  }).flatMap(([kind, items]) =>
    (items || []).map((item) => {
      const action = {
        kind,
        itemId: String(item._id),
        name: item.name,
        item,
        ...actionTypes[kind],
        icon: resourceIcon(item, actionTypes[kind].icon),
      };
      if (kind === "attack") {
        action.value = bonus(calculateAttackTotal(item, character));
        action.caption = `${item.damageDice} ${bonus(calculateDamageBonus(item, character))} de daño`;
      } else if (kind === "spell") {
        action.value = `N${item.level || 0}`;
        action.caption = `${item.school || "Magia"} · ${item.prepared ? "Preparado" : "Sin preparar"}`;
      } else if (kind === "item") {
        action.value = item.icon || "bag";
        action.caption = item.desc || "Consultar objeto";
      } else {
        action.value = bonus(calculateSkillTotal(item, character.stats || {}));
        action.caption = item.stat || "Habilidad";
      }
      return { ...action, key: actionKey(action) };
    }),
  );
}

export function moveAction(order, from, to) {
  if (to < 0 || to >= order.length || from === to) return order;
  const next = [...order];
  next.splice(to, 0, next.splice(from, 1)[0]);
  return next;
}

export function rollDice(expression, random = Math.random) {
  const match = /^(\d{1,2})d(\d{1,3})(?:\s*([+-])\s*(\d{1,4}))?$/i.exec(
    expression.trim(),
  );
  if (
    !match ||
    Number(match[1]) < 1 ||
    Number(match[1]) > 30 ||
    Number(match[2]) < 2
  )
    return null;
  const rolls = Array.from(
    { length: Number(match[1]) },
    () => Math.floor(random() * Number(match[2])) + 1,
  );
  const modifier = Number(match[4] || 0) * (match[3] === "-" ? -1 : 1);
  return {
    rolls,
    modifier,
    total: rolls.reduce((sum, roll) => sum + roll, 0) + modifier,
  };
}
