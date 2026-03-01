import type { Targets } from '../types';

export const PLAN_VERSION_ID = 'v1-2026-03-01';

export const PLAN_VERSION = {
  id: PLAN_VERSION_ID,
  effectiveDate: '2026-03-01',
  label: 'Initial plan (March 2026)',
};

export const DEFAULT_TARGETS: Targets = {
  hydrationMinL: 4.5,
  hydrationMaxL: 6,
  stepGoal: 8000,
  cardioZ2PerWeek: 2,
  cardioZ3PerWeek: 1,
};

export const COOKING_RULES = [
  'Weigh all food RAW/DRY — 10% tolerance ±',
  'Use Frylight / 1-cal spray for all cooking',
  'Pink Himalayan Salt — 5–6 turns per meal',
  'Light sauces 15g max, or zero-cal syrups',
  'Max 1 diet drink per day',
  '1–2 coffees/teas (black or with almond/skimmed milk)',
  'Eat every 3–4 hours after first meal',
];
