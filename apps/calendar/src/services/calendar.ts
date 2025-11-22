/**
 * Calendar Service
 * Interfaces with WebShell calendar API (khal integration)
 */

import type { CalendarEvent, CreateEventInput, UpdateEventInput } from '../types/calendar';

// WebShell SDK types
declare const webshell: {
  calendar: {
    getEvents: (start: Date, end: Date) => Promise<CalendarEvent[]>;
    createEvent: (event: CreateEventInput) => Promise<CalendarEvent>;
    updateEvent: (id: string, updates: UpdateEventInput) => Promise<CalendarEvent>;
    deleteEvent: (id: string) => Promise<void>;
    onEventCreated: (callback: (event: CalendarEvent) => void) => () => void;
    onEventUpdated: (callback: (event: CalendarEvent) => void) => () => void;
    onEventDeleted: (callback: (id: string) => void) => () => void;
  };
  notifications: {
    send: (options: { title: string; message: string }) => Promise<void>;
  };
};

export class CalendarService {
  /**
   * Get events within a date range
   */
  static async getEvents(start: Date, end: Date): Promise<CalendarEvent[]> {
    try {
      const events = await webshell.calendar.getEvents(start, end);
      return events.map((event) => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
      }));
    } catch (error) {
      console.error('Failed to get events:', error);
      return [];
    }
  }

  /**
   * Create a new event
   */
  static async createEvent(event: CreateEventInput): Promise<CalendarEvent | null> {
    try {
      const created = await webshell.calendar.createEvent(event);
      await webshell.notifications.send({
        title: 'Event Created',
        message: `"${event.title}" has been added to your calendar`,
      });
      return {
        ...created,
        start: new Date(created.start),
        end: new Date(created.end),
      };
    } catch (error) {
      console.error('Failed to create event:', error);
      return null;
    }
  }

  /**
   * Update an existing event
   */
  static async updateEvent(
    id: string,
    updates: UpdateEventInput
  ): Promise<CalendarEvent | null> {
    try {
      const updated = await webshell.calendar.updateEvent(id, updates);
      return {
        ...updated,
        start: new Date(updated.start),
        end: new Date(updated.end),
      };
    } catch (error) {
      console.error('Failed to update event:', error);
      return null;
    }
  }

  /**
   * Delete an event
   */
  static async deleteEvent(id: string): Promise<boolean> {
    try {
      await webshell.calendar.deleteEvent(id);
      return true;
    } catch (error) {
      console.error('Failed to delete event:', error);
      return false;
    }
  }

  /**
   * Subscribe to event creation
   */
  static onEventCreated(callback: (event: CalendarEvent) => void): () => void {
    return webshell.calendar.onEventCreated((event) => {
      callback({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
      });
    });
  }

  /**
   * Subscribe to event updates
   */
  static onEventUpdated(callback: (event: CalendarEvent) => void): () => void {
    return webshell.calendar.onEventUpdated((event) => {
      callback({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
      });
    });
  }

  /**
   * Subscribe to event deletion
   */
  static onEventDeleted(callback: (id: string) => void): () => void {
    return webshell.calendar.onEventDeleted(callback);
  }
}
