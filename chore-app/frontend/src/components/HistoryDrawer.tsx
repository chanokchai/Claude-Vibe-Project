import { useEffect, useState } from 'react';
import { Completion } from '../types';
import { api } from '../api/client';

interface Props {
  choreId: number;
  choreTitle: string;
  onClose: () => void;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function HistoryDrawer({ choreId, choreTitle, onClose }: Props) {
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getChoreHistory(choreId)
      .then(setCompletions)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [choreId]);

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      {/* Drawer */}
      <div className="relative z-10 h-full w-96 bg-white dark:bg-gray-800 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Completion History</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{choreTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <div className="flex justify-center mt-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div>
          ) : completions.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center mt-8">No completions recorded yet.</p>
          ) : (
            <ol className="relative border-l border-gray-200 dark:border-gray-700">
              {completions.map(c => (
                <li key={c.id} className="mb-6 ml-4">
                  <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border border-white dark:border-gray-800 bg-green-500" />
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{formatDate(c.occurrenceDate)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Completed by <span className="font-medium text-gray-700 dark:text-gray-200">{c.completedBy}</span>
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{formatDateTime(c.completedAt)}</p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}
