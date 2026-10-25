export default function AppUpdateNotice({ update }) {
  if (!update.available) return null;
  return <aside className="app-update-notice" role="status">
    <div><strong>Hay una nueva versión</strong><p>Se aplicará automáticamente al terminar tus cambios.</p></div>
    <button className="button secondary compact" onClick={update.apply}>Actualizar</button>
  </aside>;
}
