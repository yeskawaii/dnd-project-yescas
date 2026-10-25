import Icon from "./Icon";

export default function AppUpdateNotice({ update }) {
  if (!update.available) return <button className="app-refresh-button" onClick={update.force}>
    <Icon name="undo" size={16} />Actualizar app
  </button>;
  return <aside className="app-update-notice" role="status">
    <div><strong>Hay una nueva versión</strong><p>La app se recargará automáticamente. Esperando solo si hay cambios sin guardar.</p></div>
    <button className="button secondary compact" onClick={update.force}>Forzar actualización</button>
  </aside>;
}
