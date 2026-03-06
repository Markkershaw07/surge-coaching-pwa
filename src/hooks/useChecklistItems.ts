import { useState, useCallback, useEffect } from 'react';
import { useDayType } from './useDayType';
import { TRAINING_SECTIONS, REST_SECTIONS } from '../data/checklistSchedule';

type TickEntry = { ticked: boolean; ts: number };
type TickStore = Record<string, TickEntry>;

export function useChecklistItems() {
  const { dayType } = useDayType();
  const today = new Date().toISOString().split('T')[0];
  const storageKey = `surge_checklist_${today}`;

  const [ticks, setTicks] = useState<TickStore>(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey) ?? '{}');
    } catch {
      return {};
    }
  });

  // Re-render every minute so "last meal" timer stays live
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

  const allItems = sections.flatMap(s => s.items).map(item => ({
    ...item,
    ticked: ticks[item.id]?.ticked ?? false,
  }));

  const doneCount = allItems.filter(i => i.ticked).length;
  const totalCount = allItems.length;

  // First unticked item ID for NEXT badge
  const nextItemId = allItems.find(i => !i.ticked)?.id ?? null;

  // Last ticked meal timestamp for timing display
  const mealIds = new Set(['meal-1', 'meal-2', 'meal-3', 'meal-4']);
  const lastMealTs = Object.entries(ticks)
    .filter(([id, e]) => mealIds.has(id) && e.ticked)
    .reduce((max, [, e]) => Math.max(max, e.ts), 0);

  return { sections, ticks, doneCount, totalCount, toggle, nextItemId, lastMealTs };
}
