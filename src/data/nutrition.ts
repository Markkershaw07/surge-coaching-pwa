import type { DayPlan, MealOption, NutritionPlan } from '../types';

export const NUTRITION_PLAN: NutritionPlan = {
  training: {
    targetKcal: 2172,
    targetP: 197.2,
    targetC: 210.1,
    targetF: 58.1,
    slots: [
      {
        id: 'prewo',
        name: 'Pre-Workout',
        defaultOption: 'prewo-standard',
        options: [
          {
            id: 'prewo-standard',
            label: 'Pre-Workout Snack',
            foods: [
              { name: 'Bread Thin Sliced', qty: '50g', kcal: 111, p: 5.6, c: 21, f: 1.9 },
              { name: 'Honey', qty: '5g', kcal: 15, p: 0, c: 4.1, f: 0 },
            ],
            totals: { kcal: 126, p: 5.6, c: 25.1, f: 1.9 },
          },
        ],
      },
      {
        id: 'm1',
        name: 'Meal 1',
        defaultOption: 'm1-eggs',
        options: [
          {
            id: 'm1-eggs',
            label: 'Eggs',
            foods: [
              { name: 'Whole Egg', qty: '3Qty', kcal: 219, p: 21, c: 0, f: 15 },
              { name: 'Sourdough', qty: '80g', kcal: 218, p: 8.6, c: 40, f: 1.9 },
              { name: 'Avocado', qty: '50g', kcal: 80, p: 1, c: 0.9, f: 7.3 },
            ],
            totals: { kcal: 517, p: 30.6, c: 40.9, f: 24.2 },
          },
          {
            id: 'm1-burrito',
            label: 'Breakfast Burrito',
            foods: [
              { name: 'Whole Egg', qty: '3Qty', kcal: 219, p: 21, c: 0, f: 15 },
              { name: 'White Wrap', qty: '1Qty', kcal: 176, p: 6, c: 31, f: 3.1 },
              { name: 'Veg of choice', qty: '100g', kcal: 56, p: 4, c: 10, f: 0 },
              { name: 'Light Cheese', qty: '20g', kcal: 52, p: 5.9, c: 0.1, f: 3.2 },
              { name: 'Lean Bacon Medallions', qty: '40g', kcal: 74, p: 14, c: 0.9, f: 1.7 },
            ],
            totals: { kcal: 577, p: 50.9, c: 42, f: 23 },
          },
          {
            id: 'm1-loaded-bagel',
            label: 'Loaded Bagel',
            foods: [
              { name: 'Bagel', qty: '100g', kcal: 251, p: 10, c: 45, f: 1.4 },
              { name: 'Whole Egg', qty: '3Qty', kcal: 219, p: 21, c: 0, f: 15 },
              { name: 'Lean Bacon Medallions', qty: '40g', kcal: 74, p: 14, c: 0.9, f: 1.7 },
              { name: 'Light Cheese', qty: '5g', kcal: 13, p: 1.5, c: 0, f: 0.8 },
            ],
            totals: { kcal: 557, p: 46.5, c: 45.9, f: 18.9 },
          },
        ],
      },
      {
        id: 'm2',
        name: 'Meal 2',
        defaultOption: 'm2-chicken-burrito',
        options: [
          {
            id: 'm2-chicken-burrito',
            label: 'Chicken Burrito',
            foods: [
              { name: 'Chicken Breast Raw', qty: '200g', kcal: 216, p: 41, c: 0, f: 6 },
              { name: 'White Wrap', qty: '1Qty', kcal: 176, p: 6, c: 31, f: 3.1 },
              { name: 'Cooked White Rice', qty: '60g', kcal: 78, p: 1.4, c: 17, f: 0.1 },
              { name: 'Veg of choice', qty: '100g', kcal: 56, p: 4, c: 10, f: 0 },
              { name: 'Light Cheese', qty: '20g', kcal: 52, p: 5.9, c: 0.1, f: 3.2 },
            ],
            totals: { kcal: 578, p: 58.3, c: 58.1, f: 12.4 },
          },
          {
            id: 'm2-nandos-creamy-pasta',
            label: 'Nandos Style Creamy Pasta',
            foods: [
              { name: 'Chicken Breast Raw', qty: '180g', kcal: 195, p: 37, c: 0, f: 5.4 },
              { name: 'Pasta Dry', qty: '70g', kcal: 245, p: 9.7, c: 45, f: 2 },
              { name: 'Light Cream Cheese', qty: '40g', kcal: 80, p: 2.6, c: 2.6, f: 5.4 },
              { name: 'Peri-Peri Sauce by Nandos', qty: '20g', kcal: 10, p: 0.2, c: 0.3, f: 0.9 },
              { name: 'Red Bell Pepper', qty: '100g', kcal: 26, p: 1, c: 3.9, f: 0.3 },
            ],
            totals: { kcal: 556, p: 50.5, c: 51.8, f: 14 },
          },
        ],
      },
      {
        id: 'm3',
        name: 'Meal 3',
        defaultOption: 'm3-bolognese',
        options: [
          {
            id: 'm3-bolognese',
            label: 'Bolognese',
            foods: [
              { name: '5% Fat Beef Mince', qty: '200g', kcal: 248, p: 42, c: 0, f: 9 },
              { name: 'Pasta Dry', qty: '70g', kcal: 245, p: 9.7, c: 45, f: 2 },
              { name: 'Veg of choice', qty: '100g', kcal: 56, p: 4, c: 10, f: 0 },
              { name: 'Tomato Passata', qty: '200g', kcal: 70, p: 3.2, c: 10, f: 2 },
              { name: 'Parmesan', qty: '20g', kcal: 78, p: 7.1, c: 0.6, f: 5 },
            ],
            totals: { kcal: 697, p: 66, c: 65.6, f: 18 },
          },
          {
            id: 'm3-creamy-chicken-pasta',
            label: 'Creamy Chicken Pasta',
            foods: [
              { name: 'Chicken Breast Raw', qty: '200g', kcal: 216, p: 41, c: 0, f: 6 },
              { name: 'Pasta Dry', qty: '70g', kcal: 245, p: 9.7, c: 45, f: 2 },
              { name: 'Veg of choice', qty: '100g', kcal: 56, p: 4, c: 10, f: 0 },
              { name: 'Philadelphia Light', qty: '40g', kcal: 80, p: 2.7, c: 2.7, f: 5.3 },
              { name: 'Tomato Passata', qty: '100g', kcal: 35, p: 1.6, c: 5, f: 1 },
              { name: 'Parmesan', qty: '15g', kcal: 59, p: 5.3, c: 0.5, f: 3.7 },
            ],
            totals: { kcal: 691, p: 64.3, c: 63.2, f: 18 },
          },
          {
            id: 'm3-chicken-curry',
            label: 'Chicken Curry',
            foods: [
              { name: 'Chicken Breast Raw', qty: '200g', kcal: 216, p: 41, c: 0, f: 6 },
              { name: 'White Rice (Uncooked)', qty: '95g', kcal: 347, p: 6.8, c: 75, f: 0.6 },
              { name: 'Veg of choice', qty: '100g', kcal: 56, p: 4, c: 10, f: 0 },
              { name: '0% Fat Greek Yoghurt', qty: '100g', kcal: 48, p: 9, c: 3, f: 0 },
              { name: 'Curry Paste', qty: '20g', kcal: 20, p: 1.3, c: 2.7, f: 0 },
            ],
            totals: { kcal: 687, p: 62.1, c: 90.7, f: 6.6 },
          },
        ],
      },
      {
        id: 'm4',
        name: 'Meal 4',
        defaultOption: 'm4-standard',
        options: [
          {
            id: 'm4-standard',
            label: 'Greek Yoghurt Bowl',
            foods: [
              { name: '0% Fat Greek Yoghurt', qty: '250g', kcal: 120, p: 23, c: 7.5, f: 0 },
              { name: 'Whey', qty: '20g', kcal: 77, p: 13, c: 3.6, f: 1 },
              { name: 'Mixed Berries', qty: '100g', kcal: 57, p: 0.7, c: 9.3, f: 0.6 },
            ],
            totals: { kcal: 254, p: 36.7, c: 20.4, f: 1.6 },
          },
        ],
      },
    ],
  },
  rest: {
    targetKcal: 1984,
    targetP: 189.5,
    targetC: 182.2,
    targetF: 50,
    slots: [
      {
        id: 'm1',
        name: 'Meal 1',
        defaultOption: 'm1-eggs',
        options: [
          {
            id: 'm1-eggs',
            label: 'Eggs',
            foods: [
              { name: 'Whole Egg', qty: '3Qty', kcal: 219, p: 21, c: 0, f: 15 },
              { name: 'Sourdough', qty: '70g', kcal: 190, p: 7.5, c: 35, f: 1.7 },
              { name: 'Avocado', qty: '50g', kcal: 80, p: 1, c: 0.9, f: 7.3 },
            ],
            totals: { kcal: 489, p: 29.5, c: 35.9, f: 24 },
          },
          {
            id: 'm1-loaded-bagel',
            label: 'Loaded Bagel',
            foods: [
              { name: 'Bagel', qty: '100g', kcal: 251, p: 10, c: 45, f: 1.4 },
              { name: 'Whole Egg', qty: '2Qty', kcal: 146, p: 14, c: 0, f: 10 },
              { name: 'Lean Bacon Medallions', qty: '30g', kcal: 55, p: 11, c: 0.7, f: 1.3 },
              { name: 'Light Cheese', qty: '10g', kcal: 26, p: 3, c: 0.1, f: 1.6 },
            ],
            totals: { kcal: 478, p: 38, c: 45.8, f: 14.3 },
          },
          {
            id: 'm1-burrito',
            label: 'Breakfast Burrito',
            foods: [
              { name: 'White Wrap', qty: '1Qty', kcal: 176, p: 6, c: 31, f: 3.1 },
              { name: 'Whole Egg', qty: '2Qty', kcal: 146, p: 14, c: 0, f: 10 },
              { name: 'Light Cheese', qty: '15g', kcal: 39, p: 4.4, c: 0.1, f: 2.4 },
              { name: 'Lean Bacon Medallions', qty: '40g', kcal: 74, p: 14, c: 0.9, f: 1.7 },
              { name: 'Veg of choice', qty: '50g', kcal: 28, p: 2, c: 5, f: 0 },
            ],
            totals: { kcal: 463, p: 40.4, c: 37, f: 17.2 },
          },
        ],
      },
      {
        id: 'm2',
        name: 'Meal 2',
        defaultOption: 'm2-chicken-burrito',
        options: [
          {
            id: 'm2-chicken-burrito',
            label: 'Chicken Burrito',
            foods: [
              { name: 'Chicken Breast Raw', qty: '200g', kcal: 216, p: 41, c: 0, f: 6 },
              { name: 'White Wrap', qty: '1Qty', kcal: 176, p: 6, c: 31, f: 3.1 },
              { name: 'Cooked White Rice', qty: '60g', kcal: 78, p: 1.4, c: 17, f: 0.1 },
              { name: 'Veg of choice', qty: '100g', kcal: 56, p: 4, c: 10, f: 0 },
              { name: 'Light Cheese', qty: '20g', kcal: 52, p: 5.9, c: 0.1, f: 3.2 },
            ],
            totals: { kcal: 578, p: 58.3, c: 58.1, f: 12.4 },
          },
          {
            id: 'm2-chicken-bowl',
            label: 'Chicken Bowl',
            foods: [
              { name: 'Chicken Breast Raw', qty: '220g', kcal: 238, p: 45, c: 0, f: 6.6 },
              { name: 'White Rice (Uncooked)', qty: '55g', kcal: 201, p: 3.9, c: 43, f: 0.3 },
              { name: 'Veg of choice', qty: '100g', kcal: 56, p: 4, c: 10, f: 0 },
              { name: 'Avocado', qty: '40g', kcal: 82, p: 2.5, c: 2.5, f: 7.3 },
            ],
            totals: { kcal: 577, p: 55.4, c: 55.5, f: 14.2 },
          },
          {
            id: 'm2-nandos-pasta',
            label: 'Nandos Style Pasta',
            foods: [
              { name: 'Chicken Breast Raw', qty: '200g', kcal: 216, p: 41, c: 0, f: 6 },
              { name: 'Pasta Dry', qty: '80g', kcal: 280, p: 11, c: 51, f: 2.3 },
              { name: 'Mild Peri-Peri Sauce by Nandos', qty: '10g', kcal: 5, p: 0.1, c: 0.1, f: 0.5 },
              { name: 'Philadelphia Light Cream Cheese', qty: '30g', kcal: 60, p: 1.9, c: 1.9, f: 4 },
              { name: 'Red Bell Pepper', qty: '100g', kcal: 26, p: 1, c: 3.9, f: 0.3 },
            ],
            totals: { kcal: 587, p: 55, c: 56.9, f: 13.1 },
          },
        ],
      },
      {
        id: 'm3',
        name: 'Meal 3',
        defaultOption: 'm3-steak',
        options: [
          {
            id: 'm3-steak',
            label: 'Steak',
            foods: [
              { name: 'Sirloin Steak (SC)', qty: '180g', kcal: 268, p: 47, c: 0, f: 9 },
              { name: 'White Potato', qty: '300g', kcal: 276, p: 6.4, c: 56, f: 0.5 },
              { name: 'Veg of choice', qty: '100g', kcal: 56, p: 4, c: 10, f: 0 },
              { name: 'Parmesan', qty: '10g', kcal: 39, p: 3.6, c: 0.3, f: 2.5 },
            ],
            totals: { kcal: 639, p: 61, c: 66.3, f: 12 },
          },
          {
            id: 'm3-bolognese',
            label: 'Bolognese',
            foods: [
              { name: '5% Fat Beef Mince', qty: '180g', kcal: 223, p: 37, c: 0, f: 8.1 },
              { name: 'Pasta Dry', qty: '70g', kcal: 245, p: 9.7, c: 45, f: 2 },
              { name: 'Veg of choice', qty: '100g', kcal: 56, p: 4, c: 10, f: 0 },
              { name: 'Tomato Passata', qty: '200g', kcal: 70, p: 3.2, c: 10, f: 2 },
              { name: 'Parmesan', qty: '10g', kcal: 39, p: 3.6, c: 0.3, f: 2.5 },
            ],
            totals: { kcal: 633, p: 57.5, c: 65.3, f: 14.6 },
          },
          {
            id: 'm3-nandos',
            label: 'Nandos',
            foods: [
              { name: 'Chicken Breast Raw', qty: '230g', kcal: 249, p: 47, c: 0, f: 6.9 },
              { name: 'White Potato', qty: '300g', kcal: 276, p: 6.4, c: 56, f: 0.5 },
              { name: 'Corn Cob', qty: '100g', kcal: 80, p: 3.6, c: 9.5, f: 1.9 },
              { name: 'Peri-Peri Sauce by Nandos', qty: '60g', kcal: 30, p: 0.6, c: 0.9, f: 2.7 },
            ],
            totals: { kcal: 635, p: 57.6, c: 66.4, f: 12 },
          },
        ],
      },
      {
        id: 'm4',
        name: 'Meal 4',
        defaultOption: 'm4-standard',
        options: [
          {
            id: 'm4-standard',
            label: 'Greek Yoghurt Bowl',
            foods: [
              { name: '0% Fat Greek Yoghurt', qty: '300g', kcal: 144, p: 27, c: 9, f: 0 },
              { name: 'Mixed Berries', qty: '100g', kcal: 57, p: 0.7, c: 9.3, f: 0.6 },
              { name: 'Whey', qty: '20g', kcal: 77, p: 13, c: 3.6, f: 1 },
            ],
            totals: { kcal: 278, p: 40.7, c: 21.9, f: 1.6 },
          },
        ],
      },
    ],
  },
};

export function getMealOption(plan: DayPlan, slotId: string, optionId?: string): MealOption | undefined {
  const slot = plan.slots.find(value => value.id === slotId);
  if (!slot) return undefined;
  return slot.options.find(value => value.id === (optionId ?? slot.defaultOption)) ?? slot.options[0];
}

export function computeDayTotals(plan: DayPlan, selections: Record<string, string>) {
  let kcal = 0;
  let p = 0;
  let c = 0;
  let f = 0;
  for (const slot of plan.slots) {
    const option = getMealOption(plan, slot.id, selections[slot.id]);
    if (!option) continue;
    kcal += option.totals.kcal;
    p += option.totals.p;
    c += option.totals.c;
    f += option.totals.f;
  }
  return { kcal: Math.round(kcal), p: Math.round(p * 10) / 10, c: Math.round(c * 10) / 10, f: Math.round(f * 10) / 10 };
}
