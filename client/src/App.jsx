import { lazy, Suspense, useEffect, useState, useContext, useRef } from "react";
import { AuthContext } from "./context/auth-context";
import { Toaster, toast } from "sonner";
import api from "./api/axios";
import useAppUpdate from "./hooks/useAppUpdate";
import { clearUpdateReturn, readUpdateReturn, saveUpdateReturn } from "./utils/appUpdate";
import AppUpdateNotice from "./components/ui/AppUpdateNotice";

// PÁGINAS PRINCIPALES
import Login from "./pages/Login";
import Lobby from "./pages/Lobby";
import CharacterSelect from "./pages/CharacterSelect";
import CharacterSheet from "./pages/CharacterSheet";

// COMPONENTES GLOBALES
import ConfirmDeleteModal from "./components/ConfirmDeleteModal";

const DMDashboard = lazy(() => import("./pages/DMDashboard"));

function App() {
  const { user, logout, loading } = useContext(AuthContext);
  const userKey = user?.id || user?._id || user?.username;
  const [returnTo] = useState(() => readUpdateReturn(userKey));
  const restoredCharacter = useRef(false);
  const [characters, setCharacters] = useState([]);
  const [selectedChar, setSelectedChar] = useState(null);
  const [mode, setMode] = useState(returnTo?.mode || "lobby"); // lobby | dm | player
  const appUpdate = useAppUpdate(() => saveUpdateReturn({
    user: userKey, mode, characterId: selectedChar?._id || (returnTo?.user === userKey ? returnTo.characterId : undefined),
  }));
  useEffect(() => { clearUpdateReturn(); }, []);

  // ESTADO GLOBAL MODAL DE BORRADO
  const [deleteAlert, setDeleteAlert] = useState({
    isOpen: false,
    title: "",
    msg: "",
    action: null,
  });

  const askDelete = (title, msg, action) => {
    setDeleteAlert({ isOpen: true, title, msg, action });
  };

  const handleLogout = () => {
    setSelectedChar(null);
    setCharacters([]);
    setMode("lobby");
    setDeleteAlert({ isOpen: false, title: "", msg: "", action: null });
    logout();
  };

  useEffect(() => {
    let active = true;
    if (user) {
      api
        .get("/character")
        .then((res) => {
          if (active) {
            const next = res.data.filter(Boolean);
            setCharacters(next);
            if (!restoredCharacter.current && returnTo?.user === userKey && returnTo.characterId) {
              restoredCharacter.current = true;
              setSelectedChar(next.find((character) => character._id === returnTo.characterId) || null);
            }
          }
        })
        .catch(() => {
          if (active) toast.error("No se pudieron cargar tus personajes");
        });
    }
    return () => {
      active = false;
    };
  }, [user, userKey, returnTo]);

  if (loading) {
    return (
      <div className="h-screen bg-slate-950 flex items-center justify-center text-cyan-500 font-black animate-pulse">
        CARGANDO...
      </div>
    );
  }

  if (!user) {
    return <><AppUpdateNotice update={appUpdate} /><Login /></>;
  }

  return (
    <div className="min-h-screen text-slate-100 font-sans relative overflow-x-hidden">
      <Toaster position="top-center" richColors theme="dark" />
      <AppUpdateNotice update={appUpdate} />

      {mode === "lobby" && (
        <Lobby onSelectMode={setMode} logout={handleLogout} />
      )}
      {mode === "dm" && (
        <Suspense fallback={<p className="helper-text" role="status">Abriendo la mesa del DM…</p>}>
          <DMDashboard onBack={() => setMode("lobby")} />
        </Suspense>
      )}

      {mode === "player" && !selectedChar && (
        <CharacterSelect
          characters={characters}
          setCharacters={setCharacters}
          setSelectedChar={setSelectedChar}
          setMode={setMode}
          askDelete={askDelete}
        />
      )}

      {mode === "player" && selectedChar && (
        <CharacterSheet
          key={selectedChar._id}
          character={selectedChar}
          setCharacters={setCharacters}
          setSelectedChar={setSelectedChar}
          logout={handleLogout}
        />
      )}

      <ConfirmDeleteModal
        isOpen={deleteAlert.isOpen}
        title={deleteAlert.title}
        message={deleteAlert.msg}
        onClose={() => setDeleteAlert({ ...deleteAlert, isOpen: false })}
        onConfirm={() => {
          deleteAlert.action();
          setDeleteAlert({ ...deleteAlert, isOpen: false });
        }}
      />
    </div>
  );
}

export default App;
