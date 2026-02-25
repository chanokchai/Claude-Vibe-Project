import { Chore, Completion } from '@prisma/client';

export type ChoreWithCompletions = Chore & { completions: Completion[]; assignedTo: { id: number; name: string } | null };

export interface CalendarEvent {
  id: string;
  choreId: number;
  title: string;
  start: string;
  end: string;
  color: string;
  extendedProps: {
    description: string | null;
    assignedToId: number | null;
    assigneeName: string | null;
    recurrence: string;
    isCompleted: boolean;
    completionId: number | null;
    completedBy: string | null;
    completedAt: string | null;
    occurrenceDate: string;
  };
}

const DAY_NAMES = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

function toDateStr(date: Date): string {
  return date.toISOString().split('T')[0];
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

function getOccurrencesInRange(chore: Chore, rangeStart: Date, rangeEnd: Date): Date[] {
  const dates: Date[] = [];
  const choreStart = new Date(chore.startDate);
  const choreEnd = chore.endDate ? new Date(chore.endDate) : rangeEnd;

  // Effective range is the intersection of chore range and view range
  const effectiveStart = choreStart > rangeStart ? choreStart : rangeStart;
  const effectiveEnd = choreEnd < rangeEnd ? choreEnd : rangeEnd;

  if (effectiveStart > effectiveEnd) return dates;

  if (chore.recurrence === 'none') {
    const d = new Date(Date.UTC(choreStart.getUTCFullYear(), choreStart.getUTCMonth(), choreStart.getUTCDate()));
    if (d >= rangeStart && d <= rangeEnd) {
      dates.push(d);
    }
    return dates;
  }

  if (chore.recurrence === 'daily') {
    let current = new Date(Date.UTC(effectiveStart.getUTCFullYear(), effectiveStart.getUTCMonth(), effectiveStart.getUTCDate()));
    while (current <= effectiveEnd) {
      dates.push(new Date(current));
      current = addDays(current, 1);
    }
    return dates;
  }

  if (chore.recurrence === 'weekly') {
    let allowedDays: number[] = [];
    if (chore.recurrenceDays) {
      try {
        const parsed: string[] = JSON.parse(chore.recurrenceDays);
        allowedDays = parsed.map(d => DAY_NAMES.indexOf(d.toLowerCase())).filter(d => d !== -1);
      } catch {
        // default to the chore's start day of week
        allowedDays = [choreStart.getUTCDay()];
      }
    } else {
      allowedDays = [choreStart.getUTCDay()];
    }

    let current = new Date(Date.UTC(effectiveStart.getUTCFullYear(), effectiveStart.getUTCMonth(), effectiveStart.getUTCDate()));
    while (current <= effectiveEnd) {
      if (allowedDays.includes(current.getUTCDay())) {
        dates.push(new Date(current));
      }
      current = addDays(current, 1);
    }
    return dates;
  }

  if (chore.recurrence === 'monthly') {
    let allowedDates: number[] = [];
    if (chore.recurrenceDays) {
      try {
        allowedDates = JSON.parse(chore.recurrenceDays) as number[];
      } catch {
        allowedDates = [choreStart.getUTCDate()];
      }
    } else {
      allowedDates = [choreStart.getUTCDate()];
    }

    let current = new Date(Date.UTC(effectiveStart.getUTCFullYear(), effectiveStart.getUTCMonth(), effectiveStart.getUTCDate()));
    while (current <= effectiveEnd) {
      if (allowedDates.includes(current.getUTCDate())) {
        dates.push(new Date(current));
      }
      current = addDays(current, 1);
    }
    return dates;
  }

  return dates;
}

export function expandChoresToEvents(
  chores: ChoreWithCompletions[],
  rangeStart: Date,
  rangeEnd: Date,
  today: Date
): CalendarEvent[] {
  const events: CalendarEvent[] = [];

  for (const chore of chores) {
    const occurrences = getOccurrencesInRange(chore, rangeStart, rangeEnd);

    for (const occurrence of occurrences) {
      const occurrenceDateStr = toDateStr(occurrence);

      // Find matching completion (same chore, same occurrence date)
      const completion = chore.completions.find(c => {
        const cDate = new Date(c.occurrenceDate);
        return toDateStr(cDate) === occurrenceDateStr;
      });

      const isCompleted = !!completion;
      const isOverdue = !isCompleted && occurrence < today;

      let color = '#3b82f6'; // blue = upcoming
      if (isCompleted) color = '#22c55e'; // green
      else if (isOverdue) color = '#ef4444'; // red

      const endDate = addDays(occurrence, 1);

      events.push({
        id: `${chore.id}-${occurrenceDateStr}`,
        choreId: chore.id,
        title: chore.assignedTo
          ? `${chore.title} (${chore.assignedTo.name})`
          : chore.title,
        start: occurrenceDateStr,
        end: toDateStr(endDate),
        color,
        extendedProps: {
          description: chore.description,
          assignedToId: chore.assignedToId,
          assigneeName: chore.assignedTo?.name ?? null,
          recurrence: chore.recurrence,
          isCompleted,
          completionId: completion?.id ?? null,
          completedBy: completion?.completedBy ?? null,
          completedAt: completion?.completedAt ? completion.completedAt.toISOString() : null,
          occurrenceDate: occurrenceDateStr,
        },
      });
    }
  }

  return events;
}
