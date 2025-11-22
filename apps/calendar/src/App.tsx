/**
 * Calendar App
 * Main application component
 */

import { useState } from 'react';
import { Header } from './components/Header/Header';
import { WeekView } from './components/WeekView/WeekView';
import { EventModal } from './components/EventModal/EventModal';
import { useCalendar } from './hooks/useCalendar';
import { useEvents } from './hooks/useEvents';
import type { CalendarEvent, CreateEventInput } from './types/calendar';
import './styles/calendar.css';

function App() {
  const calendar = useCalendar();
  const events = useEvents(calendar.currentWeek.start, calendar.currentWeek.end);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [modalDefaultDate, setModalDefaultDate] = useState<Date | undefined>();
  const [modalDefaultHour, setModalDefaultHour] = useState<number>(9);

  // Handle event click
  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setModalDefaultDate(undefined);
    setIsModalOpen(true);
  };

  // Handle time slot click
  const handleTimeSlotClick = (date: Date, hour: number) => {
    setSelectedEvent(null);
    setModalDefaultDate(date);
    setModalDefaultHour(hour);
    setIsModalOpen(true);
  };

  // Handle new event button
  const handleNewEvent = () => {
    setSelectedEvent(null);
    setModalDefaultDate(new Date());
    setModalDefaultHour(9);
    setIsModalOpen(true);
  };

  // Handle create event
  const handleCreateEvent = async (eventData: CreateEventInput) => {
    await events.createEvent(eventData);
  };

  // Handle update event
  const handleUpdateEvent = async (
    id: string,
    updates: Partial<CreateEventInput>
  ) => {
    await events.updateEvent(id, updates);
  };

  // Handle delete event
  const handleDeleteEvent = async (id: string) => {
    await events.deleteEvent(id);
  };

  if (events.loading) {
    return <div className="loading">Loading calendar...</div>;
  }

  if (events.error) {
    return <div className="error">Error: {events.error}</div>;
  }

  return (
    <>
      <Header
        currentDate={calendar.currentDate}
        onPrevious={calendar.previousWeek}
        onNext={calendar.nextWeek}
        onToday={calendar.goToToday}
        onNewEvent={handleNewEvent}
      />

      <WeekView
        days={calendar.currentWeek.days}
        events={events.events}
        onEventClick={handleEventClick}
        onTimeSlotClick={handleTimeSlotClick}
      />

      <EventModal
        event={selectedEvent}
        defaultDate={modalDefaultDate}
        defaultHour={modalDefaultHour}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateEvent}
        onUpdate={handleUpdateEvent}
        onDelete={handleDeleteEvent}
      />
    </>
  );
}

export default App;
