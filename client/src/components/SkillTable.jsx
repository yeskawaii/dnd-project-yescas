import { useState } from "react";
import { calculateSkillTotal, canUseSkill } from "../utils/conversions";
import { actionKey, bonus } from "../utils/quickActions";
import FavoriteButton from "./ui/FavoriteButton";
import Icon from "./ui/Icon";
import { resourceIcon } from "../utils/characterCustomization";

export default function SkillTable({
  character,
  onUpdateSkill,
  onOpenAddModal,
  onEditSkill,
  onToggleFavorite,
  saving,
}) {
  const [sort, setSort] = useState("alpha");
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState({});
  const hasChanges = Object.keys(draft).length > 0;
  const localSkills = (character.skills || []).map((skill) => ({
    ...skill,
    ...(skill._id in draft ? { ranks: draft[skill._id] } : {}),
  }));
  const visible = localSkills
    .filter((skill) =>
      skill.name.toLocaleLowerCase().includes(search.toLocaleLowerCase()),
    )
    .sort((a, b) =>
      sort === "alpha"
        ? a.name.localeCompare(b.name)
        : calculateSkillTotal(b, character) -
          calculateSkillTotal(a, character),
    );
  const favorites = (character.quickActions || []).map(actionKey);
  return (
    <div>
      <label className="search-field">
        <Icon name="search" />
        <input
          aria-label="Buscar habilidades"
          placeholder="Busca una habilidad…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </label>
      <div className="skills-toolbar">
        <select
          aria-label="Ordenar habilidades"
          value={sort}
          onChange={(event) => setSort(event.target.value)}
        >
          <option value="alpha">Nombre: A–Z</option>
          <option value="value">Mayor bono</option>
        </select>
        <div>
          {hasChanges ? (
            <>
              <button
                className="text-button"
                onClick={() => setDraft({})}
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                className="button primary compact"
                disabled={saving}
                onClick={async () => {
                  const result = await onUpdateSkill(
                    localSkills.map((skill) => ({
                      ...skill,
                      ranks: Number(skill.ranks) || 0,
                    })),
                  );
                  if (result) setDraft({});
                }}
              >
                Guardar
              </button>
            </>
          ) : (
            <button className="text-button" onClick={onOpenAddModal}>
              <Icon name="plus" size={16} />
              Nueva
            </button>
          )}
        </div>
      </div>
      <div className="skills-list">
        {visible.map((skill) => {
          const action = {
            kind: "skill",
            itemId: String(skill._id),
            key: `skill:${skill._id}`,
          };
          return (
            <div className="skill-row" key={skill._id}>
              <button
                type="button"
                className="skill-score"
                disabled={saving || hasChanges}
                aria-label={`Editar ${skill.name}`}
                onClick={() => onEditSkill?.(skill)}
              >
                <Icon name={resourceIcon(skill, "skill")} size={16} />
                {canUseSkill(skill) ? bonus(calculateSkillTotal(skill, character)) : "—"}
              </button>
              <div>
                <strong>{skill.name}</strong>
                <small>
                  {skill.stat}
                  {skill.isClassSkill ? " · De clase" : ""}
                  {!canUseSkill(skill) ? " · Requiere entrenamiento" : ""}
                </small>
              </div>
              <label className="skill-ranks">
                Rangos
                <input
                  aria-label={`Rangos de ${skill.name}`}
                  type="number"
                  min={0}
                  step="any"
                  value={skill.ranks}
                  onChange={(event) =>
                    setDraft((previous) => ({
                      ...previous,
                      [skill._id]:
                        event.target.value === ""
                          ? ""
                          : Math.max(0, Number(event.target.value)),
                    }))
                  }
                />
              </label>
              {onToggleFavorite && (
                <FavoriteButton
                  name={skill.name}
                  active={favorites.includes(action.key)}
                  disabled={saving}
                  onClick={() => onToggleFavorite(action)}
                />
              )}
            </div>
          );
        })}
      </div>
      {!visible.length && (
        <p className="helper-text">
          No se encontraron habilidades con ese nombre.
        </p>
      )}
    </div>
  );
}
