/**
 * Event Card
 * Displays a single event in the calendar
 */

import { format } from 'date-fns';
import type { CalendarEvent } from '../../types/calendar';

interface EventCardProps {
  event: CalendarEvent;
  startHour: number;
  onClick: () => void;
}

export function EventCard({ event, startHour, onClick }: EventCardProps) {
  // Calculate position and height
  const startMinutes =
    event.start.getHours() * 60 + event.start.getMinutes();
  const endMinutes = event.end.getHours() * 60 + event.end.getMinutes();
  const duration = endMinutes - startMinutes;

  // Position relative to start hour
  const offsetMinutes = startMinutes - startHour * 60;
  const top = (offsetMinutes / 60) * 60; // 60px per hour
  const height = (duration / 60) * 60;

  // Default colors if not specified
  const backgroundColor = event.color || '#007bff';

  if (event.allDay) {
    return (
      <div
        className="event-card all-day"
        style={{ backgroundColor }}
        onClick={onClick}
      >
        <div className="event-title">{event.title}</div>
      </div>
    );
  }

  return (
    <div
      className="event-card"
      style={{
        top: `${top}px`,
        height: `${Math.max(height, 30)}px`,
        backgroundColor,
      }}
      onClick={onClick}
    >
      <div className="event-title">{event.title}</div>
      <div className="event-time">
        {format(event.start, 'h:mm a')} - {format(event.end, 'h:mm a')}
      </div>
    </div>
  );
}
