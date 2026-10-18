import { useState } from "react";
import BottomSheet from "./ui/BottomSheet";
import Icon from "./ui/Icon";

export default function JoinCampaignModal({
  isOpen,
  onClose,
  onJoin,
  characters,
}) {
  const [code, setCode] = useState("");
  const [characterId, setCharacterId] = useState(characters[0]?._id || "");
  const [pending, setPending] = useState(false);
  if (!isOpen) return null;
  return (
    <BottomSheet
      title="Unirse a una contienda"
      subtitle="Una historia en compañía"
      onClose={() => {
        if (!pending) onClose();
      }}
    >
      <form
        className="resource-form"
        onSubmit={async (event) => {
          event.preventDefault();
          if (pending || !code.trim() || !characterId) return;
          setPending(true);
          try {
            if (await onJoin(code.trim().toUpperCase(), characterId)) onClose();
          } finally {
            setPending(false);
          }
        }}
      >
        <p className="helper-text">
          Pide el código a tu Dungeon Master y elige con quién entrarás a la
          aventura.
        </p>
        <label className="form-field">
          Código de invitación
          <input
            required
            autoCapitalize="characters"
            autoComplete="off"
            spellCheck={false}
            placeholder="Ej. AB12CD"
            value={code}
            onChange={(event) => setCode(event.target.value)}
          />
        </label>
        <label className="form-field">
          Tu personaje
          <select
            value={characterId}
            onChange={(event) => setCharacterId(event.target.value)}
          >
            {characters.map((character) => (
              <option key={character._id} value={character._id}>
                {character.name} · Nivel {character.level}
              </option>
            ))}
          </select>
        </label>
        <button
          className="button primary full-width"
          disabled={pending || !characterId || !code.trim()}
        >
          <Icon name="link" />
          {pending ? "Entrando…" : "Unirme a la contienda"}
        </button>
      </form>
    </BottomSheet>
  );
}
