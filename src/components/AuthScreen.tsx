import React, { useState } from 'react';
import { Dumbbell, ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { loginOrRegister } from '../utils/authStorage';
import { UserSession } from '../types/auth';

interface AuthScreenProps {
  onSuccess: (user: UserSession) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const res = loginOrRegister(username, password);
    if (res.success && res.user) {
      onSuccess(res.user);
    } else {
      setErrorMessage(res.message || 'Falha ao autenticar.');
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-stone-950 flex flex-col items-center justify-center p-4 selection:bg-stone-300">
      <div className="w-full max-w-sm">
        {/* Athletic brand header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 mb-3 shadow-sm">
            <Dumbbell className="w-6 h-6 stroke-[2.2]" />
          </div>
          <h1 className="text-sm font-black tracking-widest text-stone-900 dark:text-stone-100 uppercase italic">
            Ficha de Treino • Pro
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Controle de Cargas & Performance
          </p>
        </div>

        {/* Clean athletic login card */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-1.5 pb-4 mb-4 border-b border-stone-100 dark:border-stone-800 text-xs font-semibold text-stone-800 dark:text-stone-200 tracking-wide uppercase">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Acesso do Atleta</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold tracking-wider text-stone-600 dark:text-stone-400 uppercase mb-1.5">
                Usuário
              </label>
              <input
                type="text"
                autoCapitalize="none"
                autoCorrect="off"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Ex: gabriel"
                className="w-full bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-hidden focus:border-stone-400 dark:focus:border-stone-500 transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold tracking-wider text-stone-600 dark:text-stone-400 uppercase mb-1.5">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Sua senha secreta"
                  className="w-full bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-hidden focus:border-stone-400 dark:focus:border-stone-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {errorMessage && (
              <div className="p-2.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl text-[11px] text-red-600 dark:text-red-400 font-medium leading-tight">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-stone-900 hover:bg-black dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 font-bold text-xs rounded-xl shadow-xs active:scale-[0.98] transition duration-150 flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer"
            >
              <span>Acessar Ficha</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-stone-100 dark:border-stone-800/60 text-center">
            <p className="text-[11px] text-stone-400 dark:text-stone-500 leading-relaxed">
              Primeiro acesso? Sua conta será gerada automaticamente com este usuário e senha, isolando seus treinos e cargas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
