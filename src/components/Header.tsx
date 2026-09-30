import React from 'react';
import { RotateCcw, Moon, Sun, LogOut, User } from 'lucide-react';
import { UserSession } from '../types/auth';

interface HeaderProps {
  currentUser: UserSession;
  onLogout: () => void;
  onResetChecks: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onLogout,
  onResetChecks,
  isDark,
  onToggleTheme,
}) => {
  // Format current date in Portuguese: e.g. "Terça-feira, 29 de setembro"
  const today = new Date();
  const dayName = today.toLocaleDateString('pt-BR', { weekday: 'long' });
  const dayNumber = today.getDate();
  const monthName = today.toLocaleDateString('pt-BR', { month: 'long' });
  const formattedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1);
  const formattedDate = `${formattedDay}, ${dayNumber} de ${monthName}`;

  return (
    <header className="mb-4">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-xs font-black tracking-wider text-stone-900 dark:text-stone-100 uppercase italic">
              Ficha de Treino
            </h1>
            <span className="text-[9px] font-mono font-semibold tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/40 px-1.5 py-0.5 rounded">
              PRO
            </span>
          </div>
          <p className="text-[11px] text-stone-500 dark:text-stone-400 font-normal mt-0.5">
            {formattedDate}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Athlete profile pill & logout */}
          <div className="flex items-center bg-stone-100 dark:bg-stone-800 rounded-lg p-0.5 border border-stone-200/60 dark:border-stone-700/60">
            <div className="flex items-center gap-1 px-2 py-1 text-[10px] font-semibold text-stone-700 dark:text-stone-300 max-w-[85px] truncate">
              <User className="w-3 h-3 text-stone-400 shrink-0" />
              <span className="truncate">{currentUser.displayName}</span>
            </div>
            <button
              onClick={onLogout}
              title="Trocar atleta / Sair"
              className="w-6 h-6 flex items-center justify-center rounded-md text-stone-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-white dark:hover:bg-stone-700 active:scale-95 transition"
              aria-label="Sair da conta"
            >
              <LogOut className="w-3 h-3" />
            </button>
          </div>

          <button
            onClick={onToggleTheme}
            title={isDark ? 'Modo Claro' : 'Modo Escuro'}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-stone-600 dark:text-stone-300 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 active:scale-95 transition"
            aria-label="Alternar tema"
          >
            {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={onResetChecks}
            title="Desmarcar checks"
            className="text-[11px] font-medium text-stone-700 dark:text-stone-200 bg-stone-200/80 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 active:scale-95 px-2.5 py-1.5 rounded-lg transition flex items-center gap-1.5"
          >
            <RotateCcw className="w-3 h-3 text-stone-500 dark:text-stone-400" />
            <span>Zerar</span>
          </button>
        </div>
      </div>
    </header>
  );
};
