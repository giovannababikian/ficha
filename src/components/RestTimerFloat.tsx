import React from 'react';
import { Play, Pause, X, Plus, Minus, BellRing } from 'lucide-react';
import { TimerState } from '../hooks/useRestTimer';

interface RestTimerFloatProps {
  timer: TimerState;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onAddTime: (delta: number) => void;
}

export const RestTimerFloat: React.FC<RestTimerFloatProps> = ({
  timer,
  onPause,
  onResume,
  onStop,
  onAddTime,
}) => {
  if (!timer.isActive && !timer.isAlarming) return null;

  const minutes = Math.floor(timer.remainingSeconds / 60);
  const seconds = timer.remainingSeconds % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const progressPercent = timer.totalSeconds > 0
    ? Math.max(0, Math.min(100, (timer.remainingSeconds / timer.totalSeconds) * 100))
    : 0;

  const isAlarming = timer.isAlarming;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-1.5rem)] max-w-md z-40">
      <div
        className={`rounded-2xl shadow-xl border p-3 backdrop-blur-md transition-all duration-200 ${
          isAlarming
            ? 'bg-emerald-600 text-white border-emerald-400 ring-2 ring-emerald-300 animate-pulse'
            : 'bg-stone-900/95 dark:bg-stone-900/95 text-white border-stone-700/80'
        }`}
      >
        {/* Progress bar */}
        {!isAlarming && (
          <div className="w-full bg-stone-800 h-1 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-emerald-400 transition-all duration-200"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              {isAlarming ? (
                <BellRing className="w-4 h-4 text-white animate-bounce shrink-0" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              )}
              <span className="text-[11px] font-bold tracking-wider uppercase text-white truncate">
                {isAlarming ? 'Pausa Concluída • 3s' : 'Descanso em Andamento'}
              </span>
            </div>
            <p className={`text-[10px] truncate mt-0.5 ${isAlarming ? 'text-emerald-100 font-medium' : 'text-stone-400'}`}>
              {timer.exerciseName || 'Hora da próxima série!'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Countdown digits */}
            <span className="text-xl font-bold font-mono tabular-nums tracking-tight">
              {isAlarming ? '00:00' : timeFormatted}
            </span>

            {/* Controls */}
            <div className="flex items-center gap-1 pl-1 border-l border-white/20">
              {!isAlarming ? (
                <>
                  <button
                    type="button"
                    onClick={() => onAddTime(-15)}
                    title="-15s"
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 active:scale-95 text-xs transition cursor-pointer"
                  >
                    <Minus className="w-3 h-3" />
                  </button>

                  {timer.isPaused ? (
                    <button
                      type="button"
                      onClick={onResume}
                      title="Continuar"
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95 transition cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-current" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={onPause}
                      title="Pausar"
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 active:scale-95 transition cursor-pointer"
                    >
                      <Pause className="w-3 h-3 fill-current" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onAddTime(15)}
                    title="+15s"
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 active:scale-95 text-xs transition cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </>
              ) : null}

              <button
                type="button"
                onClick={onStop}
                title="Fechar"
                className={`w-7 h-7 flex items-center justify-center rounded-lg active:scale-95 transition ml-0.5 cursor-pointer ${
                  isAlarming
                    ? 'bg-white/20 hover:bg-white/30 text-white font-bold'
                    : 'bg-stone-800/80 hover:bg-stone-800 text-stone-400 hover:text-stone-200'
                }`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
