/**
 * Tests for Calendar Module Implementation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CalendarModuleImpl } from './calendar';
import { BridgeAdapter } from './bridge';
import type { CalendarEvent, CreateEventInput } from '../types';
import type { WebShellBridge } from '../../bridge';

describe('CalendarModuleImpl', () => {
  let mockBridge: any;
  let bridge: BridgeAdapter;
  let calendarModule: CalendarModuleImpl;
  let bridgeEventHandlers: Map<string, Function>;

  beforeEach(() => {
    bridgeEventHandlers = new Map();

    mockBridge = {
      call: vi.fn(),
      on: vi.fn((event: string, handler: Function) => {
        bridgeEventHandlers.set(event, handler);
      }),
      off: vi.fn(),
      ready: true
    };

    bridge = new BridgeAdapter(mockBridge as WebShellBridge);
    calendarModule = new CalendarModuleImpl(bridge);
  });

  const emitBridgeEvent = (event: string, data: any) => {
    const handler = bridgeEventHandlers.get(event);
    if (handler) {
      handler(data);
    }
  };

  const mockEvent: CalendarEvent = {
    id: '1',
    title: 'Meeting',
    start: new Date('2025-01-20T10:00:00Z'),
    end: new Date('2025-01-20T11:00:00Z'),
    allDay: false,
    description: 'Team meeting',
    location: 'Office',
    color: '#ff0000',
    attendees: ['john@example.com'],
    reminders: [15]
  };

  describe('listEvents', () => {
    it('should list events in date range', async () => {
      const start = new Date('2025-01-20T00:00:00Z');
      const end = new Date('2025-01-21T00:00:00Z');

      mockBridge.call.mockResolvedValue({
        data: [{
          id: '1',
          title: 'Meeting',
          start: '2025-01-20T10:00:00Z',
          end: '2025-01-20T11:00:00Z',
          allDay: false
        }]
      });

      const events = await calendarModule.listEvents(start, end);

      expect(mockBridge.call).toHaveBeenCalledWith('calendar.listEvents', {
        start: start.toISOString(),
        end: end.toISOString()
      });
      expect(events).toHaveLength(1);
      expect(events[0].title).toBe('Meeting');
    });

    it('should handle empty event list', async () => {
      mockBridge.call.mockResolvedValue({ data: [] });

      const events = await calendarModule.listEvents(
        new Date(),
        new Date()
      );

      expect(events).toEqual([]);
    });
  });

  describe('getEvent', () => {
    it('should get event by ID', async () => {
      mockBridge.call.mockResolvedValue({
        data: {
          id: '1',
          title: 'Meeting',
          start: '2025-01-20T10:00:00Z',
          end: '2025-01-20T11:00:00Z',
          allDay: false
        }
      });

      const event = await calendarModule.getEvent('1');

      expect(mockBridge.call).toHaveBeenCalledWith('calendar.getEvent', {
        id: '1'
      });
      expect(event.id).toBe('1');
      expect(event.title).toBe('Meeting');
    });
  });

  describe('createEvent', () => {
    it('should create a new event', async () => {
      const input: CreateEventInput = {
        title: 'New Meeting',
        start: new Date('2025-01-20T10:00:00Z'),
        end: new Date('2025-01-20T11:00:00Z'),
        allDay: false,
        description: 'Important meeting',
        location: 'Office',
        color: '#0000ff',
        attendees: ['alice@example.com'],
        reminders: [30, 15]
      };

      mockBridge.call.mockResolvedValue({
        data: {
          id: '2',
          ...input,
          start: input.start.toISOString(),
          end: input.end.toISOString()
        }
      });

      const event = await calendarModule.createEvent(input);

      expect(mockBridge.call).toHaveBeenCalledWith('calendar.createEvent', {
        title: input.title,
        start: input.start.toISOString(),
        end: input.end.toISOString(),
        allDay: input.allDay,
        description: input.description,
        location: input.location,
        color: input.color,
        attendees: input.attendees,
        reminders: input.reminders
      });
      expect(event.id).toBe('2');
      expect(event.title).toBe('New Meeting');
    });
  });

  describe('updateEvent', () => {
    it('should update an existing event', async () => {
      mockBridge.call.mockResolvedValue({
        data: {
          id: '1',
          title: 'Updated Meeting',
          start: '2025-01-20T10:00:00Z',
          end: '2025-01-20T11:00:00Z',
          allDay: false
        }
      });

      const event = await calendarModule.updateEvent('1', {
        title: 'Updated Meeting'
      });

      expect(mockBridge.call).toHaveBeenCalledWith('calendar.updateEvent', {
        id: '1',
        title: 'Updated Meeting'
      });
      expect(event.title).toBe('Updated Meeting');
    });
  });

  describe('deleteEvent', () => {
    it('should delete an event', async () => {
      mockBridge.call.mockResolvedValue(undefined);

      await calendarModule.deleteEvent('1');

      expect(mockBridge.call).toHaveBeenCalledWith('calendar.deleteEvent', {
        id: '1'
      });
    });
  });

  describe('convenience queries', () => {
    it('should get today\'s events', async () => {
      mockBridge.call.mockResolvedValue({ data: [] });

      await calendarModule.eventsToday();

      expect(mockBridge.call).toHaveBeenCalled();
      const call = mockBridge.call.mock.calls[0];
      expect(call[0]).toBe('calendar.listEvents');
    });

    it('should get this week\'s events', async () => {
      mockBridge.call.mockResolvedValue({ data: [] });

      await calendarModule.eventsThisWeek();

      expect(mockBridge.call).toHaveBeenCalled();
      const call = mockBridge.call.mock.calls[0];
      expect(call[0]).toBe('calendar.listEvents');
    });

    it('should get this month\'s events', async () => {
      mockBridge.call.mockResolvedValue({ data: [] });

      await calendarModule.eventsThisMonth();

      expect(mockBridge.call).toHaveBeenCalled();
      const call = mockBridge.call.mock.calls[0];
      expect(call[0]).toBe('calendar.listEvents');
    });
  });

  describe('event subscriptions', () => {
    it('should subscribe to event created', () => {
      const handler = vi.fn();
      const unsubscribe = calendarModule.onEventCreated(handler);

      expect(typeof unsubscribe).toBe('function');
    });

    it('should receive event created notifications', () => {
      const handler = vi.fn();
      calendarModule.onEventCreated(handler);

      emitBridgeEvent('calendar-event-created', {
        id: '1',
        title: 'New Event',
        start: '2025-01-20T10:00:00Z',
        end: '2025-01-20T11:00:00Z',
        allDay: false
      });

      expect(handler).toHaveBeenCalled();
      const event = handler.mock.calls[0][0];
      expect(event.title).toBe('New Event');
    });

    it('should subscribe to event updated', () => {
      const handler = vi.fn();
      calendarModule.onEventUpdated(handler);

      emitBridgeEvent('calendar-event-updated', {
        id: '1',
        title: 'Updated Event',
        start: '2025-01-20T10:00:00Z',
        end: '2025-01-20T11:00:00Z',
        allDay: false
      });

      expect(handler).toHaveBeenCalled();
    });

    it('should subscribe to event deleted', () => {
      const handler = vi.fn();
      calendarModule.onEventDeleted(handler);

      emitBridgeEvent('calendar-event-deleted', { id: '1' });

      expect(handler).toHaveBeenCalledWith('1');
    });

    it('should unsubscribe from events', () => {
      const handler = vi.fn();
      const unsubscribe = calendarModule.onEventCreated(handler);

      unsubscribe();

      emitBridgeEvent('calendar-event-created', mockEvent);

      expect(handler).not.toHaveBeenCalled();
    });
  });
});
