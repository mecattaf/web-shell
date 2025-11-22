/**
 * Day Column
 * Displays a single day with events
 */

import { EventCard } from './EventCard';
import type { CalendarEvent } from '../../types/calendar';

interface DayColumnProps {
  date: Date;
  events: CalendarEvent[];
  startHour: number;
  endHour: number;
  onEventClick: (event: CalendarEvent) => void;
  onTimeSlotClick: (date: Date, hour: number) => void;
}

export function DayColumn({
  date,
  events,
  startHour,
  endHour,
  onEventClick,
  onTimeSlotClick,
}: DayColumnProps) {
  const hours = Array.from(
    { length: endHour - startHour + 1 },
    (_, i) => startHour + i
  );

  const handleHourClick = (hour: number) => {
    onTimeSlotClick(date, hour);
  };

  return (
    <div className="day-column">
      {/* Time grid */}
      <div className="time-grid">
        {hours.map((hour) => (
          <div
            key={hour}
            className="hour-row"
            onClick={() => handleHourClick(hour)}
          />
        ))}
      </div>

      {/* Events */}
      {events.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          startHour={startHour}
          onClick={() => onEventClick(event)}
        />
      ))}
    </div>
  );
}
