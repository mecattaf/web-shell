# Calendar Module API

 

The Calendar Module provides comprehensive calendar event management and scheduling capabilities.

 

## Overview

 

The Calendar Module (`webshell.calendar`) enables WebShell applications to:

 

- Create, read, update, and delete calendar events

- Query events by date ranges

- Access convenient date filters (today, this week, this month)

- Receive real-time event change notifications

- Manage event details (attendees, reminders, locations)

- Support all-day and timed events

 

## Namespace

 

Access via: `webshell.calendar`

 

## Event Queries

 

### `listEvents(start: Date, end: Date): Promise<CalendarEvent[]>`

 

Lists all calendar events within a specified date range.

 

**Parameters:**

- `start` (Date): Start date (inclusive)

- `end` (Date): End date (inclusive)

 

**Returns:** `Promise<CalendarEvent[]>` - Array of events in the date range

 

**Throws:**

- `WebShellError` with code `CALENDAR_INVALID_DATE` if dates are invalid

- `WebShellError` with code `PERMISSION_DENIED` if `calendar.read` permission not granted

 

**Example:**

```typescript

// Get all events for January 2025

const events = await webshell.calendar.listEvents(

  new Date('2025-01-01'),

  new Date('2025-01-31')

);

 

console.log(`Found ${events.length} events in January`);

events.forEach(event => {

  console.log(`- ${event.title} on ${event.start.toLocaleDateString()}`);

});

```

 

**Notes:**

- Both start and end dates are inclusive

- Returns events that overlap with the date range

- Events are sorted by start time

- Start date must be before or equal to end date

 

---

 

### `getEvent(id: string): Promise<CalendarEvent>`

 

Retrieves a specific event by its unique ID.

 

**Parameters:**

- `id` (string): Event ID

 

**Returns:** `Promise<CalendarEvent>` - The event details

 

**Throws:**

- `WebShellError` with code `CALENDAR_EVENT_NOT_FOUND` if event doesn't exist

- `WebShellError` with code `PERMISSION_DENIED` if `calendar.read` permission not granted

 

**Example:**

```typescript

try {

  const event = await webshell.calendar.getEvent('evt_123456');

  console.log(`Event: ${event.title}`);

  console.log(`Time: ${event.start} - ${event.end}`);

  console.log(`Location: ${event.location}`);

} catch (err) {

  if (err.code === 'CALENDAR_EVENT_NOT_FOUND') {

    console.error('Event not found');

  }

}

```

 

---

 

### `eventsToday(): Promise<CalendarEvent[]>`

 

Retrieves all events scheduled for today.

 

**Returns:** `Promise<CalendarEvent[]>` - Today's events

 

**Throws:**

- `WebShellError` with code `PERMISSION_DENIED` if `calendar.read` permission not granted

 

**Example:**

```typescript

const todayEvents = await webshell.calendar.eventsToday();

 

if (todayEvents.length === 0) {

  console.log('No events today!');

} else {

  console.log(`You have ${todayEvents.length} events today:`);

  todayEvents.forEach(event => {

    const time = event.allDay ? 'All day' : event.start.toLocaleTimeString();

    console.log(`- ${time}: ${event.title}`);

  });

}

```

 

**Notes:**

- "Today" is determined by the current system date

- Includes all-day events

- Includes events that start today, even if they end later

- Sorted by start time

 

---

 

### `eventsThisWeek(): Promise<CalendarEvent[]>`

 

Retrieves all events scheduled for the current week (Monday to Sunday).

 

**Returns:** `Promise<CalendarEvent[]>` - This week's events

 

**Throws:**

- `WebShellError` with code `PERMISSION_DENIED` if `calendar.read` permission not granted

 

**Example:**

```typescript

const weekEvents = await webshell.calendar.eventsThisWeek();

console.log(`${weekEvents.length} events this week`);

 

// Group by day

const byDay = weekEvents.reduce((acc, event) => {

  const day = event.start.toLocaleDateString();

  if (!acc[day]) acc[day] = [];

  acc[day].push(event);

  return acc;

}, {});

 

Object.entries(byDay).forEach(([day, events]) => {

  console.log(`${day}: ${events.length} events`);

});

```

 

**Notes:**

- Week starts on Monday and ends on Sunday

