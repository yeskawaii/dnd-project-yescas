// src/utils/conversions.js

// --- CONVERSIONES MÉTRICAS ---
export const lbToKg = (lb) => (Number(lb) * 0.453592).toFixed(1);
export const kgToLb = (kg) => (Number(kg) / 0.453592).toFixed(1);
export const inToCm = (inches) => (Number(inches) * 2.54).toFixed(0);
export const cmToIn = (cm) => (Number(cm) / 2.54).toFixed(1);

export * from "../../../shared/characterRules.mjs";
