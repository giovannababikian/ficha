import { useState, useEffect, useRef, useCallback } from 'react';
import { sounds } from '../utils/audio';

export interface TimerState {
  isActive: boolean;
  isPaused: boolean;
  totalSeconds: number;
  remainingSeconds: number;
  exerciseName?: string;
}

export function useRestTimer() {
  const [timer, setTimer] = useState<TimerState>({
    isActive: false,
    isPaused: false,
    totalSeconds: 0,
    remainingSeconds: 0,
    exerciseName: undefined,
  });

  const endTimeRef = useRef<number | null>(null);
  const pausedTimeRemainingRef = useRef<number>(0);
  const intervalRef = useRef<number | null>(null);

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    endTimeRef.current = null;
    setTimer(prev => ({
      ...prev,
      isActive: false,
      isPaused: false,
      remainingSeconds: 0,
    }));
  }, []);

  const startTimer = useCallback((seconds: number, exerciseName?: string) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    sounds.playStart();

    const now = Date.now();
    endTimeRef.current = now + seconds * 1000;
    pausedTimeRemainingRef.current = seconds;

    setTimer({
      isActive: true,
      isPaused: false,
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
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        endTimeRef.current = null;
        sounds.playTimerDone();
        setTimer(prev => ({
          ...prev,
          isActive: false,
          remainingSeconds: 0,
        }));
      }
    }, 250);
  }, []);

  const pauseTimer = useCallback(() => {
    if (!timer.isActive || timer.isPaused) return;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    pausedTimeRemainingRef.current = timer.remainingSeconds;
    setTimer(prev => ({ ...prev, isPaused: true }));
  }, [timer.isActive, timer.isPaused, timer.remainingSeconds]);

  const resumeTimer = useCallback(() => {
    if (!timer.isActive || !timer.isPaused) return;
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
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        endTimeRef.current = null;
        sounds.playTimerDone();
        setTimer(prev => ({
          ...prev,
          isActive: false,
          isPaused: false,
          remainingSeconds: 0,
        }));
      }
    }, 250);
  }, [timer.isActive, timer.isPaused]);

  const addTime = useCallback((deltaSeconds: number) => {
    setTimer(prev => {
      if (!prev.isActive) return prev;
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

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
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
