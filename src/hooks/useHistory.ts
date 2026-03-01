import { useState, useCallback } from 'react';
import { keys as idbKeys, get as idbGet } from 'idb-keyval';
import type { LogEntry, LogType } from '../types';

export function useHistory() {
  const [loading, setLoading] = useState(false);

  const getEntriesForDateRange = useCallback(async (
    fromDate: string,
    toDate: string,
    type?: LogType,
  ): Promise<LogEntry[]> => {
    setLoading(true);
    try {
      const allKeys = await idbKeys();
      const all: LogEntry[] = [];
      for (const key of allKeys) {
        const e = await idbGet(key) as LogEntry | undefined;
        if (e) all.push(e);
      }
      // Dedupe
      const byId = new Map<string, LogEntry>();
      for (const e of all) {
        const ex = byId.get(e.id);
        if (!ex || e.timestamp > ex.timestamp) byId.set(e.id, e);
      }
      return Array.from(byId.values()).filter(e =>
        !e.deleted &&
        e.date >= fromDate &&
        e.date <= toDate &&
        (type === undefined || e.type === type),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const getWeightHistory = useCallback(async (days = 90) => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - days);
    const toStr = to.toISOString().split('T')[0];
    const fromStr = from.toISOString().split('T')[0];
    const entries = await getEntriesForDateRange(fromStr, toStr, 'weight');
    return entries
      .map(e => ({ date: e.date, kg: (e.payload as { kg: number }).kg }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [getEntriesForDateRange]);

  const getWorkoutHistory = useCallback(async (weeks = 4) => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - weeks * 7);
    const toStr = to.toISOString().split('T')[0];
    const fromStr = from.toISOString().split('T')[0];
    return getEntriesForDateRange(fromStr, toStr, 'workout');
  }, [getEntriesForDateRange]);

  return { loading, getEntriesForDateRange, getWeightHistory, getWorkoutHistory };
}
