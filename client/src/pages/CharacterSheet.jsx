import { useLayoutEffect, useRef, useState } from "react";
import { motion as Motion } from "framer-motion";
import { toast } from "sonner";
import api from "../api/axios";
import SheetHeader from "../components/character-sheet/SheetHeader";
import GameTab from "../components/character-sheet/GameTab";
import StatsTab from "../components/character-sheet/StatsTab";
import FeaturesTab from "../components/character-sheet/FeaturesTab";
import InventoryTab from "../components/character-sheet/InventoryTab";
import SpellsTab from "../components/character-sheet/SpellsTab";
import CompanionsTab from "../components/character-sheet/CompanionsTab";
import NotesTab from "../components/character-sheet/NotesTab";
import Icon from "../components/ui/Icon";
import { actionKey } from "../utils/quickActions";
import useSharedTable from "../hooks/useSharedTable";
import PlayerTable from "../components/shared-table/PlayerTable";
import "../components/shared-table/sharedTable.css";
import CustomizationSheet from "../components/character-sheet/CustomizationSheet";
import CharacterAvatar from "../components/ui/CharacterAvatar";
import { CharacterThemeContext } from "../context/character-theme";
import {
  appearanceStyle,
  getAppearance,
} from "../utils/characterCustomization";

const tabs = [
  { id: "game", icon: "sword", label: "Partida" },
  { id: "table", icon: "eye", label: "Mesa" },
  { id: "character", icon: "book", label: "Personaje" },
  { id: "inventory", icon: "bag", label: "Mochila" },
  { id: "journal", icon: "note", label: "Diario" },
];
const sections = [
  { id: "stats", label: "Ficha" },
  { id: "features", label: "Habilidades y rasgos" },
  { id: "spells", label: "Hechizos" },
  { id: "companions", label: "Acompañantes" },
];

