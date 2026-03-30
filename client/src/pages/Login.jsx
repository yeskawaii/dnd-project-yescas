import { useState, useContext } from 'react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'sonner';

const Login = () => {
  const [form, setForm] = useState({ username: '', password: '' });
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', form);
      login(res.data.user, res.data.token);
      toast.success(`¡Bienvenido, ${res.data.user.username}!`);
    } catch (err) {
      toast.error(err.response?.data?.error || "Error al entrar");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-slate-900 p-8 rounded-2xl border border-slate-800 w-full max-w-sm">
        <h2 className="text-2xl font-black text-orange-500 mb-6 uppercase tracking-tighter">Entrar a la Taberna</h2>
        <input 
          type="text" placeholder="Usuario" 
          className="w-full bg-slate-800 p-3 rounded-lg mb-4 text-white outline-none focus:ring-2 ring-orange-500"
          onChange={e => setForm({...form, username: e.target.value})}
        />
        <input 
          type="password" placeholder="Password" 
          className="w-full bg-slate-800 p-3 rounded-lg mb-6 text-white outline-none focus:ring-2 ring-orange-500"
          onChange={e => setForm({...form, password: e.target.value})}
        />
        <button className="w-full bg-orange-600 p-3 rounded-lg font-black uppercase text-xs hover:bg-orange-500 transition-all">
          Iniciar Aventura
        </button>
      </form>
    </div>
  );
};

export default Login;