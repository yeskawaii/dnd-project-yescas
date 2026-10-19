import Icon from "../ui/Icon";
import { armorBreakdown, initiativeBonus, calculateMod, modifierTotal, activeModifiers, modifierTargets, equippedArmor } from "../../utils/conversions";
import { bonus } from "../../utils/quickActions";

export default function CombatStats({ character }) {
  const ca = armorBreakdown(character);
  const dex = calculateMod(character.stats?.Destreza);
  const sources = activeModifiers(character);
  return (
    <div>
      <div className="combat-summary" aria-label="Clase de armadura, iniciativa y ataque base">
        <div><Icon name="shield" /><strong>{ca.total}</strong><span>CA total</span></div>
        <div><Icon name="bolt" /><strong>{bonus(initiativeBonus(character))}</strong><span>Iniciativa</span></div>
        <div><Icon name="sword" /><strong>{bonus(character.baseAttack || 0)}</strong><span>Ataque base</span></div>
      </div>
      <details className="rule-breakdown">
        <summary>Desglose de defensa y combate</summary>
        <p><strong>CA {ca.total}</strong> = 10 {bonus(ca.armor)} armadura {bonus(ca.shield)} escudo {bonus(ca.dex)} Des {bonus(ca.size)} tamaño {bonus(ca.natural)} natural {bonus(ca.deflection)} desvío {bonus(ca.dodge)} esquiva {bonus(ca.misc)} otros.</p>
        <p>CA de toque: <strong>{ca.touch}</strong> · Desprevenido: <strong>{ca.flatFooted}</strong>.</p>
        {ca.maxDex != null && <p>Máximo de Destreza a CA: +{ca.maxDex}. Este límite no reduce iniciativa ni Reflejos.</p>}
        <p>Iniciativa: {bonus(dex)} Des {bonus(character.initiativeMisc || 0)} ajuste manual {bonus(modifierTotal(character, "initiative"))} efectos.</p>
        <p>El ataque base se usa al atacar. Iniciativa y ataque base no se suman a la CA.</p>
        {equippedArmor(character).map((item) => <p key={item._id || item.name}>{item.name}: {bonus(item.defenseBonus || 0)} {item.equipmentSlot === "armor" ? "armadura" : "escudo"}, penalización a habilidades {item.armorCheckPenalty || 0}.</p>)}
        {sources.length > 0 && <ul>{sources.map((entry, index) => <li key={index}>{entry.source}: {bonus(entry.value)} a {modifierTargets[entry.target]}{entry.skillName ? ` (${entry.skillName})` : ""}{entry.attackName ? ` (${entry.attackName})` : ""}</li>)}</ul>}
        <p className="helper-text">Desprevenido supone que pierdes el bono de Destreza y esquiva. Aplica las excepciones de tus rasgos con tu DM.</p>
      </details>
    </div>
  );
}
