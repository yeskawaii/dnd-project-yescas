// D&D 3.5 calculations shared by the browser, template previews and server.
export const number = (value, fallback = 0) =>
  value !== null && value !== "" && Number.isFinite(Number(value)) ? Number(value) : fallback;
export const calculateMod = (value) => Math.floor((number(value, 10) - 10) / 2);
const normalize = (value) => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
export const sizeOptions = ["Minúsculo", "Diminuto", "Menudo", "Pequeño", "Mediano", "Grande", "Enorme", "Gargantuesco", "Colosal"];
export function sizeModifier(character) {
  const aliases = { fine: 8, diminutive: 4, tiny: 2, small: 1, medium: 0, large: -1, huge: -2, gargantuan: -4, colossal: -8 };
  const index = sizeOptions.findIndex((size) => normalize(size) === normalize(character.size));
  return index < 0 ? aliases[normalize(character.size)] || 0 : [8, 4, 2, 1, 0, -1, -2, -4, -8][index];
}

export const modifierTargets = {
  armor: "Armadura", shield: "Escudo", natural: "Armadura natural", deflection: "Desvío", dodge: "Esquiva",
  ac: "Otros bonos de CA", initiative: "Iniciativa", attack: "Ataque", damage: "Daño",
  fort: "Fortaleza", ref: "Reflejos", will: "Voluntad", skill: "Habilidad",
};
export const bonusTypes = ["untyped", "armor", "shield", "natural", "deflection", "dodge", "resistance", "morale", "competence", "insight", "luck", "sacred", "profane", "enhancement", "racial", "circumstance"];
export const bonusTypeLabels = { untyped: "Sin tipo", armor: "Armadura", shield: "Escudo", natural: "Armadura natural", deflection: "Desvío", dodge: "Esquiva", resistance: "Resistencia", morale: "Moral", competence: "Competencia", insight: "Introspección", luck: "Suerte", sacred: "Sagrado", profane: "Profano", enhancement: "Mejora", racial: "Racial", circumstance: "Circunstancia" };

export function activeModifiers(character) {
  return [
    ...(character.inventory || []).filter((item) => item.equipped).map((item) => ({ name: item.name, _id: item._id, modifiers: item.modifiers, sourceKind: "inventory" })),
    ...(character.feats || []).filter((feat) => feat.active !== false).map((feat) => ({ name: feat.name, _id: feat._id, modifiers: feat.modifiers, sourceKind: "feat" })),
    ...(character.effects || []).filter((effect) => effect.active !== false).map((effect) => ({ name: effect.name, _id: effect._id, modifiers: effect.modifiers, sourceKind: "effect" })),
  ].flatMap((resource, index) => (resource.modifiers || []).map((modifier) => ({
    target: modifier.target === "ac" && ["armor", "shield", "natural", "deflection", "dodge"].includes(modifier.bonusType) ? modifier.bonusType : modifier.target,
    bonusType: modifier.bonusType, skillName: modifier.skillName, attackName: modifier.attackName,
    value: number(modifier.value), source: resource.name,
    sourceId: `${resource.sourceKind}:${resource._id || index}`,
  })));
}

// Typed bonuses do not stack. Penalties from distinct sources do; repeating
// the same modifier within one resource must never apply it twice.
export function stackModifiers(entries) {
  const sources = new Map();
  for (const entry of entries) {
    const type = entry.bonusType || "untyped";
    const key = `${type}:${entry.sourceId}`;
    const current = sources.get(key) || { type, positive: 0, negative: 0 };
    current.positive = Math.max(current.positive, number(entry.value));
    current.negative = Math.min(current.negative, number(entry.value));
    sources.set(key, current);
  }
  const typed = new Map();
  let total = 0;
  for (const entry of sources.values()) {
    total += entry.negative;
    if (["untyped", "dodge", "circumstance"].includes(entry.type)) total += entry.positive;
    else typed.set(entry.type, Math.max(typed.get(entry.type) || 0, entry.positive));
  }
  return total + [...typed.values()].reduce((sum, value) => sum + value, 0);
}
export function modifierEntries(character, target, context = {}) {
  return activeModifiers(character).filter((entry) => entry.target === target &&
    (!entry.skillName || normalize(entry.skillName) === normalize(context.skillName)) &&
    (!entry.attackName || normalize(entry.attackName) === normalize(context.attackName)));
}
export const modifierTotal = (character, target, context) => stackModifiers(modifierEntries(character, target, context));

