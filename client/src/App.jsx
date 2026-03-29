import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [char, setChar] = useState(null);

  useEffect(() => {
    // Le pegamos al servidor que acabamos de prender
    axios
      .get("http://localhost:4000/api/character")
      .then((res) => setChar(res.data))
      .catch((err) => console.error(err));
  }, []);

  if (!char) return <div className="text-white p-10">Cargando partida...</div>;

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-white">
      <h1 className="text-4xl font-black text-orange-500">{char.name}</h1>
      <p className="text-slate-400 font-bold text-xl text-uppercase">
        Nivel {char.level}
      </p>

      <div className="mt-8 grid grid-cols-2 gap-4">
        {Object.entries(char.stats).map(([stat, val]) => (
          <div
            key={stat}
            className="bg-slate-800 p-4 rounded-xl border border-slate-700 text-center"
          >
            <p className="text-xs text-slate-400 uppercase">{stat}</p>
            <p className="text-2xl font-bold">{val}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
export default App;