- Current week is relative to today's date

- Includes multi-day events that overlap with the week

 

---

 

### `eventsThisMonth(): Promise<CalendarEvent[]>`

 

Retrieves all events scheduled for the current month.

 

**Returns:** `Promise<CalendarEvent[]>` - This month's events

 

**Throws:**

- `WebShellError` with code `PERMISSION_DENIED` if `calendar.read` permission not granted

 

**Example:**

```typescript

const monthEvents = await webshell.calendar.eventsThisMonth();

console.log(`${monthEvents.length} events this month`);

 

// Calculate busy days

const busyDays = new Set(

  monthEvents.map(e => e.start.toLocaleDateString())

);

console.log(`Busy days: ${busyDays.size}`);

```

 

**Notes:**

- Month is determined by the current calendar month

- Includes events from the 1st to the last day of the month

- Includes multi-day events that overlap with the month

 

---

 

## Event Management

 

### `createEvent(event: CreateEventInput): Promise<CalendarEvent>`

 

Creates a new calendar event.

 

**Parameters:**

- `event` ([`CreateEventInput`](../sdk-api-reference.md#createeventinput)): Event details

 

**Returns:** `Promise<CalendarEvent>` - The created event with assigned ID

 

**Throws:**

- `WebShellError` with code `CALENDAR_INVALID_DATE` if dates are invalid or start >= end

- `WebShellError` with code `PERMISSION_DENIED` if `calendar.write` permission not granted

 

**Example:**

```typescript

const event = await webshell.calendar.createEvent({

  title: 'Team Meeting',

  start: new Date('2025-01-20T10:00:00'),

  end: new Date('2025-01-20T11:00:00'),

  description: 'Quarterly planning session',

  location: 'Conference Room A',

  attendees: ['alice@example.com', 'bob@example.com'],

  reminders: [15, 60] // Remind 15 min and 1 hour before

});

 

console.log(`Created event with ID: ${event.id}`);

```

 

**CreateEventInput Fields:**

- `title` (string, required): Event title

- `start` (Date, required): Event start time

- `end` (Date, required): Event end time

- `allDay` (boolean, optional): Whether event is all-day

- `description` (string, optional): Event description

- `location` (string, optional): Event location

- `color` (string, optional): Event color (hex code)

- `attendees` (string[], optional): Attendee email addresses

- `reminders` (number[], optional): Reminder times in minutes before event

 

**Notes:**

- End time must be after start time

- All-day events ignore time components

- Event ID is automatically generated

- Created timestamp is set automatically

 

---

 

### `updateEvent(id: string, updates: UpdateEventInput): Promise<CalendarEvent>`

 

Updates an existing calendar event.

 

**Parameters:**

- `id` (string): Event ID to update

- `updates` ([`UpdateEventInput`](../sdk-api-reference.md#updateeventinput)): Fields to update

 

**Returns:** `Promise<CalendarEvent>` - The updated event

 

**Throws:**

- `WebShellError` with code `CALENDAR_EVENT_NOT_FOUND` if event doesn't exist

- `WebShellError` with code `CALENDAR_INVALID_DATE` if updated dates are invalid

- `WebShellError` with code `PERMISSION_DENIED` if `calendar.write` permission not granted

 

**Example:**

```typescript

// Update only specific fields

const updated = await webshell.calendar.updateEvent('evt_123', {

  title: 'Updated Meeting Title',

  location: 'Conference Room B',

  attendees: ['alice@example.com', 'bob@example.com', 'charlie@example.com']

});

 

console.log('Event updated:', updated.title);

```

 

**UpdateEventInput Fields:**

All fields are optional (only include fields you want to change):

- `title` (string): New title

- `start` (Date): New start time

- `end` (Date): New end time

- `allDay` (boolean): Change all-day status

- `description` (string): New description

- `location` (string): New location

- `color` (string): New color

- `attendees` (string[]): New attendee list (replaces existing)

- `reminders` (number[]): New reminder times (replaces existing)

 

**Notes:**

- Only specified fields are updated

- Unspecified fields remain unchanged

- If updating start or end, the new times must still be valid

- Updated timestamp is set automatically

 

---

 

### `deleteEvent(id: string): Promise<void>`

 

Deletes a calendar event.

 

**Parameters:**

- `id` (string): Event ID to delete

 

**Returns:** `Promise<void>` - Resolves when event is deleted

 

**Throws:**

- `WebShellError` with code `CALENDAR_EVENT_NOT_FOUND` if event doesn't exist

- `WebShellError` with code `PERMISSION_DENIED` if `calendar.write` permission not granted

 

**Example:**

```typescript

try {

  await webshell.calendar.deleteEvent('evt_123');

  console.log('Event deleted successfully');

} catch (err) {

  if (err.code === 'CALENDAR_EVENT_NOT_FOUND') {

    console.error('Event not found or already deleted');

  }

}

```

 

**Notes:**

- Deletion is permanent and cannot be undone

- Consider prompting user for confirmation

- Triggers `onEventDeleted` notification

 

---

 

## Event Notifications

 

### `onEventCreated(handler: EventHandler<CalendarEvent>): UnsubscribeFn`

 

Subscribes to event creation notifications.

 

**Parameters:**

- `handler` (EventHandler<CalendarEvent>): Function called when an event is created

 

**Returns:** [`UnsubscribeFn`](../sdk-api-reference.md#unsubscribefn) - Function to unsubscribe

 

**Example:**

```typescript

const unsubscribe = webshell.calendar.onEventCreated((event) => {

  console.log(`New event created: ${event.title}`);

  console.log(`Time: ${event.start} - ${event.end}`);

 

  // Update UI with new event

  addEventToCalendar(event);

 

  // Send notification

  if (isUpcoming(event)) {

    webshell.notifications.send({

      title: 'Event Created',

      message: `${event.title} scheduled for ${formatDate(event.start)}`

    });

  }

});

 

// Later: unsubscribe()

```

 

**Notes:**

- Called for all event creations, even from other apps

- Includes events created by the current app

- Use to keep UI synchronized

- Always clean up by calling unsubscribe when done

 

---

 

### `onEventUpdated(handler: EventHandler<CalendarEvent>): UnsubscribeFn`

 

Subscribes to event update notifications.

 

**Parameters:**

- `handler` (EventHandler<CalendarEvent>): Function called when an event is updated

 

**Returns:** [`UnsubscribeFn`](../sdk-api-reference.md#unsubscribefn) - Function to unsubscribe

 

**Example:**

```typescript

webshell.calendar.onEventUpdated((event) => {

  console.log(`Event updated: ${event.title}`);

 

  // Refresh event in UI

  updateEventInCalendar(event);

 

  // Log the change

  console.log(`Updated at: ${new Date()}`);

});

```

 

**Notes:**

- Called for all event updates from any source

- Receives the complete updated event object

- Does not include information about what changed

- Use to refresh displayed event details

 

---

 

### `onEventDeleted(handler: EventHandler<string>): UnsubscribeFn`

 

Subscribes to event deletion notifications.

 

**Parameters:**

- `handler` (EventHandler<string>): Function called when an event is deleted (receives event ID)

 

**Returns:** [`UnsubscribeFn`](../sdk-api-reference.md#unsubscribefn) - Function to unsubscribe

 

**Example:**

```typescript

webshell.calendar.onEventDeleted((eventId) => {

  console.log(`Event ${eventId} was deleted`);

 

  // Remove event from UI

  removeEventFromCalendar(eventId);

 

  // Clear any related reminders

  clearRemindersForEvent(eventId);

});

```

 

**Notes:**

- Receives only the event ID, not the full event object

- Called after the event has been deleted

- Event details are no longer accessible

- Use to remove event from UI and clear related data

 

---

 

## Common Patterns

 

### Calendar Widget

 

Display upcoming events:

 

```typescript

async function loadUpcomingEvents() {

  // Get next 7 days

  const start = new Date();

  const end = new Date();

  end.setDate(end.getDate() + 7);

 

  const events = await webshell.calendar.listEvents(start, end);

 

  // Display events

  const container = document.getElementById('upcoming-events');

  container.innerHTML = events.map(event => `

    <div class="event">

      <div class="event-title">${event.title}</div>

      <div class="event-time">${formatDateTime(event.start)}</div>

      ${event.location ? `<div class="event-location">${event.location}</div>` : ''}

    </div>

  `).join('');

}

 

// Refresh when events change

webshell.calendar.onEventCreated(() => loadUpcomingEvents());

webshell.calendar.onEventUpdated(() => loadUpcomingEvents());

webshell.calendar.onEventDeleted(() => loadUpcomingEvents());

```

 

### Month View Calendar

 

Build a month calendar view:

 

```typescript

async function renderMonthView(year: number, month: number) {

  const start = new Date(year, month, 1);

  const end = new Date(year, month + 1, 0); // Last day of month

 

  const events = await webshell.calendar.listEvents(start, end);

 

  // Group events by date

  const eventsByDate = events.reduce((acc, event) => {

    const dateKey = event.start.toISOString().split('T')[0];

    if (!acc[dateKey]) acc[dateKey] = [];

    acc[dateKey].push(event);

    return acc;

  }, {});

 

  // Render calendar grid

  renderCalendarGrid(year, month, eventsByDate);

}

 

function renderCalendarGrid(year: number, month: number, eventsByDate: any) {

  const firstDay = new Date(year, month, 1).getDay();

  const daysInMonth = new Date(year, month + 1, 0).getDate();

 

  // Build calendar HTML

  let html = '<div class="calendar-grid">';

 

  // Empty cells for days before month starts

  for (let i = 0; i < firstDay; i++) {

    html += '<div class="calendar-day empty"></div>';

  }

 

  // Days of the month

  for (let day = 1; day <= daysInMonth; day++) {

    const date = new Date(year, month, day);

    const dateKey = date.toISOString().split('T')[0];

    const dayEvents = eventsByDate[dateKey] || [];

 

    html += `

      <div class="calendar-day" data-date="${dateKey}">

        <div class="day-number">${day}</div>

        <div class="day-events">

          ${dayEvents.map(e => `

            <div class="event-dot" style="background: ${e.color || '#3b82f6'}"

                 title="${e.title}"></div>

          `).join('')}

        </div>

      </div>

    `;

  }

 

  html += '</div>';

  document.getElementById('calendar').innerHTML = html;

}

```

 

### Event Creation Form

 

Create events from user input:

 

```typescript

async function createEventFromForm(formData: any) {

  try {

    const event = await webshell.calendar.createEvent({

      title: formData.title,

      start: new Date(formData.startDate + 'T' + formData.startTime),

      end: new Date(formData.endDate + 'T' + formData.endTime),

      allDay: formData.allDay,

      description: formData.description,

      location: formData.location,

      attendees: formData.attendees.split(',').map(e => e.trim()),

      reminders: formData.reminders ? [15, 60] : []

    });

 

    console.log('Event created:', event.id);

    showSuccessMessage('Event created successfully');

    closeForm();

  } catch (err) {

    if (err.code === 'CALENDAR_INVALID_DATE') {

      showError('Invalid dates. End time must be after start time.');

    } else if (err.code === 'PERMISSION_DENIED') {

      showError('Calendar write permission required');

    } else {

      showError('Failed to create event: ' + err.message);

    }

  }

}

```

 

### Quick Event Actions

 

Implement quick edit and delete:

 

```typescript

async function quickEditEvent(eventId: string) {

  const event = await webshell.calendar.getEvent(eventId);

 

  // Show quick edit dialog

  const newTitle = prompt('Event title:', event.title);

  const newLocation = prompt('Location:', event.location || '');

 

  if (newTitle !== null) {

    await webshell.calendar.updateEvent(eventId, {

      title: newTitle || event.title,

      location: newLocation || event.location

    });

 

    console.log('Event updated');

  }

}

 

async function quickDeleteEvent(eventId: string) {

  const event = await webshell.calendar.getEvent(eventId);

 

  if (confirm(`Delete event "${event.title}"?`)) {

    await webshell.calendar.deleteEvent(eventId);

    console.log('Event deleted');

  }

}

```

 

### Recurring Events Simulation

 

Simulate recurring events by creating multiple instances:

 

```typescript

async function createRecurringEvent(

  baseEvent: CreateEventInput,

  frequency: 'daily' | 'weekly' | 'monthly',

  occurrences: number

) {

  const events: CalendarEvent[] = [];

 

  for (let i = 0; i < occurrences; i++) {

    const start = new Date(baseEvent.start);

    const end = new Date(baseEvent.end);

 

    // Calculate occurrence date

    switch (frequency) {

      case 'daily':

        start.setDate(start.getDate() + i);

        end.setDate(end.getDate() + i);

        break;

      case 'weekly':

        start.setDate(start.getDate() + (i * 7));

        end.setDate(end.getDate() + (i * 7));

        break;

      case 'monthly':

        start.setMonth(start.getMonth() + i);

        end.setMonth(end.getMonth() + i);

        break;

    }

 

    const event = await webshell.calendar.createEvent({

      ...baseEvent,

      start,

      end,

      title: `${baseEvent.title} (${i + 1}/${occurrences})`

    });

 

    events.push(event);

  }

 

  return events;

}

 

// Usage

await createRecurringEvent(

  {

    title: 'Weekly Team Standup',

    start: new Date('2025-01-20T09:00:00'),

    end: new Date('2025-01-20T09:30:00'),

    location: 'Virtual'

  },

  'weekly',

  12 // 12 weeks

);

```

 

### Event Reminders

 

Set up reminder notifications:

 

```typescript

function setupEventReminders() {

  webshell.calendar.onEventCreated((event) => {

    if (event.reminders && event.reminders.length > 0) {

      event.reminders.forEach(minutesBefore => {

        const reminderTime = new Date(event.start);

        reminderTime.setMinutes(reminderTime.getMinutes() - minutesBefore);

 

        const delay = reminderTime.getTime() - Date.now();

 

        if (delay > 0) {

          setTimeout(() => {

            webshell.notifications.send({

              title: `Upcoming: ${event.title}`,

              message: `Starts in ${minutesBefore} minutes`,

              urgency: minutesBefore <= 15 ? 'critical' : 'normal'

            });

          }, delay);

        }

      });

    }

  });

}

```

 

### Conflict Detection

 

Check for scheduling conflicts:

 

```typescript

async function hasConflict(newEvent: CreateEventInput): Promise<boolean> {

  const events = await webshell.calendar.listEvents(

    newEvent.start,

    newEvent.end

  );

 

  return events.some(event => {

    // Check if events overlap

    return (

      (newEvent.start >= event.start && newEvent.start < event.end) ||

      (newEvent.end > event.start && newEvent.end <= event.end) ||

      (newEvent.start <= event.start && newEvent.end >= event.end)

    );

  });

}

 

// Usage

if (await hasConflict(eventData)) {

  const proceed = confirm('This conflicts with existing event. Create anyway?');

  if (!proceed) return;

}

 

await webshell.calendar.createEvent(eventData);

```

 

## Permissions

 

The Calendar Module requires specific permissions in your manifest:

 

```json

{

  "name": "my-calendar-app",

  "permissions": ["calendar.read", "calendar.write"],

  "entry": "index.html"

}

```

 

**Permission Levels:**

- `calendar.read`: Required for querying and reading events

- `calendar.write`: Required for creating, updating, and deleting events

 

Without these permissions, calendar methods will throw `PERMISSION_DENIED` errors.

 

## Error Handling

 

All Calendar Module methods may throw `WebShellError`. Handle errors appropriately:

 

```typescript

import { WebShellError } from 'webshell-sdk';

 

try {

  const event = await webshell.calendar.createEvent({

    title: 'Meeting',

    start: new Date('2025-01-20T10:00'),

    end: new Date('2025-01-20T09:00') // Invalid: end before start

  });

} catch (err) {

  if (err instanceof WebShellError) {

    switch (err.code) {

      case 'CALENDAR_INVALID_DATE':

        console.error('Invalid dates provided');

        break;

      case 'PERMISSION_DENIED':

        console.error('Calendar write permission required');

        break;

      case 'CALENDAR_EVENT_NOT_FOUND':

        console.error('Event not found');

        break;

      default:

        console.error('Calendar error:', err.message);

    }

  }

}

```

 

## Related Documentation

 

- [Calendar Backend Implementation](../backend/calendar.md)

- [Notifications Module](./notifications.md) - Event reminders

- [Shell Module](./shell.md) - Inter-app calendar integration

- [Calendar App Example](../../examples/calendar-app/README.md)

 
