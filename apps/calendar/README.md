# Calendar - WebShell Production App

A production-ready calendar application built with React that replaces the QML calendar implementation.

## Overview

This is not just an example - it's a **production-quality app** that demonstrates WebShell can build complex UIs better than QML. It provides full calendar functionality with a modern, performant React interface.

## Features

### Core Calendar Features
- ✅ Weekly calendar view
- ✅ Event CRUD operations (Create, Read, Update, Delete)
- ✅ All-day events support
- ✅ Custom event colors
- ✅ Real-time updates via subscriptions
- ✅ Current time indicator
- ✅ Click on time slots to create events
- ✅ Edit events by clicking them
- ✅ Notifications for event creation

### Production Quality
- ✅ TypeScript for type safety
- ✅ Modern React with hooks
- ✅ CSS Grid for layout (no manual pixel calculations)
- ✅ Real-time subscriptions
- ✅ Responsive design
- ✅ Clean, maintainable code
- ✅ Design tokens for theming
- ✅ Accessible UI

## Why Better Than QML?

The original QML calendar required:
- Thousands of lines of code
- Manual pixel calculations
- Custom layout engine
- Complex overlap logic
- Repetitive Repeater patterns

This React version uses:
- **CSS Grid** for automatic layout
- **React hooks** for state management
- **date-fns** for date manipulation
- Standard event handling
- Hot reload for instant iteration

## Structure

```
apps/calendar/
├── webshell.json              # App manifest
├── package.json               # Dependencies
├── vite.config.ts             # Build config
├── tsconfig.json              # TypeScript config
├── index.html                 # Entry point
├── src/
│   ├── main.tsx               # App bootstrap
│   ├── App.tsx                # Main component
│   ├── components/
│   │   ├── Header/
│   │   │   └── Header.tsx     # Navigation header
│   │   ├── WeekView/
│   │   │   ├── WeekView.tsx   # Week container
│   │   │   ├── TimeColumn.tsx # Hour labels
│   │   │   ├── DayColumn.tsx  # Day with events
│   │   │   ├── EventCard.tsx  # Event display
│   │   │   └── CurrentTimeLine.tsx # Current time
│   │   └── EventModal/
│   │       └── EventModal.tsx # Create/edit dialog
│   ├── hooks/
│   │   ├── useCalendar.ts     # Calendar navigation
│   │   └── useEvents.ts       # Event management
│   ├── services/
│   │   └── calendar.ts        # API interface
│   ├── types/
│   │   └── calendar.ts        # Type definitions
│   └── styles/
│       └── calendar.css       # Styles
└── README.md
```

## Setup

Install dependencies:

```bash
cd apps/calendar
npm install
```

## Running

### Development mode

```bash
npm run dev
# Then run WebShell pointing to http://localhost:5173
```

The dev server runs on port 5173 as specified in the manifest.

### Build for production

```bash
npm run build
# Output in dist/
```

### Run tests

```bash
npm test
```

## Code Walkthrough

### 1. Hooks Architecture

**useCalendar** - Navigation and week state:
```typescript
const { currentWeek, nextWeek, previousWeek, goToToday } = useCalendar();
```

**useEvents** - Event management with subscriptions:
```typescript
const { events, createEvent, updateEvent, deleteEvent } = useEvents(
  weekStart,
  weekEnd
);
```

### 2. CSS Grid Layout

No manual calculations needed:

```css
.week-grid-content {
  display: grid;
  grid-template-columns: 80px repeat(7, 1fr);
}

.event-card {
  grid-row: 3 / span 2; /* Automatically positioned */
}
```

### 3. Event Positioning

Using simple math instead of complex layout engine:

```typescript
const top = (offsetMinutes / 60) * 60; // 60px per hour
const height = (duration / 60) * 60;
```

### 4. Real-time Updates

Subscriptions keep UI in sync:

```typescript
useEffect(() => {
  const unsubscribe = CalendarService.onEventCreated((event) => {
    setEvents(prev => [...prev, event]);
  });

  return unsubscribe;
}, []);
```

### 5. Integration with khal

The calendar service interfaces with WebShell's calendar API which integrates with khal:

```typescript
const events = await webshell.calendar.getEvents(start, end);
const created = await webshell.calendar.createEvent({ title, start, end });
```

## API Integration

The app uses the WebShell Calendar API:

- `webshell.calendar.getEvents(start, end)` - Fetch events
- `webshell.calendar.createEvent(event)` - Create event
- `webshell.calendar.updateEvent(id, updates)` - Update event
- `webshell.calendar.deleteEvent(id)` - Delete event
- `webshell.calendar.onEventCreated(callback)` - Subscribe to creations
- `webshell.calendar.onEventUpdated(callback)` - Subscribe to updates
- `webshell.calendar.onEventDeleted(callback)` - Subscribe to deletions

## Performance

Target metrics:
- ⚡ Load time: < 500ms
- ⚡ Scroll: 60 FPS
- ⚡ Event creation: < 100ms
- ⚡ Memory: < 150MB

## Customization

### Change visible hours

Edit `WeekView.tsx`:
```typescript
const startHour = 6;  // Start at 6 AM
const endHour = 22;   // End at 10 PM
```

### Change week start day

Edit `useCalendar.ts`:
```typescript
const start = startOfWeek(currentDate, { weekStartsOn: 0 }); // Sunday
```

### Custom event colors

When creating an event, specify a color:
```typescript
createEvent({
  title: 'Meeting',
  start: new Date(),
  end: new Date(),
  color: '#10b981', // Green
});
```

## Future Enhancements

Potential additions:
- [ ] Month view
- [ ] Drag-and-drop event editing
- [ ] Recurring events
- [ ] Event categories
- [ ] Search/filter events
- [ ] Multiple calendars
- [ ] Timezone support
- [ ] Import/export (.ics)
- [ ] Keyboard shortcuts
- [ ] Event reminders

## Development

### Running tests

```bash
npm test
```

### Linting

```bash
npm run lint
```

### Type checking

```bash
npm run build
```

## Architecture Notes

### Component Hierarchy

```
App
├── Header
│   └── Navigation controls
├── WeekView
│   ├── TimeColumn
│   └── DayColumn × 7
│       ├── EventCard × N
│       └── CurrentTimeLine
└── EventModal
```

### State Management

- **Calendar state**: Managed by `useCalendar` hook
- **Event state**: Managed by `useEvents` hook with real-time sync
- **Modal state**: Local to `App` component
- **Form state**: Local to `EventModal` component

### Data Flow

```
User Action → Hook → Service → WebShell API → khal
                ↓
           State Update → Re-render
```

## Comparison with QML

| Aspect | QML | React WebShell |
|--------|-----|----------------|
| Lines of code | ~3000 | ~1000 |
| Layout | Manual calculations | CSS Grid |
| State | Property bindings | React hooks |
| Hot reload | ✗ | ✓ |
| Developer tools | Limited | Chrome DevTools |
| Learning curve | Steep | Gentle |
| Ecosystem | Limited | Massive |

## Dependencies

- **React**: UI framework
- **date-fns**: Date manipulation
- **Vite**: Build tool
- **TypeScript**: Type safety

## License

Part of the WebShell project.
