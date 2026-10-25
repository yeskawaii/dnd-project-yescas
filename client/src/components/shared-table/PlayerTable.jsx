import { useState } from "react";
import Icon from "../ui/Icon";
import BottomSheet from "../ui/BottomSheet";
import CinematicScene from "./CinematicScene";
import SharedBattleMap from "./SharedBattleMap";
import { markSecretRead, readSecretIds, secretReadKey } from "../../utils/tablePresentation";

export default function PlayerTable({ character, table }) {
  const [expanded, setExpanded] = useState(false);
  const [selectedSecret, setSelectedSecret] = useState(null);
  const campaignId = character.campaign?._id || character.campaign;
  const storageKey = secretReadKey(campaignId, character._id);
  const [read, setRead] = useState(() => readSecretIds(localStorage, storageKey));
  const { data, error, updatedAt, refresh } = table;
  const secret = data?.secrets.find((entry) => entry.id === selectedSecret);
  const active = data?.combat?.combatants.find((entry) => entry.id === data.combat.activeId);

  if (!campaignId) return (
    <div className="empty-state"><Icon name="map" size={36} /><h3>Tu lugar en la mesa</h3>
      <p>Une este personaje a una contienda desde la selección de personajes para ver escenas, el mapa y tus secretos.</p></div>
  );

  return (
    <div className="player-table">
      <div className="shared-table-heading">
        <div><p className="eyebrow">Una aventura en compañía</p><h2>{data?.campaign.name || character.campaign?.name || "Mesa compartida"}</h2></div>
        <button className="text-button" onClick={refresh}><Icon name="undo" size={16} />Actualizar</button>
      </div>
      <p className="table-sync" role="status">
        <span className={`status-dot ${error ? "is-offline" : ""}`} />
        {error ? "Conexión interrumpida" : updatedAt ? "Actualización automática · cada 4 segundos" : "Conectando con tu mesa…"}
      </p>
      {error && <p className="table-error" role="alert">{error}{data ? " Se muestra la última versión recibida." : ""}</p>}
      {data?.scene && <CinematicScene key={data.scene.presentationId} scene={data.scene} onExpand={() => setExpanded(true)} />}
      {data?.combat && (
        <section className="surface shared-turns">
          <div className="section-heading"><h2>{data.combat.name}</h2><span className="edition-pill">Ronda {data.combat.round}</span></div>
          <div className="dm-turn-banner" role="status"><Icon name="bolt" size={20} />
            {active ? <>Turno de <strong>{active.name}</strong></> : data.combat.hiddenTurn ? "El DM está resolviendo un turno" : "Esperando el inicio del combate"}
          </div>
          <ol className="shared-turn-list">
            {data.combat.combatants.map((entry) => (
              <li className={entry.id === data.combat.activeId ? "is-turn" : ""} key={entry.id}>
                <span className={`dm-kind-dot ${entry.kind}`} /><strong>{entry.name}</strong>
                {entry.hp != null && <small>{entry.hp} / {entry.maxHp} PV</small>}
                <span className="shared-initiative">{entry.initiative}</span>
              </li>
            ))}
          </ol>
          {!data.combat.combatants.length && <p className="helper-text">El DM aún no ha revelado participantes.</p>}
          <p className="helper-text">La vida mostrada corresponde al encuentro que dirige el DM.</p>
        </section>
      )}
      {data?.map && <SharedBattleMap map={data.map} combatants={data.combat.combatants} activeId={data.combat.activeId} onMoveToken={table.moveToken} />}
      {data && !data.enabled && !data.scene && (
        <div className="surface table-waiting"><Icon name="scene" size={32} /><h3>El telón está a punto de abrirse</h3>
          <p>Cuando el DM presente una escena o comparta el combate, aparecerá aquí automáticamente.</p></div>
      )}
      {data && (
        <section className="surface player-secrets">
          <div className="section-heading"><div><p className="eyebrow">Solo para {character.name}</p><h2>Tus secretos</h2></div><Icon name="lock" size={21} /></div>
          <p className="helper-text">Abre cada mensaje cuando puedas leerlo en privado.</p>
          <div className="secret-inbox">
            {data.secrets.map((entry) => (
              <button key={entry.id} className="secret-envelope" onClick={() => {
                setRead(markSecretRead(localStorage, storageKey, read, entry.id));
                setSelectedSecret(entry.id);
              }}>
                <span className="action-emblem tone-violet"><Icon name="lock" /></span>
                <span><strong>{entry.title}</strong><small>{read.includes(entry.id) ? "Volver a leer" : "Mensaje nuevo del DM"}</small></span>
                {!read.includes(entry.id) && <span className="secret-unread">Nuevo</span>}
                <Icon name="chevron" size={18} />
              </button>
            ))}
          </div>
          {!data.secrets.length && <p className="helper-text">Todavía no tienes mensajes privados del DM.</p>}
        </section>
      )}
      {expanded && data?.scene && <BottomSheet className="cinematic-dialog" title={data.scene.title} subtitle="La escena de tu aventura" onClose={() => setExpanded(false)}>
        <CinematicScene key={data.scene.presentationId} scene={data.scene} />
      </BottomSheet>}
      {secret && <BottomSheet title={secret.title} subtitle={`Solo para ${character.name}`} onClose={() => setSelectedSecret(null)}>
        <p className="private-secret-label"><Icon name="lock" size={16} />Mensaje privado del Dungeon Master</p>
        <p className="detail-description">{secret.content}</p>
        <button className="button primary full-width" onClick={() => setSelectedSecret(null)}>Guardar el secreto</button>
      </BottomSheet>}
    </div>
  );
}
