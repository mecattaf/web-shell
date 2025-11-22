/**
 * Current Time Line
 * Displays a red line at the current time
 */

import { useState, useEffect } from 'react';

interface CurrentTimeLineProps {
  startHour: number;
}

export function CurrentTimeLine({ startHour }: CurrentTimeLineProps) {
  const [top, setTop] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updatePosition = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const totalMinutes = hours * 60 + minutes;
      const startMinutes = startHour * 60;

      // Only show if within visible hours
      if (hours >= startHour && hours < 21) {
        const offsetMinutes = totalMinutes - startMinutes;
        const newTop = (offsetMinutes / 60) * 60; // 60px per hour
        setTop(newTop);
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    updatePosition();

    // Update every minute
    const interval = setInterval(updatePosition, 60000);

    return () => clearInterval(interval);
  }, [startHour]);

  if (!isVisible) return null;

  return (
    <div
      className="current-time-line"
      style={{
        top: `${top}px`,
        left: 'var(--cal-time-col-width)',
      }}
    />
  );
}
