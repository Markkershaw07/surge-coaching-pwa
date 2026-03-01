import { useCallback } from 'react';
import { set as idbSet, get as idbGet, keys as idbKeys } from 'idb-keyval';
import { PLAN_VERSION_ID } from '../data/targets';
import type { LogEntry, LogType } from '../types';

function generateId(): string {
  return crypto.randomUUID();
}

export function useStorage() {
  const writeEntry = useCallback(async (
    type: LogType,
    payload: LogEntry['payload'],
    overrideId?: string,
  ): Promise<LogEntry> => {
    const entry: LogEntry = {
      id: overrideId ?? generateId(),
      timestamp: Date.now(),
      date: new Date().toISOString().split('T')[0],
      planVersionId: PLAN_VERSION_ID,
      type,
      payload,
    };
    await idbSet(entry.id, entry);
    // Also mirror to localStorage for quick access
    try {
      const existing = JSON.parse(localStorage.getItem('surge_log_ids') ?? '[]') as string[];
      if (!existing.includes(entry.id)) {
        existing.push(entry.id);
        localStorage.setItem('surge_log_ids', JSON.stringify(existing));
      }
    } catch {}
    return entry;
  }, []);

  const deleteEntry = useCallback(async (entry: LogEntry): Promise<void> => {
    const tombstone: LogEntry = { ...entry, deleted: true, timestamp: Date.now() };
    await idbSet(entry.id, tombstone);
  }, []);

  const getAllEntries = useCallback(async (): Promise<LogEntry[]> => {
    const allKeys = await idbKeys();
    const entries: LogEntry[] = [];
    for (const key of allKeys) {
      const entry = await idbGet(key) as LogEntry | undefined;
      if (entry && !entry.deleted) {
        entries.push(entry);
      }
    }
    return entries;
  }, []);

  const getEntriesByDate = useCallback(async (date: string): Promise<LogEntry[]> => {
    const all = await getAllEntries();
    // For same id, only keep highest timestamp
    const byId = new Map<string, LogEntry>();
    for (const e of all) {
      const existing = byId.get(e.id);
      if (!existing || e.timestamp > existing.timestamp) {
        byId.set(e.id, e);
      }
    }
    return Array.from(byId.values()).filter(e => e.date === date && !e.deleted);
  }, [getAllEntries]);

  return { writeEntry, deleteEntry, getAllEntries, getEntriesByDate };
}
