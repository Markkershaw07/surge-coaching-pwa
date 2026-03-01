import type { SessionType } from '../types';

// 0 = Sunday, 1 = Monday, ... 6 = Saturday
export const WEEKLY_SCHEDULE: Record<number, SessionType> = {
  0: 'rest',   // Sunday
  1: 'push',   // Monday
  2: 'pull',   // Tuesday
  3: 'rest',   // Wednesday
  4: 'legs',   // Thursday
  5: 'upper',  // Friday
  6: 'rest',   // Saturday
};

export const SESSION_LABELS: Record<SessionType, string> = {
  push: 'PUSH DAY',
  pull: 'PULL DAY',
  legs: 'LEGS DAY',
  upper: 'UPPER DAY',
  rest: 'REST DAY',
};

export const SESSION_COLOURS: Record<SessionType, string> = {
  push: 'bg-orange-500',
  pull: 'bg-blue-500',
  legs: 'bg-green-500',
  upper: 'bg-purple-500',
  rest: 'bg-slate-600',
};

export function getDayType(session: SessionType): 'training' | 'rest' {
  return session === 'rest' ? 'rest' : 'training';
}
