/**
 * Event Modal
 * Create/edit event dialog
 */

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import type { CalendarEvent, CreateEventInput } from '../../types/calendar';

interface EventModalProps {
  event: CalendarEvent | null;
  defaultDate?: Date;
  defaultHour?: number;
  isOpen: boolean;
  onClose: () => void;
  onCreate: (event: CreateEventInput) => void;
  onUpdate: (id: string, event: Partial<CreateEventInput>) => void;
  onDelete: (id: string) => void;
}

export function EventModal({
  event,
  defaultDate,
  defaultHour = 9,
  isOpen,
  onClose,
  onCreate,
  onUpdate,
  onDelete,
}: EventModalProps) {
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [allDay, setAllDay] = useState(false);
  const [color, setColor] = useState('#007bff');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');

  // Initialize form when event or defaultDate changes
  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setStartDate(format(event.start, 'yyyy-MM-dd'));
      setStartTime(format(event.start, 'HH:mm'));
      setEndDate(format(event.end, 'yyyy-MM-dd'));
      setEndTime(format(event.end, 'HH:mm'));
      setAllDay(event.allDay || false);
      setColor(event.color || '#007bff');
      setDescription(event.description || '');
      setLocation(event.location || '');
    } else if (defaultDate) {
      const start = new Date(defaultDate);
      start.setHours(defaultHour, 0, 0, 0);
      const end = new Date(start);
      end.setHours(defaultHour + 1, 0, 0, 0);

      setTitle('');
      setStartDate(format(start, 'yyyy-MM-dd'));
      setStartTime(format(start, 'HH:mm'));
      setEndDate(format(end, 'yyyy-MM-dd'));
      setEndTime(format(end, 'HH:mm'));
      setAllDay(false);
      setColor('#007bff');
      setDescription('');
      setLocation('');
    }
  }, [event, defaultDate, defaultHour]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const start = new Date(`${startDate}T${startTime}`);
    const end = new Date(`${endDate}T${endTime}`);

    const eventData: CreateEventInput = {
      title,
      start,
      end,
      allDay,
      color,
      description,
      location,
    };

    if (event) {
      onUpdate(event.id, eventData);
    } else {
      onCreate(eventData);
    }

    onClose();
  };

  const handleDelete = () => {
    if (event && confirm(`Delete event "${event.title}"?`)) {
      onDelete(event.id);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {event ? 'Edit Event' : 'New Event'}
          </h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Title</label>
              <input
                type="text"
                className="form-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>

              {!allDay && (
                <div className="form-group">
                  <label className="form-label">Start Time</label>
                  <input
                    type="time"
                    className="form-input"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </div>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">End Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>

              {!allDay && (
                <div className="form-group">
                  <label className="form-label">End Time</label>
                  <input
                    type="time"
                    className="form-input"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  />
                </div>
              )}
            </div>

            <div className="form-group">
              <div className="form-checkbox-group">
                <input
                  type="checkbox"
                  id="all-day"
                  checked={allDay}
                  onChange={(e) => setAllDay(e.target.checked)}
                />
                <label htmlFor="all-day">All day event</label>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Color</label>
              <input
                type="color"
                className="form-input"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                style={{ height: '50px' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Location</label>
              <input
                type="text"
                className="form-input"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Optional"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="modal-footer">
            {event && (
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDelete}
                style={{ marginRight: 'auto' }}
              >
                Delete
              </button>
            )}
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {event ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
