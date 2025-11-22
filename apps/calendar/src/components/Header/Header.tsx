/**
 * Calendar Header
 * Navigation and view controls
 */

import { format } from 'date-fns';

interface HeaderProps {
  currentDate: Date;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  onNewEvent: () => void;
}

export function Header({
  currentDate,
  onPrevious,
  onNext,
  onToday,
  onNewEvent,
}: HeaderProps) {
  return (
    <header className="calendar-header">
      <h1 className="calendar-title">
        📅 {format(currentDate, 'MMMM yyyy')}
      </h1>

      <nav className="calendar-nav">
        <button onClick={onPrevious}>← Previous</button>
        <button onClick={onToday}>Today</button>
        <button onClick={onNext}>Next →</button>
        <button onClick={onNewEvent} style={{ marginLeft: '1rem' }}>
          + New Event
        </button>
      </nav>
    </header>
  );
}
