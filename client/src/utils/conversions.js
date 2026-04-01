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

// Calcular el Bono de Ataque Total
export const calculateAttackTotal = (attack, character) => {
  const bab = character.baseAttack || 0;
  
  // Asumimos Fuerza para Melee y Destreza para Rango
  // (Si tienes armas "Finesse/Sutil", podrías agregar lógica para usar DEX en Melee)
  const statUsed = attack.type === 'Ranged' ? 'Destreza' : 'Fuerza';
  const statMod = calculateMod(character.stats[statUsed]);
  
  return bab + statMod + (attack.attackBonus || 0);
};

// Calcular el Bono de Daño Total (Normalmente solo usa Fuerza)
export const calculateDamageBonus = (attack, character) => {
  // Las armas a distancia (Arcos) usualmente no suman Destreza al daño
  if (attack.type === 'Ranged') {
    return attack.damageBonus || 0;
  }
  
  const strMod = calculateMod(character.stats['Fuerza']);
  
  // Si usas un arma a dos manos, sumarías 1.5x de fuerza (podrías añadir una checkbox "Dos Manos" después)
  return strMod + (attack.damageBonus || 0);
};