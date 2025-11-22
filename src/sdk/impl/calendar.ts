/**
 * WebShell SDK - Calendar Module Implementation
 *
 * Calendar event management and queries
 */

import { BridgeAdapter } from './bridge';
import type { CalendarModule } from '../calendar';
import type {
  CalendarEvent,
  CreateEventInput,
  UpdateEventInput,
  EventHandler,
  UnsubscribeFn
} from '../types';

/**
 * Calendar Module Implementation
 *
 * Provides CRUD operations for calendar events with convenience queries
 */
export class CalendarModuleImpl implements CalendarModule {
  private bridge: BridgeAdapter;

  constructor(bridge: BridgeAdapter) {
    this.bridge = bridge;
  }

  /**
   * List events within a date range
   */
  async listEvents(start: Date, end: Date): Promise<CalendarEvent[]> {
    const result = await this.bridge.call('calendar.listEvents', {
      start: start.toISOString(),
      end: end.toISOString()
    });

    return this.parseEventList(result);
  }

  /**
   * Get a specific event by ID
   */
  async getEvent(id: string): Promise<CalendarEvent> {
    const result = await this.bridge.call('calendar.getEvent', { id });
    return this.parseEvent(result);
  }

  /**
   * Create a new calendar event
   */
  async createEvent(event: CreateEventInput): Promise<CalendarEvent> {
    const result = await this.bridge.call('calendar.createEvent', {
      title: event.title,
      start: event.start.toISOString(),
      end: event.end.toISOString(),
      allDay: event.allDay ?? false,
      description: event.description,
      location: event.location,
      color: event.color,
      attendees: event.attendees,
      reminders: event.reminders
    });

    return this.parseEvent(result);
  }

  /**
   * Update an existing event
   */
  async updateEvent(id: string, updates: UpdateEventInput): Promise<CalendarEvent> {
    const params: any = { id };

    if (updates.title !== undefined) params.title = updates.title;
    if (updates.start !== undefined) params.start = updates.start.toISOString();
    if (updates.end !== undefined) params.end = updates.end.toISOString();
    if (updates.allDay !== undefined) params.allDay = updates.allDay;
    if (updates.description !== undefined) params.description = updates.description;
    if (updates.location !== undefined) params.location = updates.location;
    if (updates.color !== undefined) params.color = updates.color;
    if (updates.attendees !== undefined) params.attendees = updates.attendees;
    if (updates.reminders !== undefined) params.reminders = updates.reminders;

    const result = await this.bridge.call('calendar.updateEvent', params);
    return this.parseEvent(result);
  }

  /**
   * Delete an event
   */
  async deleteEvent(id: string): Promise<void> {
    await this.bridge.call('calendar.deleteEvent', { id });
  }

  /**
   * Get today's events
   */
  async eventsToday(): Promise<CalendarEvent[]> {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    return this.listEvents(start, end);
  }

  /**
   * Get this week's events
   */
  async eventsThisWeek(): Promise<CalendarEvent[]> {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek; // Get Sunday

    const start = new Date(now);
    start.setDate(diff);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    return this.listEvents(start, end);
  }

  /**
   * Get this month's events
   */
  async eventsThisMonth(): Promise<CalendarEvent[]> {
    const now = new Date();

    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    start.setHours(0, 0, 0, 0);

    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    end.setHours(23, 59, 59, 999);

    return this.listEvents(start, end);
  }

  /**
   * Register handler for event created notifications
   */
  onEventCreated(handler: EventHandler<CalendarEvent>): UnsubscribeFn {
    const wrappedHandler = (data: any) => {
      handler(this.parseEvent(data));
    };

    this.bridge.on('calendar-event-created', wrappedHandler);

    return () => {
      this.bridge.off('calendar-event-created', wrappedHandler);
    };
  }

  /**
   * Register handler for event updated notifications
   */
  onEventUpdated(handler: EventHandler<CalendarEvent>): UnsubscribeFn {
    const wrappedHandler = (data: any) => {
      handler(this.parseEvent(data));
    };

    this.bridge.on('calendar-event-updated', wrappedHandler);

    return () => {
      this.bridge.off('calendar-event-updated', wrappedHandler);
    };
  }

  /**
   * Register handler for event deleted notifications
   */
  onEventDeleted(handler: EventHandler<string>): UnsubscribeFn {
    const wrappedHandler = (data: any) => {
      handler(data.id || data);
    };

    this.bridge.on('calendar-event-deleted', wrappedHandler);

    return () => {
      this.bridge.off('calendar-event-deleted', wrappedHandler);
    };
  }

  /**
   * Parse a single event from backend format
   */
  private parseEvent(data: any): CalendarEvent {
    return {
      id: data.id,
      title: data.title,
      start: new Date(data.start),
      end: new Date(data.end),
      allDay: data.allDay ?? false,
      description: data.description,
      location: data.location,
      color: data.color,
      attendees: data.attendees,
      reminders: data.reminders
    };
  }

  /**
   * Parse event list from backend format
   */
  private parseEventList(data: any): CalendarEvent[] {
    if (!Array.isArray(data)) {
      return [];
    }

    return data.map(event => this.parseEvent(event));
  }
}
