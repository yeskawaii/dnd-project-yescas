import { useEffect, useEffectEvent, useRef, useState } from "react";
import { toast } from "sonner";
import api from "../../api/axios";
import Icon from "../ui/Icon";
import BottomSheet from "../ui/BottomSheet";
import ActorForm from "./ActorForm";
import EntityDetails from "./EntityDetails";
import NotesPanel from "./NotesPanel";
import BattleMap from "./BattleMap";
import PartyCompanions from "./PartyCompanions";
import CombatPanel from "./CombatPanel";
import PresentationPanel from "./PresentationPanel";
import "../shared-table/sharedTable.css";
import {
  armorClass,
  emptyWorkspace,
  kindLabels,
  makeCombatant,
  makeCompanionCombatant,
  companionSourceId,
  newId,
} from "../../utils/dmWorkspace";

const tabs = [
  ["presentation", "eye", "Compartir"],
  ["combat", "sword", "Combate"],
  ["party", "shield", "Grupo"],
  ["library", "book", "Criaturas"],
  ["notes", "note", "Diario"],
  ["map", "map", "Mapa"],
];
export default function DMWorkspace({ campaign, initialPlayers, onBack }) {
  const [workspace, setWorkspace] = useState(
    () => campaign.dmWorkspace || emptyWorkspace(),
  );
  const [revision, setRevision] = useState(campaign.workspaceRevision || 0);
  const [players, setPlayers] = useState(initialPlayers);
  const [tab, setTab] = useState("combat");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [undo, setUndo] = useState(null);
  const [editing, setEditing] = useState(null);
  const [confirmation, setConfirmation] = useState(null);
  const [search, setSearch] = useState("");
  const [kind, setKind] = useState("all");
  const [partyFocus, setPartyFocus] = useState("");
  const saveLock = useRef(false);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  const change = (next) => {
    if (saveLock.current) return;
    setUndo(workspace);
    setWorkspace(next);
    setDirty(true);
  };
  const ask = (title, message, action) =>
    setConfirmation({ title, message, action });
  const save = async (nextWorkspace = workspace, quiet = false) => {
    if (saveLock.current) return;
    saveLock.current = true;
    setSaving(true);
    setSaveError("");
    try {
      const { data } = await api.put(`/campaign/${campaign._id}/workspace`, {
        workspace: nextWorkspace,
        revision,
      }, { timeout: 15000 });
      setWorkspace(data.workspace);
      setRevision(data.revision);
      setDirty(false);
      setUndo(null);
      if (!quiet) toast.success("Mesa guardada. La vista del grupo está actualizada.");
      return true;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "No se guardó la mesa. Revisa tu conexión y vuelve a intentarlo.";
      setSaveError(message);
      toast.error(message);
      return false;
    } finally {
      saveLock.current = false;
      setSaving(false);
    }
  };
  const saveLiveTable = useEffectEvent(() => save(workspace, true));
  useEffect(() => {
    if (!dirty || saving || saveError || !workspace.presentation?.enabled) return;
    let timer;
    const saveWhenReady = () => {
      // Editors use portals outside the disabled fieldset. Let every editor finish first.
      if (document.querySelector('[role="dialog"]')) {
        timer = window.setTimeout(saveWhenReady, 1000);
        return;
      }
      saveLiveTable();
    };
    timer = window.setTimeout(saveWhenReady, 1000);
    return () => window.clearTimeout(timer);
  }, [dirty, saving, saveError, workspace]);
  const publish = (nextWorkspace) => {
    if (saveLock.current) return;
    change(nextWorkspace);
    return save(nextWorkspace);
  };
  const refreshPlayers = async () => {
    setRefreshing(true);
    try {
      const { data } = await api.get(`/campaign/${campaign._id}/dashboard`);
      setPlayers(data.players);
      toast.success("Fichas del grupo actualizadas.");
    } catch {
      toast.error("No se pudo actualizar el grupo.");
    } finally {
      setRefreshing(false);
    }
  };
  const add = (entities, isPlayer) => {
    const combatants = [...workspace.combat.combatants];
    for (const entity of entities) {
      if (
        isPlayer &&
        combatants.some(
          (entry) => entry.kind === "player" && entry.sourceId === entity._id,
        )
      )
        continue;
      if (combatants.length >= 100) {
        toast.error("El encuentro admite hasta 100 participantes.");
        break;
      }
      combatants.push(makeCombatant(entity, isPlayer, combatants));
    }
    change({ ...workspace, combat: { ...workspace.combat, combatants } });
  };
  const addCompanion = (player, companion) => {
    const combatants = workspace.combat.combatants;
    if (!companion.active || combatants.length >= 100 || combatants.some((entry) => entry.sourceId === companionSourceId(player, companion))) return;
    change({ ...workspace, combat: { ...workspace.combat, combatants: [...combatants, makeCompanionCombatant(player, companion, combatants)] } });
    toast.success(`${companion.name} añadido al encuentro.`);
  };
  const focusedPlayer =
    players.find((player) => player._id === partyFocus) || players[0];
  const filteredActors = workspace.actors.filter(
    (actor) =>
      (kind === "all" || kind === actor.kind) &&
      `${actor.name} ${actor.description} ${actor.actions}`
        .toLocaleLowerCase()
        .includes(search.toLocaleLowerCase()),
  );
  const leave = () =>
    dirty
      ? ask(
          "Hay cambios sin guardar",
          "Guarda la mesa para conservar el combate, las notas y el mapa antes de volver.",
          onBack,
        )
      : onBack();
  return (
    <div className="entry-page dm-dashboard dm-workspace">
      <header className="entry-topbar">
        <button className="text-button" disabled={saving} onClick={leave}>
          <Icon name="back" size={18} />
          Mis contiendas
        </button>
        <div className="wordmark">
          <Icon name="book" size={20} />
          Dungeon Master
        </div>
      </header>
      <div className="dm-workspace-heading">
        <div>
          <p className="eyebrow">Detrás de la pantalla</p>
          <h1>{campaign.name}</h1>
          <p>Tu grupo, tus criaturas y tu historia. Todo a la mano.</p>
        </div>
        <button
          className="button secondary compact"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(campaign.inviteCode);
              toast.success("Código copiado.");
            } catch {
              toast.error(`Código de invitación: ${campaign.inviteCode}`);
            }
          }}
        >
          <Icon name="link" size={16} />
          {campaign.inviteCode}
        </button>
      </div>
      <div className={`dm-savebar ${dirty ? "unsaved" : ""}`}>
        <span role="status">
          <span className="dm-status-dot" />
          {saving
            ? "Guardando mesa…"
            : dirty
              ? "Cambios sin guardar"
              : "Mesa guardada"}
        </span>
        <div className="dm-actions">
          <button
            className="icon-button"
            aria-label="Deshacer último cambio sin guardar"
            disabled={!undo || saving}
            onClick={() => {
              setWorkspace(undo);
              setUndo(null);
              setDirty(true);
            }}
          >
            <Icon name="undo" size={18} />
          </button>
          <button
            className="button primary compact"
            disabled={!dirty || saving}
            onClick={() => save()}
          >
            {saving ? "Guardando…" : "Guardar mesa"}
          </button>
        </div>
      </div>
      {saveError && (
        <p className="dm-save-error" role="alert">
          {saveError} Tus cambios siguen en esta pantalla.
        </p>
      )}
      <nav className="dm-tabs" aria-label="Herramientas del Dungeon Master">
        {tabs.map(([id, icon, label]) => (
          <button
            key={id}
            aria-current={tab === id ? "page" : undefined}
            className={tab === id ? "active" : ""}
            onClick={() => setTab(id)}
          >
            <Icon name={icon} size={19} />
            <span>{label}</span>
            {id === "library" && workspace.actors.length > 0 && (
              <small>{workspace.actors.length}</small>
            )}
          </button>
        ))}
      </nav>
      <fieldset className="dm-tool-content" disabled={saving}>
        {tab === "presentation" && (
          <PresentationPanel
            workspace={workspace}
            players={players}
            onChange={change}
            onPublish={publish}
            onDelete={ask}
            onRefreshPlayers={refreshPlayers}
            refreshing={refreshing}
          />
        )}
        {tab === "combat" && (
          <CombatPanel
            workspace={workspace}
            players={players}
            onChange={change}
            onAddPlayers={() => add(players, true)}
            onBrowseParty={() => setTab("party")}
            onAddCompanion={addCompanion}
            onBrowseLibrary={() => setTab("library")}
            onDelete={ask}
          />
        )}
        {tab === "party" && (
          <section>
            <div className="section-heading">
              <div>
                <p className="eyebrow">Consulta sin salir de la mesa</p>
                <h2>Personajes del grupo</h2>
              </div>
              <button
                className="button secondary compact"
                disabled={refreshing}
                onClick={refreshPlayers}
              >
                {refreshing ? "Actualizando…" : "Actualizar fichas"}
              </button>
            </div>
            <p className="helper-text">
              Consulta las fichas actuales. Actualizarlas no reemplaza el
              registro de vida del encuentro.
            </p>
            <div className="dm-combat-layout">
              <aside className="dm-party-list">
                {players.map((player) => (
                  <div
                    className={`surface dm-party-card ${focusedPlayer?._id === player._id ? "selected" : ""}`}
                    key={player._id}
                  >
                    <button
                      className="dm-party-select"
                      aria-pressed={focusedPlayer?._id === player._id}
                      onClick={() => setPartyFocus(player._id)}
                    >
                      <strong>{player.name}</strong>
                      <small>
                        {player.class} · Nivel {player.level}
                      </small>
                      <span>
                        {player.hp?.current ?? 0} / {player.hp?.max ?? 0} PV ·
                        CA {armorClass(player)}
                      </span>
                    </button>
                    <button
                      className="button secondary compact"
                      disabled={
                        workspace.combat.combatants.length >= 100 ||
                        workspace.combat.combatants.some(
                          (entry) =>
                            entry.kind === "player" &&
                            entry.sourceId === player._id,
                        )
                      }
                      onClick={() => {
                        add([player], true);
                        toast.success(`${player.name} añadido al encuentro.`);
                      }}
                    >
                      Añadir al encuentro
                    </button>
                  </div>
                ))}
              </aside>
              {focusedPlayer && (
                <article className="surface dm-focus">
                  <div className="dm-focus-heading">
                    <div>
                      <p className="eyebrow">Ficha de consulta</p>
                      <h2>{focusedPlayer.name}</h2>
                    </div>
                  </div>
                  <EntityDetails entity={focusedPlayer} player />
                  <PartyCompanions player={focusedPlayer} combatants={workspace.combat.combatants} onAdd={addCompanion} />
                </article>
              )}
            </div>
            {!players.length && (
              <div className="empty-state">
                <Icon name="link" size={30} />
                <h3>Invita a tus aventureros</h3>
                <p>
                  Comparte el código {campaign.inviteCode}. Cuando se unan, toca
                  Actualizar fichas.
                </p>
              </div>
            )}
          </section>
        )}
        {tab === "library" && (
          <section>
            <div className="section-heading">
              <div>
                <p className="eyebrow">Tu reparto, siempre listo</p>
                <h2>Monstruos, NPC y aliados</h2>
              </div>
              <button
                className="button primary compact"
                disabled={workspace.actors.length >= 200}
                onClick={() => setEditing({})}
              >
                <Icon name="plus" size={17} />
                Crear criatura
              </button>
            </div>
            <p className="helper-text">
              Crea una ficha breve y añade tantas copias al combate como
              necesites. Cada copia tiene vida y estados independientes.
            </p>
            <div className="dm-filter-row">
              <label className="form-field">
                Buscar criaturas
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Nombre, habilidad o historia…"
                />
              </label>
              <label className="form-field">
                Tipo
                <select
                  value={kind}
                  onChange={(event) => setKind(event.target.value)}
                >
                  <option value="all">Todos</option>
                  {["monster", "npc", "ally"].map((key) => (
                    <option key={key} value={key}>
                      {kindLabels[key]}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="dm-library-grid">
              {filteredActors.map((actor) => (
                <article className="surface dm-library-card" key={actor.id}>
                  <div className="dm-focus-heading">
                    <div>
                      <p className="eyebrow">{kindLabels[actor.kind]}</p>
                      <h3>{actor.name}</h3>
                    </div>
                    <span className="armor-badge">
                      <Icon name="shield" size={14} />
                      {actor.ac}
                    </span>
                  </div>
                  <p className="helper-text">
                    {actor.maxHp} PV · Iniciativa{" "}
                    {actor.initiativeBonus >= 0 ? "+" : ""}
                    {actor.initiativeBonus}
                  </p>
                  <details className="dm-detail-item">
                    <summary>Acciones e historia</summary>
                    <EntityDetails entity={actor} />
                  </details>
                  <div className="dm-actions">
                    <button
                      className="button primary compact"
                      disabled={workspace.combat.combatants.length >= 100}
                      onClick={() => {
                        add([actor], false);
                        toast.success(`${actor.name} añadido al encuentro.`);
                      }}
                    >
                      <Icon name="plus" size={15} />
                      Al combate
                    </button>
                    <button
                      className="icon-button"
                      aria-label={`Editar ${actor.name}`}
                      onClick={() => setEditing(actor)}
                    >
                      <Icon name="edit" size={17} />
                    </button>
                    <button
                      className="icon-button"
                      disabled={workspace.actors.length >= 200}
                      aria-label={`Duplicar ${actor.name}`}
                      onClick={() =>
                        change({
                          ...workspace,
                          actors: [
                            ...workspace.actors,
                            {
                              ...actor,
                              id: newId(),
                              name: `${actor.name.slice(0, 110)} (copia)`,
                            },
                          ],
                        })
                      }
                    >
                      <Icon name="copy" size={17} />
                    </button>
                    <button
                      className="icon-button"
                      aria-label={`Eliminar ${actor.name}`}
                      onClick={() =>
                        ask(
                          "Eliminar criatura",
                          `Se quitará «${actor.name}» de la biblioteca. Sus copias en combate se conservan.`,
                          () =>
                            change({
                              ...workspace,
                              actors: workspace.actors.filter(
                                (entry) => entry.id !== actor.id,
                              ),
                            }),
                        )
                      }
                    >
                      <Icon name="trash" size={17} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
            {!filteredActors.length && (
              <div className="empty-state">
                <Icon name="book" size={32} />
                <h3>
                  {workspace.actors.length
                    ? "Sin coincidencias"
                    : "Prepara a quienes habitan tu mundo"}
                </h3>
                <p>
                  Crea criaturas con sus ataques, defensas, motivaciones y
                  secretos.
                </p>
              </div>
            )}
          </section>
        )}
        {tab === "notes" && (
          <NotesPanel
            notes={workspace.notes}
            onChange={(notes) => change({ ...workspace, notes })}
            onDelete={ask}
          />
        )}
        {tab === "map" && (
          <BattleMap
            map={workspace.map}
            combatants={workspace.combat.combatants}
            activeId={workspace.combat.activeId}
            onChange={(map) => change({ ...workspace, map })}
            onDelete={ask}
          />
        )}
      </fieldset>
      {editing && (
        <ActorForm
          actor={editing.id ? editing : null}
          onClose={() => setEditing(null)}
          onSave={(actor) => {
            change({
              ...workspace,
              actors: workspace.actors.some((entry) => entry.id === actor.id)
                ? workspace.actors.map((entry) =>
                    entry.id === actor.id ? actor : entry,
                  )
                : [...workspace.actors, actor],
            });
            setEditing(null);
          }}
        />
      )}
      {confirmation && (
        <BottomSheet
          title={confirmation.title}
          subtitle="Tu mesa de aventura"
          onClose={() => setConfirmation(null)}
        >
          <p className="detail-description">{confirmation.message}</p>
          <div className="button-row">
            <button
              className="button secondary"
              disabled={saving}
              onClick={() => setConfirmation(null)}
            >
              Cancelar
            </button>
            {confirmation.title === "Hay cambios sin guardar" ? (
              <>
                <button
                  className="button secondary"
                  disabled={saving}
                  onClick={() => {
                    setConfirmation(null);
                    onBack();
                  }}
                >
                  Salir sin guardar
                </button>
                <button
                  className="button primary"
                  disabled={saving}
                  onClick={async () => {
                    if (await save()) {
                      setConfirmation(null);
                      onBack();
                    }
                  }}
                >
                  Guardar y salir
                </button>
              </>
            ) : (
              <button
                className="button primary"
                onClick={() => {
                  confirmation.action();
                  setConfirmation(null);
                }}
              >
                Confirmar
              </button>
            )}
          </div>
        </BottomSheet>
      )}
    </div>
  );
}
