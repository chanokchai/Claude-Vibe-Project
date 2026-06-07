import React, { useState } from 'react';
import { CalendarEvent, RecurrenceType, TeamMember, WEEKDAYS } from '../types';
import { api } from '../api/client';
import { HistoryDrawer } from './HistoryDrawer';

interface CreateMode {
  mode: 'create';
  defaultDate?: string;
}

interface ViewMode {
  mode: 'view';
  event: CalendarEvent;
}

type Props = (CreateMode | ViewMode) & {
  members: TeamMember[];
  onClose: () => void;
  onSaved: () => void;
};

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

export function ChoreModal(props: Props) {
  const isView = props.mode === 'view';
  const event = isView ? props.event : null;

  // Form state
  const [title, setTitle] = useState(isView ? '' : '');
  const [description, setDescription] = useState('');
  const [assignedToId, setAssignedToId] = useState<number | ''>('');
  const [recurrence, setRecurrence] = useState<RecurrenceType>('none');
  const [weeklyDays, setWeeklyDays] = useState<string[]>([]);
  const [monthlyDates, setMonthlyDates] = useState<string>('');
  const [startDate, setStartDate] = useState(
    !isView ? (props.defaultDate || todayStr()) : todayStr()
  );
  const [endDate, setEndDate] = useState('');

  // Complete state (view mode)
  const [completedBy, setCompletedBy] = useState('');
  const [completionLoading, setCompletionLoading] = useState(false);

  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  // Prefill edit form when switching to edit mode
  function enterEditMode() {
    if (!event) return;
    // We don't have the full chore data here, just event props
    // For a full implementation we'd fetch the chore; we have enough from extendedProps
    setTitle(event.title.replace(event.extendedProps.assigneeName ? ` (${event.extendedProps.assigneeName})` : '', ''));
    setDescription(event.extendedProps.description || '');
    setAssignedToId(event.extendedProps.assignedToId || '');
    setRecurrence(event.extendedProps.recurrence as RecurrenceType);
    setStartDate(event.start);
    setEditMode(true);
  }

  function buildRecurrenceDays() {
    if (recurrence === 'weekly') return weeklyDays.length ? weeklyDays : null;
    if (recurrence === 'monthly') {
      const nums = monthlyDates
        .split(',')
        .map(s => parseInt(s.trim()))
        .filter(n => !isNaN(n) && n >= 1 && n <= 31);
      return nums.length ? nums : null;
    }
    return null;
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setError('Title is required'); return; }
    setLoading(true);
    setError('');
    try {
      await api.createChore({
        title: title.trim(),
        description: description.trim() || undefined,
        assignedToId: assignedToId || null,
        recurrence,
        recurrenceDays: buildRecurrenceDays(),
        startDate,
        endDate: endDate || null,
      });
      props.onSaved();
      props.onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!event || !title.trim()) { setError('Title is required'); return; }
    setLoading(true);
    setError('');
    try {
      await api.updateChore(event.choreId, {
        title: title.trim(),
        description: description.trim() || undefined,
        assignedToId: assignedToId || null,
        recurrence,
        recurrenceDays: buildRecurrenceDays(),
        startDate,
        endDate: endDate || null,
      });
      props.onSaved();
      props.onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!event) return;
    if (!confirm('Delete this chore and all its history? This cannot be undone.')) return;
    try {
      await api.deleteChore(event.choreId);
      props.onSaved();
      props.onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    }
  }

  async function handleMarkComplete(e: React.FormEvent) {
    e.preventDefault();
    if (!event || !completedBy) { setError('Please select who completed this'); return; }
    setCompletionLoading(true);
    setError('');
    try {
      await api.markComplete({
        choreId: event.choreId,
        occurrenceDate: event.extendedProps.occurrenceDate,
        completedBy: completedBy.trim(),
      });
      props.onSaved();
      props.onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark complete');
    } finally {
      setCompletionLoading(false);
    }
  }

  async function handleUnmark() {
    if (!event || !event.extendedProps.completionId) return;
    if (!confirm('Unmark this completion?')) return;
    try {
      await api.unmarkComplete(event.extendedProps.completionId);
      props.onSaved();
      props.onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unmark');
    }
  }

  function toggleWeekday(day: string) {
    setWeeklyDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  }

  const isFormMode = props.mode === 'create' || editMode;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/40" onClick={props.onClose} />

        {/* Modal */}
        <div className="relative z-10 bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              {isFormMode && !editMode ? 'New Chore' : editMode ? 'Edit Chore' : 'Chore Details'}
            </h2>
            <button onClick={props.onClose} className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 text-2xl leading-none">
              &times;
            </button>
          </div>

          <div className="px-6 py-5 space-y-4">
            {/* VIEW MODE */}
            {isView && !editMode && event && (
              <>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {event.title.replace(event.extendedProps.assigneeName ? ` (${event.extendedProps.assigneeName})` : '', '')}
                  </h3>
                  {event.extendedProps.assigneeName && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Assigned to: <span className="font-medium">{event.extendedProps.assigneeName}</span></p>
                  )}
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    Date: <span className="font-medium">{new Date(event.extendedProps.occurrenceDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </p>
                  {event.extendedProps.recurrence !== 'none' && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      Recurrence: <span className="font-medium capitalize">{event.extendedProps.recurrence}</span>
                    </p>
                  )}
                  {event.extendedProps.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 bg-gray-50 dark:bg-gray-700 rounded p-2">{event.extendedProps.description}</p>
                  )}
                </div>

                {/* Completion status */}
                {event.extendedProps.isCompleted ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm font-semibold text-green-700">Completed</p>
                    <p className="text-sm text-green-600 mt-0.5">
                      by <span className="font-medium">{event.extendedProps.completedBy}</span>
                    </p>
                    {event.extendedProps.completedAt && (
                      <p className="text-xs text-green-500 mt-0.5">
                        {new Date(event.extendedProps.completedAt).toLocaleString()}
                      </p>
                    )}
                    <button
                      onClick={handleUnmark}
                      className="mt-2 text-xs text-red-500 hover:text-red-700 underline"
                    >
                      Unmark completion
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleMarkComplete} className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mark as Done</label>
                      <select
                        value={completedBy}
                        onChange={e => setCompletedBy(e.target.value)}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select member…</option>
                        {props.members.map(m => (
                          <option key={m.id} value={m.name}>{m.name}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="submit"
                      disabled={completionLoading || !completedBy}
                      className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white py-2 rounded-lg text-sm font-medium"
                    >
                      {completionLoading ? 'Saving…' : 'Mark Complete'}
                    </button>
                  </form>
                )}

                {error && <p className="text-red-500 text-sm">{error}</p>}

                {/* Action buttons */}
                <div className="flex gap-2 pt-2 border-t dark:border-gray-700">
                  <button
                    onClick={() => setShowHistory(true)}
                    className="flex-1 text-sm py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                  >
                    View History
                  </button>
                  <button
                    onClick={enterEditMode}
                    className="flex-1 text-sm py-2 rounded-lg border border-blue-300 dark:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                  >
                    Edit Chore
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex-1 text-sm py-2 rounded-lg border border-red-300 hover:bg-red-50 text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}

            {/* FORM MODE (create or edit) */}
            {isFormMode && (
              <form onSubmit={editMode ? handleUpdate : handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Clean the coffee machine"
                    required
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Optional notes…"
                    rows={2}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assign To</label>
                  <select
                    value={assignedToId}
                    onChange={e => setAssignedToId(e.target.value ? Number(e.target.value) : '')}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Unassigned</option>
                    {props.members.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Recurrence</label>
                  <select
                    value={recurrence}
                    onChange={e => setRecurrence(e.target.value as RecurrenceType)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="none">One-time</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                {recurrence === 'weekly' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Days of Week</label>
                    <div className="flex gap-1 flex-wrap">
                      {WEEKDAYS.map(d => (
                        <button
                          key={d.value}
                          type="button"
                          onClick={() => toggleWeekday(d.value)}
                          className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                            weeklyDays.includes(d.value)
                              ? 'bg-blue-500 text-white border-blue-500'
                              : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-400'
                          }`}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Defaults to start date's day if none selected.</p>
                  </div>
                )}

                {recurrence === 'monthly' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Day(s) of Month</label>
                    <input
                      type="text"
                      value={monthlyDates}
                      onChange={e => setMonthlyDates(e.target.value)}
                      placeholder="e.g. 1, 15"
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Comma-separated day numbers (1–31). Defaults to start date's day.</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date *</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                      required
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={e => setEndDate(e.target.value)}
                      min={startDate}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <div className="flex gap-2 pt-1">
                  {editMode && (
                    <button
                      type="button"
                      onClick={() => setEditMode(false)}
                      className="flex-1 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white py-2 rounded-lg text-sm font-medium"
                  >
                    {loading ? 'Saving…' : editMode ? 'Save Changes' : 'Create Chore'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {showHistory && event && (
        <HistoryDrawer
          choreId={event.choreId}
          choreTitle={event.title.replace(event.extendedProps.assigneeName ? ` (${event.extendedProps.assigneeName})` : '', '')}
          onClose={() => setShowHistory(false)}
        />
      )}
    </>
  );
}
