import { keys as idbKeys, get as idbGet, set as idbSet, clear as idbClear } from 'idb-keyval';

const APP_VERSION = '1.0.0';
const REQUIRED_KEYS = ['appVersion', 'exportedAt', 'localStorage', 'idbStore'];
const REQUIRED_ENTRY_FIELDS = ['id', 'timestamp', 'date', 'planVersionId', 'type'];
const KNOWN_VERSIONS = ['1.0.0'];

interface BackupData {
  appVersion: string;
  exportedAt: string;
  localStorage: Record<string, string>;
  idbStore: Record<string, unknown>;
}

export async function exportBackup(): Promise<void> {
  const lsData: Record<string, string> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)!;
    lsData[key] = localStorage.getItem(key)!;
  }

  const idbData: Record<string, unknown> = {};
  const allKeys = await idbKeys();
  for (const key of allKeys) {
    idbData[String(key)] = await idbGet(key);
  }

  const backup: BackupData = {
    appVersion: APP_VERSION,
    exportedAt: new Date().toISOString(),
    localStorage: lsData,
    idbStore: idbData,
  };

  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `surge-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);

  localStorage.setItem('surge_last_backup', new Date().toISOString().split('T')[0]);
}

export async function importBackup(file: File): Promise<{ success: boolean; error?: string }> {
  try {
    const text = await file.text();
    let data: BackupData;
    try {
      data = JSON.parse(text);
    } catch {
      return { success: false, error: 'Invalid JSON file.' };
    }

    // Rule 1: Required top-level keys
    for (const key of REQUIRED_KEYS) {
      if (!(key in data)) return { success: false, error: `Missing required key: ${key}` };
    }

    // Rule 2: Known version
    if (!KNOWN_VERSIONS.includes(data.appVersion)) {
      if (data.appVersion > APP_VERSION) {
        return { success: false, error: `Backup created with newer app version (${data.appVersion}). Please update the app.` };
      }
    }

    // Rule 3: Validate IDB entries
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    const maxDate = sevenDaysFromNow.toISOString().split('T')[0];

    for (const [, entry] of Object.entries(data.idbStore)) {
      if (typeof entry !== 'object' || entry === null) continue;
      const e = entry as Record<string, unknown>;
      for (const field of REQUIRED_ENTRY_FIELDS) {
        if (!(field in e)) return { success: false, error: `Entry missing field: ${field}` };
      }
      if (typeof e.date === 'string' && e.date > maxDate) {
        return { success: false, error: `Entry has future date beyond 7 days: ${e.date}` };
      }
    }

    // All validation passed — write data transactionally
    await idbClear();
    for (const [key, value] of Object.entries(data.idbStore)) {
      await idbSet(key, value);
    }

    localStorage.clear();
    for (const [key, value] of Object.entries(data.localStorage)) {
      localStorage.setItem(key, value);
    }

    localStorage.setItem('surge_last_backup', new Date().toISOString().split('T')[0]);
    return { success: true };
  } catch (err) {
    return { success: false, error: `Unexpected error: ${String(err)}` };
  }
}
