/**
 * useEvents hook
 * Manages calendar events with real-time updates
 */

import { useState, useEffect, useCallback } from 'react';
import { CalendarService } from '../services/calendar';
import type { CalendarEvent, CreateEventInput, UpdateEventInput } from '../types/calendar';

export function useEvents(startDate: Date, endDate: Date) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load events for date range
  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const loadedEvents = await CalendarService.getEvents(startDate, endDate);
      setEvents(loadedEvents);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load events');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  // Initial load
  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribeCreated = CalendarService.onEventCreated((event) => {
      setEvents((prev) => [...prev, event]);
    });

    const unsubscribeUpdated = CalendarService.onEventUpdated((event) => {
      setEvents((prev) =>
        prev.map((e) => (e.id === event.id ? event : e))
      );
    });

    const unsubscribeDeleted = CalendarService.onEventDeleted((id) => {
      setEvents((prev) => prev.filter((e) => e.id !== id));
    });

    return () => {
      unsubscribeCreated();
      unsubscribeUpdated();
      unsubscribeDeleted();
    };
  }, []);

  // CRUD operations
  const createEvent = async (event: CreateEventInput): Promise<CalendarEvent | null> => {
    const created = await CalendarService.createEvent(event);
    if (created) {
      setEvents((prev) => [...prev, created]);
    }
    return created;
  };

  const updateEvent = async (
    id: string,
    updates: UpdateEventInput
  ): Promise<CalendarEvent | null> => {
    const updated = await CalendarService.updateEvent(id, updates);
    if (updated) {
      setEvents((prev) =>
        prev.map((e) => (e.id === id ? updated : e))
      );
    }
    return updated;
  };

  const deleteEvent = async (id: string): Promise<boolean> => {
    const success = await CalendarService.deleteEvent(id);
    if (success) {
      setEvents((prev) => prev.filter((e) => e.id !== id));
    }
    return success;
  };

  return {
    events,
    loading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
    refreshEvents: loadEvents,
  };
}
