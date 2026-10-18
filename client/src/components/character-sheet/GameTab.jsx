import { useState } from "react";
import { Reorder, useDragControls } from "framer-motion";
import HealthTracker from "../HealthTracker";
import BottomSheet from "../ui/BottomSheet";
import FavoriteButton from "../ui/FavoriteButton";
import Icon from "../ui/Icon";
import ActionDetails from "./ActionDetails";
import {
  actionKey,
  actionTypes,
  bonus,
  getActions,
  moveAction,
} from "../../utils/quickActions";
import { calculateMod } from "../../utils/conversions";

function FavoriteTile({
  action,
  organizing,
  saving,
  index,
  count,
  onOpen,
  onMove,
}) {
  const controls = useDragControls();
  return (
    <Reorder.Item
      value={action.key}
      dragListener={false}
      dragControls={controls}
      className={`favorite-tile ${organizing ? "is-organizing" : ""}`}
      whileDrag={{
        scale: 1.025,
        zIndex: 5,
        borderColor: "#b7ddc4",
        boxShadow: "0 12px 30px #0006",
      }}
    >
      {organizing && (
        <button
          className="drag-handle icon-button"
          disabled={saving}
          aria-label={`Arrastrar ${action.name}`}
          onPointerDown={(event) => {
            event.preventDefault();
            controls.start(event);
          }}
        >
          <Icon name="grip" />
        </button>
      )}
      <button
        className="favorite-content"
        disabled={organizing}
        onClick={onOpen}
      >
        <span className={`action-emblem tone-${action.tone}`}>
          <Icon name={action.icon} size={22} />
        </span>
        <span className="action-copy">
          <span className="action-type">{action.singular}</span>
          <strong>{action.name}</strong>
          <small>{action.caption}</small>
        </span>
        <span className={`action-value tone-text-${action.tone}`}>
          {action.kind === "item" ? (
            <Icon name="chevron" size={18} />
          ) : (
            action.value
          )}
        </span>
        {!organizing && action.kind !== "item" && (
          <Icon name="chevron" size={16} />
        )}
      </button>
      {organizing && (
        <div className="reorder-buttons">
          <button
            className="icon-button"
            onClick={() => onMove(index, index - 1)}
            disabled={saving || index === 0}
            aria-label={`Subir ${action.name}`}
          >
            <Icon name="up" size={18} />
          </button>
          <button
            className="icon-button"
            onClick={() => onMove(index, index + 1)}
            disabled={saving || index === count - 1}
            aria-label={`Bajar ${action.name}`}
          >
            <Icon name="down" size={18} />
          </button>
        </div>
      )}
    </Reorder.Item>
  );
}

