import { CalendarEvent, Chore, Completion, TeamMember } from '../types';

//const BASE = '/api';
const BASE = (import.meta.env.VITE_API_URL ?? '') + '/api';


async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// Chores
export const api = {
  // Calendar events (expanded occurrences)
  getOccurrences(start: string, end: string): Promise<CalendarEvent[]> {
    return request(`/chores/occurrences?start=${start}&end=${end}`);
  },

  createChore(data: {
    title: string;
    description?: string;
    assignedToId?: number | null;
    recurrence: string;
    recurrenceDays?: string[] | number[] | null;
    startDate: string;
    endDate?: string | null;
  }): Promise<Chore> {
    return request('/chores', { method: 'POST', body: JSON.stringify(data) });
  },

  updateChore(
    id: number,
    data: {
      title: string;
      description?: string;
      assignedToId?: number | null;
      recurrence: string;
      recurrenceDays?: string[] | number[] | null;
      startDate: string;
      endDate?: string | null;
    }
  ): Promise<Chore> {
    return request(`/chores/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },

  deleteChore(id: number): Promise<void> {
    return request(`/chores/${id}`, { method: 'DELETE' });
  },

  getChoreHistory(id: number): Promise<Completion[]> {
    return request(`/chores/${id}/history`);
  },

  // Team Members
  getMembers(): Promise<TeamMember[]> {
    return request('/members');
  },

  addMember(name: string): Promise<TeamMember> {
    return request('/members', { method: 'POST', body: JSON.stringify({ name }) });
  },

  deleteMember(id: number): Promise<void> {
    return request(`/members/${id}`, { method: 'DELETE' });
  },

  // Completions
  markComplete(data: {
    choreId: number;
    occurrenceDate: string;
    completedBy: string;
  }): Promise<Completion> {
    return request('/completions', { method: 'POST', body: JSON.stringify(data) });
  },

  unmarkComplete(id: number): Promise<void> {
    return request(`/completions/${id}`, { method: 'DELETE' });
  },
};
