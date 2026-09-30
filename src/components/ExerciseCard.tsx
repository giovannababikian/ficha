import React from 'react';
import { Timer, Check } from 'lucide-react';
import { Exercise } from '../types/workout';
import { sounds } from '../utils/audio';

interface ExerciseCardProps {
  exercise: Exercise;
  isCompleted: boolean;
  weight: string;
  onToggleCheck: (id: string) => void;
  onWeightChange: (id: string, weight: string) => void;
  onStartTimer: (seconds: number, exerciseName: string) => void;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  isCompleted,
  weight,
  onToggleCheck,
  onWeightChange,
  onStartTimer,
}) => {
  const handleCheck = () => {
    onToggleCheck(exercise.id);
    sounds.playCheck();
  };

  const handleTimerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onStartTimer(exercise.restSeconds, exercise.name);
  };

  return (
    <div
      className={`border rounded-xl p-3 shadow-xs transition-all duration-200 select-none ${
        isCompleted
          ? 'opacity-40 bg-stone-100/90 dark:bg-stone-900/40 border-stone-200/60 dark:border-stone-800/50'
          : 'bg-white dark:bg-stone-900/90 border-stone-200/90 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Checkbox and Info */}
        <div className="flex items-start gap-2.5 min-w-0 flex-1">
          <button
            type="button"
            role="checkbox"
            aria-checked={isCompleted}
            onClick={handleCheck}
            className={`w-[1.35rem] h-[1.35rem] rounded-[6px] border flex items-center justify-center transition-colors shrink-0 mt-0.5 cursor-pointer ${
              isCompleted
                ? 'bg-emerald-600 border-emerald-600 text-white'
                : 'bg-white dark:bg-stone-800 border-stone-300 dark:border-stone-700 hover:border-stone-500'
            }`}
          >
            {isCompleted && <Check className="w-3.5 h-3.5 stroke-[2.8]" />}
          </button>

          <div className="min-w-0 flex-1">
            <h3
              onClick={handleCheck}
              className={`text-xs font-semibold cursor-pointer transition-colors ${
                isCompleted
                  ? 'line-through text-stone-500 dark:text-stone-400'
                  : 'text-stone-900 dark:text-stone-100'
              }`}
            >
              {exercise.name}
            </h3>

            <div className="flex flex-wrap items-center gap-1.5 mt-1">
              <span className="text-[11px] font-bold text-stone-800 dark:text-stone-200 font-mono tracking-tight bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 rounded">
                {exercise.targetSetsReps}
              </span>

              {exercise.restSeconds > 0 && (
                <button
                  type="button"
                  onClick={handleTimerClick}
                  title={`Iniciar cronômetro de descanso (${exercise.restSeconds}s)`}
                  className="inline-flex items-center gap-1 text-[10px] font-medium text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-stone-800/80 hover:bg-stone-200 dark:hover:bg-stone-700 active:scale-95 px-1.5 py-0.5 rounded border border-stone-200/50 dark:border-stone-700/50 transition cursor-pointer"
                >
                  <Timer className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Pausa: {exercise.restSeconds}s</span>
                </button>
              )}
            </div>

            {exercise.notes && (
              <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-1 leading-snug">
                {exercise.notes}
              </p>
            )}
          </div>
        </div>

        {/* Load Input (kg) */}
        {exercise.hasWeightInput && (
          <div className="w-16 shrink-0 text-right">
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                value={weight}
                placeholder="kg"
                onChange={e => onWeightChange(exercise.id, e.target.value)}
                className="w-full text-right text-xs font-mono font-medium bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md py-1 px-2 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-hidden focus:border-stone-400 dark:focus:border-stone-500 focus:bg-white dark:focus:bg-stone-900 transition"
                aria-label={`Carga para ${exercise.name}`}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
