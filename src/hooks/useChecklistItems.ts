import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDayType } from './useDayType';
import { useDailyLog } from './useDailyLog';
import { useAppSettings } from './useAppSettings';
import { useWeeklyPlan } from './useWeeklyPlan';
import { TRAINING_SECTIONS, REST_SECTIONS } from '../data/checklistSchedule';
import { NUTRITION_PLAN } from '../data/nutrition';
import type { ChecklistItemState, HydrationPayload, MealPayload, StepsPayload, SupplementPayload, WorkoutPayload } from '../types';

function getManualStorageKey() {
  return `surge_checklist_${new Date().toISOString().split('T')[0]}`;
}

type TickEntry = { ticked: boolean; ts: number };
type TickStore = Record<string, TickEntry>;

function readManualTicks(storageKey: string): TickStore {
  try {
    return JSON.parse(localStorage.getItem(storageKey) ?? '{}') as TickStore;
  } catch {
    return {};
  }
}

function todayKey() {
  return new Date().toISOString().split('T')[0];
}

export function useChecklistItems() {
  const { dayType, session } = useDayType();
  const { entries, addEntry, editEntry, removeEntry } = useDailyLog();
  const { settings } = useAppSettings();
  const weeklyPlan = useWeeklyPlan();
  const storageKey = getManualStorageKey();
  const [manualTicks, setManualTicks] = useState<TickStore>(() => readManualTicks(storageKey));

  useEffect(() => {
    setManualTicks(readManualTicks(storageKey));
  }, [storageKey]);

  const toggle = useCallback((id: string) => {
    setManualTicks(prev => {
      const wasOn = prev[id]?.ticked ?? false;
      const next: TickStore = { ...prev, [id]: { ticked: !wasOn, ts: Date.now() } };
      localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
  }, [storageKey]);

  const sections = dayType === 'training' ? TRAINING_SECTIONS : REST_SECTIONS;
  const items = useMemo(() => sections.flatMap(section => section.items), [sections]);
  const todayPlan = weeklyPlan.getDay(todayKey());

  const supplementEntries = entries.filter(entry => entry.type === 'supplement');
  const mealEntries = entries.filter(entry => entry.type === 'meal');
  const hydrationEntries = entries.filter(entry => entry.type === 'hydration');
  const weightEntry = entries.filter(entry => entry.type === 'weight').at(-1) ?? null;
  const stepsEntry = entries.filter(entry => entry.type === 'steps').at(-1) ?? null;
  const workoutEntry = [...entries].reverse().find(entry => {
    if (entry.type !== 'workout') return false;
    const payload = entry.payload as WorkoutPayload;
    return payload.sessionType === session && payload.finished;
  }) ?? null;
  const cardioEntry = entries.filter(entry => entry.type === 'cardio').at(-1) ?? null;

  const totalLitres = hydrationEntries.reduce((sum, entry) => sum + (entry.payload as HydrationPayload).ml, 0) / 1000;
  const currentSteps = stepsEntry ? (stepsEntry.payload as StepsPayload).steps : 0;

  const mealMap = useMemo(() => {
    const next = new Map<string, { entry: typeof mealEntries[number]; payload: MealPayload }>();
    for (const entry of mealEntries) {
      const payload = entry.payload as MealPayload;
      next.set(payload.slot, { entry, payload });
    }
    return next;
  }, [mealEntries]);

  const itemStates = useMemo(() => {
    const states: Record<string, ChecklistItemState> = {};

    for (const item of items) {
      let ticked = false;
      let canUndo = false;
      let detailText = item.label;

      switch (item.source) {
        case 'manual': {
          ticked = manualTicks[item.id]?.ticked ?? false;
          canUndo = ticked;
          detailText = ticked ? 'Completed manually' : (item.hint ?? item.label);
          break;
        }
        case 'weight': {
          ticked = !!weightEntry;
          canUndo = !!weightEntry;
          detailText = weightEntry ? `${(weightEntry.payload as { kg: number }).kg} kg logged` : 'Log your morning weight';
          break;
        }
        case 'supplement': {
          const entry = supplementEntries.find(value => {
            const payload = value.payload as SupplementPayload;
            return payload.taken && payload.name === item.logKey;
          });
          ticked = !!entry;
          canUndo = !!entry;
          detailText = ticked ? 'Logged from your supplement plan' : (item.dose ?? item.label);
          break;
        }
        case 'meal': {
          const meal = item.logKey ? mealMap.get(item.logKey) : undefined;
          ticked = !!meal?.payload.eaten;
          canUndo = !!meal?.entry;
          detailText = meal?.payload.eaten ? 'Logged as eaten' : 'Choose and mark as eaten from your plan';
          break;
        }
        case 'hydration': {
          ticked = totalLitres >= settings.hydrationMinL;
          canUndo = hydrationEntries.length > 0;
          detailText = `${totalLitres.toFixed(1)}L of ${settings.hydrationMinL}L`; 
          break;
        }
        case 'steps': {
          ticked = currentSteps >= settings.stepGoal;
          canUndo = !!stepsEntry;
          detailText = `${currentSteps.toLocaleString()} of ${settings.stepGoal.toLocaleString()} steps`;
          break;
        }
        case 'workout': {
          ticked = !!workoutEntry;
          canUndo = !!workoutEntry;
          detailText = ticked ? 'Finished workout logged' : 'Finish today\'s session to complete this';
          break;
        }
        case 'cardio': {
          ticked = !!cardioEntry;
          canUndo = !!cardioEntry;
          detailText = ticked ? 'Cardio session logged' : 'Optional, but counts toward weekly cardio';
          break;
        }
      }

      states[item.id] = {
        id: item.id,
        ticked,
        source: item.source,
        canUndo,
        overdue: false,
        optional: item.optional ?? false,
        hintText: item.label,
        detailText,
      };
    }

    return states;
  }, [items, manualTicks, weightEntry, supplementEntries, mealMap, totalLitres, settings.hydrationMinL, currentSteps, settings.stepGoal, stepsEntry, workoutEntry, cardioEntry, hydrationEntries.length]);

  const doneCount = items.filter(item => itemStates[item.id]?.ticked).length;
  const totalCount = items.length;
  const nextItemId = items.find(item => !itemStates[item.id]?.ticked && !item.optional)?.id ?? null;

  const mealIds = ['prewo-snack', 'meal-1', 'meal-2', 'meal-3', 'meal-4'];
  const mealTimestamps = mealIds.map(id => {
    const item = items.find(value => value.id === id);
    if (!item?.logKey) return 0;
    const meal = mealMap.get(item.logKey);
    if (!meal?.payload.eaten) return 0;
    return meal.payload.eatenAt ?? meal.entry.timestamp;
  }).filter(Boolean);
  const firstMealTs = [...mealTimestamps].sort((left, right) => left - right)[0] ?? 0;
  const lastMealTs = mealTimestamps.reduce((max, value) => Math.max(max, value), 0);

  const completeItem = useCallback(async (id: string) => {
    const item = items.find(value => value.id === id);
    if (!item) return;

    if (item.source === 'manual') {
      toggle(id);
      return;
    }

    if (item.source === 'supplement' && item.logKey) {
      await addEntry('supplement', { name: item.logKey, taken: true }, `supp-${item.logKey.replace(/\s+/g, '-')}-${todayKey()}`);
      return;
    }

    if (item.source === 'meal' && item.logKey) {
      const existing = mealMap.get(item.logKey);
      const alternative = existing?.payload.alternative
        ?? todayPlan?.selections[item.logKey]
        ?? NUTRITION_PLAN[dayType].slots.find(value => value.id === item.logKey)?.defaultOption;
      if (!alternative) return;

      if (existing) {
        await editEntry(existing.entry, {
          ...existing.payload,
          alternative,
          eaten: true,
          eatenAt: Date.now(),
        });
      } else {
        await addEntry('meal', {
          slot: item.logKey,
          alternative,
          eaten: true,
          eatenAt: Date.now(),
        }, `meal-${item.logKey}-${todayKey()}`);
      }
      return;
    }

    if (item.source === 'hydration') {
      await addEntry('hydration', { ml: 500 });
    }
  }, [items, toggle, addEntry, mealMap, todayPlan, dayType, editEntry]);

  const undoItem = useCallback(async (id: string) => {
    const item = items.find(value => value.id === id);
    if (!item) return;

    if (item.source === 'manual') {
      toggle(id);
      return;
    }

    if (item.source === 'weight' && weightEntry) {
      await removeEntry(weightEntry);
      return;
    }

    if (item.source === 'supplement') {
      const entry = [...supplementEntries].reverse().find(value => {
        const payload = value.payload as SupplementPayload;
        return payload.taken && payload.name === item.logKey;
      });
      if (entry) await removeEntry(entry);
      return;
    }

    if (item.source === 'meal' && item.logKey) {
      const meal = mealMap.get(item.logKey);
      if (meal) {
        await editEntry(meal.entry, {
          ...meal.payload,
          eaten: false,
          eatenAt: undefined,
        });
      }
      return;
    }

    if (item.source === 'hydration') {
      const entry = [...hydrationEntries].reverse()[0];
      if (entry) await removeEntry(entry);
      return;
    }

    if (item.source === 'steps' && stepsEntry) {
      await removeEntry(stepsEntry);
      return;
    }

    if (item.source === 'workout' && workoutEntry) {
      await removeEntry(workoutEntry);
      return;
    }

    if (item.source === 'cardio' && cardioEntry) {
      await removeEntry(cardioEntry);
    }
  }, [items, toggle, weightEntry, supplementEntries, mealMap, hydrationEntries, stepsEntry, workoutEntry, cardioEntry, removeEntry, editEntry]);

  return {
    sections,
    items,
    itemStates,
    doneCount,
    totalCount,
    toggle,
    completeItem,
    undoItem,
    nextItemId,
    lastMealTs,
    firstMealTs,
    hydrationTarget: settings.hydrationMinL,
    stepGoal: settings.stepGoal,
  };
}
