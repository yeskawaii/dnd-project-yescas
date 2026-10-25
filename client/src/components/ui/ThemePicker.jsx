import Icon from "./Icon";
import { appearanceStyle, characterThemes } from "../../utils/characterCustomization";

export default function ThemePicker({ value, onChange, emblem = "palette" }) {
  return (
    <div className="theme-grid" role="group" aria-label="Paletas de color">
      {characterThemes.map((theme) => (
        <button
          type="button"
          key={theme.id}
          style={appearanceStyle({ theme: theme.id })}
          className={`theme-option ${value === theme.id ? "selected" : ""}`}
          aria-pressed={value === theme.id}
          onClick={() => onChange(theme.id)}
        >
          <span className="theme-swatch"><Icon name={emblem} size={22} /></span>
          <strong>{theme.name}</strong>
          <small>{theme.hint}</small>
          {value === theme.id && <Icon name="check" size={15} />}
        </button>
      ))}
    </div>
  );
}
