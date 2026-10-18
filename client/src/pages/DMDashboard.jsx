import { useEffect, useState } from "react";
import { toast } from "sonner";
import api from "../api/axios";
import AddCampaignModal from "../components/AddCampaignModal";
import Icon from "../components/ui/Icon";
import { calculateMod } from "../utils/conversions";
import { bonus } from "../utils/quickActions";

export default function DMDashboard({ onBack }) {
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [players, setPlayers] = useState([]);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [sorting, setSorting] = useState(false);
  const [rolls, setRolls] = useState({});
  useEffect(() => {
    let active = true;
    api
      .get("/campaign/my-campaigns")
      .then(({ data }) => {
        if (active) setCampaigns(data);
      })
      .catch(() => {
        if (active) setFailed(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);
  const view = async (id, refresh = false) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/campaign/${id}/dashboard`);
      setSelectedCampaign(data.campaign);
      setPlayers(data.players);
      if (!refresh) {
        setRolls({});
        setSorting(false);
      } else toast.success("Datos de los personajes actualizados.");
    } catch {
      toast.error("No se pudo cargar la contienda. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };
  const create = async (name) => {
    try {
      const { data } = await api.post("/campaign/create", { name });
      setCampaigns((previous) => [...previous, data]);
      toast.success("Tu contienda está lista.");
      return data;
    } catch {
      toast.error("No se pudo crear la contienda.");
      return null;
    }
  };
  const initiative = (player) =>
    calculateMod(player.stats?.Destreza) + (player.initiativeMisc || 0);
  const listed = sorting
    ? [...players].sort((a, b) => {
        const aHasRoll = rolls[a._id] !== undefined && rolls[a._id] !== "";
        const bHasRoll = rolls[b._id] !== undefined && rolls[b._id] !== "";
        if (aHasRoll !== bHasRoll) return aHasRoll ? -1 : 1;
        return (
          (Number(rolls[b._id]) || 0) +
            initiative(b) -
            ((Number(rolls[a._id]) || 0) + initiative(a)) ||
          (b.stats?.Destreza || 10) - (a.stats?.Destreza || 10)
        );
      })
    : players;
  return (
    <div className="entry-page dm-dashboard">
      <header className="entry-topbar">
        <button
          className="text-button"
          onClick={selectedCampaign ? () => setSelectedCampaign(null) : onBack}
        >
          <Icon name="back" size={18} />
          {selectedCampaign ? "Mis contiendas" : "Volver"}
        </button>
        <div className="wordmark">
          <Icon name="book" size={20} />
          Dungeon Master
        </div>
      </header>
      {!selectedCampaign ? (
        <>
          <div className="entry-heading">
            <p className="eyebrow">Detrás de cada gran aventura</p>
            <h1>
              Tu historia.
              <br />
              <em>Su próxima hazaña.</em>
            </h1>
            <p>Reúne a tus jugadores y ten sus personajes a la vista.</p>
          </div>
          <div className="section-heading">
            <h2>Mis contiendas</h2>
            <button
              className="button primary compact"
              onClick={() => setCreating(true)}
            >
              <Icon name="plus" size={16} />
              Crear
            </button>
          </div>
          {loading && (
            <p className="helper-text" role="status">
              Cargando tus contiendas…
            </p>
          )}
          {failed && (
            <div className="surface">
              <p className="helper-text">
                No se pudieron cargar las contiendas.
              </p>
              <button
                className="button secondary"
                onClick={() => {
                  setFailed(false);
                  setLoading(true);
                  api
                    .get("/campaign/my-campaigns")
                    .then(({ data }) => setCampaigns(data))
                    .catch(() => setFailed(true))
                    .finally(() => setLoading(false));
                }}
              >
                Reintentar
              </button>
            </div>
          )}
          <div className="campaign-list">
            {campaigns.map((campaign) => (
              <button
                className="campaign-card"
                key={campaign._id}
                onClick={() => view(campaign._id)}
                disabled={loading}
              >
                <span className="action-emblem tone-amber">
                  <Icon name="book" size={24} />
                </span>
                <span>
                  <strong>{campaign.name}</strong>
                  <small>Invitación · {campaign.inviteCode}</small>
                </span>
                <Icon name="chevron" />
              </button>
            ))}
          </div>
          {!loading && !failed && !campaigns.length && (
            <div className="empty-state">
              <Icon name="book" size={32} />
              <h3>Hay una historia por contar</h3>
              <p>Crea una contienda y comparte el código con tu grupo.</p>
            </div>
          )}
          {creating && (
            <AddCampaignModal
              isOpen
              onClose={() => setCreating(false)}
              onAdd={create}
            />
          )}
        </>
      ) : (
        <>
          <div className="entry-heading">
            <p className="eyebrow">Tu grupo de aventureros</p>
            <h1>{selectedCampaign.name}</h1>
            <p>Consulta los personajes y ordena las tiradas de iniciativa.</p>
          </div>
          <div className="dm-invite">
            <div>
              <span className="eyebrow">Código de invitación</span>
              <strong>{selectedCampaign.inviteCode}</strong>
            </div>
            <button
              className="button secondary compact"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(
                    selectedCampaign.inviteCode,
                  );
                  toast.success("Código copiado.");
                } catch {
                  toast.error(
                    "No se pudo copiar. Comparte el código que aparece en pantalla.",
                  );
                }
              }}
            >
              <Icon name="link" size={16} />
              Copiar
            </button>
          </div>
          <div className="dm-toolbar">
            <button
              className={`button ${sorting ? "primary" : "secondary"}`}
              onClick={() => setSorting((previous) => !previous)}
              aria-pressed={sorting}
            >
              <Icon name="bolt" size={17} />
              {sorting ? "Por iniciativa" : "Ordenar iniciativa"}
            </button>
            <button
              className="icon-button"
              aria-label="Reiniciar tiradas de iniciativa"
              onClick={() => {
                setRolls({});
                setSorting(false);
              }}
            >
              <Icon name="undo" />
            </button>
            <button
              className="text-button"
              disabled={loading}
              onClick={() => view(selectedCampaign._id, true)}
            >
              {loading ? "Actualizando…" : "Actualizar"}
            </button>
          </div>
          <p className="helper-text">
            Anota el resultado del d20. El bono del personaje se suma
            automáticamente.
          </p>
          <div className="dm-player-grid">
            {listed.map((player, index) => {
              const armor = player.armorClass || {};
              const ca =
                10 +
                calculateMod(player.stats?.Destreza) +
                (armor.armor || 0) +
                (armor.shield || 0) +
                (armor.natural || 0) +
                (armor.misc || 0);
              const hasRoll =
                rolls[player._id] !== undefined && rolls[player._id] !== "";
              const percent = Math.max(
                0,
                Math.min(
                  100,
                  player.hp?.max > 0
                    ? (player.hp.current / player.hp.max) * 100
                    : 0,
                ),
              );
              return (
                <article className="dm-player" key={player._id}>
                  <div className="dm-player-heading">
                    <span className="character-avatar">
                      {sorting ? index + 1 : <Icon name="sword" />}
                    </span>
                    <div>
                      <h2>{player.name}</h2>
                      <p>
                        {player.class} · Nivel {player.level}
                      </p>
                    </div>
                    <span className="armor-badge">
                      <Icon name="shield" size={14} />
                      {ca}
                    </span>
                  </div>
                  <div className="dm-health">
                    <span>Vida</span>
                    <strong>
                      {player.hp?.current || 0}{" "}
                      <small>/ {player.hp?.max || 0}</small>
                    </strong>
                  </div>
                  <div
                    className={`weight-track ${percent <= 25 ? "overweight" : ""}`}
                  >
                    <span style={{ width: `${percent}%` }} />
                  </div>
                  <div className="initiative-row">
                    <label>
                      Tirada d20
                      <input
                        type="number"
                        inputMode="numeric"
                        min={1}
                        max={20}
                        aria-label={`Iniciativa de ${player.name}`}
                        placeholder="—"
                        value={rolls[player._id] ?? ""}
                        onChange={(event) => {
                          const value = event.target.value;
                          setRolls((previous) => ({
                            ...previous,
                            [player._id]:
                              value === ""
                                ? ""
                                : Math.max(
                                    1,
                                    Math.min(20, Math.trunc(Number(value))),
                                  ),
                          }));
                        }}
                      />
                    </label>
                    <span>+</span>
                    <div>
                      <span>Bono</span>
                      <strong>{bonus(initiative(player))}</strong>
                    </div>
                    <span>=</span>
                    <div className="initiative-total">
                      <span>Iniciativa</span>
                      <strong>
                        {hasRoll
                          ? Number(rolls[player._id]) + initiative(player)
                          : "—"}
                      </strong>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
          {!players.length && (
            <div className="empty-state">
              <Icon name="link" size={32} />
              <h3>La mesa está lista</h3>
              <p>
                Comparte el código para que tus jugadores se unan. Después toca
                Actualizar.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
