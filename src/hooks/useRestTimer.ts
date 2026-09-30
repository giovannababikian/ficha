import { useState, useEffect, useRef, useCallback } from 'react';
import { sounds } from '../utils/audio';

export interface TimerState {
  isActive: boolean;
  isPaused: boolean;
  isAlarming: boolean; // True during the 3 seconds alarm
  totalSeconds: number;
  remainingSeconds: number;
  exerciseName?: string;
}

export function useRestTimer() {
  const [timer, setTimer] = useState<TimerState>({
    isActive: false,
    isPaused: false,
    isAlarming: false,
    totalSeconds: 0,
    remainingSeconds: 0,
    exerciseName: undefined,
  });

  const endTimeRef = useRef<number | null>(null);
  const pausedTimeRemainingRef = useRef<number>(0);
  const intervalRef = useRef<number | null>(null);
  const alarmTimeoutRef = useRef<number | null>(null);
  const wakeLockRef = useRef<any>(null);

  // Request WakeLock to prevent the screen from sleeping during pause
  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator && !wakeLockRef.current) {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        wakeLockRef.current.addEventListener('release', () => {
          wakeLockRef.current = null;
        });
      }
    } catch {
      // Ignore if not supported or disallowed
    }
  };

  const releaseWakeLock = () => {
    try {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
      }
    } catch {
      // ignore
    }
  };

  // Dispatch lock-screen system notification if allowed
  const notifyCompletion = (exerciseName?: string) => {
    try {
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('⏱️ Pausa Concluída!', {
          body: exerciseName ? `Hora da próxima série de: ${exerciseName}` : 'Descanso finalizado. Bom treino!',
          tag: 'rest-timer',
          silent: false,
        });
      }
    } catch {
      // ignore
    }
  };

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (alarmTimeoutRef.current) {
      clearTimeout(alarmTimeoutRef.current);
      alarmTimeoutRef.current = null;
    }
    endTimeRef.current = null;
    releaseWakeLock();

    setTimer({
      isActive: false,
      isPaused: false,
      isAlarming: false,
      totalSeconds: 0,
      remainingSeconds: 0,
      exerciseName: undefined,
    });
  }, []);

  const triggerAlarm = useCallback((exerciseName?: string) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    endTimeRef.current = null;

    // Play 3 seconds discreet alarm + ducking + vibration
    sounds.playRestAlarm3s();
    notifyCompletion(exerciseName);

    setTimer(prev => ({
      ...prev,
      remainingSeconds: 0,
      isAlarming: true,
    }));

    // After 3 seconds, turn off alarming state and release screen wake lock
    if (alarmTimeoutRef.current) clearTimeout(alarmTimeoutRef.current);
    alarmTimeoutRef.current = window.setTimeout(() => {
      releaseWakeLock();
      setTimer(prev => ({
        ...prev,
        isActive: false,
        isAlarming: false,
      }));
    }, 3000);
  }, []);

  const startTimer = useCallback((seconds: number, exerciseName?: string) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (alarmTimeoutRef.current) clearTimeout(alarmTimeoutRef.current);

    // Ask notification permission on first user tap if not asked yet
    try {
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().catch(() => {});
      }
    } catch {
      // ignore
    }

    sounds.playStart();
    requestWakeLock();

    const now = Date.now();
    endTimeRef.current = now + seconds * 1000;
    pausedTimeRemainingRef.current = seconds;

    setTimer({
      isActive: true,
      isPaused: false,
      isAlarming: false,
      totalSeconds: seconds,
      remainingSeconds: seconds,
      exerciseName,
    });

    intervalRef.current = window.setInterval(() => {
      if (!endTimeRef.current) return;
      const leftMs = endTimeRef.current - Date.now();
      const leftSec = Math.max(0, Math.ceil(leftMs / 1000));

      setTimer(prev => ({
        ...prev,
        remainingSeconds: leftSec,
      }));

      if (leftSec <= 0) {
        triggerAlarm(exerciseName);
      }
    }, 250);
  }, [triggerAlarm]);

  const pauseTimer = useCallback(() => {
    if (!timer.isActive || timer.isPaused || timer.isAlarming) return;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    pausedTimeRemainingRef.current = timer.remainingSeconds;
    releaseWakeLock();
    setTimer(prev => ({ ...prev, isPaused: true }));
  }, [timer.isActive, timer.isPaused, timer.isAlarming, timer.remainingSeconds]);

  const resumeTimer = useCallback(() => {
    if (!timer.isActive || !timer.isPaused || timer.isAlarming) return;
    requestWakeLock();
    const now = Date.now();
    endTimeRef.current = now + pausedTimeRemainingRef.current * 1000;

    setTimer(prev => ({ ...prev, isPaused: false }));

    intervalRef.current = window.setInterval(() => {
      if (!endTimeRef.current) return;
      const leftMs = endTimeRef.current - Date.now();
      const leftSec = Math.max(0, Math.ceil(leftMs / 1000));

      setTimer(prev => ({
        ...prev,
        remainingSeconds: leftSec,
      }));

      if (leftSec <= 0) {
        triggerAlarm(timer.exerciseName);
      }
    }, 250);
  }, [timer.isActive, timer.isPaused, timer.isAlarming, timer.exerciseName, triggerAlarm]);

  const addTime = useCallback((deltaSeconds: number) => {
    setTimer(prev => {
      if (!prev.isActive || prev.isAlarming) return prev;
      const newRemaining = Math.max(5, prev.remainingSeconds + deltaSeconds);
      const newTotal = Math.max(newRemaining, prev.totalSeconds + (deltaSeconds > 0 ? deltaSeconds : 0));

      if (!prev.isPaused) {
        endTimeRef.current = Date.now() + newRemaining * 1000;
      } else {
        pausedTimeRemainingRef.current = newRemaining;
      }

      return {
        ...prev,
        remainingSeconds: newRemaining,
        totalSeconds: newTotal,
      };
    });
  }, []);

  // Handle visibility change (screen lock/unlock or tab switch)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Re-request wake lock if timer is active
        if (endTimeRef.current && !timer.isPaused && !timer.isAlarming) {
          requestWakeLock();
          const leftMs = endTimeRef.current - Date.now();
          const leftSec = Math.max(0, Math.ceil(leftMs / 1000));
          if (leftSec <= 0) {
            triggerAlarm(timer.exerciseName);
          } else {
            setTimer(prev => ({ ...prev, remainingSeconds: leftSec }));
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [timer.isPaused, timer.isAlarming, timer.exerciseName, triggerAlarm]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (alarmTimeoutRef.current) clearTimeout(alarmTimeoutRef.current);
      releaseWakeLock();
    };
  }, []);

  return {
    timer,
    startTimer,
    stopTimer,
    pauseTimer,
    resumeTimer,
    addTime,
  };
}
