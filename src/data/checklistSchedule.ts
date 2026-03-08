import type { ChecklistItemSource } from '../types';

export interface ChecklistItemDef {
  id: string;
  label: string;
  dose?: string;
  hint?: string;
  source: ChecklistItemSource;
  logKey?: string;
  reminderEligible?: boolean;
  optional?: boolean;
}

export interface ChecklistSection {
  id: string;
  title: string;
  subtitle?: string;
  isMeals?: boolean;
  items: ChecklistItemDef[];
}

export const TRAINING_SECTIONS: ChecklistSection[] = [
  {
    id: 'wake-up',
    title: 'Wake Up',
    items: [
      { id: 'weigh', label: 'Weigh yourself', hint: 'first thing, before eating', source: 'weight', logKey: 'weight', reminderEligible: true },
      { id: 'supp-omega3', label: 'Omega 3', dose: '2g', source: 'supplement', logKey: 'Omega 3', reminderEligible: true },
      { id: 'supp-vitd', label: 'Vitamin D', dose: '25mcg', source: 'supplement', logKey: 'Vitamin D', reminderEligible: true },
      { id: 'supp-vitc', label: 'Vitamin C', dose: '2g (2 capsules)', source: 'supplement', logKey: 'Vitamin C', reminderEligible: true },
      { id: 'supp-multi', label: 'Multivitamin', dose: '1 capsule', source: 'supplement', logKey: 'Multivitamin', reminderEligible: true },
      { id: 'supp-bvit', label: 'B Vitamin', dose: '1 capsule', source: 'supplement', logKey: 'B Vitamin', reminderEligible: true },
    ],
  },
  {
    id: 'pre-workout',
    title: 'Pre-Workout',
    items: [
      { id: 'prewo-drink', label: 'Pre-workout drink', dose: 'coffee or 300ml pre-wo', hint: '30-60 min before gym', source: 'manual', reminderEligible: true },
      { id: 'prewo-snack', label: 'Pre-workout snack', hint: 'bread + honey about 30 min before gym', source: 'meal', logKey: 'prewo', reminderEligible: true },
    ],
  },
  {
    id: 'gym',
    title: 'Gym',
    items: [
      { id: 'movement-prep', label: 'Movement prep', hint: 'complete before your workout', source: 'manual', reminderEligible: true },
      { id: 'workout', label: 'Workout', source: 'workout', logKey: 'workout', reminderEligible: true },
      { id: 'supp-eaa', label: 'EAA', dose: '15g', hint: 'during workout', source: 'supplement', logKey: 'Essential Amino Acids (EAA)', reminderEligible: false },
      { id: 'supp-creatine', label: 'Creatine', dose: '5g', hint: 'during workout', source: 'supplement', logKey: 'Creatine', reminderEligible: false },
    ],
  },
  {
    id: 'meals',
    title: 'Meals',
    subtitle: 'eat every 3-4 hours',
    isMeals: true,
    items: [
      { id: 'meal-1', label: 'Meal 1', source: 'meal', logKey: 'm1', reminderEligible: true },
      { id: 'meal-2', label: 'Meal 2', hint: '3-4 hrs after Meal 1', source: 'meal', logKey: 'm2', reminderEligible: true },
      { id: 'meal-3', label: 'Meal 3', hint: '3-4 hrs after Meal 2', source: 'meal', logKey: 'm3', reminderEligible: true },
      { id: 'meal-4', label: 'Meal 4', hint: '3-4 hrs after Meal 3', source: 'meal', logKey: 'm4', reminderEligible: true },
    ],
  },
  {
    id: 'daily',
    title: 'Daily',
    items: [
      { id: 'hydration', label: 'Hydration', dose: 'hit your daily water target', source: 'hydration', logKey: 'hydration', reminderEligible: true },
      { id: 'steps', label: 'Steps', dose: 'hit your daily step goal', source: 'steps', logKey: 'steps', reminderEligible: true },
      { id: 'cardio', label: 'Cardio', dose: 'optional today, counts toward weekly target', source: 'cardio', logKey: 'cardio', optional: true, reminderEligible: false },
    ],
  },
  {
    id: 'evening',
    title: 'Evening',
    items: [
      { id: 'supp-magnesium', label: 'Magnesium', dose: '400-500mg', hint: 'before bed', source: 'supplement', logKey: 'Magnesium', reminderEligible: true },
    ],
  },
];

export const REST_SECTIONS: ChecklistSection[] = TRAINING_SECTIONS.filter(
  section => section.id !== 'pre-workout' && section.id !== 'gym',
);
