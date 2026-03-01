import { useMemo } from 'react';
import { WEEKLY_SCHEDULE, getDayType } from '../data/schedule';
import type { SessionType } from '../types';

export function useDayType(date: Date = new Date()) {
  return useMemo(() => {
    const dow = date.getDay();
    const session = WEEKLY_SCHEDULE[dow] as SessionType;
    const dayType = getDayType(session);
    return { session, dayType };
  }, [date]);
}

export function getDateString(date: Date = new Date()): string {
  return date.toISOString().split('T')[0];
}
