import { useEffect, useMemo, useState } from 'react';
import type { AppSettings } from '../types';
import { DEFAULT_TARGETS } from '../data/targets';

const STORAGE_KEY = 'surge_app_settings';
const SETTINGS_EVENT = 'surge-settings-changed';

export const DEFAULT_APP_SETTINGS: AppSettings = {
  ...DEFAULT_TARGETS,
  reminders: {
    browserNotifications: false,
    mealReminders: true,
    taskReminders: true,
    hydrationReminders: true,
    stepsReminders: true,
    quietHoursStart: '22:00',
    quietHoursEnd: '07:00',
    wakeTime: '07:30',
    workoutTime: '17:30',
    eveningTime: '21:00',
    mealGapMin: 180,
    followUpMin: 30,
  },
};

function mergeSettings(raw: Partial<AppSettings> | null | undefined): AppSettings {
  return {
    ...DEFAULT_APP_SETTINGS,
    ...(raw ?? {}),
    reminders: {
      ...DEFAULT_APP_SETTINGS.reminders,
      ...(raw?.reminders ?? {}),
    },
  };
}

export function getStoredSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_APP_SETTINGS;
    return mergeSettings(JSON.parse(raw) as Partial<AppSettings>);
  } catch {
    return DEFAULT_APP_SETTINGS;
  }
}

export function saveStoredSettings(settings: AppSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  localStorage.setItem('surge_hydration_min', String(settings.hydrationMinL));
  localStorage.setItem('surge_hydration_max', String(settings.hydrationMaxL));
  localStorage.setItem('surge_step_goal', String(settings.stepGoal));
  window.dispatchEvent(new Event(SETTINGS_EVENT));
}

export function useAppSettings() {
  const [settings, setSettings] = useState<AppSettings>(() => getStoredSettings());

  useEffect(() => {
    const handleSync = () => setSettings(getStoredSettings());
    window.addEventListener('storage', handleSync);
    window.addEventListener(SETTINGS_EVENT, handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener(SETTINGS_EVENT, handleSync);
    };
  }, []);

  const api = useMemo(() => ({
    settings,
    saveSettings(next: AppSettings) {
      saveStoredSettings(next);
      setSettings(next);
    },
    async requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
      if (typeof Notification === 'undefined') return 'unsupported';
      const permission = await Notification.requestPermission();
      const next = {
        ...settings,
        reminders: {
          ...settings.reminders,
          browserNotifications: permission === 'granted',
        },
      };
      saveStoredSettings(next);
      setSettings(next);
      return permission;
    },
  }), [settings]);

  return api;
}
