import { useState, useEffect, useMemo, useCallback } from 'react';
import { WORKOUT_DAYS } from './data/workouts';
import { DayKey, WorkoutDay } from './types/workout';
import { UserSession } from './types/auth';
import { getActiveSession, setActiveSession, getUserStoragePrefix } from './utils/authStorage';
import { AuthScreen } from './components/AuthScreen';
import { Header } from './components/Header';
import { NavTabs } from './components/NavTabs';
import { ExerciseCard } from './components/ExerciseCard';
import { RestTimerFloat } from './components/RestTimerFloat';
import { WorkoutHistorySection, HistoryItem } from './components/WorkoutHistorySection';
import { useRestTimer } from './hooks/useRestTimer';
import { sounds } from './utils/audio';
import { Check, CheckCircle2, Timer, RotateCcw } from 'lucide-react';

function getTodayStr() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(getActiveSession);

  // Per-user storage prefix
  const userPrefix = useMemo(() => {
    return currentUser ? getUserStoragePrefix(currentUser.username) : '';
  }, [currentUser]);

  const [activeDayKey, setActiveDayKey] = useState<DayKey>('terca');
  const [checkedMap, setCheckedMap] = useState<Record<string, boolean>>({});
  const [weightsMap, setWeightsMap] = useState<Record<string, string>>({});
  const [completedDays, setCompletedDays] = useState<Record<DayKey, boolean>>({
    terca: false,
    quarta: false,
    quinta: false,
  });

  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      return localStorage.getItem('minimal_gym_theme') === 'dark';
    } catch {
      return false;
    }
  });

  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [historyList, setHistoryList] = useState<HistoryItem[]>([]);

  const { timer, startTimer, stopTimer, pauseTimer, resumeTimer, addTime } = useRestTimer();

  // Sync dark class on html root
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('minimal_gym_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('minimal_gym_theme', 'light');
    }
  }, [isDark]);

  // Load user data when currentUser changes
  useEffect(() => {
    if (!currentUser || !userPrefix) return;

    // Load active day preference or default to today's weekday
    try {
      const savedDay = localStorage.getItem(`${userPrefix}active_day`) as DayKey;
      if (savedDay && ['terca', 'quarta', 'quinta'].includes(savedDay)) {
        setActiveDayKey(savedDay);
      } else {
        const dayOfWeek = new Date().getDay();
        if (dayOfWeek === 2) setActiveDayKey('terca');
        else if (dayOfWeek === 3) setActiveDayKey('quarta');
        else if (dayOfWeek === 4) setActiveDayKey('quinta');
        else setActiveDayKey('terca');
      }
    } catch {
      setActiveDayKey('terca');
    }

    // Load checks and weights
    const newChecked: Record<string, boolean> = {};
    const newWeights: Record<string, string> = {};
    const todayStr = getTodayStr();

    WORKOUT_DAYS.forEach(day => {
      day.exercises.forEach(ex => {
        const isC = localStorage.getItem(`${userPrefix}${ex.id}_c`) === '1';
        if (isC) newChecked[ex.id] = true;

        const w = localStorage.getItem(`${userPrefix}${ex.id}_w`);
        if (w) newWeights[ex.id] = w;
      });
    });

    // Load day completion statuses
    const newCompletedDays: Record<DayKey, boolean> = {
      terca: localStorage.getItem(`${userPrefix}done_terca_${todayStr}`) === '1',
      quarta: localStorage.getItem(`${userPrefix}done_quarta_${todayStr}`) === '1',
      quinta: localStorage.getItem(`${userPrefix}done_quinta_${todayStr}`) === '1',
    };

    // Load workout history
    let savedHistory: HistoryItem[] = [];
    try {
      const raw = localStorage.getItem(`${userPrefix}history`);
      if (raw) savedHistory = JSON.parse(raw);
    } catch {
      savedHistory = [];
    }

    setCheckedMap(newChecked);
    setWeightsMap(newWeights);
    setCompletedDays(newCompletedDays);
    setHistoryList(savedHistory);
  }, [currentUser, userPrefix]);

  const handleSelectDay = (day: DayKey) => {
    setActiveDayKey(day);
    if (!userPrefix) return;
    try {
      localStorage.setItem(`${userPrefix}active_day`, day);
    } catch {
      // ignore
    }
  };

  const handleToggleCheck = useCallback((id: string) => {
    setCheckedMap(prev => {
      const nextState = !prev[id];
      const updated = { ...prev, [id]: nextState };
      if (userPrefix) {
        try {
          if (nextState) {
            localStorage.setItem(`${userPrefix}${id}_c`, '1');
          } else {
            localStorage.removeItem(`${userPrefix}${id}_c`);
          }
        } catch {
          // ignore
        }
      }
      return updated;
    });
  }, [userPrefix]);

  const handleWeightChange = useCallback((id: string, value: string) => {
    setWeightsMap(prev => {
      const updated = { ...prev, [id]: value };
      if (userPrefix) {
        try {
          if (value.trim()) {
            localStorage.setItem(`${userPrefix}${id}_w`, value.trim());
          } else {
            localStorage.removeItem(`${userPrefix}${id}_w`);
          }
        } catch {
          // ignore
        }
      }
      return updated;
    });
  }, [userPrefix]);

  const currentWorkout: WorkoutDay = useMemo(() => {
    return WORKOUT_DAYS.find(d => d.id === activeDayKey) || WORKOUT_DAYS[0];
  }, [activeDayKey]);

  // Toggle workout done state for current day
  const handleToggleWorkoutDone = () => {
    if (!userPrefix) return;
    const todayStr = getTodayStr();
    const currentStatus = completedDays[activeDayKey];
    const newStatus = !currentStatus;

    setCompletedDays(prev => ({
      ...prev,
      [activeDayKey]: newStatus,
    }));

    try {
      if (newStatus) {
        localStorage.setItem(`${userPrefix}done_${activeDayKey}_${todayStr}`, '1');
        sounds.playTimerDone();

        // Add to history record
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        const newEntry: HistoryItem = {
          date: todayStr,
          dayKey: activeDayKey,
          completedAt: timeStr,
        };
        const updatedHistory = [...historyList, newEntry];
        setHistoryList(updatedHistory);
        localStorage.setItem(`${userPrefix}history`, JSON.stringify(updatedHistory));
      } else {
        localStorage.removeItem(`${userPrefix}done_${activeDayKey}_${todayStr}`);
        sounds.playCheck();
      }
    } catch {
      // ignore
    }
  };

  // Reset checks
  const handleResetCurrentChecks = () => {
    if (!userPrefix) return;
    const nextChecked = { ...checkedMap };
    currentWorkout.exercises.forEach(ex => {
      delete nextChecked[ex.id];
      try {
        localStorage.removeItem(`${userPrefix}${ex.id}_c`);
      } catch {
        // ignore
      }
    });
    setCheckedMap(nextChecked);
    setIsResetConfirmOpen(false);
    sounds.playCheck();
  };

  const handleResetAllChecks = () => {
    if (!userPrefix) return;
    WORKOUT_DAYS.forEach(day => {
      day.exercises.forEach(ex => {
        try {
          localStorage.removeItem(`${userPrefix}${ex.id}_c`);
        } catch {
          // ignore
        }
      });
    });
    setCheckedMap({});
    setIsResetConfirmOpen(false);
    sounds.playCheck();
  };

  const handleClearHistory = () => {
    if (!userPrefix) return;
    setHistoryList([]);
    try {
      localStorage.removeItem(`${userPrefix}history`);
    } catch {
      // ignore
    }
  };

  const handleLogout = () => {
    setActiveSession(null);
    setCurrentUser(null);
    setCheckedMap({});
    setWeightsMap({});
    setHistoryList([]);
  };

  // Progress metrics
  const progressByDay = useMemo(() => {
    const result: Record<DayKey, { completed: number; total: number }> = {
      terca: { completed: 0, total: 6 },
      quarta: { completed: 0, total: 3 },
      quinta: { completed: 0, total: 6 },
    };

    WORKOUT_DAYS.forEach(day => {
      let count = 0;
      day.exercises.forEach(ex => {
        if (checkedMap[ex.id]) count++;
      });
      result[day.id] = { completed: count, total: day.exercises.length };
    });

    return result;
  }, [checkedMap]);

  // If user is not logged in, render clean AuthScreen
  if (!currentUser) {
    return <AuthScreen onSuccess={setCurrentUser} />;
  }

  const currentDayDone = completedDays[activeDayKey];
  const currentProgress = progressByDay[activeDayKey];

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col justify-between transition-colors duration-150">
      <div className="w-full max-w-md mx-auto pt-5 pb-20 px-3 sm:px-4">
        {/* Header with Athlete Profile */}
        <Header
          currentUser={currentUser}
          onLogout={handleLogout}
          onResetChecks={() => setIsResetConfirmOpen(true)}
          isDark={isDark}
          onToggleTheme={() => setIsDark(prev => !prev)}
        />

        {/* Navigation Tabs */}
        <NavTabs
          days={WORKOUT_DAYS}
          activeDay={activeDayKey}
          onSelectDay={handleSelectDay}
          completedDays={completedDays}
          progressByDay={progressByDay}
        />

        {/* Main Workout Panel */}
        <main className="space-y-3">
          {/* Warmup / Top Section Banner */}
          {currentWorkout.warmupCard && (
            <div className="bg-stone-100/90 dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 rounded-xl p-3 text-xs text-stone-700 dark:text-stone-300">
              <div className="flex items-center justify-between font-medium mb-1">
                <span className="font-semibold text-stone-900 dark:text-stone-100 uppercase tracking-wide text-[11px]">
                  {currentWorkout.warmupCard.title}
                </span>
                <button
                  type="button"
                  onClick={() => startTimer(currentWorkout.warmupCard!.restSeconds, currentWorkout.warmupCard!.title)}
                  title="Iniciar cronômetro de pausa de aquecimento"
                  className="inline-flex items-center gap-1 text-[10px] text-stone-600 dark:text-stone-300 bg-stone-200/80 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 active:scale-95 px-1.5 py-0.5 rounded border border-stone-300/40 dark:border-stone-700/60 transition cursor-pointer"
                >
                  <Timer className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Pausa: {currentWorkout.warmupCard.restSeconds}s</span>
                </button>
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-normal">
                {currentWorkout.warmupCard.description}
              </p>
            </div>
          )}

          {/* Exercise Cards */}
          <div className="space-y-2">
            {currentWorkout.exercises.map(ex => (
              <ExerciseCard
                key={ex.id}
                exercise={ex}
                isCompleted={!!checkedMap[ex.id]}
                weight={weightsMap[ex.id] || ''}
                onToggleCheck={handleToggleCheck}
                onWeightChange={handleWeightChange}
                onStartTimer={startTimer}
              />
            ))}
          </div>

          {/* Workout Completion Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleToggleWorkoutDone}
              className={`w-full py-3.5 rounded-xl font-bold text-xs tracking-wider uppercase shadow-xs transition duration-150 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] ${
                currentDayDone
                  ? 'bg-stone-900 hover:bg-black dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-700/20'
              }`}
            >
              {currentDayDone ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
                  <span>Concluído Hoje (Desfazer)</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>
                    Treino Concluído
                    {currentProgress.completed > 0 && ` (${currentProgress.completed}/${currentProgress.total})`}
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Workout History Log */}
          <WorkoutHistorySection
            historyList={historyList}
            onClearHistory={handleClearHistory}
          />
        </main>
      </div>

      {/* Floating Rest Timer */}
      <RestTimerFloat
        timer={timer}
        onPause={pauseTimer}
        onResume={resumeTimer}
        onStop={stopTimer}
        onAddTime={addTime}
      />

      {/* Reset Confirmation Dialog */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 w-full max-w-xs shadow-xl space-y-3">
            <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100 font-semibold text-xs">
              <RotateCcw className="w-4 h-4 text-stone-500" />
              <span>Zerar Checkboxes</span>
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              Escolha quais caixas de marcação deseja desmarcar para o próximo treino:
            </p>
            <div className="space-y-1.5 pt-1">
              <button
                type="button"
                onClick={handleResetCurrentChecks}
                className="w-full py-2 px-3 rounded-lg text-xs font-medium bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-left transition cursor-pointer"
              >
                Desmarcar apenas {currentWorkout.label} ({currentWorkout.subtitle})
              </button>
              <button
                type="button"
                onClick={handleResetAllChecks}
                className="w-full py-2 px-3 rounded-lg text-xs font-medium bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-left transition cursor-pointer"
              >
                Desmarcar todos os dias (A, Core, B)
              </button>
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="w-full py-2 px-3 rounded-lg text-xs font-medium text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 transition text-center cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