export default function CharacterSheet({
  character,
  setCharacters,
  setSelectedChar,
  logout,
}) {
  const [activeTab, setActiveTab] = useState("game");
  const [section, setSection] = useState("stats");
  const [unitSystem, setUnitSystem] = useState("imp");
  const [saveState, setSaveState] = useState("saved");
  const [customizing, setCustomizing] = useState(false);
  const appearance = getAppearance(character);
  const theme = appearanceStyle(appearance);
  const queue = useRef(Promise.resolve());
  const pending = useRef(0);
  const scrollPositions = useRef({});
  const saving = saveState === "saving";
  const campaignId = character.campaign?._id || character.campaign;
  const table = useSharedTable(campaignId, character._id);

  useLayoutEffect(() => {
    window.scrollTo({
      top: scrollPositions.current[`${activeTab}:${section}`] || 0,
      behavior: "instant",
    });
  }, [activeTab, section]);

  const navigate = (tab, nextSection = section) => {
    scrollPositions.current[`${activeTab}:${section}`] = window.scrollY;
    setSection(nextSection);
    setActiveTab(tab);
  };

  const handleUpdateCharacter = (updatedData) => {
    pending.current += 1;
    setSaveState("saving");
    const request = queue.current.then(async () => {
      try {
        const { data } = await api.patch(
          `/character/${character._id}/update`,
          updatedData,
        );
        setSelectedChar(data);
        setCharacters((previous) =>
          previous.map((item) => (item._id === data._id ? data : item)),
        );
        return data;
      } catch {
        toast.error(
          "No se guardó el cambio. Comprueba tu conexión e inténtalo de nuevo.",
        );
        return null;
      } finally {
        pending.current -= 1;
      }
    });
    queue.current = request;
    request.then((result) => {
      if (!pending.current) setSaveState(result ? "saved" : "error");
    });
    return request;
  };

  const toggleFavorite = (action) => {
    if (saving) return Promise.resolve(null);
    const current = character.quickActions || [];
    const exists = current.some((entry) => actionKey(entry) === action.key);
    return handleUpdateCharacter({
      quickActions: exists
        ? current.filter((entry) => actionKey(entry) !== action.key)
        : [...current, { kind: action.kind, itemId: action.itemId }],
    });
  };
  const browse = (destination) => navigate("character", destination);
  const shared = {
    character,
    onUpdate: handleUpdateCharacter,
    onToggleFavorite: toggleFavorite,
    saving,
  };

  return (
    <CharacterThemeContext.Provider value={theme}>
      <div className="character-app personalized-sheet" style={theme} data-app-update-blocked={saveState !== "saved"}>
        <SheetHeader
          character={character}
          onUpdate={handleUpdateCharacter}
          onBack={() => setSelectedChar(null)}
          logout={logout}
          saveState={saveState}
          onCustomize={() => setCustomizing(true)}
        />
        <div className="sheet-workspace">
          {activeTab === "game" ? (
            <section
              className={`character-hero backdrop-${appearance.backdrop}`}
            >
              <div className="hero-heading">
                <span className="eyebrow">
                  <span className="status-dot" />
                  LISTO PARA LA AVENTURA
                </span>
                <span className="hero-edition">D&D 3.5</span>
              </div>
              <div className="hero-identity">
                <CharacterAvatar character={character} size="large" />
                <div>
                  <p className="eyebrow">Tu historia continúa</p>
                  <h1>{character.name}</h1>
                  <p>
                    {character.race} · {character.class} · Nivel{" "}
                    {character.level}
                  </p>
                </div>
              </div>
              <button
                className="hero-customize"
                onClick={() => setCustomizing(true)}
                disabled={saving}
              >
                <Icon name="palette" size={17} />
                <span>Mi estilo y mi partida</span>
                <Icon name="chevron" size={16} />
              </button>
            </section>
          ) : (
            <div className="page-intro">
              <div>
                <p className="eyebrow">
                  {activeTab === "game"
                    ? "Tu aventura, sin interrupciones"
                    : "Un lugar para cada detalle"}
                </p>
                <h1>
                  {tabs.find((tab) => tab.id === activeTab).label === "Partida"
                    ? "Tu mesa de aventura"
                    : tabs.find((tab) => tab.id === activeTab).label}
                </h1>
              </div>
              <span className="edition-pill">
                <Icon name="dice" size={15} />
                D&D 3.5
              </span>
            </div>
          )}
          {activeTab === "character" && (
            <nav
              className="segmented character-sections"
              aria-label="Secciones del personaje"
            >
              {sections.map((item) => (
                <button
                  key={item.id}
                  className={section === item.id ? "active" : ""}
                  aria-current={section === item.id ? "page" : undefined}
                  onClick={() => navigate("character", item.id)}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          )}
          <main>
            {activeTab === "game" && campaignId && (
              <button
                className="shared-table-teaser"
                onClick={() => navigate("table")}
              >
                <span className="action-emblem tone-mint">
                  <Icon name="eye" size={23} />
                </span>
                <span>
                  <strong>
                    {table.data?.scene?.title ||
                      "Tu grupo tiene una mesa compartida"}
                  </strong>
                  <small>
                    Escenas, turnos y mapa
                    {table.data?.secrets.length
                      ? ` · ${table.data.secrets.length} mensajes privados`
                      : ""}
                  </small>
                </span>
                <Icon name="chevron" size={20} />
              </button>
            )}
            <Motion.div
              key={`${activeTab}:${activeTab === "character" ? section : ""}`}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.12 }}
            >
              {activeTab === "game" && (
                <GameTab {...shared} onBrowse={browse} />
              )}
              {activeTab === "table" && (
                <PlayerTable
                  key={`${campaignId}:${character._id}`}
                  character={character}
                  table={table}
                  onUpdate={handleUpdateCharacter}
                />
              )}
              {activeTab === "character" && section === "stats" && (
                <StatsTab
                  {...shared}
                  unitSystem={unitSystem}
                  setUnitSystem={setUnitSystem}
                />
              )}
              {activeTab === "character" && section === "features" && (
                <FeaturesTab {...shared} />
              )}
              {activeTab === "character" && section === "spells" && (
                <SpellsTab {...shared} />
              )}
              {activeTab === "character" && section === "companions" && (
                <CompanionsTab {...shared} />
              )}
              {activeTab === "inventory" && (
                <InventoryTab {...shared} unitSystem={unitSystem} />
              )}
              {activeTab === "journal" && <NotesTab {...shared} />}
            </Motion.div>
          </main>
        </div>
        <nav className="main-nav" aria-label="Navegación principal">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={activeTab === tab.id ? "active" : ""}
              aria-current={activeTab === tab.id ? "page" : undefined}
              onClick={() => navigate(tab.id)}
            >
              <span className="nav-icon">
                <Icon name={tab.icon} size={22} />
              </span>
              <span>{tab.label}</span>
              {activeTab === tab.id && <span className="nav-active-dot" />}
            </button>
          ))}
        </nav>
        {customizing && (
          <CustomizationSheet
            character={character}
            onUpdate={handleUpdateCharacter}
            onClose={() => setCustomizing(false)}
          />
        )}
      </div>
    </CharacterThemeContext.Provider>
  );
}
