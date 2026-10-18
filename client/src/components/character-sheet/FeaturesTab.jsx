import { useState } from "react";
import SkillTable from "../SkillTable";
import Icon from "../ui/Icon";
import BottomSheet from "../ui/BottomSheet";
import DeleteSheet from "../ui/DeleteSheet";
import ResourceEditor from "./ResourceEditor";

const collections = { skill: "skills", trait: "traits", feat: "feats" };

export default function FeaturesTab({
  character,
  onUpdate,
  onToggleFavorite,
  saving,
}) {
  const [editor, setEditor] = useState(null);
  const [selected, setSelected] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const save = (data) => {
    const collection = collections[editor.kind];
    return onUpdate({
      [collection]: editor.item
        ? character[collection].map((item) =>
            item._id === data._id ? data : item,
          )
        : [...(character[collection] || []), data],
    });
  };
  return (
    <div className="legacy-content">
      <section className="surface">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Lo que sabes hacer</p>
            <h2>Habilidades</h2>
          </div>
          <Icon name="skill" />
        </div>
        <SkillTable
          character={character}
          onUpdateSkill={(skills) => onUpdate({ skills })}
          onOpenAddModal={() => setEditor({ kind: "skill", item: null })}
          onToggleFavorite={onToggleFavorite}
          saving={saving}
        />
      </section>
      <div className="legacy-features-grid">
        {[
          ["trait", "Rasgos innatos", "book"],
          ["feat", "Dotes", "star"],
        ].map(([kind, title, icon]) => (
          <section className="surface" key={kind}>
            <div className="section-heading">
              <h2>{title}</h2>
              <button
                className="text-button"
                disabled={saving}
                onClick={() => setEditor({ kind, item: null })}
              >
                <Icon name="plus" size={16} />
                Agregar
              </button>
            </div>
            <div className="feature-list">
              {(character[collections[kind]] || []).map((item) => (
                <button
                  className="feature-row"
                  key={item._id}
                  onClick={() => setSelected({ kind, item })}
                >
                  <span
                    className={`action-emblem ${kind === "trait" ? "tone-mint" : "tone-amber"}`}
                  >
                    <Icon name={icon} />
                  </span>
                  <span className="action-copy">
                    <strong>{item.name}</strong>
                    <small>
                      {kind === "trait"
                        ? item.source || "Rasgo de personaje"
                        : item.type}
                    </small>
                  </span>
                  <Icon name="chevron" size={17} />
                </button>
              ))}
            </div>
            {!character[collections[kind]]?.length && (
              <p className="helper-text">
                Aquí aparecerán tus {kind === "trait" ? "rasgos" : "dotes"} y
                sus efectos.
              </p>
            )}
          </section>
        ))}
      </div>
      {selected && (
        <BottomSheet
          title={selected.item.name}
          subtitle={selected.kind === "trait" ? "Rasgo de personaje" : "Dote"}
          onClose={() => setSelected(null)}
        >
          <p className="detail-description">
            {selected.item.description ||
              selected.item.desc ||
              "Todavía no hay una descripción."}
          </p>
          <div className="detail-footer">
            <button
              className="button secondary"
              onClick={() => {
                setEditor(selected);
                setSelected(null);
              }}
            >
              <Icon name="edit" />
              Editar
            </button>
            <button
              className="button danger"
              onClick={() => {
                setDeleting(selected);
                setSelected(null);
              }}
            >
              <Icon name="trash" />
              Eliminar
            </button>
          </div>
        </BottomSheet>
      )}
      {editor && (
        <ResourceEditor
          kind={editor.kind}
          item={editor.item}
          onClose={() => setEditor(null)}
          onSave={save}
        />
      )}
      {deleting && (
        <DeleteSheet
          name={deleting.item.name}
          onClose={() => setDeleting(null)}
          onConfirm={() =>
            onUpdate({
              [collections[deleting.kind]]: character[
                collections[deleting.kind]
              ].filter((item) => item._id !== deleting.item._id),
            })
          }
        />
      )}
    </div>
  );
}
