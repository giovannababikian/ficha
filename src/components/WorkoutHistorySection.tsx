import React, { useState } from 'react';
import { Calendar, ChevronDown, ChevronUp, Trash2, CheckCircle2 } from 'lucide-react';
import { WORKOUT_DAYS } from '../data/workouts';

export interface HistoryItem {
  date: string;
  dayKey: string;
  completedAt: string;
}

interface WorkoutHistorySectionProps {
  historyList: HistoryItem[];
  onClearHistory: () => void;
}

export const WorkoutHistorySection: React.FC<WorkoutHistorySectionProps> = ({
  historyList,
  onClearHistory,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const getWorkoutLabel = (key: string) => {
    const found = WORKOUT_DAYS.find(d => d.id === key);
    return found ? `${found.label} (${found.subtitle})` : key.toUpperCase();
  };

  return (
    <section className="mt-6 pt-4 border-t border-stone-200 dark:border-stone-800">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIsOpen(prev => !prev)}
          className="flex items-center gap-2 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 transition py-1 text-left"
        >
          <Calendar className="w-3.5 h-3.5 text-stone-500" />
          <span>Registro de Treinos Realizados</span>
          <span className="text-[10px] font-mono tabular-nums px-1.5 py-0.5 rounded-full bg-stone-200/80 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
            {historyList.length}
          </span>
          {isOpen ? (
            <ChevronUp className="w-3.5 h-3.5 text-stone-400 ml-1" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-stone-400 ml-1" />
          )}
        </button>

        {isOpen && historyList.length > 0 && (
          <button
            type="button"
            onClick={onClearHistory}
            className="text-[10px] text-stone-400 hover:text-red-500 dark:hover:text-red-400 flex items-center gap-1 transition"
            title="Limpar histórico de registros"
          >
            <Trash2 className="w-3 h-3" />
            <span>Limpar</span>
          </button>
        )}
      </div>

      {isOpen && (
        <div className="mt-3 space-y-1.5 animate-fadeIn">
          {historyList.length === 0 ? (
            <p className="text-[11px] text-stone-500 dark:text-stone-400 py-3 px-3 bg-stone-100/60 dark:bg-stone-900/60 rounded-xl text-center">
              Nenhum treino concluído ainda. Ao tocar em "Treino Feito", o treino concluído será registrado aqui automaticamente.
            </p>
          ) : (
            <div className="space-y-1 max-h-56 overflow-y-auto">
              {historyList
                .slice()
                .reverse()
                .map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs py-2 px-3 bg-white dark:bg-stone-900 rounded-lg border border-stone-200/80 dark:border-stone-800"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="font-medium text-stone-800 dark:text-stone-200 truncate">
                        {getWorkoutLabel(item.dayKey)}
                      </span>
                    </div>

                    <div className="text-[10px] text-stone-400 dark:text-stone-500 font-mono shrink-0 pl-2">
                      <span>{item.date}</span>
                      {item.completedAt && <span> • {item.completedAt}</span>}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
};
