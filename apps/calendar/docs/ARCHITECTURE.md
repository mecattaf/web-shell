# Calendar Architecture

## Why Web Over QML?

The original QML calendar required:
- Thousands of lines of code
- Manual pixel calculations for event positioning
- Custom layout engine for overlapping events
- Complex overlap detection logic
- Repetitive Repeater patterns for generating UI
- Limited tooling and debugging capabilities

This React version uses:
- **CSS Grid** for layout (automatic positioning)
- **React hooks** for state management (automatic re-rendering)
- **Standard event handling** (no custom bindings)
- **date-fns library** for date math (battle-tested)
- **Hot reload** for instant iteration
- **Chrome DevTools** for debugging

## Component Structure

```
App (Root)
│
├── Header
│   ├── Title (displays current month/year)
│   └── Navigation
│       ├── Previous Week button
│       ├── Today button
│       ├── Next Week button
│       └── New Event button
│
├── WeekView
│   ├── Week Days Header
│   │   └── Day Header × 7 (Mon-Sun)
│   │       ├── Day name (e.g., "Mon")
│   │       └── Date number (e.g., "15")
│   │
│   └── Week Grid
│       ├── TimeColumn (hour labels 7:00-20:00)
│       │
│       └── DayColumn × 7
│           ├── Time Grid (clickable hour slots)
│           ├── EventCard × N (positioned events)
│           │   ├── Event title
│           │   └── Event time
│           └── CurrentTimeLine (red line at current time)
│
└── EventModal (dialog)
    ├── Modal Header
    │   ├── Title ("New Event" or "Edit Event")
    │   └── Close button
    ├── Event Form
    │   ├── Title input
    │   ├── Start date/time
    │   ├── End date/time
    │   ├── All-day checkbox
    │   ├── Color picker
    │   ├── Location input
    │   └── Description textarea
    └── Modal Footer
        ├── Delete button (if editing)
        ├── Cancel button
        └── Create/Update button
```

## State Flow

### 1. Initial Load

```
App mounts
  ↓
useCalendar() calculates current week
  ↓
useEvents(weekStart, weekEnd) loads events
  ↓
CalendarService.getEvents() → WebShell API → khal
  ↓
Events returned → State updated → Components render
```

### 2. Creating an Event

```
User clicks time slot
  ↓
App sets modal state (date, hour)
  ↓
EventModal opens with pre-filled form
  ↓
User fills form and submits
  ↓
App calls createEvent()
  ↓
useEvents hook → CalendarService → WebShell API
  ↓
Event created in khal
  ↓
onEventCreated subscription fires
  ↓
State updated → Event appears in UI
  ↓
Notification sent
```

### 3. Real-time Updates

```
External change (e.g., via CLI or sync)
  ↓
WebShell backend detects change
  ↓
Subscription callback fires
  ↓
Hook updates events state
  ↓
React re-renders affected components
```

## Data Models

### CalendarEvent

```typescript
interface CalendarEvent {
  id: string;           // Unique identifier
  title: string;        // Event name
  start: Date;          // Start date/time
  end: Date;            // End date/time
  allDay?: boolean;     // All-day event flag
  color?: string;       // Display color (hex)
  description?: string; // Event details
  location?: string;    // Event location
}
```

### WeekDay

```typescript
interface WeekDay {
  date: Date;           // The date
  isToday: boolean;     // Is this today?
  isCurrentMonth: boolean; // Is in current month?
}
```

## Hooks Design

### useCalendar

**Purpose**: Manage calendar navigation and week state

**State**:
- `currentDate`: The currently viewed date
- `currentWeek`: Computed week data (start, end, days)

**Operations**:
- `nextWeek()`: Advance by 1 week
- `previousWeek()`: Go back 1 week
- `goToToday()`: Jump to current week
- `goToDate(date)`: Jump to specific date

**Implementation**:
```typescript
const currentWeek = useMemo(() => {
  const start = startOfWeek(currentDate, { weekStartsOn: 1 });
  const end = endOfWeek(currentDate, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start, end });
  return { start, end, days };
}, [currentDate]);
```

### useEvents

**Purpose**: Manage event data with real-time updates

**State**:
- `events`: Array of calendar events
- `loading`: Loading state
- `error`: Error state

**Operations**:
- `createEvent(event)`: Create new event
- `updateEvent(id, updates)`: Update existing event
- `deleteEvent(id)`: Delete event
- `refreshEvents()`: Reload events from API

**Subscriptions**:
- `onEventCreated`: New event added
- `onEventUpdated`: Event modified
- `onEventDeleted`: Event removed

**Implementation**:
```typescript
useEffect(() => {
  const unsubscribe = CalendarService.onEventCreated((event) => {
    setEvents(prev => [...prev, event]);
  });
  return unsubscribe;
}, []);
```

## Services Layer

### CalendarService

**Purpose**: Interface with WebShell Calendar API

