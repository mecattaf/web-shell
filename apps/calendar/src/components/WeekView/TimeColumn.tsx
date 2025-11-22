/**
 * Time Column
 * Displays hour labels on the left side
 */

interface TimeColumnProps {
  startHour: number;
  endHour: number;
}

export function TimeColumn({ startHour, endHour }: TimeColumnProps) {
  const hours = Array.from(
    { length: endHour - startHour + 1 },
    (_, i) => startHour + i
  );

  return (
    <div className="time-column">
      {hours.map((hour) => (
        <div key={hour} className="time-slot">
          {hour.toString().padStart(2, '0')}:00
        </div>
      ))}
    </div>
  );
}
