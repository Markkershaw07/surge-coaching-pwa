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
  'Weigh all food raw or dry, with a 10% tolerance.',
  'Use Frylight or 1-cal spray for cooking.',
  'Pink Himalayan salt: 5-6 turns per meal.',
  'Light sauces 15g max, or zero-calorie syrups.',
  'Max 1 diet drink per day.',
  '1-2 coffees or teas, black or with almond/skimmed milk.',
  'Eat every 3-4 hours after your first meal.',
];
