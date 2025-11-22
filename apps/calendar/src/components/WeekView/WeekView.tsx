/**
 * Week View Component
 * Displays a week calendar with events
 */

import { format } from 'date-fns';
import { TimeColumn } from './TimeColumn';
import { DayColumn } from './DayColumn';
import { CurrentTimeLine } from './CurrentTimeLine';
import type { CalendarEvent, WeekDay } from '../../types/calendar';

interface WeekViewProps {
  days: WeekDay[];
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onTimeSlotClick: (date: Date, hour: number) => void;
}

export function WeekView({
  days,
  events,
  onEventClick,
  onTimeSlotClick,
}: WeekViewProps) {
  const startHour = 7;
  const endHour = 20;

  return (
    <div className="week-view">
      {/* Days header */}
      <div className="week-days-header">
        <div className="day-header"></div>
        {days.map((day) => (
          <div
            key={day.date.toISOString()}
            className={`day-header ${day.isToday ? 'today' : ''}`}
          >
            <div className="day-header-name">{format(day.date, 'EEE')}</div>
            <div className="day-header-date">{format(day.date, 'd')}</div>
          </div>
        ))}
      </div>

      {/* Week grid */}
      <div className="week-grid">
        <div className="week-grid-content">
          <TimeColumn startHour={startHour} endHour={endHour} />

          {days.map((day) => {
            const dayEvents = events.filter((event) => {
              const eventDate = new Date(event.start);
              return (
                eventDate.getFullYear() === day.date.getFullYear() &&
                eventDate.getMonth() === day.date.getMonth() &&
                eventDate.getDate() === day.date.getDate()
              );
            });

            return (
              <DayColumn
                key={day.date.toISOString()}
                date={day.date}
                events={dayEvents}
                startHour={startHour}
                endHour={endHour}
                onEventClick={onEventClick}
                onTimeSlotClick={onTimeSlotClick}
              />
            );
          })}

          <CurrentTimeLine startHour={startHour} />
        </div>
      </div>
    </div>
  );
}
