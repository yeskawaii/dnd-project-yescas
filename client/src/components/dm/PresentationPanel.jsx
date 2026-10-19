import { useState } from "react";
import BottomSheet from "../ui/BottomSheet";
import Icon from "../ui/Icon";
import CinematicScene from "../shared-table/CinematicScene";
import { newId } from "../../utils/dmWorkspace";
import { emptyPresentation, presentScene, sceneMoods } from "../../utils/tablePresentation";

function SceneForm({ scene, onClose, onSave }) {
  const [draft, setDraft] = useState(() => scene || {
    id: newId(), title: "", description: "", imageUrl: "", mood: "forest",
  });
  const [preview, setPreview] = useState(false);
  const patch = (key) => (event) => setDraft({ ...draft, [key]: event.target.value });
  return (
    <BottomSheet title={scene ? "Editar escena" : "Preparar una escena"} subtitle="El escenario de su próxima hazaña" onClose={onClose}>
      <form className="resource-form" onSubmit={(event) => {
        event.preventDefault();
        onSave({ ...draft, title: draft.title.trim(), imageUrl: draft.imageUrl.trim() });
      }}>
        <label className="form-field">Título
          <input required maxLength={160} value={draft.title} onChange={patch("title")} placeholder="Las puertas de la ciudad olvidada" />
        </label>
        <label className="form-field">Lo que el grupo ve y escucha
          <textarea rows={6} maxLength={12000} value={draft.description} onChange={patch("description")} placeholder="La lluvia se detiene cuando cruzáis el arco. Al otro lado, todas las ventanas están encendidas…" />
        </label>
        <label className="form-field">Ambiente
          <select value={draft.mood} onChange={patch("mood")}>
            {Object.entries(sceneMoods).map(([key, mood]) => <option value={key} key={key}>{mood.label}</option>)}
          </select>
        </label>
        <label className="form-field">Imagen de fondo (opcional, enlace HTTPS)
          <input type="url" pattern="https://.*" maxLength={2000} value={draft.imageUrl} onChange={patch("imageUrl")} placeholder="https://…" />
        </label>
        <p className="helper-text">Sin imagen, el ambiente crea un fondo ilustrado con luz y formas. Guardar el borrador mantiene esta escena en tu biblioteca; Presentar la revela al grupo.</p>
        <button type="button" className="button secondary" onClick={() => setPreview(!preview)}>{preview ? "Cerrar vista previa" : "Vista previa"}</button>
        {preview && <CinematicScene scene={{ ...draft, title: draft.title || "Tu próxima escena" }} />}
        <button className="button primary" disabled={!draft.title.trim()}>Guardar borrador</button>
      </form>
    </BottomSheet>
  );
}

function SecretForm({ secret, players, onClose, onSave }) {
  const [draft, setDraft] = useState(() => secret || {
    id: newId(), title: "", content: "", recipientId: "", released: false,
  });
  return (
    <BottomSheet title={secret ? "Editar secreto" : "Un secreto entre dos"} subtitle="Solo tú y el destinatario" onClose={onClose}>
      <form className="resource-form" onSubmit={(event) => {
        event.preventDefault();
        onSave({ ...draft, title: draft.title.trim(), content: draft.content.trim(), released: false });
      }}>
        <label className="form-field">Destinatario
          <select required value={draft.recipientId} onChange={(event) => setDraft({ ...draft, recipientId: event.target.value })}>
            <option value="" disabled>Elige un personaje</option>
            {players.map((player) => <option value={player._id} key={player._id}>{player.name} · {player.class}</option>)}
          </select>
        </label>
        <label className="form-field">Título del mensaje
          <input required maxLength={160} value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="Un recuerdo que no te pertenece" />
        </label>
        <label className="form-field">Lo que solo este personaje sabe
          <textarea required rows={7} maxLength={12000} value={draft.content} onChange={(event) => setDraft({ ...draft, content: event.target.value })} placeholder="Reconoces el medallón: era de tu hermana. Nadie más parece haberlo notado." />
        </label>
        <p className="helper-text">Este mensaje permanece privado hasta que pulses Enviar al personaje. Se entrega al personaje elegido, aunque su jugador tenga otras fichas.</p>
        <button className="button primary" disabled={!draft.title.trim() || !draft.content.trim() || !players.some((player) => player._id === draft.recipientId)}>Guardar borrador</button>
      </form>
    </BottomSheet>
  );
}

