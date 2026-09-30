export type DayKey = 'terca' | 'quarta' | 'quinta';

export interface Exercise {
  id: string;
  name: string;
  targetSetsReps: string;
  restSeconds: number; // e.g. 120, 90, 75, 60, 45, 30
  notes: string;
  hasWeightInput: boolean;
  warmup?: boolean;
}

export interface WorkoutDay {
  id: DayKey;
  label: string; // "Terça", "Quarta", "Quinta"
  subtitle: string; // "Treino A", "Core/Corrida", "Treino B"
  focus: string; // e.g. "Inferiores & Glúteo", "Recuperação Ativa & Cardio", "Superiores & Braços"
  warmupCard?: {
    title: string;
    restSeconds: number;
    description: string;
  };
  exercises: Exercise[];
}

export interface ExerciseLog {
  completed: boolean;
  weight: string;
  lastUpdated?: string;
  notes?: string;
}

export interface WorkoutHistoryEntry {
  date: string; // YYYY-MM-DD
  dayKey: DayKey;
  completedAt: string;
  exerciseCount: number;
  completedCount: number;
}
