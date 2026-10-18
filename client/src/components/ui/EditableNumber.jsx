import { useRef, useState } from "react";
import Icon from "./Icon";

export default function EditableNumber({
  value,
  onSave,
  label = "valor",
  className = "",
  min,
  max,
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const active = useRef(false);
  const finish = () => {
    if (!active.current) return;
    active.current = false;
    setEditing(false);
    if (draft === "" || !Number.isFinite(Number(draft))) return;
    let next = Number(draft);
    if (min !== undefined) next = Math.max(min, next);
    if (max !== undefined) next = Math.min(max, next);
    if (next !== value) onSave(next);
  };
  if (editing)
    return (
      <input
        autoFocus
        aria-label={label}
        type="number"
        step="any"
        inputMode={min !== undefined && min >= 0 ? "decimal" : undefined}
        min={min}
        max={max}
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
        className={`editable-input editable-number ${className}`}
      />
    );
  return (
    <button
      type="button"
      title={`Editar ${label}`}
      aria-label={`Editar ${label}: ${value ?? 0}`}
      className={`editable-control editable-number ${className}`}
      onClick={() => {
        setDraft(String(value ?? 0));
        active.current = true;
        setEditing(true);
      }}
    >
      <span>{value ?? 0}</span>
      <Icon name="edit" size={10} />
    </button>
  );
}
