import { useMemo, useState } from 'react';
import { NUTRITION_PLAN } from '../data/nutrition';
import type { DayType, WeeklyPlan, WeeklyPlanDay } from '../types';

const STORAGE_PREFIX = 'surge_week_plan_';
const WEEK_EVENT = 'surge-week-plan-changed';

function toDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

function startOfWeek(base: Date): Date {
  const copy = new Date(base);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function defaultSelections(dayType: DayType): Record<string, string> {
  const selections: Record<string, string> = {};
  for (const slot of NUTRITION_PLAN[dayType].slots) {
    selections[slot.id] = slot.defaultOption;
  }
  return selections;
}

function inferDayType(date: Date): DayType {
  return date.getDay() === 0 || date.getDay() === 3 || date.getDay() === 6 ? 'rest' : 'training';
}

function buildWeek(weekStart: Date): WeeklyPlan {
  const days: WeeklyPlanDay[] = [];
  for (let index = 0; index < 7; index += 1) {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);
    const dayType = inferDayType(date);
    days.push({
      date: toDateKey(date),
      dayType,
      selections: defaultSelections(dayType),
    });
  }
  return {
    weekStart: toDateKey(weekStart),
    days,
  };
}

function getStorageKey(weekStart: string) {
  return `${STORAGE_PREFIX}${weekStart}`;
}

function loadWeekPlan(weekStart: Date): WeeklyPlan {
  const week = buildWeek(weekStart);
  try {
    const raw = localStorage.getItem(getStorageKey(week.weekStart));
    if (!raw) return week;
    const parsed = JSON.parse(raw) as WeeklyPlan;
    return {
      weekStart: week.weekStart,
      days: week.days.map(day => {
        const existing = parsed.days.find(item => item.date === day.date);
        if (!existing) return day;
        const dayType = existing.dayType;
        return {
          date: day.date,
          dayType,
          selections: {
            ...defaultSelections(dayType),
            ...existing.selections,
          },
        };
      }),
    };
  } catch {
    return week;
  }
}

function saveWeekPlan(plan: WeeklyPlan) {
  localStorage.setItem(getStorageKey(plan.weekStart), JSON.stringify(plan));
  window.dispatchEvent(new Event(WEEK_EVENT));
}

function categoryForFood(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('chicken') || lower.includes('beef') || lower.includes('steak') || lower.includes('egg') || lower.includes('whey') || lower.includes('yoghurt')) return 'Protein';
  if (lower.includes('rice') || lower.includes('pasta') || lower.includes('oats') || lower.includes('bread') || lower.includes('potato') || lower.includes('wrap') || lower.includes('noodles')) return 'Carbs';
  if (lower.includes('berries') || lower.includes('veg') || lower.includes('avocado')) return 'Fruit and veg';
  if (lower.includes('cheese') || lower.includes('parmesan') || lower.includes('philadelphia')) return 'Dairy';
  return 'Extras';
}

function parseQty(qty: string): { value: number; unit: string } | null {
  const match = qty.trim().match(/^(\d+(?:\.\d+)?)\s*(.*)$/);
  if (!match) return null;
  return {
    value: Number(match[1]),
    unit: match[2] || 'item',
  };
}

function formatQty(value: number, unit: string): string {
  const display = Number.isInteger(value) ? String(value) : value.toFixed(1).replace(/\.0$/, '');
  return unit === 'item' ? display : `${display}${unit}`;
}

export function buildShoppingList(plan: WeeklyPlan): Record<string, string[]> {
  const grouped = new Map<string, Map<string, { value: number; unit: string } | null>>();

  for (const day of plan.days) {
    const slots = NUTRITION_PLAN[day.dayType].slots;
    for (const slot of slots) {
      const optionId = day.selections[slot.id] ?? slot.defaultOption;
      const option = slot.options.find(item => item.id === optionId) ?? slot.options[0];
      for (const food of option.foods) {
        const category = categoryForFood(food.name);
        if (!grouped.has(category)) grouped.set(category, new Map());
        const categoryMap = grouped.get(category)!;
        const parsedQty = parseQty(food.qty);
        const existing = categoryMap.get(food.name);

        if (!parsedQty || !existing || existing === null || existing.unit !== parsedQty.unit) {
          if (existing && parsedQty && existing !== null && existing.unit !== parsedQty.unit) {
            categoryMap.set(food.name, null);
          } else if (!existing) {
            categoryMap.set(food.name, parsedQty);
          }
          continue;
        }

        categoryMap.set(food.name, {
          value: existing.value + parsedQty.value,
          unit: existing.unit,
        });
      }
    }
  }

  const output: Record<string, string[]> = {};
  for (const [category, foods] of grouped.entries()) {
    output[category] = Array.from(foods.entries())
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([name, qty]) => qty ? `${name} - ${formatQty(qty.value, qty.unit)}` : `${name} - mixed quantities`);
  }
  return output;
}

export function shoppingListText(plan: WeeklyPlan): string {
  const grouped = buildShoppingList(plan);
  return Object.entries(grouped)
    .map(([category, items]) => [`${category}`, ...items.map(item => `- ${item}`)].join('\n'))
    .join('\n\n');
}

export function useWeeklyPlan() {
  const [weekStart] = useState(() => startOfWeek(new Date()));
  const [plan, setPlan] = useState<WeeklyPlan>(() => loadWeekPlan(weekStart));
  const [selectedDate, setSelectedDate] = useState(() => plan.days[0]?.date ?? toDateKey(new Date()));

  const selectedDay = useMemo(() => {
    return plan.days.find(day => day.date === selectedDate) ?? plan.days[0];
  }, [plan.days, selectedDate]);

  const selectedPlan = useMemo(() => NUTRITION_PLAN[selectedDay.dayType], [selectedDay]);

  return {
    plan,
    weekDays: plan.days,
    selectedDate,
    selectedDay,
    selectedPlan,
    setSelectedDate,
    updateDayType(date: string, dayType: DayType) {
      const nextPlan = {
        ...plan,
        days: plan.days.map(day => day.date === date ? {
          ...day,
          dayType,
          selections: {
            ...defaultSelections(dayType),
            ...day.selections,
          },
        } : day),
      };
      setPlan(nextPlan);
      saveWeekPlan(nextPlan);
    },
    updateSelection(date: string, slotId: string, optionId: string) {
      const nextPlan = {
        ...plan,
        days: plan.days.map(day => day.date === date ? {
          ...day,
          selections: {
            ...day.selections,
            [slotId]: optionId,
          },
        } : day),
      };
      setPlan(nextPlan);
      saveWeekPlan(nextPlan);
    },
    getDay(date: string) {
      return plan.days.find(day => day.date === date) ?? null;
    },
    shoppingListText: shoppingListText(plan),
  };
}
