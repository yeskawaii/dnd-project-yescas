import { useRef, useState } from "react";
import Icon from "./Icon";

export default function EditableText({
  value,
  onSave,
  label = "dato",
  className = "",
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const active = useRef(false);
  const finish = () => {
    if (!active.current) return;
    active.current = false;
    setEditing(false);
    const next = draft.trim();
    if (next && next !== value) onSave(next);
  };
  if (editing)
    return (
      <input
        autoFocus
        aria-label={label}
        value={draft}
        onFocus={(event) => event.target.select()}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={finish}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            finish();
          } else if (event.key === "Escape") {
            event.preventDefault();
            active.current = false;
            setEditing(false);
          }
        }}
        className={`editable-input ${className}`}
      />
    );
  return (
    <button
      type="button"
      className={`editable-control ${className}`}
      title={`Editar ${label}`}
      aria-label={`Editar ${label}: ${value || "Vacío"}`}
      onClick={() => {
        setDraft(value || "");
        active.current = true;
        setEditing(true);
      }}
    >
      <span>{value || "Sin definir"}</span>
      <Icon name="edit" size={11} />
    </button>
  );
}
