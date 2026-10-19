import { useState } from "react";
import Icon from "../ui/Icon";
import FavoriteButton from "../ui/FavoriteButton";
import DeleteSheet from "../ui/DeleteSheet";
import ResourceEditor from "./ResourceEditor";
import ActionDetails from "./ActionDetails";
import { actionKey, getActions } from "../../utils/quickActions";

export default function SpellsTab({
  character,
  onUpdate,
  onToggleFavorite,
  saving,
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [editor, setEditor] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const favorites = (character.quickActions || []).map(actionKey);
  const actions = getActions(character)
    .filter((action) => action.kind === "spell")
    .sort((a, b) => a.item.level - b.item.level);
  const visible = actions.filter(
    (action) =>
      action.name.toLocaleLowerCase().includes(search.toLocaleLowerCase()) &&
      (filter === "all" ||
        (filter === "prepared"
          ? action.item.prepared
          : favorites.includes(action.key))),
  );
  const selectedAction = actions.find((action) => action.key === selected);
  const save = (data) =>
    onUpdate({
      spells: editor.item
        ? character.spells.map((spell) =>
            spell._id === data._id ? data : spell,
          )
        : [...(character.spells || []), data],
    });
  return (
    <section className="collection-page">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Un poco de magia</p>
          <h2>
            Tu grimorio <span className="count-badge">{actions.length}</span>
          </h2>
        </div>
        <button
          className="button primary compact"
          onClick={() => setEditor({ item: null })}
          disabled={saving}
        >
          <Icon name="plus" size={17} />
          Aprender
        </button>
      </div>
      <label className="search-field">
        <Icon name="search" />
        <input
          aria-label="Buscar hechizos"
          placeholder="Busca un hechizo…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </label>
      <div className="filter-chips">
        {[
          ["all", "Todos"],
          ["prepared", "Preparados"],
          ["favorites", "Favoritos"],
        ].map(([id, label]) => (
          <button
            key={id}
            className={filter === id ? "active" : ""}
            onClick={() => setFilter(id)}
          >
            {label}
            {id === "prepared" && (
              <span>
                {actions.filter((action) => action.item.prepared).length}
              </span>
            )}
          </button>
        ))}
      </div>
      <div className="collection-grid">
        {visible.map((action) => (
          <article className="collection-card" key={action.key}>
            <button
              className="collection-open"
              onClick={() => setSelected(action.key)}
            >
              <span className="action-emblem tone-violet">
                <Icon name={action.icon} size={24} />
              </span>
              <span className="action-copy">
                <span className="action-type">
                  Nivel {action.item.level} · {action.item.school}
                </span>
                <strong>{action.name}</strong>
                <small>{action.item.desc || "Toca para ver sus efectos"}</small>
              </span>
              <Icon name="chevron" size={17} />
            </button>
            <div className="collection-card-footer">
              <button
                className={`preparation-button ${action.item.prepared ? "prepared" : ""}`}
                role="switch"
                aria-checked={action.item.prepared}
                aria-label={`Preparar ${action.name}`}
                disabled={saving}
                onClick={() =>
                  onUpdate({
                    spells: character.spells.map((spell) =>
                      spell._id === action.itemId
                        ? { ...spell, prepared: !spell.prepared }
                        : spell,
                    ),
                  })
                }
              >
                <span className="switch-track">
                  <span />
                </span>
                {action.item.prepared ? "Preparado" : "Sin preparar"}
              </button>
              <FavoriteButton
                active={favorites.includes(action.key)}
                name={action.name}
                disabled={saving}
                onClick={() => onToggleFavorite(action)}
              />
            </div>
          </article>
        ))}
      </div>
      {!visible.length && (
        <div className="empty-state">
          <Icon name="magic" size={32} />
          <h3>
            {actions.length
              ? "Sin hechizos en esta vista"
              : "Tu magia empieza aquí"}
          </h3>
          <p>
            {actions.length
              ? "Prueba otro filtro o nombre."
              : "Agrega un hechizo y marca tus favoritos para tenerlos en Partida."}
          </p>
        </div>
      )}
      {selectedAction && (
        <ActionDetails
          key={selectedAction.key}
          action={selectedAction}
          character={character}
          saving={saving}
          onUpdate={onUpdate}
          onToggleFavorite={onToggleFavorite}
          onClose={() => setSelected(null)}
          onEdit={() => {
            setEditor({ item: selectedAction.item });
            setSelected(null);
          }}
          onDelete={() => {
            setDeleting(selectedAction);
            setSelected(null);
          }}
        />
      )}
      {editor && (
        <ResourceEditor
          kind="spell"
          item={editor.item}
          onClose={() => setEditor(null)}
          onSave={save}
        />
      )}
      {deleting && (
        <DeleteSheet
          name={deleting.name}
          onClose={() => setDeleting(null)}
          onConfirm={() =>
            onUpdate({
              spells: character.spells.filter(
                (spell) => spell._id !== deleting.itemId,
              ),
              quickActions: (character.quickActions || []).filter(
                (entry) => actionKey(entry) !== deleting.key,
              ),
            })
          }
        />
      )}
    </section>
  );
}