export default function PresentationPanel({ workspace, players, onChange, onPublish, onDelete, onRefreshPlayers, refreshing }) {
  const [editor, setEditor] = useState(null);
  const presentation = { ...emptyPresentation(), ...workspace.presentation };
  const change = (patch) => onChange({ ...workspace, presentation: { ...presentation, ...patch } });
  const publish = (patch) => onPublish({ ...workspace, presentation: { ...presentation, ...patch } });
  const revealed = workspace.combat.combatants.filter((entry) => entry.kind === "player" || entry.visibleToPlayers).length;
  return (
    <div className="presentation-panel">
      <section className="surface sharing-settings">
        <div className="section-heading"><div><p className="eyebrow">Abre una ventana a tu mundo</p><h2>Mesa compartida</h2></div><Icon name="eye" size={24} /></div>
        <p className="helper-text">Tus jugadores la encuentran en la pestaña Mesa de su personaje. Las escenas y secretos se entregan también cuando el mapa y combate están desactivados.</p>
        <div className="sharing-status"><span className={`status-dot ${presentation.enabled ? "" : "is-offline"}`} />
          <span>{presentation.enabled ? "Mapa y combate habilitados" : "Mapa y combate privados"}</span>
          <button className={`button compact ${presentation.enabled ? "secondary" : "primary"}`} onClick={() => publish({ enabled: !presentation.enabled })}>
            {presentation.enabled ? "Dejar de compartir" : "Compartir con el grupo"}
          </button>
        </div>
        <label className="checkbox-field"><input type="checkbox" checked={presentation.shareMap} onChange={(event) => change({ shareMap: event.target.checked })} />Compartir el mapa táctico</label>
        <label className="checkbox-field"><input type="checkbox" checked={presentation.showEnemyHp} onChange={(event) => change({ showEnemyHp: event.target.checked })} />Mostrar puntos de vida de criaturas reveladas</label>
        <p className="helper-text">Hay {revealed} participantes visibles. Revela u oculta criaturas desde Combate. Mientras compartes, los cambios se guardan automáticamente y llegan al grupo en unos segundos. La biblioteca, los estados escritos por el DM y el Diario permanecen privados.</p>
      </section>
      <section className="surface">
        <div className="section-heading"><div><p className="eyebrow">Prepara la entrada en escena</p><h2>Escenas cinematográficas</h2></div>
          <button className="button primary compact" disabled={presentation.scenes.length >= 50} onClick={() => setEditor({ kind: "scene", item: null })}><Icon name="plus" size={17} />Nueva escena</button>
        </div>
        {presentation.activeScene && <div className="presented-scene-summary"><Icon name="scene" size={20} /><span>En las pantallas del grupo: <strong>{presentation.activeScene.title}</strong></span>
          <button className="text-button" onClick={() => publish({ activeScene: null })}>Retirar escena</button></div>}
        <div className="scene-library">
          {presentation.scenes.map((scene) => (
            <article className={`scene-library-card scene-mood-${scene.mood}`} key={scene.id}>
              <span className="scene-library-sigil" aria-hidden="true">{sceneMoods[scene.mood]?.icon}</span>
              <div><h3>{scene.title}</h3><p>{scene.description || sceneMoods[scene.mood]?.label}</p></div>
              <div className="dm-actions">
                <button className="button primary compact" onClick={() => onPublish({ ...workspace, presentation: presentScene(presentation, scene, newId()) })}><Icon name="scene" size={16} />Presentar</button>
                <button className="icon-button" aria-label={`Editar escena ${scene.title}`} onClick={() => setEditor({ kind: "scene", item: scene })}><Icon name="edit" size={17} /></button>
                <button className="icon-button" aria-label={`Eliminar escena ${scene.title}`} onClick={() => onDelete("Eliminar escena", `Se eliminará «${scene.title}» de la biblioteca. Si está presentada, seguirá visible hasta que la retires.`, () => change({ scenes: presentation.scenes.filter((entry) => entry.id !== scene.id) }))}><Icon name="trash" size={17} /></button>
              </div>
            </article>
          ))}
        </div>
        {!presentation.scenes.length && <div className="empty-state"><Icon name="scene" size={32} /><h3>El telón lo levantas tú</h3><p>Combina un título, una descripción y un ambiente o imagen. Presenta la escena cuando el grupo llegue a ese momento.</p></div>}
      </section>
      <section className="surface">
        <div className="section-heading"><div><p className="eyebrow">Lo que no todos deben saber</p><h2>Secretos individuales</h2></div>
          <button className="button primary compact" disabled={!players.length || presentation.secrets.length >= 200} onClick={() => setEditor({ kind: "secret", item: null })}><Icon name="lock" size={17} />Nuevo secreto</button>
        </div>
        <button className="text-button" disabled={refreshing} onClick={onRefreshPlayers}>{refreshing ? "Actualizando…" : "Actualizar destinatarios del grupo"}</button>
        {!players.length && <p className="helper-text">Cuando un jugador una su personaje a la contienda, actualiza el grupo para poder elegirlo.</p>}
        <div className="dm-secrets-list">
          {presentation.secrets.map((secret) => {
            const recipient = players.find((player) => player._id === secret.recipientId);
            return <article className="dm-secret-card" key={secret.id}>
              <div><span className="eyebrow">{secret.released ? "Entregado" : "Borrador privado"} · {recipient?.name || "Personaje fuera de la contienda"}</span><h3>{secret.title}</h3><p>{secret.content}</p></div>
              <div className="dm-actions">
                {secret.released ? <button className="button secondary compact" onClick={() => onDelete("Retirar secreto", "El mensaje dejará de aparecer en la siguiente actualización. El jugador puede haberlo leído ya.", () => publish({ secrets: presentation.secrets.map((entry) => entry.id === secret.id ? { ...entry, released: false } : entry) }))}>Retirar</button> : <>
                  <button className="button primary compact" disabled={!recipient} onClick={() => publish({ secrets: presentation.secrets.map((entry) => entry.id === secret.id ? { ...entry, released: true } : entry) })}>Enviar al personaje</button>
                  <button className="icon-button" aria-label={`Editar secreto ${secret.title}`} onClick={() => setEditor({ kind: "secret", item: secret })}><Icon name="edit" size={17} /></button>
                  <button className="icon-button" aria-label={`Eliminar secreto ${secret.title}`} onClick={() => onDelete("Eliminar borrador", "Se eliminará este mensaje privado sin enviarlo.", () => change({ secrets: presentation.secrets.filter((entry) => entry.id !== secret.id) }))}><Icon name="trash" size={17} /></button>
                </>}
              </div>
            </article>;
          })}
        </div>
        {!presentation.secrets.length && <div className="empty-state"><Icon name="lock" size={30} /><h3>Una pista puede cambiarlo todo</h3><p>Elige un personaje y entrégale un recuerdo, una percepción o una instrucción que solo él conocerá.</p></div>}
      </section>
      {editor?.kind === "scene" && <SceneForm scene={editor.item} onClose={() => setEditor(null)} onSave={(scene) => {
        change({ scenes: editor.item ? presentation.scenes.map((entry) => entry.id === scene.id ? scene : entry) : [...presentation.scenes, scene] });
        setEditor(null);
      }} />}
      {editor?.kind === "secret" && <SecretForm secret={editor.item} players={players} onClose={() => setEditor(null)} onSave={(secret) => {
        change({ secrets: editor.item ? presentation.secrets.map((entry) => entry.id === secret.id ? secret : entry) : [...presentation.secrets, secret] });
        setEditor(null);
      }} />}
    </div>
  );
}