export const equippedArmor = (character) => (character.inventory || []).filter((item) => item.equipped && ["armor", "shield"].includes(item.equipmentSlot));
export function armorCheckPenalty(character, shieldOnly = false) {
  return (shieldOnly ? 0 : Math.min(0, number(character.armorClass?.checkPenalty))) +
    equippedArmor(character).filter((item) => !shieldOnly || item.equipmentSlot === "shield")
      .reduce((sum, item) => sum + Math.min(0, number(item.armorCheckPenalty)), 0);
}
export function armorBreakdown(character) {
  const armor = character.armorClass || {};
  const equipment = equippedArmor(character);
  const limits = [armor.maxDex, ...equipment.map((item) => item.maxDex)].filter((limit) => limit != null && limit !== "").map((limit) => Math.max(0, number(limit)));
  const maxDex = limits.length ? Math.min(...limits) : null;
  const dex = Math.min(calculateMod(character.stats?.Destreza), maxDex ?? Infinity);
  const parts = { base: 10, dex, size: sizeModifier(character) };
  for (const target of ["armor", "shield", "natural", "deflection", "dodge"]) {
    parts[target] = stackModifiers([
      { value: number(armor[target]), bonusType: target, sourceId: `manual:${target}` },
      ...modifierEntries(character, target).map((entry) => ({ ...entry, bonusType: target })),
      ...equipment.filter((item) => item.equipmentSlot === target).map((item, i) => ({ value: item.defenseBonus, bonusType: target, sourceId: `equipment:${item._id || i}` })),
    ]);
  }
  parts.misc = number(armor.misc) + modifierTotal(character, "ac");
  const total = Object.values(parts).reduce((sum, value) => sum + value, 0);
  const dodgeLost = Math.max(0, number(armor.dodge)) + stackModifiers(modifierEntries(character, "dodge")
    .filter((entry) => entry.value > 0).map((entry) => ({ ...entry, bonusType: "dodge" })));
  return { ...parts, maxDex, total, touch: total - parts.armor - parts.shield - parts.natural,
    flatFooted: total - Math.max(0, dex) - dodgeLost };
}
export const armorClass = (character) => armorBreakdown(character).total;
export const initiativeBonus = (character) => calculateMod(character.stats?.Destreza) + number(character.initiativeMisc) + modifierTotal(character, "initiative");
export const saveStats = { fort: "Constitución", ref: "Destreza", will: "Sabiduría" };
export function saveBreakdown(character, key) {
  const base = number(character.saves?.[key]);
  const ability = character.saves?.mode === "calculated" ? calculateMod(character.stats?.[saveStats[key]]) : 0;
  const effects = modifierTotal(character, key);
  return { base, ability, effects, total: base + ability + effects };
}
export const calculateSaveTotal = (character, key) => saveBreakdown(character, key).total;
export function convertSavesMode(character, mode) {
  return Object.fromEntries([ ["mode", mode], ...Object.keys(saveStats).map((key) => [key,
    calculateSaveTotal(character, key) - modifierTotal(character, key) - (mode === "calculated" ? calculateMod(character.stats?.[saveStats[key]]) : 0),
  ]) ]);
}

const armorSkills = ["Acrobacias", "Equilibrio", "Escapismo", "Esconderse", "Juego de Manos", "Moverse Sigilosamente", "Saltar", "Trepar"];
const trainedSkills = ["Abrir Cerraduras", "Acrobacias", "Conocimiento de Conjuros", "Descifrar Escritura", "Inutilizar Mecanismo", "Juego de Manos", "Usar Objeto Mágico"];
export function requiresTraining(skill) {
  return skill.trainedOnly ?? trainedSkills.some((name) => normalize(name) === normalize(skill.name));
}
export function canUseSkill(skill) {
  return !requiresTraining(skill) || number(skill.ranks) >= 1;
}
export const skillArmorPenalty = (skill, penalty) => normalize(skill.name) === "nadar" ? 2 * penalty :
  armorSkills.some((name) => normalize(name) === normalize(skill.name)) ? penalty : 0;
export function skillBreakdown(skill, character) {
  const stats = character.stats || character;
  const ability = calculateMod(stats?.[skill.stat]);
  const ranks = Math.floor(Math.max(0, number(skill.ranks)));
  const misc = number(skill.miscModifier);
  const penalty = skillArmorPenalty(skill, armorCheckPenalty(character));
  const effects = modifierTotal(character, "skill", { skillName: skill.name });
  return { ability, ranks, misc, penalty, effects, total: ability + ranks + misc + penalty + effects };
}
export const calculateSkillTotal = (skill, character) => skillBreakdown(skill, character).total;

