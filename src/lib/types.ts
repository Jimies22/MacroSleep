import type { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  name: string | null;
  email: string | null;
  photoURL: string | null;
  age?: number;
  weight?: number;
  macroGoals?: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
}

export interface SleepLog {
  id: string;
  startTime: Timestamp;
  endTime: Timestamp;
  totalHours: number;
  date: Timestamp;
}

export interface MacroLog {
  id: string;
  mealName: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  createdAt: Timestamp;
}
