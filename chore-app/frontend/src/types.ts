export interface TeamMember {
  id: number;
  name: string;
  createdAt: string;
}

export interface Chore {
  id: number;
  title: string;
  description: string | null;
  assignedToId: number | null;
  assignedTo: TeamMember | null;
  recurrence: 'none' | 'daily' | 'weekly' | 'monthly';
  recurrenceDays: string | null; // JSON string
  startDate: string;
  endDate: string | null;
  createdAt: string;
}

export interface Completion {
  id: number;
  choreId: number;
  completedBy: string;
  completedAt: string;
  occurrenceDate: string;
}

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

export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly';

export const WEEKDAYS = [
  { value: 'mon', label: 'Mon' },
  { value: 'tue', label: 'Tue' },
  { value: 'wed', label: 'Wed' },
  { value: 'thu', label: 'Thu' },
  { value: 'fri', label: 'Fri' },
  { value: 'sat', label: 'Sat' },
  { value: 'sun', label: 'Sun' },
];