**Methods**:
- `getEvents(start, end)`: Fetch events in date range
- `createEvent(event)`: Create new event
- `updateEvent(id, updates)`: Update event
- `deleteEvent(id)`: Delete event
- `onEventCreated(callback)`: Subscribe to creations
- `onEventUpdated(callback)`: Subscribe to updates
- `onEventDeleted(callback)`: Subscribe to deletions

**Error Handling**:
```typescript
try {
  const events = await webshell.calendar.getEvents(start, end);
  return events;
} catch (error) {
  console.error('Failed to get events:', error);
  return [];
}
```

## Layout System

### CSS Grid for Week View

No manual positioning calculations:

```css
.week-grid-content {
  display: grid;
  grid-template-columns: 80px repeat(7, 1fr);
  /* 80px for time labels, 7 equal columns for days */
}
```

### Event Positioning

Simple formula based on time:

```typescript
// Calculate top position
const startMinutes = hour * 60 + minutes;
const offsetMinutes = startMinutes - startHour * 60;
const top = (offsetMinutes / 60) * 60; // 60px per hour

// Calculate height
const duration = endMinutes - startMinutes;
const height = (duration / 60) * 60;
```

### Current Time Indicator

Updates every minute:

```typescript
useEffect(() => {
  const updatePosition = () => {
    const now = new Date();
    const totalMinutes = now.getHours() * 60 + now.getMinutes();
    const offsetMinutes = totalMinutes - startHour * 60;
    const top = (offsetMinutes / 60) * 60;
    setTop(top);
  };

  updatePosition();
  const interval = setInterval(updatePosition, 60000);
  return () => clearInterval(interval);
}, []);
```

## Performance Optimizations

### 1. Memoization

Expensive calculations are memoized:

```typescript
const currentWeek = useMemo(() => {
  // Calculate week days
}, [currentDate]);
```

### 2. Subscription Cleanup

Prevent memory leaks:

```typescript
useEffect(() => {
  const unsubscribe = CalendarService.onEventCreated(callback);
  return () => unsubscribe(); // Cleanup
}, []);
```

### 3. Event Filtering

Only render events for visible days:

```typescript
const dayEvents = events.filter(event =>
  isSameDay(event.start, day.date)
);
```

### 4. CSS for Animations

Hardware-accelerated transforms:

```css
.event-card:hover {
  transform: scale(1.02);
  transition: transform 0.2s;
}
```

## Integration Points

### WebShell Calendar API

```typescript
declare const webshell: {
  calendar: {
    getEvents(start: Date, end: Date): Promise<CalendarEvent[]>;
    createEvent(event: CreateEventInput): Promise<CalendarEvent>;
    updateEvent(id: string, updates: UpdateEventInput): Promise<CalendarEvent>;
    deleteEvent(id: string): Promise<void>;
    onEventCreated(callback: (event: CalendarEvent) => void): () => void;
    onEventUpdated(callback: (event: CalendarEvent) => void): () => void;
    onEventDeleted(callback: (id: string) => void): () => void;
  };
};
```

### khal Integration

WebShell backend manages khal interaction:
- Events stored in vdir format
- Synced via vdirsyncer
- Read/write through khal Python API

## Testing Strategy

### Unit Tests

Test individual components and hooks:
- Hook logic (useCalendar, useEvents)
- Date calculations
- Event positioning
- Form validation

### Integration Tests

Test component interactions:
- Creating events
- Updating events
- Navigation
- Subscriptions

### E2E Tests

Test full user workflows:
- Opening app
- Creating event via click
- Editing event
- Deleting event
- Week navigation

## Accessibility

### Keyboard Navigation

- Tab through interactive elements
- Enter to activate
- Escape to close modal

### ARIA Labels

```tsx
<button aria-label="Previous week" onClick={onPrevious}>
  ←
</button>
```

### Color Contrast

All text meets WCAG AA standards.

## Build & Deploy

### Development

```bash
npm run dev
# Vite dev server on :5173 with HMR
```

### Production

```bash
npm run build
# TypeScript compilation + Vite bundling
# Output: dist/
```

### Environment

- Node.js 18+
- React 18
- TypeScript 5
- Vite 6

## File Organization

```
src/
├── components/       # React components
│   ├── Header/      # Top navigation
│   ├── WeekView/    # Calendar grid
│   └── EventModal/  # Event dialog
├── hooks/           # Custom hooks
│   ├── useCalendar.ts
│   └── useEvents.ts
├── services/        # API layer
│   └── calendar.ts
├── types/           # TypeScript types
│   └── calendar.ts
└── styles/          # CSS
    └── calendar.css
```

## Future Improvements

### Potential Enhancements

1. **Virtual scrolling** for large event lists
2. **Drag-and-drop** for event rescheduling
3. **Month view** alternative layout
4. **Recurring events** support
5. **Multiple calendars** with color coding
6. **Search/filter** functionality
7. **Keyboard shortcuts** (Ctrl+N for new event, etc.)
8. **Offline support** with service workers

### Performance Targets

- [ ] Load time: < 500ms
- [ ] Scroll: 60 FPS
- [ ] Event creation: < 100ms
- [ ] Memory usage: < 150MB
- [ ] Bundle size: < 200KB gzipped
