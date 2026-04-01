// src/utils/conversions.js

// --- CONVERSIONES MÉTRICAS ---
export const lbToKg = (lb) => (Number(lb) * 0.453592).toFixed(1);
export const kgToLb = (kg) => (Number(kg) / 0.453592).toFixed(1);
export const inToCm = (inches) => (Number(inches) * 2.54).toFixed(0);
export const cmToIn = (cm) => (Number(cm) / 2.54).toFixed(1);

// --- CÁLCULOS D&D ---

// Sacar el modificador de toda la vida: (Stat - 10) / 2
export const calculateMod = (value) => {
  const val = Number(value) || 10;
  return Math.floor((val - 10) / 2);
};

// Calcular el total de una Skill (Habilidad)
export const calculateSkillTotal = (skill, stats) => {
  const statValue = stats[skill.stat] || 10;
  const mod = calculateMod(statValue);
  
  // Bono de entrenamiento (+3 si es de clase y tiene al menos 1 rango)
  const classBonus = (skill.isClassSkill && skill.ranks > 0) ? 3 : 0;
  
  return mod + (Number(skill.ranks) || 0) + (Number(skill.miscModifier) || 0) + classBonus;
};