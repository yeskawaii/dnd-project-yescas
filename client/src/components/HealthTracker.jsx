import { useState } from 'react'
import { toast } from 'sonner'

export default function HealthTracker({ currentHp, maxHp }) {
  const [hp, setHp] = useState(currentHp)
  const [inputValue, setInputValue] = useState('') // Estado para el input manual

  const updateHp = (amount) => {
    const value = parseInt(amount)
    if (isNaN(value)) return

    const newHp = Math.max(0, Math.min(hp + value, maxHp))
    setHp(newHp)
    
    if (value > 0) toast.success(`Curado: +${value} HP`)
    if (value < 0) toast.error(`Daño: ${value} HP`)
    
    setInputValue('') // Limpiamos el input después de usarlo
  }

  return (
    <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl p-6 mb-8 shadow-2xl">
      <div className="flex justify-between items-end mb-4">
        <div>
          <p className="text-[10px] font-black text-slate-500 tracking-widest uppercase text-left">Puntos de Vida</p>
          <h2 className="text-5xl font-black text-white">
            {hp}<span className="text-slate-600 text-2xl">/{maxHp}</span>
          </h2>
        </div>
        <div className="h-12 w-12 bg-red-600/20 rounded-xl flex items-center justify-center border border-red-600/50 text-2xl">❤️</div>
      </div>

      {/* Barra de Vida */}
      <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden mb-6">
        <div 
          className="h-full bg-red-600 transition-all duration-500 ease-out" 
          style={{ width: `${(hp / maxHp) * 100}%` }}
        />
      </div>

      {/* INPUT MANUAL - LO NUEVO */}
      <div className="flex gap-2 mb-6">
        <input 
          type="number" 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Cantidad..."
          className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-orange-500 transition-colors"
        />
        <button 
          onClick={() => updateHp(-inputValue)}
          className="bg-red-900/40 border border-red-600/50 text-red-500 px-4 py-3 rounded-xl font-black text-xs active:scale-95 transition-transform"
        >
          DAÑO
        </button>
        <button 
          onClick={() => updateHp(inputValue)}
          className="bg-green-900/40 border border-green-600/50 text-green-500 px-4 py-3 rounded-xl font-black text-xs active:scale-95 transition-transform"
        >
          CURA
        </button>
      </div>

      {/* Botones rápidos (Los dejamos porque sirven para ajustes de 1 en 1) */}
      <div className="grid grid-cols-4 gap-2 border-t border-slate-800 pt-6">
        {[-5, -1, 1, 5].map(val => (
          <button 
            key={val} 
            onClick={() => updateHp(val)} 
            className={`bg-slate-800 p-3 rounded-xl font-black text-xs ${val < 0 ? 'text-red-400' : 'text-green-400'} active:scale-95 transition-transform`}
          >
            {val > 0 ? `+${val}` : val}
          </button>
        ))}
      </div>
    </div>
  )
}