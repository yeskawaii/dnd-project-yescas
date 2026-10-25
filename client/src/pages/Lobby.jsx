import Icon from "../components/ui/Icon";

export default function Lobby({ onSelectMode, logout, onRefreshApp }) {
  return (
    <div className="entry-page">
      <header className="entry-topbar">
        <div className="wordmark">
          <Icon name="dice" size={24} />
          Grimorio
        </div>
        <button className="text-button" onClick={logout}>
          <Icon name="logout" size={17} />
          Salir
        </button>
      </header>
      <div className="entry-heading">
        <p className="eyebrow">Bienvenido a tu próxima aventura</p>
        <h1>
          Las mejores historias
          <br />
          empiezan <em>en la mesa.</em>
        </h1>
        <p>
          Tu personaje, tus recursos y tu grupo. Todo listo para que te
          concentres en jugar.
        </p>
      </div>
      <div className="lobby-choices">
        <button className="lobby-choice" onClick={() => onSelectMode("player")}>
          <span className="action-emblem tone-mint">
            <Icon name="sword" size={25} />
          </span>
          <span className="choice-number">01 / JUGAR</span>
          <h2>Soy aventurero</h2>
          <p>Abre tu personaje y lleva tus recursos favoritos a la mesa.</p>
          <Icon name="chevron" className="choice-arrow" />
        </button>
        <button className="lobby-choice dm" onClick={() => onSelectMode("dm")}>
          <span className="action-emblem tone-amber">
            <Icon name="book" size={25} />
          </span>
          <span className="choice-number">02 / NARRAR</span>
          <h2>Soy Dungeon Master</h2>
          <p>Reúne a tu grupo y sigue el pulso de tus contiendas.</p>
          <Icon name="chevron" className="choice-arrow" />
        </button>
      </div>
      <p className="entry-footnote">
        <Icon name="dice" size={15} />
        Hecho para jugar D&D 3.5, estés donde estés.
      </p>
      <button className="app-refresh-button" onClick={onRefreshApp}>
        <Icon name="undo" size={16} />Actualizar app
      </button>
    </div>
  );
}
