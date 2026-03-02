import { useState, useCallback } from 'react';
import { useDailyLog } from './useDailyLog';
import { useDayType } from './useDayType';
import { MORNING_SUPPS, INTRA_SUPPS, EVENING_SUPPS } from '../data/supplements';
import { NUTRITION_PLAN } from '../data/nutrition';
import { DEFAULT_TARGETS } from '../data/targets';
import type {
  ChecklistItem,
  HydrationPayload,
  StepsPayload,
  SupplementPayload,
  MealPayload,
} from '../types';

export function useChecklistItems() {
  const { dayType } = useDayType();
  const { today, getByType } = useDailyLog();

  const manualKey = `surge_checklist_manual_${today}`;
  const [manualTicks, setManualTicks] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem(manualKey) ?? '{}');
    } catch {
      return {};
    }
  });

  const toggleManual = useCallback((id: string) => {
    setManualTicks(prev => {
      const next = { ...prev, [id]: !prev[id] };
      localStorage.setItem(manualKey, JSON.stringify(next));
      return next;
    });
  }, [manualKey]);

  const hydrationTargetL =
    parseFloat(localStorage.getItem('surge_hydration_min') ?? '') ||
    DEFAULT_TARGETS.hydrationMinL;
  const stepGoal =
    parseInt(localStorage.getItem('surge_step_goal') ?? '') ||
    DEFAULT_TARGETS.stepGoal;

  const isTraining = dayType === 'training';

  // Supplement status
  const suppEntries = getByType('supplement');
  const takenNames = new Set(
    suppEntries
      .filter(e => (e.payload as SupplementPayload).taken)
      .map(e => (e.payload as SupplementPayload).name),
  );

  const morningTotal = MORNING_SUPPS.length;
  const morningDone = MORNING_SUPPS.filter(s => takenNames.has(s.name)).length;

  const intraTotal = INTRA_SUPPS.length;
  const intraDone = INTRA_SUPPS.filter(s => takenNames.has(s.name)).length;

  const eveningTotal = EVENING_SUPPS.length;
  const eveningDone = EVENING_SUPPS.filter(s => takenNames.has(s.name)).length;

  // Meal slots
  const mealEntries = getByType('meal');
  const loggedSlots = new Set(mealEntries.map(e => (e.payload as MealPayload).slot));

  // Hydration
  const hydrationEntries = getByType('hydration');
  const totalL =
    hydrationEntries.reduce((sum, e) => sum + (e.payload as HydrationPayload).ml, 0) / 1000;

  // Steps
  const stepsEntries = getByType('steps');
  const latestSteps =
    stepsEntries.length > 0
      ? (stepsEntries[stepsEntries.length - 1].payload as StepsPayload).steps
      : 0;

  // Workout
  const workoutDone = getByType('workout').length > 0;

  // Derive slot IDs from plan — never hardcoded
  const trainingPrewoSlot = NUTRITION_PLAN.training.slots[0]; // 'prewo'
  const mealSlots = NUTRITION_PLAN[dayType].slots.filter(s => s.id !== trainingPrewoSlot.id);

  const items: ChecklistItem[] = [];

  // 1. Morning Supplements
  items.push({
    id: 'supp-morning',
    kind: 'supplement-group',
    label: 'Morning Supplements',
    sublabel: morningDone < morningTotal ? `${morningDone} of ${morningTotal} done` : undefined,
    ticked: morningDone === morningTotal,
    partial: morningDone > 0 && morningDone < morningTotal,
    trainingOnly: false,
  });

  if (isTraining) {
    // 2. Pre-workout drink (manual tick)
    items.push({
      id: 'manual-prewo-drink',
      kind: 'manual',
      label: 'Pre-workout Drink',
      ticked: !!manualTicks['manual-prewo-drink'],
      trainingOnly: true,
    });

    // 3. Pre-Workout Snack (from training plan's first slot)
    items.push({
      id: `meal-${trainingPrewoSlot.id}`,
      kind: 'meal',
      label: trainingPrewoSlot.name,
      ticked: loggedSlots.has(trainingPrewoSlot.id),
      trainingOnly: true,
    });

    // 4. Workout
    items.push({
      id: 'workout',
      kind: 'workout',
      label: 'Workout',
      ticked: workoutDone,
      trainingOnly: true,
    });

    // 5. Intra Supplements
    items.push({
      id: 'supp-intra',
      kind: 'supplement-group',
      label: 'Intra Supplements',
      sublabel: intraDone < intraTotal ? `${intraDone} of ${intraTotal} done` : undefined,
      ticked: intraDone === intraTotal,
      partial: intraDone > 0 && intraDone < intraTotal,
      trainingOnly: true,
    });
  }

  // Meal slots (m1–m4 for both day types)
  for (const slot of mealSlots) {
    items.push({
      id: `meal-${slot.id}`,
      kind: 'meal',
      label: slot.name,
      ticked: loggedSlots.has(slot.id),
      trainingOnly: false,
    });
  }

  // Hydration target
  items.push({
    id: 'hydration',
    kind: 'hydration',
    label: 'Hydration Target',
    sublabel: `${totalL.toFixed(1)}L / ${hydrationTargetL}L`,
    ticked: totalL >= hydrationTargetL,
    trainingOnly: false,
  });

  // Steps target
  items.push({
    id: 'steps',
    kind: 'steps',
    label: 'Steps Target',
    sublabel: `${latestSteps.toLocaleString()} / ${stepGoal.toLocaleString()}`,
    ticked: latestSteps >= stepGoal,
    trainingOnly: false,
  });

  // Evening Supplements
  items.push({
    id: 'supp-evening',
    kind: 'supplement-group',
    label: 'Evening Supplements',
    sublabel: eveningDone < eveningTotal ? `${eveningDone} of ${eveningTotal} done` : undefined,
    ticked: eveningDone === eveningTotal,
    partial: eveningDone > 0 && eveningDone < eveningTotal,
    trainingOnly: false,
  });

  const doneCount = items.filter(i => i.ticked).length;
  const totalCount = items.length;

  return { items, doneCount, totalCount, toggleManual };
}
