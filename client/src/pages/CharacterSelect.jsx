import { useRef, useState } from "react";
import api from "../api/axios";
import { toast } from "sonner";
import JoinCampaignModal from "../components/JoinCampaignModal";
import Icon from "../components/ui/Icon";

export default function CharacterSelect({
  characters,
  setCharacters,
  setSelectedChar,
  setMode,
  askDelete,
}) {
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const creationPending = useRef(false);
  const create = async () => {
    if (creationPending.current) return;
    creationPending.current = true;
    setIsCreating(true);
    try {
      const { data } = await api.post("/character", {});
      setCharacters((previous) => [...previous, data]);
      setSelectedChar(data);
      toast.success("Ficha lista. Personalízala en la pestaña Personaje.");
    } catch {
      toast.error("No se pudo crear el personaje. Inténtalo de nuevo.");
    } finally {
      creationPending.current = false;
      setIsCreating(false);
    }
  };
  const join = async (inviteCode, characterId) => {
    try {
      const { data } = await api.post("/campaign/join", {
        inviteCode,
        characterId,
      });
      setCharacters((previous) =>
        previous.map((character) =>
          character._id === characterId ? data.character : character,
        ),
      );
      toast.success(data.message);
      return true;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "No se pudo unir a la contienda",
      );
      return false;
    }
  };
  const remove = (id) =>
    askDelete(
      "Eliminar personaje",
      "Se eliminará este personaje y todos sus recursos. Esta acción no se puede deshacer.",
      async () => {
        try {
          await api.delete(`/character/${id}`);
          setCharacters((previous) =>
            previous.filter((character) => character._id !== id),
          );
        } catch {
          toast.error("No se pudo eliminar el personaje.");
        }
      },
    );
  return (
    <div className="entry-page">
      <header className="entry-topbar">
        <button className="text-button" onClick={() => setMode("lobby")}>
          <Icon name="back" size={18} />
          Volver
        </button>
        <div className="wordmark">
          <Icon name="dice" size={20} />
          Grimorio
        </div>
      </header>
      <div className="entry-heading">
        <p className="eyebrow">Tus compañeros de aventura</p>
        <h1>
          ¿Quién serás <em>hoy?</em>
        </h1>
        <p>
          Elige un personaje y vuelve a la acción. Tu mesa estará justo como la
          dejaste.
        </p>
      </div>
      <div className="character-select-list">
        {characters.map((character) => (
          <article className="character-select-card" key={character._id}>
            <button
              className="character-select-open"
              onClick={() => setSelectedChar(character)}
            >
              <span className="character-avatar">
                <Icon name="sword" size={24} />
              </span>
              <div>
                <h2>{character.name}</h2>
                <p>
                  {character.class} · Nivel {character.level}
                </p>
                {character.campaign?.name && (
                  <small>{character.campaign.name}</small>
                )}
              </div>
              <Icon name="chevron" />
            </button>
            <button
              className="icon-button"
              onClick={() => remove(character._id)}
              aria-label={`Eliminar ${character.name}`}
            >
              <Icon name="trash" size={18} />
            </button>
          </article>
        ))}
      </div>
      {!characters.length && (
        <div className="favorites-empty">
          <span className="empty-illustration">
            <Icon name="sword" size={30} />
          </span>
          <h3>Tu primera historia te espera.</h3>
          <p>
            Crea una ficha y personaliza tu nombre, clase, atributos y equipo.
          </p>
        </div>
      )}
      <div className="selection-actions">
        <button
          className="button primary"
          onClick={create}
          disabled={isCreating}
          aria-busy={isCreating}
        >
          <Icon name="plus" size={18} />
          {isCreating ? "Abriendo ficha…" : "Crear nuevo personaje"}
        </button>
        <button
          className="button secondary"
          onClick={() => setIsJoinModalOpen(true)}
          disabled={!characters.length}
        >
          <Icon name="link" size={18} />
          Unirse a contienda
        </button>
      </div>
      <p className="selection-hint">
        Una ficha lista para editar. Una mesa lista para jugar.
      </p>
      {isJoinModalOpen && (
        <JoinCampaignModal
          isOpen
          onClose={() => setIsJoinModalOpen(false)}
          onJoin={join}
          characters={characters}
        />
      )}
    </div>
  );
}
