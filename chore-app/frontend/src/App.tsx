import { useState, useCallback, useRef, useEffect } from 'react';
import { CalendarView } from './components/CalendarView';
import { ChoreModal } from './components/ChoreModal';
import { TeamMembersPanel } from './components/TeamMembersPanel';
import { api } from './api/client';
import { CalendarEvent, TeamMember } from './types';

type ModalState =
  | { type: 'none' }
  | { type: 'create'; defaultDate?: string }
  | { type: 'view'; event: CalendarEvent };

export default function App() {
  const [modal, setModal] = useState<ModalState>({ type: 'none' });
  const [showTeamPanel, setShowTeamPanel] = useState(false);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const calendarRefreshRef = useRef<(() => void) | null>(null);

  // Load members on mount
  useEffect(() => {
    api.getMembers().then(setMembers).catch(console.error);
  }, [refreshKey]);

  const handleMembersChange = useCallback(() => {
    setRefreshKey(k => k + 1);
  }, []);

  const handleEventClick = useCallback((event: CalendarEvent) => {
    setModal({ type: 'view', event });
  }, []);

  const handleDateSelect = useCallback((date: string) => {
    setModal({ type: 'create', defaultDate: date });
  }, []);

  const handleDatesChange = useCallback((_start: string, _end: string) => {
    // FullCalendar handles its own event fetching; this is a hook for future use
  }, []);

  const eventsLoader = useCallback(
    (start: string, end: string) => api.getOccurrences(start, end),
    []
  );

  const handleSaved = useCallback(() => {
    setRefreshKey(k => k + 1);
    // Trigger FullCalendar to refetch events
    if (calendarRefreshRef.current) {
      calendarRefreshRef.current();
    }
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Top bar */}
      <header className="bg-white border-b shadow-sm px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🧹</span>
          <h1 className="text-xl font-bold text-gray-800">Office Chore Board</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setModal({ type: 'create' })}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm"
          >
            + New Chore
          </button>
          <button
            onClick={() => setShowTeamPanel(true)}
            className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium"
          >
            Team Members
          </button>
        </div>
      </header>

      {/* Legend */}
      <div className="bg-white border-b px-4 py-1.5 flex items-center gap-6 text-xs text-gray-500 flex-shrink-0">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-blue-500" /> Upcoming
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-green-500" /> Completed
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-red-500" /> Overdue
        </span>
        <span className="ml-auto text-gray-400">Click a date to add a chore • Click an event to view/complete</span>
      </div>

      {/* Calendar */}
      <main className="flex-1 p-4 overflow-hidden">
        <div className="bg-white rounded-xl shadow-sm h-full p-4">
          <CalendarView
            key={refreshKey}
            onEventClick={handleEventClick}
            onDateSelect={handleDateSelect}
            onDatesChange={handleDatesChange}
            eventsLoader={eventsLoader}
          />
        </div>
      </main>

      {/* Modals */}
      {modal.type === 'create' && (
        <ChoreModal
          mode="create"
          defaultDate={modal.defaultDate}
          members={members}
          onClose={() => setModal({ type: 'none' })}
          onSaved={handleSaved}
        />
      )}
      {modal.type === 'view' && (
        <ChoreModal
          mode="view"
          event={modal.event}
          members={members}
          onClose={() => setModal({ type: 'none' })}
          onSaved={handleSaved}
        />
      )}

      {/* Team Members Panel */}
      {showTeamPanel && (
        <TeamMembersPanel
          members={members}
          onClose={() => setShowTeamPanel(false)}
          onMembersChange={handleMembersChange}
        />
      )}
    </div>
  );
}