export function attackBreakdown(attack, character) {
  const ranged = ["Ranged", "Thrown"].includes(attack.type);
  const finesse = !ranged && (attack.finesse || attack.type === "Finesse");
  const stat = ranged || finesse ? "Destreza" : "Fuerza";
  const base = number(character.baseAttack);
  const ability = calculateMod(character.stats?.[stat]);
  const size = sizeModifier(character);
  const extra = number(attack.attackBonus);
  const effects = modifierTotal(character, "attack", { attackName: attack.name });
  const shieldPenalty = finesse ? armorCheckPenalty(character, true) : 0;
  const compositePenalty = attack.type === "Ranged" && attack.rangedDamage === "composite" && calculateMod(character.stats?.Fuerza) < number(attack.strengthRating) ? -2 : 0;
  return { base, ability, stat, size, extra, effects, shieldPenalty, compositePenalty, total: base + ability + size + extra + effects + shieldPenalty + compositePenalty };
}
export const calculateAttackTotal = (attack, character) => attackBreakdown(attack, character).total;
export function calculateDamageBonus(attack, character) {
  const strength = calculateMod(character.stats?.Fuerza);
  let ability = strength;
  if (attack.type === "Ranged") {
    const mode = attack.rangedDamage || "none";
    ability = mode === "strength" ? strength : mode === "bow" ? Math.min(0, strength) :
      mode === "composite" ? Math.min(strength, Math.max(0, number(attack.strengthRating))) : 0;
  } else if (attack.type !== "Thrown" && strength > 0) {
    ability = attack.hands === "offHand" ? Math.floor(strength / 2) :
      attack.hands === "two" && !attack.light ? Math.floor(strength * 1.5) : strength;
  }
  return ability + number(attack.damageBonus) + modifierTotal(character, "damage", { attackName: attack.name });
}
export const weaponDamage = (rolledTotal, attack, character) => Math.max(1, number(rolledTotal) + calculateDamageBonus(attack, character));

export function equipInventory(inventory, itemId, equipped) {
  const selected = inventory.find((item) => String(item._id) === String(itemId));
  return inventory.map((item) => String(item._id) === String(itemId) ? { ...item, equipped } :
    equipped && ["armor", "shield"].includes(selected?.equipmentSlot) && item.equipmentSlot === selected.equipmentSlot ? { ...item, equipped: false } : item);
}

export function renameModifierReferences(character, field, oldName, newName) {
  if (!oldName || oldName === newName) return {};
  const patch = {};
  for (const key of ["feats", "inventory", "effects"]) {
    if (!(character[key] || []).some((resource) => (resource.modifiers || []).some((entry) => entry[field] && normalize(entry[field]) === normalize(oldName)))) continue;
    patch[key] = character[key].map((resource) => ({ ...resource, modifiers: (resource.modifiers || []).map((entry) => entry[field] && normalize(entry[field]) === normalize(oldName) ? { ...entry, [field]: newName } : entry) }));
  }
  return patch;
}

export const compareInitiative = (a, b) => number(b.initiative) - number(a.initiative) ||
  number(b.initiativeBonus) - number(a.initiativeBonus) || number(b.tieBreaker) - number(a.tieBreaker);
export function initiativeTies(combatants) {
  return combatants.filter((entry) => combatants.some((other) => other.id !== entry.id && compareInitiative(entry, other) === 0));
}
// A uniform permutation has the same final ordering as repeated tied rolls.
export function resolveInitiativeTies(combatants, random = Math.random) {
  const unresolved = initiativeTies(combatants);
  const groups = new Map();
  for (const entry of unresolved) {
    const key = `${number(entry.initiative)}:${number(entry.initiativeBonus)}`;
    groups.set(key, combatants.filter((peer) => number(peer.initiative) === number(entry.initiative) && number(peer.initiativeBonus) === number(entry.initiativeBonus)));
  }
  const ranks = new Map();
  for (const group of groups.values()) {
    const shuffled = [...group];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    shuffled.forEach((entry, index) => ranks.set(entry.id, shuffled.length - index));
  }
  return combatants.map((entry) => ranks.has(entry.id) ? { ...entry, tieBreaker: ranks.get(entry.id) } : { ...entry });
}
