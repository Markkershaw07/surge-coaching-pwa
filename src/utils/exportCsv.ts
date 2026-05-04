import { get as idbGet, keys as idbKeys } from 'idb-keyval';
import type { CardioPayload, LogEntry, MealPayload, StepsPayload, WorkoutPayload } from '../types';

type CsvValue = string | number | boolean | undefined;
type CsvRow = CsvValue[];

async function getAllEntries(): Promise<LogEntry[]> {
  const allKeys = await idbKeys();
  const all: LogEntry[] = [];
  for (const key of allKeys) {
    const entry = await idbGet(key) as LogEntry | undefined;
    if (entry) all.push(entry);
  }

  const byId = new Map<string, LogEntry>();
  for (const entry of all) {
    const existing = byId.get(entry.id);
    if (!existing || entry.timestamp > existing.timestamp) byId.set(entry.id, entry);
  }

  return Array.from(byId.values()).filter(entry => !entry.deleted).sort((left, right) => left.date.localeCompare(right.date) || left.timestamp - right.timestamp);
}

function escapeCsv(value: CsvValue): string {
  const text = String(value ?? '');
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function downloadCsv(filename: string, headers: string[], rows: CsvRow[]) {
  const csv = [headers.join(','), ...rows.map(row => row.map(escapeCsv).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export async function exportComplianceCsv(): Promise<void> {
  const entries = await getAllEntries();
  const rows: CsvRow[] = entries.flatMap((entry): CsvRow[] => {
    switch (entry.type) {
      case 'weight':
        return [[entry.date, 'weight', (entry.payload as { kg: number }).kg, '', '', '']];
      case 'steps':
        return [[entry.date, 'steps', (entry.payload as StepsPayload).steps, '', '', '']];
      case 'hydration':
        return [[entry.date, 'hydration', (entry.payload as { ml: number }).ml, 'ml', '', '']];
      case 'cardio': {
        const payload = entry.payload as CardioPayload;
        return [[entry.date, 'cardio', payload.durationMin, 'min', payload.modality ?? '', `Zone ${payload.zone}`]];
      }
      case 'meal': {
        const payload = entry.payload as MealPayload;
        return [[entry.date, 'meal', payload.slot, payload.alternative, payload.eaten, payload.eatenAt ? new Date(payload.eatenAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '']];
      }
      case 'supplement': {
        const payload = entry.payload as { name: string; taken: boolean };
        return [[entry.date, 'supplement', payload.name, payload.taken, '', '']];
      }
      default:
        return [];
    }
  });

  downloadCsv(`surge-compliance-${new Date().toISOString().split('T')[0]}.csv`, ['date', 'type', 'value', 'detail', 'status', 'extra'], rows);
}

export async function exportWorkoutCsv(): Promise<void> {
  const entries = await getAllEntries();
  const workoutRows: CsvRow[] = entries
    .filter(entry => entry.type === 'workout')
    .flatMap((entry): CsvRow[] => {
      const payload = entry.payload as WorkoutPayload;
      return payload.exercises.flatMap(exercise =>
        exercise.sets.map(set => [
          entry.date,
          payload.sessionType,
          exercise.exerciseId,
          set.setNumber,
          set.weight,
          set.reps,
          Boolean(set.completedAt),
          payload.finished,
          payload.durationMin ?? '',
        ]),
      );
    });

  downloadCsv(`surge-workouts-${new Date().toISOString().split('T')[0]}.csv`, ['date', 'session', 'exercise_id', 'set_number', 'weight', 'reps', 'set_completed', 'workout_finished', 'duration_min'], workoutRows);
}
