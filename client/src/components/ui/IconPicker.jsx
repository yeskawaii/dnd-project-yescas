import { characterIcons } from "../../utils/characterCustomization";
import Icon from "./Icon";

export default function IconPicker({
  value,
  onChange,
  label = "Elige un icono",
  allowDefault = false,
  disabled = false,
}) {
  return (
    <fieldset className="icon-picker" disabled={disabled}>
      <legend>{label}</legend>
      <div className="icon-picker-grid">
        {allowDefault && (
          <button
            type="button"
            className={!value ? "selected" : ""}
            aria-pressed={!value}
            onClick={() => onChange("")}
          >
            <Icon name="undo" />
            <span>Auto</span>
          </button>
        )}
        {characterIcons.map(([id, name]) => (
          <button
            type="button"
            key={id}
            className={value === id ? "selected" : ""}
            aria-pressed={value === id}
            onClick={() => onChange(id)}
          >
            <Icon name={id} size={23} />
            <span>{name}</span>
          </button>
        ))}
      </div>
    </fieldset>
  );
}
