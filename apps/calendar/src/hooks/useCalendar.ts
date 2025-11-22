/**
 * useCalendar hook
 * Manages calendar navigation and week/month state
 */

import { useState, useMemo } from 'react';
import {
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isToday,
  format,
} from 'date-fns';
import type { WeekDay } from '../types/calendar';

export function useCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Week view
  const currentWeek = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
    const end = endOfWeek(currentDate, { weekStartsOn: 1 });

    const days = eachDayOfInterval({ start, end }).map(
      (date): WeekDay => ({
        date,
        isToday: isToday(date),
        isCurrentMonth: true,
      })
    );

    return {
      start,
      end,
      days,
      format: (formatStr: string) => format(start, formatStr),
    };
  }, [currentDate]);

  // Navigation
  const nextWeek = () => {
    setCurrentDate((prev) => addWeeks(prev, 1));
  };

  const previousWeek = () => {
    setCurrentDate((prev) => subWeeks(prev, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const goToDate = (date: Date) => {
    setCurrentDate(date);
  };

  // Check if a date is in current view
  const isDateInView = (date: Date) => {
    return (
      date >= currentWeek.start &&
      date <= currentWeek.end
    );
  };

  return {
    currentDate,
    currentWeek,
    nextWeek,
    previousWeek,
    goToToday,
    goToDate,
    isDateInView,
  };
}
