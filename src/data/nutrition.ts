import type { NutritionPlan } from '../types';

export const NUTRITION_PLAN: NutritionPlan = {
  training: {
    targetKcal: 2293,
    targetP: 200.6,
    targetC: 235.2,
    targetF: 58.7,
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
            label: 'Eggs & Sourdough',
            foods: [
              { name: 'Whole Egg', qty: '3', kcal: 219, p: 21, c: 0, f: 15 },
              { name: 'Sourdough', qty: '100g', kcal: 272, p: 11, c: 50, f: 2.4 },
              { name: 'Avocado', qty: '50g', kcal: 80, p: 1, c: 0.9, f: 7.3 },
            ],
            totals: { kcal: 571, p: 33, c: 50.9, f: 24.7 },
          },
          {
            id: 'm1-oats',
            label: 'Oats & Whey',
            foods: [
              { name: 'Oats', qty: '75g', kcal: 284, p: 9.9, c: 43, f: 4.9 },
              { name: 'Mixed Berries', qty: '100g', kcal: 57, p: 0.7, c: 9.3, f: 0.6 },
              { name: 'Whey', qty: '35g', kcal: 135, p: 23, c: 6.3, f: 1.8 },
              { name: 'Dark Chocolate 70%', qty: '15g', kcal: 90, p: 1.2, c: 5.3, f: 6.4 },
            ],
            totals: { kcal: 566, p: 34.8, c: 63.9, f: 13.7 },
          },
        ],
      },
      {
        id: 'm2',
        name: 'Meal 2',
        defaultOption: 'm2-burrito',
        options: [
          {
            id: 'm2-burrito',
            label: 'Chicken Burrito',
            foods: [
              { name: 'Chicken Breast Raw', qty: '200g', kcal: 216, p: 41, c: 0, f: 6 },
              { name: 'White Wrap', qty: '1', kcal: 176, p: 6, c: 31, f: 3.1 },
              { name: 'Cooked White Rice', qty: '100g', kcal: 130, p: 2.4, c: 28, f: 0.2 },
              { name: 'Veg of choice', qty: '100g', kcal: 56, p: 4, c: 10, f: 0 },
              { name: 'Light Cheese', qty: '20g', kcal: 52, p: 5.9, c: 0.1, f: 3.2 },
            ],
            totals: { kcal: 630, p: 59.3, c: 69.1, f: 12.5 },
          },
          {
            id: 'm2-bowl',
            label: 'Chicken & Sweet Potato Bowl',
            foods: [
              { name: 'Chicken Breast Raw', qty: '200g', kcal: 216, p: 41, c: 0, f: 6 },
              { name: 'Sweet Potato', qty: '350g', kcal: 301, p: 5.5, c: 60, f: 0.2 },
              { name: 'Veg of choice', qty: '100g', kcal: 56, p: 4, c: 10, f: 0 },
              { name: 'Avocado', qty: '40g', kcal: 64, p: 0.8, c: 0.7, f: 5.9 },
            ],
            totals: { kcal: 637, p: 51.3, c: 70.7, f: 12.1 },
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
            label: 'Beef Bolognese',
            foods: [
              { name: '5% Fat Beef Mince', qty: '200g', kcal: 248, p: 42, c: 0, f: 9 },
              { name: 'Pasta dry', qty: '70g', kcal: 245, p: 9.7, c: 45, f: 2 },
              { name: 'Veg of choice', qty: '100g', kcal: 56, p: 4, c: 10, f: 0 },
              { name: 'Tomato Passata', qty: '200g', kcal: 70, p: 3.2, c: 10, f: 2 },
              { name: 'Parmesan', qty: '20g', kcal: 78, p: 7.1, c: 0.6, f: 5 },
            ],
            totals: { kcal: 697, p: 66, c: 65.6, f: 18 },
          },
          {
            id: 'm3-creamychicken',
            label: 'Creamy Chicken Pasta',
            foods: [
              { name: 'Chicken Breast Raw', qty: '200g', kcal: 216, p: 41, c: 0, f: 6 },
              { name: 'Pasta dry', qty: '70g', kcal: 245, p: 9.7, c: 45, f: 2 },
              { name: 'Veg of choice', qty: '100g', kcal: 56, p: 4, c: 10, f: 0 },
              { name: 'Philadelphia Light', qty: '40g', kcal: 80, p: 2.7, c: 2.7, f: 5.3 },
              { name: 'Tomato Passata', qty: '100g', kcal: 35, p: 1.6, c: 5, f: 1 },
              { name: 'Parmesan', qty: '15g', kcal: 59, p: 5.3, c: 0.5, f: 3.7 },
            ],
            totals: { kcal: 691, p: 64.3, c: 63.2, f: 18 },
          },
          {
            id: 'm3-stirfry',
            label: 'Chicken Stir Fry',
            foods: [
              { name: 'Chicken Breast Raw', qty: '200g', kcal: 216, p: 41, c: 0, f: 6 },
              { name: 'Egg Noodles', qty: '85g', kcal: 294, p: 10, c: 60, f: 1.8 },
              { name: 'Veg of choice', qty: '100g', kcal: 56, p: 4, c: 10, f: 0 },
              { name: 'Stir Fry Sauce', qty: '50g', kcal: 55, p: 0, c: 8.4, f: 0 },
              { name: 'Whole Egg', qty: '1', kcal: 73, p: 7, c: 0, f: 5 },
            ],
            totals: { kcal: 694, p: 62, c: 78.4, f: 12.8 },
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
            label: 'Greek Yoghurt & Berries',
            foods: [
              { name: '0% Fat Greek Yoghurt', qty: '250g', kcal: 120, p: 23, c: 7.5, f: 0 },
              { name: 'Whey', qty: '20g', kcal: 77, p: 13, c: 3.6, f: 1 },
              { name: 'Mixed Berries', qty: '100g', kcal: 57, p: 0.7, c: 9.3, f: 0.6 },
              { name: 'Honey', qty: '5g', kcal: 15, p: 0, c: 4.1, f: 0 },
            ],
            totals: { kcal: 269, p: 36.7, c: 24.5, f: 1.6 },
          },
        ],
      },
    ],
  },
  rest: {
    targetKcal: 2066,
    targetP: 190.5,
    targetC: 201.4,
    targetF: 50.1,
    slots: [
      {
        id: 'm1',
        name: 'Meal 1',
        defaultOption: 'm1-eggs',
        options: [
          {
            id: 'm1-eggs',
            label: 'Eggs & Sourdough',
            foods: [
              { name: 'Whole Egg', qty: '3', kcal: 219, p: 21, c: 0, f: 15 },
              { name: 'Sourdough', qty: '70g', kcal: 190, p: 7.5, c: 35, f: 1.7 },
              { name: 'Avocado', qty: '50g', kcal: 80, p: 1, c: 0.9, f: 7.3 },
            ],
            totals: { kcal: 489, p: 29.5, c: 35.9, f: 24 },
          },
        ],
      },
      {
        id: 'm2',
        name: 'Meal 2',
        defaultOption: 'm2-burrito',
        options: [
          {
            id: 'm2-burrito',
            label: 'Chicken Burrito',
            foods: [
              { name: 'Chicken Breast Raw', qty: '200g', kcal: 216, p: 41, c: 0, f: 6 },
              { name: 'White Wrap', qty: '1', kcal: 176, p: 6, c: 31, f: 3.1 },
              { name: 'Cooked White Rice', qty: '100g', kcal: 130, p: 2.4, c: 28, f: 0.2 },
              { name: 'Veg of choice', qty: '100g', kcal: 56, p: 4, c: 10, f: 0 },
              { name: 'Light Cheese', qty: '20g', kcal: 52, p: 5.9, c: 0.1, f: 3.2 },
            ],
            totals: { kcal: 630, p: 59.3, c: 69.1, f: 12.5 },
          },
          {
            id: 'm2-bowl',
            label: 'Chicken Rice Bowl',
            foods: [
              { name: 'Chicken Breast Raw', qty: '220g', kcal: 238, p: 45, c: 0, f: 6.6 },
              { name: 'White Rice (Uncooked)', qty: '70g', kcal: 256, p: 5, c: 55, f: 0.4 },
              { name: 'Veg of choice', qty: '100g', kcal: 56, p: 4, c: 10, f: 0 },
              { name: 'Avocado', qty: '40g', kcal: 82, p: 2.5, c: 2.5, f: 7.3 },
            ],
            totals: { kcal: 632, p: 56.5, c: 67.5, f: 14.3 },
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
            label: 'Sirloin Steak & Potato',
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
            label: 'Beef Bolognese',
            foods: [
              { name: '5% Fat Beef Mince', qty: '180g', kcal: 223, p: 37, c: 0, f: 8.1 },
              { name: 'Pasta dry', qty: '70g', kcal: 245, p: 9.7, c: 45, f: 2 },
              { name: 'Veg of choice', qty: '100g', kcal: 56, p: 4, c: 10, f: 0 },
              { name: 'Tomato Passata', qty: '200g', kcal: 70, p: 3.2, c: 10, f: 2 },
              { name: 'Parmesan', qty: '10g', kcal: 39, p: 3.6, c: 0.3, f: 2.5 },
            ],
            totals: { kcal: 633, p: 57.5, c: 65.3, f: 14.6 },
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
            label: 'Greek Yoghurt & Berries',
            foods: [
              { name: '0% Fat Greek Yoghurt', qty: '300g', kcal: 144, p: 27, c: 9, f: 0 },
              { name: 'Mixed Berries', qty: '100g', kcal: 57, p: 0.7, c: 9.3, f: 0.6 },
              { name: 'Honey', qty: '10g', kcal: 30, p: 0, c: 8.2, f: 0 },
              { name: 'Whey', qty: '20g', kcal: 77, p: 13, c: 3.6, f: 1 },
            ],
            totals: { kcal: 308, p: 40.7, c: 30.1, f: 1.6 },
          },
        ],
      },
    ],
  },
};

export function computeDayTotals(plan: typeof NUTRITION_PLAN['training'], selections: Record<string, string>) {
  let kcal = 0, p = 0, c = 0, f = 0;
  for (const slot of plan.slots) {
    const selectedId = selections[slot.id] ?? slot.defaultOption;
    const option = slot.options.find(o => o.id === selectedId) ?? slot.options[0];
    kcal += option.totals.kcal;
    p += option.totals.p;
    c += option.totals.c;
    f += option.totals.f;
  }
  return { kcal: Math.round(kcal), p: Math.round(p * 10) / 10, c: Math.round(c * 10) / 10, f: Math.round(f * 10) / 10 };
}