export default function GameTab({
  character,
  onUpdate,
  onToggleFavorite,
  saving,
  onBrowse,
}) {
  const [organizing, setOrganizing] = useState(false);
  const [order, setOrder] = useState([]);
  const [panel, setPanel] = useState(null);
  const [selectedKey, setSelectedKey] = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const actions = getActions(character);
  const actionMap = new Map(actions.map((action) => [action.key, action]));
  const favoriteKeys = (character.quickActions || [])
    .map(actionKey)
    .filter((key) => actionMap.has(key));
  const orderedKeys = organizing
    ? order.filter((key) => actionMap.has(key))
    : favoriteKeys;
  const selected = actionMap.get(selectedKey);
  const dex = calculateMod(character.stats?.Destreza);
  const armor = character.armorClass || {};
  const ca =
    10 +
    dex +
    (armor.armor || 0) +
    (armor.shield || 0) +
    (armor.natural || 0) +
    (armor.misc || 0);
  const filtered = actions.filter(
    (action) =>
      (filter === "all" || action.kind === filter) &&
      `${action.name} ${action.caption}`
        .toLocaleLowerCase()
        .includes(search.toLocaleLowerCase()),
  );
  const saveOrder = async () => {
    const result = await onUpdate({
      quickActions: orderedKeys.map((key) => {
        const { kind, itemId } = actionMap.get(key);
        return { kind, itemId };
      }),
    });
    if (result) setOrganizing(false);
  };

  return (
    <div className="game-layout">
      <div className="game-overview">
        <HealthTracker
          currentHp={character.hp?.current}
          maxHp={character.hp?.max}
          onEditHp={(current) => onUpdate({ "hp.current": current })}
          onEditMax={(max) => onUpdate({ "hp.max": max })}
          saving={saving}
        />
        <div className="combat-summary">
          <div>
            <Icon name="shield" />
            <strong>{ca}</strong>
            <span>Armadura</span>
          </div>
          <div>
            <Icon name="bolt" />
            <strong>{bonus(dex + (character.initiativeMisc || 0))}</strong>
            <span>Iniciativa</span>
          </div>
          <div>
            <Icon name="sword" />
            <strong>{bonus(character.baseAttack || 0)}</strong>
            <span>Ataque base</span>
          </div>
        </div>
        <div className="session-note">
          <span className="status-dot" />
          <p>
            {character.campaign?.name ? (
              <>
                En contienda <strong>{character.campaign.name}</strong>
              </>
            ) : (
              <>Tu ficha, lista para la siguiente aventura.</>
            )}
          </p>
          <Icon name="dice" size={18} />
        </div>
        <div className="desktop-hint">
          <Icon name="star" size={28} />
          <h3>Tu mesa, a tu manera.</h3>
          <p>
            Reúne tus recursos favoritos y ordénalos como prefieras. Menos
            búsquedas, más aventura.
          </p>
        </div>
      </div>
      <section className="quick-actions-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Todo a mano</p>
            <h2>
              Acciones rápidas{" "}
              <span className="count-badge">{favoriteKeys.length}</span>
            </h2>
          </div>
          {favoriteKeys.length > 1 && !organizing && (
            <button
              className="text-button"
              disabled={saving}
              onClick={() => {
                setOrder(favoriteKeys);
                setOrganizing(true);
              }}
            >
              <Icon name="grip" size={16} />
              Organizar
            </button>
          )}
        </div>
        {organizing && (
          <div className="organize-toolbar">
            <p>Arrastra la agarradera o usa las flechas.</p>
            <div>
              <button
                className="text-button"
                disabled={saving}
                onClick={() => setOrganizing(false)}
              >
                Cancelar
              </button>
              <button
                className="button primary compact"
                disabled={saving}
                onClick={saveOrder}
              >
                <Icon name="check" size={16} />
                {saving ? "Guardando…" : "Listo"}
              </button>
            </div>
          </div>
        )}
        <Reorder.Group
          axis="y"
          values={orderedKeys}
          onReorder={setOrder}
          className="favorites-list"
          aria-label="Acciones favoritas"
        >
          {orderedKeys.map((key, index) => (
            <FavoriteTile
              key={key}
              action={actionMap.get(key)}
              organizing={organizing}
              saving={saving}
              index={index}
              count={orderedKeys.length}
              onOpen={() => {
                setSelectedKey(key);
                setPanel("detail");
              }}
              onMove={(from, to) =>
                setOrder((previous) => moveAction(previous, from, to))
              }
            />
          ))}
        </Reorder.Group>
        {!favoriteKeys.length && (
          <div className="favorites-empty">
            <span className="empty-illustration">
              <Icon name="star" size={32} />
            </span>
            <h3>Lo que más usas, aquí.</h3>
            <p>
              Agrega tus ataques, hechizos, objetos y habilidades para
              encontrarlos en un toque.
            </p>
            <div className="empty-categories">
              {Object.values(actionTypes).map((type) => (
                <span
                  key={type.icon}
                  className={`action-emblem tone-${type.tone}`}
                >
                  <Icon name={type.icon} />
                </span>
              ))}
            </div>
          </div>
        )}
        {!organizing && (
          <button
            className="add-favorite-button"
            onClick={() => {
              setSearch("");
              setFilter("all");
              setPanel("library");
            }}
          >
            <span>
              <Icon name="plus" />
            </span>
            <div>
              <strong>Agregar a mi mesa</strong>
              <small>Elige tus recursos favoritos</small>
            </div>
            <Icon name="chevron" size={18} />
          </button>
        )}
        {!organizing && (
          <div className="browse-shortcuts">
            <button onClick={() => onBrowse("spells")}>
              <Icon name="magic" size={17} />
              Ver hechizos
              <Icon name="chevron" size={14} />
            </button>
            <button onClick={() => onBrowse("features")}>
              <Icon name="skill" size={17} />
              Ver habilidades
              <Icon name="chevron" size={14} />
            </button>
          </div>
        )}
      </section>
      {panel === "library" && (
        <BottomSheet
          title="Agrega tus favoritos"
          subtitle="Personaliza tu mesa"
          onClose={() => setPanel(null)}
        >
          <label className="search-field">
            <Icon name="search" />
            <input
              aria-label="Buscar recursos"
              placeholder="Buscar en tu personaje…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <div className="filter-chips">
            <button
              className={filter === "all" ? "active" : ""}
              onClick={() => setFilter("all")}
            >
              Todo
            </button>
            {Object.entries(actionTypes).map(([key, type]) => (
              <button
                key={key}
                className={filter === key ? "active" : ""}
                onClick={() => setFilter(key)}
              >
                {type.label}
              </button>
            ))}
          </div>
          <p className="helper-text">
            Toca la estrella para tenerlo siempre a mano.
          </p>
          <div className="resource-list">
            {filtered.map((action) => (
              <div className="resource-row" key={action.key}>
                <span className={`action-emblem tone-${action.tone}`}>
                  <Icon name={action.icon} />
                </span>
                <div>
                  <strong>{action.name}</strong>
                  <small>{action.caption}</small>
                </div>
                <FavoriteButton
                  active={favoriteKeys.includes(action.key)}
                  disabled={saving}
                  name={action.name}
                  onClick={() => onToggleFavorite(action)}
                />
              </div>
            ))}
          </div>
          {!filtered.length && (
            <div className="empty-state">
              <Icon name="search" size={28} />
              <h3>
                {search ? "Sin coincidencias" : "Aún no hay recursos aquí"}
              </h3>
              <p>
                {search
                  ? "Prueba con otro nombre o categoría."
                  : "Agrega ataques y hechizos en Personaje u objetos en Mochila."}
              </p>
            </div>
          )}
        </BottomSheet>
      )}
      {panel === "detail" && selected && (
        <ActionDetails
          key={selected.key}
          action={selected}
          character={character}
          onClose={() => setPanel(null)}
          onToggleFavorite={onToggleFavorite}
          saving={saving}
          onUpdate={onUpdate}
        />
      )}
    </div>
  );
}
