import { useState } from "react";
import Icon from "../ui/Icon";
import EntityDetails from "./EntityDetails";
import {
  advanceTurn,
  kindLabels,
  orderedCombatants,
  removeCombatant,
} from "../../utils/dmWorkspace";

export default function CombatPanel({
  workspace,
  players,
  onChange,
  onAddPlayers,
  onBrowseLibrary,
  onDelete,
}) {
  const combat = workspace.combat;
  const ordered = orderedCombatants(combat);
  const [selected, setSelected] = useState("");
  const [amount, setAmount] = useState(1);
  const focus =
    combat.combatants.find((entry) => entry.id === selected) ||
    combat.combatants.find((entry) => entry.id === combat.activeId) ||
    ordered[0];
  const source =
    focus?.kind === "player"
      ? players.find((player) => player._id === focus.sourceId)
      : null;
  const active = combat.combatants.find(
    (entry) => entry.id === combat.activeId,
  );
  const patchCombat = (patch) =>
    onChange({ ...workspace, combat: { ...combat, ...patch } });
  const patchFocus = (patch) =>
    patchCombat({
      combatants: combat.combatants.map((entry) =>
        entry.id === focus.id ? { ...entry, ...patch } : entry,
      ),
    });
  const cycle = (direction) => {
    const index = ordered.findIndex((entry) => entry.id === focus?.id);
    setSelected(
      ordered[(index + direction + ordered.length) % ordered.length]?.id || "",
    );
  };
  return (
    <section>
      <div className="dm-combat-top">
        <label className="form-field">
          Encuentro
          <input
            maxLength={160}
            value={combat.name}
            onChange={(event) => patchCombat({ name: event.target.value })}
          />
        </label>
        <div className="dm-round">
          <small>Ronda</small>
          <strong>{combat.round}</strong>
        </div>
        <div className="dm-actions">
          <button
            className="button secondary compact"
            disabled={
              !combat.activeId ||
              (combat.round === 1 && ordered[0]?.id === combat.activeId)
            }
            onClick={() => {
              const next = advanceTurn(combat, -1);
              patchCombat(next);
              setSelected(next.activeId);
            }}
            aria-label="Turno anterior"
          >
            <Icon name="back" size={17} />
          </button>
          <button
            className="button primary"
            disabled={!ordered.length || combat.round >= 99999}
            onClick={() => {
              const next = advanceTurn(combat);
              patchCombat(next);
              setSelected(next.activeId);
            }}
          >
            {combat.activeId ? "Siguiente turno" : "Iniciar combate"}
            <Icon name="chevron" size={17} />
          </button>
        </div>
      </div>
      <div className="dm-turn-banner" role="status">
        <Icon name="bolt" size={19} />
        <span>
          {active ? (
            <>
              Turno de <strong>{active.name}</strong>
            </>
          ) : (
            "Añade participantes, prepara su iniciativa e inicia el combate."
          )}
        </span>
        <small>{ordered.length} participantes</small>
      </div>
      <div className="dm-actions dm-encounter-actions">
        <button
          className="button secondary compact"
          disabled={
            !players.some(
              (player) =>
                !combat.combatants.some(
                  (entry) =>
                    entry.sourceId === player._id && entry.kind === "player",
                ),
            ) ||
            combat.combatants.length +
              players.filter(
                (player) =>
                  !combat.combatants.some(
                    (entry) =>
                      entry.sourceId === player._id && entry.kind === "player",
                  ),
              ).length >
              100
          }
          onClick={onAddPlayers}
        >
          <Icon name="plus" size={16} />
          Añadir grupo
        </button>
        <button className="button secondary compact" onClick={onBrowseLibrary}>
          <Icon name="book" size={16} />
          Añadir criaturas
        </button>
        <button
          className="text-button"
          disabled={!ordered.length}
          onClick={() =>
            onDelete(
              "Volver a tirar iniciativa",
              "Se reemplazarán las iniciativas y el combate volverá a la primera ronda.",
              () => {
                patchCombat({
                  combatants: combat.combatants.map((entry) => ({
                    ...entry,
                    initiative:
                      Math.floor(Math.random() * 20) +
                      1 +
                      entry.initiativeBonus,
                  })),
                  round: 1,
                  activeId: "",
                });
              },
            )
          }
        >
          <Icon name="dice" size={17} />
          Tirar iniciativa
        </button>
      </div>
      <p className="helper-text">
        La iniciativa es el total, incluido el bono. La vida y los estados se
        registran solo en este encuentro; las fichas originales de los jugadores
        se consultan sin editarlas.
      </p>
      {ordered.length ? (
        <div className="dm-combat-layout">
          <aside
            className="surface dm-roster"
            aria-label="Participantes por iniciativa"
          >
            <div className="dm-roster-heading">
              <span>Orden de turno</span>
              <span>Ini.</span>
            </div>
            {ordered.map((entry) => (
              <div
                className={`dm-roster-row ${entry.id === focus?.id ? "selected" : ""} ${entry.id === combat.activeId ? "is-turn" : ""}`}
                key={entry.id}
              >
                <button
                  className="dm-roster-select"
                  onClick={() => setSelected(entry.id)}
                  aria-pressed={focus?.id === entry.id}
                >
                  <span className={`dm-kind-dot ${entry.kind}`} />
                  <span>
                    <strong>{entry.name}</strong>
                    <small>
                      {entry.hp} / {entry.maxHp} PV · CA {entry.ac}
                      {entry.conditions ? ` · ${entry.conditions}` : ""}
                    </small>
                  </span>
                  {entry.id === combat.activeId && (
                    <Icon name="bolt" size={14} />
                  )}
                </button>
                <input
                  type="number"
                  min={-100}
                  max={200}
                  aria-label={`Iniciativa total de ${entry.name}`}
                  value={entry.initiative}
                  onChange={(event) =>
                    patchCombat({
                      combatants: combat.combatants.map((item) =>
                        item.id === entry.id
                          ? {
                              ...item,
                              initiative: Math.max(
                                -100,
                                Math.min(
                                  200,
                                  Math.trunc(Number(event.target.value) || 0),
                                ),
                              ),
                            }
                          : item,
                      ),
                    })
                  }
                />
              </div>
            ))}
          </aside>
          <article className="surface dm-focus" key={focus.id}>
            <div className="dm-focus-heading">
              <div>
                <p className="eyebrow">
                  {kindLabels[focus.kind]} · Ficha rápida
                </p>
                <h2>{focus.name}</h2>
              </div>
              <div className="dm-actions">
                <button
                  className="icon-button"
                  aria-label="Consultar ficha anterior"
                  onClick={() => cycle(-1)}
                >
                  <Icon name="back" size={18} />
                </button>
                <button
                  className="icon-button"
                  aria-label="Consultar siguiente ficha"
                  onClick={() => cycle(1)}
                >
                  <Icon name="chevron" size={18} />
                </button>
              </div>
            </div>
            <div className="dm-hp-panel">
              <div>
                <small>Vida del encuentro</small>
                <strong className={focus.hp <= 0 ? "dm-danger" : ""}>
                  {focus.hp} <em>/ {focus.maxHp}</em>
                </strong>
              </div>
              <div className="dm-hp-controls">
                <label className="form-field">
                  Cantidad
                  <input
                    type="number"
                    min={1}
                    max={9999}
                    step="1"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                  />
                </label>
                <button
                  className="button secondary compact"
                  disabled={
                    !Number.isInteger(Number(amount)) ||
                    Number(amount) < 1 ||
                    Number(amount) > 9999
                  }
                  onClick={() =>
                    patchFocus({
                      hp: Math.max(-9999, focus.hp - Number(amount)),
                    })
                  }
                >
                  − Daño
                </button>
                <button
                  className="button secondary compact"
                  disabled={
                    !Number.isInteger(Number(amount)) ||
                    Number(amount) < 1 ||
                    Number(amount) > 9999 ||
                    focus.hp >= focus.maxHp
                  }
                  onClick={() =>
                    patchFocus({
                      hp: Math.min(focus.maxHp, focus.hp + Number(amount)),
                    })
                  }
                >
                  + Curar
                </button>
              </div>
            </div>
            <label className="form-field">
              Estados y recordatorios
              <input
                maxLength={500}
                value={focus.conditions}
                onChange={(event) =>
                  patchFocus({ conditions: event.target.value })
                }
                placeholder="Ej. Aturdido · hasta su próximo turno"
              />
            </label>
            {focus.kind === "player" && !source ? (
              <p className="helper-text">
                Este jugador ya no está en la contienda. Su registro del
                encuentro se conserva.
              </p>
            ) : (
              <EntityDetails
                entity={source || focus}
                player={Boolean(source)}
              />
            )}
            <button
              className="text-button dm-danger"
              onClick={() =>
                onDelete(
                  "Retirar participante",
                  `Se retirará a ${focus.name} del encuentro y del mapa.`,
                  () => onChange(removeCombatant(workspace, focus.id)),
                )
              }
            >
              <Icon name="trash" size={16} />
              Retirar del encuentro
            </button>
          </article>
        </div>
      ) : (
        <div className="empty-state">
          <Icon name="sword" size={34} />
          <h3>Todo el combate, en una sola mesa</h3>
          <p>
            Añade a tu grupo y a las criaturas. Consulta sus acciones aquí sin
            saltar entre páginas.
          </p>
        </div>
      )}
      {ordered.length > 0 && (
        <button
          className="text-button dm-danger dm-reset"
          onClick={() =>
            onDelete(
              "Cerrar encuentro",
              "Se vaciará el combate y se retirarán sus fichas del mapa. La biblioteca, el diario y el terreno se conservan.",
              () =>
                onChange({
                  ...workspace,
                  combat: {
                    name: "Nuevo encuentro",
                    round: 1,
                    activeId: "",
                    combatants: [],
                  },
                  map: { ...workspace.map, tokens: [] },
                }),
            )
          }
        >
          Cerrar y vaciar encuentro
        </button>
      )}
    </section>
  );
}
