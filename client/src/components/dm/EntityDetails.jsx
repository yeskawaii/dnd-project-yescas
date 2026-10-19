import {
  calculateAttackTotal,
  calculateDamageBonus,
  calculateMod,
  calculateSkillTotal,
  calculateSaveTotal,
  canUseSkill,
  armorBreakdown,
} from "../../utils/conversions";
import { bonus } from "../../utils/quickActions";
import { armorClass, initiativeBonus } from "../../utils/dmWorkspace";

export default function EntityDetails({ entity, player = false }) {
  if (!entity)
    return (
      <p className="helper-text">
        Selecciona una ficha para consultar sus acciones.
      </p>
    );
  return (
    <div className="dm-details">
      <div className="dm-stat-strip">
        <span>
          CA <strong>{player ? armorClass(entity) : entity.ac}</strong>
        </span>
        <span>
          Iniciativa{" "}
          <strong>
            {bonus(player ? initiativeBonus(entity) : entity.initiativeBonus)}
          </strong>
        </span>
        {player && (
          <span>
            Velocidad <strong>{entity.speed}</strong>
          </span>
        )}
      </div>
      {player ? (
        <>
          <p>CA de toque {armorBreakdown(entity).touch} · Desprevenido {armorBreakdown(entity).flatFooted}</p>
          <div className="dm-attributes">
            {Object.entries(entity.stats || {}).map(([name, value]) => (
              <div key={name}>
                <small>{name}</small>
                <strong>
                  {value} <em>({bonus(calculateMod(value))})</em>
                </strong>
              </div>
            ))}
          </div>
          <div
            className="dm-stat-strip"
            title="Salvaciones calculadas según el modo de la ficha"
          >
            {[
              ["fort", "Fortaleza"],
              ["ref", "Reflejos"],
              ["will", "Voluntad"],
            ].map(([key, label]) => (
              <span key={key}>
                {label} <strong>{bonus(calculateSaveTotal(entity, key))}</strong>
              </span>
            ))}
          </div>
          <h3>Ataques</h3>
          {!entity.attacks?.length && (
            <p className="helper-text">Sin ataques registrados.</p>
          )}
          {entity.attacks?.map((attack) => (
            <div className="dm-detail-item" key={attack._id}>
              <strong>{attack.name}</strong>
              <p>
                Ataque {bonus(calculateAttackTotal(attack, entity))} · Daño{" "}
                {attack.damageDice}
                {bonus(calculateDamageBonus(attack, entity))} ·{" "}
                {attack.damageType}
              </p>
              <small>
                Crítico {attack.critRange}/{attack.critMultiplier}
              </small>
            </div>
          ))}
          <h3>Hechizos</h3>
          {!entity.spells?.length && (
            <p className="helper-text">Sin hechizos registrados.</p>
          )}
          {entity.spells?.map((spell) => (
            <details className="dm-detail-item" key={spell._id}>
              <summary>
                {spell.name} · Niv. {spell.level}
                {spell.prepared ? " · Preparado" : ""}
              </summary>
              <p className="dm-prose">{spell.desc || "Sin descripción."}</p>
            </details>
          ))}
          <h3>Rasgos y dotes</h3>
          {[...(entity.feats || []), ...(entity.traits || [])].map(
            (feat, i) => (
              <details className="dm-detail-item" key={feat._id || i}>
                <summary>{feat.name}</summary>
                <p className="dm-prose">{feat.desc || feat.description}</p>
              </details>
            ),
          )}
          <details className="dm-detail-item">
            <summary>Habilidades</summary>
            {entity.skills?.map((skill) => (
              <p key={skill._id || skill.name}>
                {skill.name}{" "}
                <strong>
                  {canUseSkill(skill) ? bonus(calculateSkillTotal(skill, entity)) : "Requiere entrenamiento"}
                </strong>
              </p>
            ))}
          </details>
        </>
      ) : (
        <>
          <h3>Acciones y habilidades</h3>
          <p className="dm-prose">
            {entity.actions ||
              "Añade ataques, daño, habilidades y conjuros en la biblioteca."}
          </p>
          <h3>Historia y personalidad</h3>
          <p className="dm-prose">
            {entity.description || "Sin notas sobre esta criatura."}
          </p>
        </>
      )}
    </div>
  );
}
