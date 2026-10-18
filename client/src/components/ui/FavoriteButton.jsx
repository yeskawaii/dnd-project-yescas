import Icon from "./Icon";

export default function FavoriteButton({ active, onClick, disabled, name }) {
  return (
    <button
      className={`icon-button favorite-button ${active ? "is-favorite" : ""}`}
      aria-label={`${active ? "Quitar" : "Agregar"} ${name || ""} ${active ? "de" : "a"} favoritos`}
      aria-pressed={active}
      onClick={onClick}
      disabled={disabled}
    >
      <Icon name="star" fill={active ? "currentColor" : "none"} />
    </button>
  );
}
