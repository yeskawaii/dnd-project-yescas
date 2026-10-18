import { useState } from "react";
import BottomSheet from "./ui/BottomSheet";
import Icon from "./ui/Icon";

export default function AddCampaignModal({ isOpen, onClose, onAdd }) {
  const [name, setName] = useState("");
  const [pending, setPending] = useState(false);
  if (!isOpen) return null;
  return (
    <BottomSheet
      title="Una nueva contienda"
      subtitle="Tú pones la historia"
      onClose={() => {
        if (!pending) onClose();
      }}
    >
      <form
        className="resource-form"
        onSubmit={async (event) => {
          event.preventDefault();
          if (pending || !name.trim()) return;
          setPending(true);
          try {
            if (await onAdd(name.trim())) onClose();
          } finally {
            setPending(false);
          }
        }}
      >
        <label className="form-field">
          Nombre de la aventura
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="El santuario del bosque"
            required
            maxLength={120}
          />
        </label>
        <p className="helper-text">
          Se creará un código de invitación para que tus jugadores se unan con
          sus personajes.
        </p>
        <button
          className="button primary full-width"
          disabled={pending || !name.trim()}
        >
          <Icon name="plus" />
          {pending ? "Creando…" : "Crear contienda"}
        </button>
      </form>
    </BottomSheet>
  );
}
