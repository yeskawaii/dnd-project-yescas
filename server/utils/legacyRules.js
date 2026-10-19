import { getCharacterTemplate } from "../data/characterTemplates.js";
import { number, armorClass, initiativeBonus, calculateSaveTotal, calculateMod, saveStats, modifierTotal, skillArmorPenalty, calculateAttackTotal, calculateSkillTotal } from "../../shared/characterRules.mjs";

// Read-only proposal for identifiable old starter sheets. Unknown/manual builds
// are never inferred from item or feat names alone. The owner reviews the patch.
export function proposeLegacyRulesUpgrade(document) {
  const character = JSON.parse(JSON.stringify(document));
  const unavailable = { available: false, reason: "Esta ficha ya usa bonos vinculados o fue personalizada. Vincula sus recursos desde el editor y retira los valores correspondientes de los ajustes manuales." };
  if (character.saves?.mode === "calculated" || character.effects?.length ||
    [...(character.inventory || []), ...(character.feats || [])].some((entry) => entry.modifiers?.length || entry.equipped)) return unavailable;
  const template = ["fighter", "rogue", "wizard", "cleric"].map(getCharacterTemplate).find((entry) =>
    character.notes?.some((note) => note.title === `Primeros pasos · ${entry.name}` && note.content?.includes(entry.source)));
  if (!template) return unavailable;
  const references = template.sheet.feats.flatMap((feat) => feat.modifiers || []);
  if (references.some((entry) => entry.attackName && character.attacks?.filter((attack) => attack.name === entry.attackName).length !== 1 ||
    entry.skillName && character.skills?.filter((skill) => skill.name === entry.skillName).length !== 1)) return unavailable;
  const gear = template.sheet.inventory.filter((item) => item.equipmentSlot);
  const armor = gear.filter((item) => item.equipmentSlot === "armor").reduce((sum, item) => sum + item.defenseBonus, 0);
  const shield = gear.filter((item) => item.equipmentSlot === "shield").reduce((sum, item) => sum + item.defenseBonus, 0);
  if (number(character.armorClass?.armor) !== armor || number(character.armorClass?.shield) !== shield || number(character.armorClass?.checkPenalty) !== 0 ||
    gear.some((item) => character.inventory?.filter((entry) => entry.name === item.name).length !== 1) ||
    template.sheet.feats.some((feat) => character.feats?.filter((entry) => entry.name === feat.name && entry.active !== false).length !== 1)) return unavailable;
  const patch = {
    inventory: (character.inventory || []).map((item) => {
      const reference = gear.find((entry) => entry.name === item.name);
      return reference ? { ...item, equipmentSlot: reference.equipmentSlot, defenseBonus: reference.defenseBonus, armorCheckPenalty: reference.armorCheckPenalty, maxDex: reference.maxDex, equipped: true } : item;
    }),
    feats: character.feats.map((feat) => ({ ...feat, modifiers: template.sheet.feats.find((entry) => entry.name === feat.name)?.modifiers || [] })),
    armorClass: { ...character.armorClass, armor: 0, shield: 0 },
  };
  const linked = { ...character, ...patch };
  patch.initiativeMisc = number(character.initiativeMisc) - modifierTotal(linked, "initiative");
  patch.attacks = (character.attacks || []).map((attack) => ({ ...attack,
    attackBonus: number(attack.attackBonus) - modifierTotal(linked, "attack", { attackName: attack.name }),
    ...(attack.type === "Ranged" && template.sheet.attacks.find((entry) => entry.name === attack.name)?.rangedDamage === "bow" ? { rangedDamage: "bow" } : {}),
  }));
  patch.skills = (character.skills || []).map((skill) => ({ ...skill,
    miscModifier: number(skill.miscModifier) - modifierTotal(linked, "skill", { skillName: skill.name }) - skillArmorPenalty(skill, template.armorPenalty),
  }));
  patch.saves = Object.fromEntries([["mode", "calculated"], ...Object.entries(saveStats).map(([key, stat]) => [key,
    number(character.saves?.[key]) - calculateMod(character.stats?.[stat]) - modifierTotal(linked, key),
  ])]);
  const updated = { ...character, ...patch };
  const changes = [
    { label: "CA total", before: armorClass(character), after: armorClass(updated) },
    { label: "Iniciativa", before: initiativeBonus(character), after: initiativeBonus(updated) },
    ...Object.entries({ fort: "Fortaleza", ref: "Reflejos", will: "Voluntad" }).map(([key, label]) => ({ label, before: calculateSaveTotal(character, key), after: calculateSaveTotal(updated, key) })),
    ...updated.attacks.map((attack, index) => ({ label: `Ataque: ${attack.name}`, before: calculateAttackTotal(character.attacks[index], character), after: calculateAttackTotal(attack, updated) })),
    ...updated.skills.filter((skill) => skill.ranks > 0).map((skill) => ({ label: `Habilidad: ${skill.name}`, before: calculateSkillTotal(character.skills.find((entry) => entry._id === skill._id), character), after: calculateSkillTotal(skill, updated) })),
  ];
  return { available: true, template: template.name, patch, changes };
}
