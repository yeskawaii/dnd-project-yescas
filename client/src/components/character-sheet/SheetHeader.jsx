import EditableText from "../ui/EditableText";
import EditableNumber from "../ui/EditableNumber";
import Icon from "../ui/Icon";

export default function SheetHeader({
  character,
  onUpdate,
  onBack,
  logout,
  saveState = "saved",
}) {
  return (
    <header className="character-header">
      <div className="character-header-inner">
        <button
          onClick={onBack}
          disabled={saveState === "saving"}
          className="icon-button"
          aria-label="Volver a mis personajes"
        >
          <Icon name="back" />
        </button>
        <div className="character-avatar">
          <Icon name="sword" size={23} />
        </div>
        <div className="character-identity">
          <EditableText
            value={character.name}
            onSave={(name) => onUpdate({ name })}
            label="Nombre"
            className="character-name"
          />
          <div className="character-meta">
            <EditableText
              value={character.class}
              onSave={(value) => onUpdate({ class: value })}
              label="Clase"
            />
            <span className="meta-divider" />
            <span>Nivel</span>
            <EditableNumber
              value={character.level}
              onSave={(level) => onUpdate({ level })}
              label="Nivel"
              min={1}
              max={20}
            />
          </div>
        </div>
        <div className={`save-status ${saveState}`} role="status">
          <span className="status-dot" />
          <span>
            {saveState === "saving"
              ? "Guardando…"
              : saveState === "error"
                ? "Sin guardar"
                : "Guardado"}
          </span>
        </div>
        <button
          onClick={logout}
          disabled={saveState === "saving"}
          className="icon-button logout-button"
          aria-label="Cerrar sesión"
        >
          <Icon name="logout" size={19} />
        </button>
      </div>
    </header>
  );
}
