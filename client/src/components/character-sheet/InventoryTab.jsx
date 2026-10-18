import { useState } from "react";
import EditableNumber from "../ui/EditableNumber";
import Icon from "../ui/Icon";
import FavoriteButton from "../ui/FavoriteButton";
import DeleteSheet from "../ui/DeleteSheet";
import ResourceEditor from "./ResourceEditor";
import ActionDetails from "./ActionDetails";
import { lbToKg } from "../../utils/conversions";
import { actionKey, getActions } from "../../utils/quickActions";

export default function InventoryTab({
  character,
  onUpdate,
  unitSystem,
  onToggleFavorite,
  saving,
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [editor, setEditor] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const totalWeight = (character.inventory || []).reduce(
    (sum, item) => sum + (item.weight || 0),
    0,
  );
  const maxWeight = character.weight?.max || 100;
  const favorites = (character.quickActions || []).map(actionKey);
  const actions = getActions(character).filter(
    (action) => action.kind === "item",
  );
  const visible = actions.filter(
    (action) =>
      action.name.toLocaleLowerCase().includes(search.toLocaleLowerCase()) &&
      (filter === "all" ||
        (filter === "favorites"
          ? favorites.includes(action.key)
          : action.item.icon === "🧪")),
  );
  const selectedAction = actions.find((action) => action.key === selected);
  return (
    <div className="collection-page">
      <section className="wallet-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Tus provisiones</p>
            <h2>Monedero</h2>
          </div>
          <span className="coin-symbol">◎</span>
        </div>
        <div className="wallet-grid">
          {[
            ["cp", "Cobre"],
            ["sp", "Plata"],
            ["gp", "Oro"],
            ["pp", "Platino"],
          ].map(([coin, name]) => (
            <div key={coin}>
              <span>{name}</span>
              <EditableNumber
                value={character.money?.[coin] || 0}
                onSave={(value) => onUpdate({ [`money.${coin}`]: value })}
                label={name}
                min={0}
              />
              <small>{coin.toUpperCase()}</small>
            </div>
          ))}
        </div>
      </section>
      <section className="weight-panel">
        <div>
          <span>
            <Icon name="bag" size={17} />
            Carga de la mochila
          </span>
          <strong className={totalWeight > maxWeight ? "overweight" : ""}>
            {unitSystem === "imp" ? totalWeight : lbToKg(totalWeight)} /{" "}
            {unitSystem === "imp" ? maxWeight : lbToKg(maxWeight)}{" "}
            {unitSystem === "imp" ? "lb" : "kg"}
          </strong>
        </div>
        <div
          className={`weight-track ${totalWeight > maxWeight ? "overweight" : ""}`}
        >
          <span
            style={{
              width: `${Math.min(100, (totalWeight / maxWeight) * 100)}%`,
            }}
          />
        </div>
        <p>
          {totalWeight > maxWeight
            ? "La carga supera el máximo de tu ficha."
            : "Lleva lo que necesitas para el camino."}
        </p>
        <label className="weight-limit">
          Capacidad (lb)
          <EditableNumber
            value={maxWeight}
            onSave={(value) => onUpdate({ "weight.max": value })}
            min={1}
            label="Capacidad en libras"
          />
        </label>
      </section>
      <div className="section-heading">
        <div>
          <p className="eyebrow">Cada objeto cuenta</p>
          <h2>
            Equipamiento <span className="count-badge">{actions.length}</span>
          </h2>
        </div>
        <button
          className="button primary compact"
          onClick={() => setEditor({ item: null })}
          disabled={saving}
        >
          <Icon name="plus" size={17} />
          Agregar
        </button>
      </div>
      <label className="search-field">
        <Icon name="search" />
        <input
          aria-label="Buscar objetos"
          placeholder="Busca en tu mochila…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </label>
      <div className="filter-chips">
        {[
          ["all", "Todo"],
          ["potions", "Pociones"],
          ["favorites", "Favoritos"],
        ].map(([id, name]) => (
          <button
            key={id}
            className={filter === id ? "active" : ""}
            onClick={() => setFilter(id)}
          >
            {name}
          </button>
        ))}
      </div>
      <div className="collection-grid">
        {visible.map((action) => (
          <article className="collection-card" key={action.key}>
            <div className="item-card-row">
              <button
                className="collection-open"
                onClick={() => setSelected(action.key)}
              >
                <span className="action-emblem tone-mint item-emoji">
                  {action.item.icon || "📦"}
                </span>
                <span className="action-copy">
                  <strong>{action.name}</strong>
                  <small>
                    {unitSystem === "imp"
                      ? `${action.item.weight || 0} lb`
                      : `${lbToKg(action.item.weight || 0)} kg`}
                  </small>
                </span>
                <Icon name="chevron" size={17} />
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
          <Icon name="bag" size={32} />
          <h3>
            {actions.length
              ? "Sin objetos en esta vista"
              : "Hay espacio para una aventura"}
          </h3>
          <p>
            {actions.length
              ? "Prueba otro nombre o categoría."
              : "Agrega tu equipo, provisiones y tesoros."}
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
          kind="item"
          item={editor.item}
          onClose={() => setEditor(null)}
          onSave={(data) =>
            onUpdate({
              inventory: editor.item
                ? character.inventory.map((item) =>
                    item._id === data._id ? data : item,
                  )
                : [...(character.inventory || []), data],
            })
          }
        />
      )}
      {deleting && (
        <DeleteSheet
          name={deleting.name}
          onClose={() => setDeleting(null)}
          onConfirm={() =>
            onUpdate({
              inventory: character.inventory.filter(
                (item) => item._id !== deleting.itemId,
              ),
              quickActions: (character.quickActions || []).filter(
                (entry) => actionKey(entry) !== deleting.key,
              ),
            })
          }
        />
      )}
    </div>
  );
}
