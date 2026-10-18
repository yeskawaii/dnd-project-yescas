import { useEffect, useState } from "react";
import { toast } from "sonner";
import api from "../api/axios";
import AddCampaignModal from "../components/AddCampaignModal";
import Icon from "../components/ui/Icon";
import DMWorkspace from "../components/dm/DMWorkspace";

export default function DMDashboard({ onBack }) {
  const [campaigns, setCampaigns] = useState([]);
  const [selected, setSelected] = useState(null);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
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
  const view = async (id) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/campaign/${id}/dashboard`);
      setSelected(data);
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
  if (selected)
    return (
      <DMWorkspace
        key={selected.campaign._id}
        campaign={selected.campaign}
        initialPlayers={selected.players}
        onBack={() => setSelected(null)}
      />
    );
  return (
    <div className="entry-page dm-dashboard">
      <header className="entry-topbar">
        <button className="text-button" onClick={onBack}>
          <Icon name="back" size={18} />
          Volver
        </button>
        <div className="wordmark">
          <Icon name="book" size={20} />
          Dungeon Master
        </div>
      </header>
      <div className="entry-heading">
        <p className="eyebrow">Detrás de cada gran aventura</p>
        <h1>
          Tu historia.
          <br />
          <em>Su próxima hazaña.</em>
        </h1>
        <p>
          Prepara criaturas, dirige el combate y lleva la historia de tu grupo.
        </p>
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
          <p className="helper-text">No se pudieron cargar las contiendas.</p>
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
    </div>
  );
}
