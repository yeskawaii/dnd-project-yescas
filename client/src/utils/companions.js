export const companionKinds = {
  familiar: "Familiar", summon: "Invocación", homunculus: "Homúnculo",
  animal: "Compañero animal", mount: "Montura", other: "Otro acompañante",
};
export const emptyCompanion = () => ({
  name: "", kind: "familiar", active: true, hp: { current: 10, max: 10 },
  ac: 10, initiativeBonus: 0, speed: "30 ft", duration: "", actions: "", description: "",
});
