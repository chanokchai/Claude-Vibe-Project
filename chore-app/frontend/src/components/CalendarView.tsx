import { useRef, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventClickArg, DatesSetArg, DateSelectArg } from '@fullcalendar/core';
import { CalendarEvent } from '../types';

interface Props {
  onEventClick: (event: CalendarEvent) => void;
  onDateSelect: (date: string) => void;
  onDatesChange: (start: string, end: string) => void;
  eventsLoader: (start: string, end: string) => Promise<CalendarEvent[]>;
}

export function CalendarView({ onEventClick, onDateSelect, onDatesChange, eventsLoader }: Props) {
  const calendarRef = useRef<FullCalendar>(null);

  const handleDatesSet = useCallback(
    (info: DatesSetArg) => {
      const start = info.startStr.split('T')[0];
      const end = info.endStr.split('T')[0];
      onDatesChange(start, end);
    },
    [onDatesChange]
  );

  const handleEventClick = useCallback(
    (info: EventClickArg) => {
      const raw = info.event;
      const event: CalendarEvent = {
        id: raw.id,
        choreId: raw.extendedProps.choreId,
        title: raw.title,
        start: raw.startStr,
        end: raw.endStr,
        color: (raw.backgroundColor as string) || '#3b82f6',
        extendedProps: raw.extendedProps as CalendarEvent['extendedProps'],
      };
      onEventClick(event);
    },
    [onEventClick]
  );

  const handleDateSelect = useCallback(
    (info: DateSelectArg) => {
      onDateSelect(info.startStr.split('T')[0]);
    },
    [onDateSelect]
  );

  const fetchEvents = useCallback(
    async (
      info: { startStr: string; endStr: string },
      successCallback: (events: object[]) => void,
      failureCallback: (error: Error) => void
    ) => {
      try {
        const start = info.startStr.split('T')[0];
        const end = info.endStr.split('T')[0];
        const events = await eventsLoader(start, end);
        // Attach choreId to extendedProps for event click handler
        const mapped = events.map(e => ({
          ...e,
          extendedProps: { ...e.extendedProps, choreId: e.choreId },
        }));
        successCallback(mapped);
      } catch (err) {
        failureCallback(err instanceof Error ? err : new Error('Failed to load events'));
      }
    },
    [eventsLoader]
  );

  return (
    <div className="h-full">
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        height="100%"
        events={fetchEvents}
        eventClick={handleEventClick}
        datesSet={handleDatesSet}
        selectable={true}
        select={handleDateSelect}
        selectMirror={true}
        dayMaxEvents={3}
        eventDisplay="block"
        eventTimeFormat={{
          hour: 'numeric',
          minute: '2-digit',
          meridiem: 'short',
        }}
      />
    </div>
  );
}
