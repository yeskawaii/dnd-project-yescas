import { useEffect, useState } from 'react'
import axios from 'axios'
import { Toaster } from 'sonner'
import StatCard from './components/StatCard'
import HealthTracker from './components/HealthTracker'

function App() {
  const [char, setChar] = useState(null)
  const [activeTab, setActiveTab] = useState('stats')

  useEffect(() => {
    axios.get('http://localhost:4000/api/character')
      .then(res => setChar(res.data))
      .catch(err => console.error("Error en API:", err))
  }, [])

  if (!char) return <div className="h-screen bg-slate-950 flex items-center justify-center text-orange-500 font-black tracking-widest animate-pulse">CARGANDO AVENTURA...</div>

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24 font-sans selection:bg-orange-500/30">
      <Toaster position="top-center" richColors theme="dark" />
      
      <header className="p-6 pt-12 border-b border-slate-800 bg-slate-900/80 backdrop-blur-xl sticky top-0 z-30">
        <h1 className="text-2xl font-black tracking-tighter text-orange-500 uppercase leading-none">{char.name}</h1>
        <p className="text-[10px] font-black text-slate-500 mt-1 tracking-widest">NIVEL {char.level} • PÍCARO</p>
      </header>

      <main className="p-4 max-w-md mx-auto relative z-10">
        {activeTab === 'stats' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <HealthTracker currentHp={24} maxHp={30} />
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 justify-items-center mt-6">
              {Object.entries(char.stats).map(([stat, val]) => (
                <StatCard key={stat} label={stat} value={val} />
              ))}
            </div>
          </div>
        )}
        
        {activeTab !== 'stats' && (
          <div className="flex flex-col items-center justify-center py-20 opacity-30 italic">
            <span className="text-4xl mb-4">🚧</span>
            <p>Sección en construcción...</p>
          </div>
        )}
      </main>

      {/* BOTTOM NAV */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 px-8 py-4 flex justify-between items-center z-40 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        {[
          { id: 'stats', icon: '⚔️', label: 'STATS' },
          { id: 'inv', icon: '🎒', label: 'INV' },
          { id: 'spells', icon: '🪄', label: 'SPELLS' },
          { id: 'notes', icon: '📜', label: 'NOTAS' }
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex flex-col items-center transition-colors ${activeTab === tab.id ? 'text-orange-500' : 'text-slate-500'}`}>
            <span className="text-xl mb-1">{tab.icon}</span>
            <span className="text-[9px] font-black tracking-tighter uppercase">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
export default App