/**
 * WebShell SDK - Calendar Module
 *
 * Calendar event management and queries
 */

import type {
  CalendarEvent,
  CreateEventInput,
  UpdateEventInput,
  EventHandler,
  UnsubscribeFn
} from './types';

/**
 * Calendar Module Interface
 *
 * Create, read, update, and delete calendar events
 */
export interface CalendarModule {
  /**
   * List events within a date range
   * @param start - Start date (inclusive)
   * @param end - End date (inclusive)
   * @returns Promise with list of events within the date range
   * @throws {WebShellError} CALENDAR_INVALID_DATE if dates are invalid
   * @throws {WebShellError} PERMISSION_DENIED if calendar.read permission not granted
   * @example
   * ```typescript
   * // Get all events for January 2025
   * const events = await webshell.calendar.listEvents(
   *   new Date('2025-01-01'),
   *   new Date('2025-01-31')
   * );
   * console.log(`Found ${events.length} events`);
   * ```
   */
  listEvents(start: Date, end: Date): Promise<CalendarEvent[]>;

  /**
   * Get a specific event by ID
   * @param id - Event ID
   * @returns Promise with event details
   * @throws {WebShellError} CALENDAR_EVENT_NOT_FOUND if event doesn't exist
   * @throws {WebShellError} PERMISSION_DENIED if calendar.read permission not granted
   * @example
   * ```typescript
   * const event = await webshell.calendar.getEvent('evt_123');
   * console.log(`Event: ${event.title} at ${event.start}`);
   * ```
   */
  getEvent(id: string): Promise<CalendarEvent>;

  /**
   * Create a new calendar event
   * @param event - Event details including title, start, and end times
   * @returns Promise resolving to the created event with assigned ID
   * @throws {WebShellError} CALENDAR_INVALID_DATE if dates are invalid or start >= end
   * @throws {WebShellError} PERMISSION_DENIED if calendar.write permission not granted
   * @example
   * ```typescript
   * const event = await webshell.calendar.createEvent({
   *   title: 'Team Meeting',
   *   start: new Date('2025-01-20T10:00'),
   *   end: new Date('2025-01-20T11:00'),
   *   description: 'Quarterly planning session',
   *   location: 'Conference Room A'
   * });
   * console.log(`Created event with ID: ${event.id}`);
   * ```
   */
  createEvent(event: CreateEventInput): Promise<CalendarEvent>;

  /**
   * Update an existing event
   * @param id - Event ID
   * @param updates - Partial event updates (only include fields to change)
   * @returns Promise with updated event
   * @throws {WebShellError} CALENDAR_EVENT_NOT_FOUND if event doesn't exist
   * @throws {WebShellError} CALENDAR_INVALID_DATE if updated dates are invalid
   * @throws {WebShellError} PERMISSION_DENIED if calendar.write permission not granted
   * @example
   * ```typescript
   * // Update only the title and location
   * const updated = await webshell.calendar.updateEvent('evt_123', {
   *   title: 'Updated Meeting Title',
   *   location: 'Room B'
   * });
   * ```
   */
  updateEvent(id: string, updates: UpdateEventInput): Promise<CalendarEvent>;

  /**
   * Delete an event
   * @param id - Event ID
   * @returns Promise that resolves when event is deleted
   * @throws {WebShellError} CALENDAR_EVENT_NOT_FOUND if event doesn't exist
   * @throws {WebShellError} PERMISSION_DENIED if calendar.write permission not granted
   * @example
   * ```typescript
   * await webshell.calendar.deleteEvent('evt_123');
   * console.log('Event deleted successfully');
   * ```
   */
  deleteEvent(id: string): Promise<void>;

  /**
   * Get today's events
   * @returns Promise with today's events
   * @throws {WebShellError} PERMISSION_DENIED if calendar.read permission not granted
   * @example
   * ```typescript
   * const todayEvents = await webshell.calendar.eventsToday();
   * console.log(`You have ${todayEvents.length} events today`);
   * ```
   */
  eventsToday(): Promise<CalendarEvent[]>;

  /**
   * Get this week's events
   * @returns Promise with this week's events (Monday to Sunday)
   * @throws {WebShellError} PERMISSION_DENIED if calendar.read permission not granted
   * @example
   * ```typescript
   * const weekEvents = await webshell.calendar.eventsThisWeek();
   * ```
   */
  eventsThisWeek(): Promise<CalendarEvent[]>;

  /**
   * Get this month's events
   * @returns Promise with this month's events
   * @throws {WebShellError} PERMISSION_DENIED if calendar.read permission not granted
   * @example
   * ```typescript
   * const monthEvents = await webshell.calendar.eventsThisMonth();
   * ```
   */
  eventsThisMonth(): Promise<CalendarEvent[]>;

  /**
   * Register handler for event created notifications
   * @param handler - Event handler called when an event is created
   * @returns Unsubscribe function to remove the handler
   * @example
   * ```typescript
   * const unsubscribe = webshell.calendar.onEventCreated((event) => {
   *   console.log(`New event: ${event.title}`);
   * });
   * // Later: clean up
   * unsubscribe();
   * ```
   */
  onEventCreated(handler: EventHandler<CalendarEvent>): UnsubscribeFn;

  /**
   * Register handler for event updated notifications
   * @param handler - Event handler called when an event is updated
   * @returns Unsubscribe function to remove the handler
   * @example
   * ```typescript
   * webshell.calendar.onEventUpdated((event) => {
   *   console.log(`Event updated: ${event.title}`);
   * });
   * ```
   */
  onEventUpdated(handler: EventHandler<CalendarEvent>): UnsubscribeFn;

  /**
   * Register handler for event deleted notifications
   * @param handler - Event handler (receives deleted event ID)
   * @returns Unsubscribe function to remove the handler
   * @example
   * ```typescript
   * webshell.calendar.onEventDeleted((eventId) => {
   *   console.log(`Event ${eventId} was deleted`);
   * });
   * ```
   */
  onEventDeleted(handler: EventHandler<string>): UnsubscribeFn;
}
