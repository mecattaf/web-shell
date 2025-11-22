/**
 * Calendar Types
 */

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  color?: string;
  description?: string;
  location?: string;
}

export interface CreateEventInput {
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  color?: string;
  description?: string;
  location?: string;
}

export interface UpdateEventInput {
  title?: string;
  start?: Date;
  end?: Date;
  allDay?: boolean;
  color?: string;
  description?: string;
  location?: string;
}

export type ViewType = 'week' | 'month';

export interface WeekDay {
  date: Date;
  isToday: boolean;
  isCurrentMonth: boolean;
}
