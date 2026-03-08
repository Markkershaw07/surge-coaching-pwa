import { useState, useCallback, useEffect } from 'react';
import { useDayType } from './useDayType';
import { useDailyLog } from './useDailyLog';
import { TRAINING_SECTIONS, REST_SECTIONS } from '../data/checklistSchedule';
import { DEFAULT_TARGETS } from '../data/targets';
import type {
  HydrationPayload,
  MealPayload,
  StepsPayload,
  SupplementPayload,
} from '../types';

type TickEntry = { ticked: boolean; ts: number };
type TickStore = Record<string, TickEntry>;

function getSavedNumber(key: string, fallback: number): number {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  const value = Number(raw);
  return Number.isFinite(value) ? value : fallback;
}

export function useChecklistItems() {
  const { dayType } = useDayType();
  const { entries } = useDailyLog();
  const today = new Date().toISOString().split('T')[0];
  const storageKey = `surge_checklist_${today}`;

  const [ticks, setTicks] = useState<TickStore>(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey) ?? '{}');
    } catch {
      return {};
    }
  });

  const [, setMinuteTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setMinuteTick(n => n + 1), 60_000);
    return () => clearInterval(t);
  }, []);

  const toggle = useCallback((id: string) => {
    setTicks(prev => {
      const wasOn = prev[id]?.ticked ?? false;
      const next: TickStore = { ...prev, [id]: { ticked: !wasOn, ts: Date.now() } };
      localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
  }, [storageKey]);

  const sections = dayType === 'training' ? TRAINING_SECTIONS : REST_SECTIONS;

  const hydrationMin = getSavedNumber('surge_hydration_min', DEFAULT_TARGETS.hydrationMinL);
  const stepGoal = getSavedNumber('surge_step_goal', DEFAULT_TARGETS.stepGoal);

  const autoTicks: TickStore = {};

  const weightEntry = entries.filter(e => e.type === 'weight').at(-1);
  if (weightEntry) {
    autoTicks.weigh = { ticked: true, ts: weightEntry.timestamp };
  }

  const supplementMap: Record<string, string> = {
    'Omega 3': 'supp-omega3',
    'Vitamin D': 'supp-vitd',
    'Vitamin C': 'supp-vitc',
    Multivitamin: 'supp-multi',
    'B Vitamin': 'supp-bvit',
    'Essential Amino Acids (EAA)': 'supp-eaa',
    Creatine: 'supp-creatine',
    Magnesium: 'supp-magnesium',
  };

  for (const entry of entries.filter(e => e.type === 'supplement')) {
    const payload = entry.payload as SupplementPayload;
    const checklistId = supplementMap[payload.name];
    if (payload.taken && checklistId) {
      autoTicks[checklistId] = { ticked: true, ts: entry.timestamp };
    }
  }

  for (const entry of entries.filter(e => e.type === 'meal')) {
    const payload = entry.payload as MealPayload;
    const mealMap: Record<string, string> = {
      prewo: 'prewo-snack',
      m1: 'meal-1',
      m2: 'meal-2',
      m3: 'meal-3',
      m4: 'meal-4',
    };
    const checklistId = mealMap[payload.slot];
    if (checklistId) {
      autoTicks[checklistId] = { ticked: true, ts: entry.timestamp };
    }
  }

  const hydrationEntries = entries.filter(e => e.type === 'hydration');
  const totalLitres = hydrationEntries.reduce((sum, entry) => {
    return sum + (entry.payload as HydrationPayload).ml;
  }, 0) / 1000;
  if (totalLitres >= hydrationMin && hydrationEntries.length > 0) {
    autoTicks.hydration = { ticked: true, ts: hydrationEntries[hydrationEntries.length - 1].timestamp };
  }

  const stepsEntry = entries.filter(e => e.type === 'steps').at(-1);
  if (stepsEntry && (stepsEntry.payload as StepsPayload).steps >= stepGoal) {
    autoTicks.steps = { ticked: true, ts: stepsEntry.timestamp };
  }

  const workoutEntry = entries.filter(e => e.type === 'workout').at(-1);
  if (workoutEntry) {
    autoTicks.workout = { ticked: true, ts: workoutEntry.timestamp };
  }

  const mergedTicks: TickStore = { ...ticks, ...autoTicks };

  const allItems = sections.flatMap(s => s.items).map(item => ({
    ...item,
    ticked: mergedTicks[item.id]?.ticked ?? false,
  }));

  const doneCount = allItems.filter(i => i.ticked).length;
  const totalCount = allItems.length;
  const nextItemId = allItems.find(i => !i.ticked)?.id ?? null;

  const mealIds = new Set(['prewo-snack', 'meal-1', 'meal-2', 'meal-3', 'meal-4']);
  const lastMealTs = Object.entries(mergedTicks)
    .filter(([id, entry]) => mealIds.has(id) && entry.ticked)
    .reduce((max, [, entry]) => Math.max(max, entry.ts), 0);

  return { sections, ticks: mergedTicks, doneCount, totalCount, toggle, nextItemId, lastMealTs };
}
