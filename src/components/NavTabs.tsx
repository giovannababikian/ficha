import React from 'react';
import { Check } from 'lucide-react';
import { DayKey, WorkoutDay } from '../types/workout';

interface NavTabsProps {
  days: WorkoutDay[];
  activeDay: DayKey;
  onSelectDay: (day: DayKey) => void;
  completedDays: Record<DayKey, boolean>;
  progressByDay: Record<DayKey, { completed: number; total: number }>;
}

export const NavTabs: React.FC<NavTabsProps> = ({
  days,
  activeDay,
  onSelectDay,
  completedDays,
  progressByDay,
}) => {
  return (
    <nav className="grid grid-cols-3 gap-1.5 bg-stone-200/70 dark:bg-stone-900/90 p-1.5 rounded-xl mb-4 text-center border border-stone-200/50 dark:border-stone-800">
      {days.map(day => {
        const isActive = activeDay === day.id;
        const isDone = completedDays[day.id];
        const progress = progressByDay[day.id] || { completed: 0, total: day.exercises.length };

        let buttonClasses = 'relative py-2.5 px-1 rounded-lg text-xs transition-all duration-150 text-center select-none cursor-pointer ';

        if (isDone) {
          // When workout is finished, the entire box turns sport emerald
          buttonClasses += isActive
            ? 'bg-emerald-600 text-white font-bold shadow-sm ring-2 ring-emerald-400/60'
            : 'bg-emerald-600/95 text-white font-semibold hover:bg-emerald-500 shadow-xs';
        } else if (isActive) {
          buttonClasses += 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-50 shadow-sm font-bold border border-stone-200/80 dark:border-stone-700';
        } else {
          buttonClasses += 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 font-medium hover:bg-stone-200/50 dark:hover:bg-stone-800/50';
        }

        return (
          <button
            key={day.id}
            onClick={() => onSelectDay(day.id)}
            className={buttonClasses}
          >
            <div className="flex items-center justify-center gap-1">
              <span className="tracking-wide uppercase text-[11px]">{day.label}</span>
              {isDone && (
                <Check className="w-3.5 h-3.5 stroke-[3] text-white shrink-0" />
              )}
            </div>

            <div className="flex items-center justify-center gap-1 mt-0.5">
              <span
                className={`block text-[10px] tracking-tight ${
                  isDone ? 'text-emerald-100 font-normal' : 'opacity-70 font-normal'
                }`}
              >
                {day.subtitle}
              </span>
              {progress.total > 0 && progress.completed > 0 && (
                <span
                  className={`text-[9px] font-mono tabular-nums ${
                    isDone
                      ? 'text-emerald-100 font-semibold'
                      : progress.completed === progress.total
                      ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                      : 'text-stone-400 dark:text-stone-500'
                  }`}
                >
                  ({progress.completed}/{progress.total})
                </span>
              )}
            </div>
          </button>
        );
      })}
    </nav>
  );
};
