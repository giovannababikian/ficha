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
  if (!timer.isActive) return null;

  const minutes = Math.floor(timer.remainingSeconds / 60);
  const seconds = timer.remainingSeconds % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const progressPercent = timer.totalSeconds > 0
    ? Math.max(0, Math.min(100, (timer.remainingSeconds / timer.totalSeconds) * 100))
    : 0;

  const isFinished = timer.remainingSeconds === 0;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-1.5rem)] max-w-md z-40">
      <div className={`rounded-xl shadow-lg border p-3 backdrop-blur-md transition-all duration-200 ${
        isFinished
          ? 'bg-emerald-950/90 text-white border-emerald-500 animate-bounce'
          : 'bg-stone-900/95 dark:bg-stone-900/95 text-white border-stone-700/80'
      }`}>
        {/* Progress bar */}
        <div className="w-full bg-stone-800 h-1 rounded-full overflow-hidden mb-2">
          <div
            className={`h-full transition-all duration-200 ${
              isFinished ? 'bg-emerald-400' : 'bg-stone-200'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              {isFinished ? (
                <BellRing className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              )}
              <span className="text-[11px] font-medium tracking-wide uppercase text-stone-300 truncate">
                {isFinished ? 'Pausa Encerrada!' : 'Descanso em andamento'}
              </span>
            </div>
            <p className="text-[10px] text-stone-400 truncate mt-0.5">
              {timer.exerciseName || 'Pausa programada'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Countdown digits */}
            <span className="text-xl font-bold font-mono tabular-nums tracking-tight">
              {timeFormatted}
            </span>

            {/* Controls */}
            <div className="flex items-center gap-1 pl-1 border-l border-stone-800">
              <button
                type="button"
                onClick={() => onAddTime(-15)}
                title="-15s"
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 active:scale-95 text-xs transition"
              >
                <Minus className="w-3 h-3" />
              </button>

              {timer.isPaused ? (
                <button
                  type="button"
                  onClick={onResume}
                  title="Continuar"
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95 transition"
                >
                  <Play className="w-3 h-3 fill-current" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onPause}
                  title="Pausar"
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 active:scale-95 transition"
                >
                  <Pause className="w-3 h-3 fill-current" />
                </button>
              )}

              <button
                type="button"
                onClick={() => onAddTime(15)}
                title="+15s"
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 active:scale-95 text-xs transition"
              >
                <Plus className="w-3 h-3" />
              </button>

              <button
                type="button"
                onClick={onStop}
                title="Fechar"
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-stone-800/80 hover:bg-stone-800 text-stone-400 hover:text-stone-200 active:scale-95 transition ml-0.5"
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
