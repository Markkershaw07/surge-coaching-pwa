export interface ChecklistItemDef {
  id: string;
  label: string;
  dose?: string;
  hint?: string;
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
      { id: 'weigh', label: 'Weigh yourself', hint: 'first thing, before eating' },
      { id: 'supp-omega3', label: 'Omega 3', dose: '2g' },
      { id: 'supp-vitd', label: 'Vitamin D', dose: '25mcg' },
      { id: 'supp-vitc', label: 'Vitamin C', dose: '2g (2 capsules)' },
      { id: 'supp-multi', label: 'Multivitamin', dose: '1 capsule' },
      { id: 'supp-bvit', label: 'B Vitamin', dose: '1 capsule' },
    ],
  },
  {
    id: 'pre-workout',
    title: 'Pre-Workout',
    items: [
      { id: 'prewo-drink', label: 'Pre-workout drink', dose: 'coffee or 300ml pre-wo', hint: '30-60 min before gym' },
      { id: 'prewo-snack', label: 'Pre-workout snack', hint: 'bread + honey about 30 min before gym' },
    ],
  },
  {
    id: 'gym',
    title: 'Gym',
    items: [
      { id: 'movement-prep', label: 'Movement prep', hint: 'complete before your workout' },
      { id: 'workout', label: 'Workout' },
      { id: 'supp-eaa', label: 'EAA', dose: '15g', hint: 'during workout' },
      { id: 'supp-creatine', label: 'Creatine', dose: '5g', hint: 'during workout' },
    ],
  },
  {
    id: 'meals',
    title: 'Meals',
    subtitle: 'eat every 3-4 hours',
    isMeals: true,
    items: [
      { id: 'meal-1', label: 'Meal 1' },
      { id: 'meal-2', label: 'Meal 2', hint: '3-4 hrs after Meal 1' },
      { id: 'meal-3', label: 'Meal 3', hint: '3-4 hrs after Meal 2' },
      { id: 'meal-4', label: 'Meal 4', hint: '3-4 hrs after Meal 3' },
    ],
  },
  {
    id: 'daily',
    title: 'Daily',
    items: [
      { id: 'hydration', label: 'Hydration', dose: '4.5L target' },
      { id: 'steps', label: 'Steps', dose: '8,000 target' },
    ],
  },
  {
    id: 'evening',
    title: 'Evening',
    items: [
      { id: 'supp-magnesium', label: 'Magnesium', dose: '400-500mg', hint: 'before bed' },
    ],
  },
];

export const REST_SECTIONS: ChecklistSection[] = TRAINING_SECTIONS.filter(
  s => s.id !== 'pre-workout' && s.id !== 'gym',
);
