export default function AppUpdateNotice({ update }) {
  if (!update.available) return null;
  return <aside className="app-update-notice" role="status">
    <div><strong>Hay una nueva versión</strong><p>La app se recargará automáticamente. Esperando solo si hay cambios sin guardar.</p></div>
    <button className="button secondary compact" onClick={update.force}>Forzar actualización</button>
  </aside>;
}
