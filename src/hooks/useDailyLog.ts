import { useState, useEffect, useCallback } from 'react';
import { set as idbSet, get as idbGet, keys as idbKeys } from 'idb-keyval';
import { PLAN_VERSION_ID } from '../data/targets';
import type { LogEntry, LogType } from '../types';

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function generateId(): string {
  return crypto.randomUUID();
}

export function useDailyLog() {
  const [today] = useState(getToday);
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEntries = useCallback(async () => {
    const allKeys = await idbKeys();
    const all: LogEntry[] = [];
    for (const key of allKeys) {
      const e = await idbGet(key) as LogEntry | undefined;
      if (e) all.push(e);
    }
    // Dedupe: per id keep highest timestamp, filter to today, filter deleted
    const byId = new Map<string, LogEntry>();
    for (const e of all) {
      const ex = byId.get(e.id);
      if (!ex || e.timestamp > ex.timestamp) byId.set(e.id, e);
    }
    const todayEntries = Array.from(byId.values()).filter(e => e.date === today && !e.deleted);
    setEntries(todayEntries);
    setLoading(false);
  }, [today]);

  useEffect(() => { loadEntries(); }, [loadEntries]);

  const addEntry = useCallback(async (
    type: LogType,
    payload: LogEntry['payload'],
    overrideId?: string,
  ): Promise<LogEntry> => {
    const entry: LogEntry = {
      id: overrideId ?? generateId(),
      timestamp: Date.now(),
      date: today,
      planVersionId: PLAN_VERSION_ID,
      type,
      payload,
    };
    await idbSet(entry.id, entry);
    setEntries(prev => {
      const filtered = prev.filter(e => e.id !== entry.id);
      return [...filtered, entry];
    });
    return entry;
  }, [today]);

  const removeEntry = useCallback(async (entry: LogEntry): Promise<void> => {
    const tombstone: LogEntry = { ...entry, deleted: true, timestamp: Date.now() };
    await idbSet(entry.id, tombstone);
    setEntries(prev => prev.filter(e => e.id !== entry.id));
  }, []);

  const editEntry = useCallback(async (
    original: LogEntry,
    newPayload: LogEntry['payload'],
  ): Promise<LogEntry> => {
    const updated: LogEntry = { ...original, payload: newPayload, timestamp: Date.now() };
    await idbSet(updated.id, updated);
    setEntries(prev => prev.map(e => e.id === updated.id ? updated : e));
    return updated;
  }, []);

  const getByType = useCallback((type: LogType) => entries.filter(e => e.type === type), [entries]);

  return { today, entries, loading, addEntry, removeEntry, editEntry, getByType, refresh: loadEntries };
}
