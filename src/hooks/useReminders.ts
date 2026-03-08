import { useEffect, useMemo, useState } from 'react';
import { useAppSettings } from './useAppSettings';
import type { ChecklistItemState, ReminderCardState } from '../types';

interface ReminderInput {
  items: ChecklistItemState[];
  firstMealTs: number;
}

function toMinutes(value: string): number {
  const [hours, minutes] = value.split(':').map(Number);
  return (hours * 60) + minutes;
}

function nowMinutes() {
  const now = new Date();
  return (now.getHours() * 60) + now.getMinutes();
}

function inQuietHours(start: string, end: string): boolean {
  const current = nowMinutes();
  const startMin = toMinutes(start);
  const endMin = toMinutes(end);
  if (startMin < endMin) return current >= startMin && current < endMin;
  return current >= startMin || current < endMin;
}

function reminderStoreKey() {
  return `surge_reminders_${new Date().toISOString().split('T')[0]}`;
}

function readReminderStore(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(reminderStoreKey()) ?? '{}') as Record<string, number>;
  } catch {
    return {};
  }
}

function writeReminderStore(store: Record<string, number>) {
  localStorage.setItem(reminderStoreKey(), JSON.stringify(store));
}

export function useReminders({ items, firstMealTs }: ReminderInput) {
  const { settings } = useAppSettings();
  const [, setMinuteTick] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setMinuteTick(value => value + 1), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const overdueIds = useMemo(() => {
    const ids = new Set<string>();
    const currentMin = nowMinutes();
    const reminderSettings = settings.reminders;
    const byId = new Map(items.map(item => [item.id, item]));

    const addIfPending = (itemIds: string[]) => {
      for (const id of itemIds) {
        const item = byId.get(id);
        if (item && !item.ticked && !item.optional) ids.add(id);
      }
    };

    if (reminderSettings.taskReminders && currentMin >= toMinutes(reminderSettings.wakeTime) + reminderSettings.followUpMin) {
      addIfPending(['weigh', 'supp-omega3', 'supp-vitd', 'supp-vitc', 'supp-multi', 'supp-bvit']);
    }

    if (reminderSettings.taskReminders && currentMin >= toMinutes(reminderSettings.workoutTime)) {
      addIfPending(['prewo-drink', 'movement-prep', 'workout']);
    }

    if (reminderSettings.taskReminders && currentMin >= toMinutes(reminderSettings.eveningTime)) {
      addIfPending(['supp-magnesium']);
    }

    if (reminderSettings.mealReminders && firstMealTs > 0) {
      const mealItemIds = ['meal-1', 'meal-2', 'meal-3', 'meal-4'];
      const completedMeals = mealItemIds.filter(id => byId.get(id)?.ticked).length;
      const nextMeal = mealItemIds.find(id => !(byId.get(id)?.ticked));
      if (nextMeal) {
        const dueAt = firstMealTs + (completedMeals * reminderSettings.mealGapMin * 60_000);
        if (Date.now() >= dueAt) ids.add(nextMeal);
      }
    }

    if (reminderSettings.hydrationReminders && currentMin >= 14 * 60) {
      const item = byId.get('hydration');
      if (item && !item.ticked) ids.add('hydration');
    }

    if (reminderSettings.stepsReminders && currentMin >= 18 * 60) {
      const item = byId.get('steps');
      if (item && !item.ticked) ids.add('steps');
    }

    return ids;
  }, [firstMealTs, items, settings.reminders]);

  const card = useMemo<ReminderCardState | null>(() => {
    const overdue = items.filter(item => overdueIds.has(item.id));
    if (overdue.length === 0) return null;
    const focus = overdue.slice(0, 3).map(item => item.hintText ?? item.id.replace(/-/g, ' '));
    return {
      title: 'Time to check in',
      detail: focus.join(' | '),
      itemIds: overdue.map(item => item.id),
      level: 'warning',
    };
  }, [items, overdueIds]);

  useEffect(() => {
    if (typeof Notification === 'undefined') return;
    if (!settings.reminders.browserNotifications) return;
    if (Notification.permission !== 'granted') return;
    if (inQuietHours(settings.reminders.quietHoursStart, settings.reminders.quietHoursEnd)) return;
    if (!card) return;

    const store = readReminderStore();
    const reminderId = card.itemIds.join(',');
    const lastSent = store[reminderId] ?? 0;
    const cooldownMs = settings.reminders.followUpMin * 60_000;
    if (Date.now() - lastSent < cooldownMs) return;

    const notification = new Notification(card.title, {
      body: card.detail,
      tag: `surge-${reminderId}`,
    });
    notification.onclick = () => window.focus();
    store[reminderId] = Date.now();
    writeReminderStore(store);
  }, [card, settings.reminders]);

  return { overdueIds, reminderCard: card };
}
