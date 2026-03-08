export type SessionType = 'push' | 'pull' | 'legs' | 'upper' | 'rest';
export type DayType = 'training' | 'rest';
export type LogType = 'hydration' | 'supplement' | 'meal' | 'workout' | 'weight' | 'cardio' | 'steps';
export type ReminderType = 'meals' | 'tasks' | 'hydration' | 'steps';
export type ChecklistItemSource = 'manual' | 'weight' | 'supplement' | 'meal' | 'hydration' | 'steps' | 'workout' | 'cardio';

export interface HydrationPayload { ml: number }
export interface SupplementPayload { name: string; taken: boolean }
export interface MealPayload { slot: string; alternative: string }
export interface WorkoutPayload { sessionType: SessionType; exercises: ExerciseLog[] }
export interface WeightPayload { kg: number }
export interface CardioPayload { zone: 2 | 3; durationMin: number; distanceKm?: number }
export interface StepsPayload { steps: number }

export interface ExerciseLog {
  exerciseId: string;
  sets: SetLog[];
}
export interface SetLog {
  setNumber: number;
  reps: number;
  weight: number;
  isFeeder?: boolean;
}

export interface LogEntry {
  id: string;
  timestamp: number;
  date: string;
  planVersionId: string;
  type: LogType;
  deleted?: boolean;
  payload: HydrationPayload | SupplementPayload | MealPayload | WorkoutPayload | WeightPayload | CardioPayload | StepsPayload;
}

export interface FoodItem {
  name: string;
  qty: string;
  kcal: number;
  p: number;
  c: number;
  f: number;
}

export interface MealOption {
  id: string;
  label: string;
  foods: FoodItem[];
  totals: { kcal: number; p: number; c: number; f: number };
}

export interface MealSlot {
  id: string;
  name: string;
  options: MealOption[];
  defaultOption: string;
}

export interface DayPlan {
  targetKcal: number;
  targetP: number;
  targetC: number;
  targetF: number;
  slots: MealSlot[];
}

export interface NutritionPlan {
  training: DayPlan;
  rest: DayPlan;
}

export interface Supplement {
  name: string;
  dose: string;
  timing: 'morning' | 'intra' | 'evening' | 'preworkout';
}

export interface Exercise {
  id: string;
  label: string;
  sets: number;
  reps: string;
  rest: string;
  notes?: string;
  isWarmUp?: boolean;
}

export interface WorkoutSession {
  type: SessionType;
  exercises: Exercise[];
}

export interface MovementPrepExercise {
  name: string;
  detail: string;
}

export interface PlanVersion {
  id: string;
  effectiveDate: string;
  label: string;
}

export interface Targets {
  hydrationMinL: number;
  hydrationMaxL: number;
  stepGoal: number;
  cardioZ2PerWeek: number;
  cardioZ3PerWeek: number;
}

export interface ReminderSettings {
  browserNotifications: boolean;
  mealReminders: boolean;
  taskReminders: boolean;
  hydrationReminders: boolean;
  stepsReminders: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  wakeTime: string;
  workoutTime: string;
  eveningTime: string;
  mealGapMin: number;
  followUpMin: number;
}

export interface AppSettings extends Targets {
  reminders: ReminderSettings;
}

export interface WeeklyPlanDay {
  date: string;
  dayType: DayType;
  selections: Record<string, string>;
}

export interface WeeklyPlan {
  weekStart: string;
  days: WeeklyPlanDay[];
}

export interface ChecklistItemState {
  id: string;
  ticked: boolean;
  source: ChecklistItemSource;
  canUndo: boolean;
  overdue: boolean;
  optional: boolean;
  hintText?: string;
}

export interface ReminderCardState {
  title: string;
  detail: string;
  itemIds: string[];
  level: 'info' | 'warning';
}
