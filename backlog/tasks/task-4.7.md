---
id: task-4.7
title: Create example apps and production calendar
status: Done
created_date: 2025-01-19
milestone: milestone-4
assignees: []
labels: [examples, documentation, production-app]
dependencies: [task-4.6]
---

## Description

Build **four complete applications**: three example apps that demonstrate WebShell SDK usage patterns, plus **one production-ready calendar app** that serves as both a flagship showcase and a replacement for the existing QML calendar.

**Key Distinction**: The calendar is NOT just an example—it's a real, production-quality app that proves WebShell can build complex UIs better than QML.

## Acceptance Criteria

**Example Apps (Templates)**:
- [ ] "Hello World" - minimal viable app
- [ ] "System Monitor" - dashboard using system/power services
- [ ] "Note Taker" - simple CRUD app with persistence

**Production App**:
- [ ] **Calendar** - full-featured calendar replacing QML version
  - [ ] Feature parity with existing QML calendar
  - [ ] All CRUD operations working
  - [ ] Better UX than QML version
  - [ ] Performance acceptable (smooth scrolling, no lag)
  - [ ] Uses design tokens for theming
  - [ ] Production-ready code quality

**All Apps**:
- [ ] Complete webshell.json manifest
- [ ] TypeScript implementation
- [ ] Styled with design tokens
- [ ] README with setup instructions
- [ ] Work in both dev and production mode

## Implementation Plan

### 1. Hello World Example (Template)
   
**Purpose**: Absolute minimum WebShell app
   
**Features**:
- Single HTML file
- Display app name from manifest
- Show current theme color
- One button that sends notification
- Demonstrates: basic SDK setup, theme access, notifications
   
**Structure**:
```
examples/hello-world/
├── webshell.json
├── index.html
├── main.ts
└── README.md
```

**Implementation**:
```typescript
// main.ts
import { webshell } from 'webshell-sdk';

webshell.ready(() => {
  document.getElementById('app-name')!.textContent = 
    webshell.shell.app.getName();
  
  document.getElementById('notify-btn')!.addEventListener('click', async () => {
    await webshell.notifications.send({
      title: 'Hello from WebShell!',
      message: 'Your first notification'
    });
  });
  
  // Show current primary color
  const primary = document.documentElement.style.getPropertyValue('--color-primary');
  document.getElementById('theme-color')!.textContent = primary;
});
```

### 2. System Monitor Example (Template)
   
**Purpose**: Dashboard showing system resources
   
**Features**:
- Svelte + TypeScript
- Display CPU, memory, disk usage
- Battery status with charging indicator
- Real-time updates via subscriptions
- Clipboard operations demo
- Demonstrates: system service, power service, subscriptions, real-time data
   
**Structure**:
```
examples/system-monitor/
├── webshell.json
├── package.json
├── vite.config.ts
├── src/
│   ├── main.ts
│   ├── App.svelte
│   └── components/
│       ├── CPUGauge.svelte
│       ├── MemoryChart.svelte
│       ├── BatteryIndicator.svelte
│       └── ClipboardMonitor.svelte
└── README.md
```

### 3. Note Taker Example (Template)

**Purpose**: Simple CRUD app with local storage

**Features**:
- React + TypeScript
- Create/read/update/delete notes
- Local storage persistence
- Search/filter notes
- Markdown preview
- Demonstrates: IPC for persistence, forms, state management

**Structure**:
```
examples/note-taker/
├── webshell.json
├── package.json
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── components/
│   │   ├── NoteList.tsx
│   │   ├── NoteEditor.tsx
│   │   └── MarkdownPreview.tsx
│   └── services/
│       └── notes.ts
└── README.md
```

### 4. **Production Calendar App** (Flagship)

**Purpose**: Production-quality calendar that replaces the QML implementation and proves WebShell superiority.

**Why This Matters**: Your original investigation showed the QML calendar was thousands of lines with manual layout calculations. This React version should be cleaner, more maintainable, and demonstrate why web tech is better for complex UIs.

**Features** (Full Feature Parity):
- Weekly calendar view (like current QML)
- Month view (optional enhancement)
- Event CRUD operations
- All-day events
- Event colors
- Time slots (configurable start/end hours)
- Current time indicator
- Scroll to first event
- Integration with khal/vdirsyncer
- Notifications for upcoming events
- Drag-and-drop event editing (enhancement)
- Keyboard shortcuts
- Blur background
- Responsive sizing

**Structure**:
```
apps/calendar/
├── webshell.json
├── package.json
├── vite.config.ts
├── tsconfig.json
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── components/
│   │   ├── WeekView/
│   │   │   ├── WeekView.tsx
│   │   │   ├── TimeColumn.tsx
│   │   │   ├── DayColumn.tsx
│   │   │   ├── EventCard.tsx
│   │   │   └── CurrentTimeLine.tsx
│   │   ├── MonthView/
│   │   │   └── MonthView.tsx
│   │   ├── EventModal/
│   │   │   ├── EventModal.tsx
│   │   │   └── EventForm.tsx
│   │   └── Header/
│   │       ├── Header.tsx
│   │       └── ViewSwitcher.tsx
│   ├── hooks/
│   │   ├── useCalendar.ts
│   │   ├── useEvents.ts
│   │   └── useTheme.ts
│   ├── services/
│   │   └── calendar.ts
│   ├── types/
│   │   └── calendar.ts
│   └── styles/
│       └── calendar.css
├── docs/
│   ├── ARCHITECTURE.md
│   └── MIGRATION.md
└── README.md
```

**Implementation Highlights**:

**Key Component: WeekView.tsx**
```tsx
import { useCalendar, useEvents } from '../hooks';
import { TimeColumn, DayColumn, CurrentTimeLine } from './';

export function WeekView() {
  const { currentWeek, nextWeek, previousWeek } = useCalendar();
  const { events, createEvent, updateEvent, deleteEvent } = useEvents();
  
  return (
    <div className="week-view">
      <header className="week-header">
        <h2>{currentWeek.format('MMMM YYYY')}</h2>
        <div className="week-controls">
          <button onClick={previousWeek}>←</button>
          <button onClick={() => setCurrentWeek(new Date())}>Today</button>
          <button onClick={nextWeek}>→</button>
        </div>
      </header>
      
      <div className="week-grid">
        <TimeColumn startHour={7} endHour={20} />
        
        {currentWeek.days.map((day, index) => (
          <DayColumn
            key={day.toISOString()}
            date={day}
            events={events.filter(e => isSameDay(e.start, day))}
            onCreateEvent={createEvent}
          />
        ))}
        
        <CurrentTimeLine />
      </div>
    </div>
  );
}
```

**Why This is Better Than QML**:

1. **CSS Grid for Layout** (vs manual pixel calculations):
```css
.week-grid {
  display: grid;
  grid-template-columns: 80px repeat(7, 1fr);
  grid-template-rows: auto 1fr;
  gap: var(--space-s);
}

.day-column {
  display: grid;
  grid-auto-rows: 60px; /* Each hour */
}
```

2. **Event Positioning** (vs manual overlap logic):
```tsx
function EventCard({ event }: { event: CalendarEvent }) {
  const startMinutes = getMinutesSinceMidnight(event.start);
  const duration = getDurationMinutes(event.start, event.end);
  
  return (
    <div 
      className="event-card"
      style={{
        gridRow: `${Math.floor(startMinutes / 60) + 1} / span ${Math.ceil(duration / 60)}`,
        backgroundColor: event.color
      }}
    >
      <div className="event-title">{event.title}</div>
      <div className="event-time">
        {formatTime(event.start)} - {formatTime(event.end)}
      </div>
    </div>
  );
}
```

3. **State Management** (vs QML property bindings):
```typescript
// hooks/useEvents.ts
import { webshell } from 'webshell-sdk';
import { useState, useEffect } from 'react';

export function useEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadEvents();
    
    // Subscribe to changes
    const unsubscribe = webshell.calendar.onEventCreated((event) => {
      setEvents(prev => [...prev, event]);
    });
    
    return unsubscribe;
  }, []);
  
  const createEvent = async (event: CreateEventInput) => {
    const created = await webshell.calendar.createEvent(event);
    setEvents(prev => [...prev, created]);
    return created;
  };
  
  return { events, loading, createEvent, updateEvent, deleteEvent };
}
```

**Manifest**:
```json
{
  "version": "1.0.0",
  "name": "calendar",
  "displayName": "Calendar",
  "description": "Production calendar with khal integration",
  "entrypoint": "index.html",
  "icon": "calendar.svg",
  
  "permissions": {
    "calendar": {
      "read": true,
      "write": true,
      "delete": true
    },
    "notifications": {
      "send": true
    }
  },
  
  "window": {
    "type": "widget",
    "width": 1200,
    "height": 800,
    "minWidth": 800,
    "minHeight": 600,
    "blur": true,
    "transparency": true,
    "position": "center"
  },
  
  "devServer": "http://localhost:5173"
}
```

**Performance Targets**:
- Load time: < 500ms
- Scroll: 60 FPS
- Event creation: < 100ms
- Memory: < 150MB

**Code Quality Standards**:
- TypeScript strict mode
- ESLint + Prettier
- Unit tests (Vitest)
- E2E tests (Playwright)
- Documentation
- No console errors
- Accessibility (ARIA labels, keyboard nav)

**Documentation**:

**File**: `apps/calendar/docs/ARCHITECTURE.md`
```markdown
# Calendar Architecture

## Why Web Over QML?

The original QML calendar required:
- Thousands of lines of code
- Manual pixel calculations
- Custom layout engine
- Complex overlap logic
- Repetitive Repeater patterns

This React version uses:
- CSS Grid for layout (automatic)
- React hooks for state (automatic)
- Standard event handling (automatic)
- Libraries for date math (day.js)
- Hot reload (instant iteration)

## Component Structure

```
WeekView (container)
├── TimeColumn (hour labels)
├── DayColumn × 7 (one per day)
│   └── EventCard × N (events for that day)
└── CurrentTimeLine (animated)
```

## State Flow

```
User Action → Hook → SDK → Go Backend → khal
                ↓
           State Update → Re-render
```

## Performance

- Virtual scrolling for large event lists
- Memoized components
- Debounced search/filter
- Lazy loading of month data
```

**Migration Guide**:

**File**: `apps/calendar/docs/MIGRATION.md`
```markdown
# Migrating from QML Calendar

## Feature Comparison

| Feature | QML | React WebShell | Status |
|---------|-----|----------------|--------|
| Weekly view | ✓ | ✓ | ✓ Parity |
| Event CRUD | ✓ | ✓ | ✓ Parity |
| khal integration | ✓ | ✓ | ✓ Parity |
| All-day events | ✓ | ✓ | ✓ Parity |
| Drag-to-edit | ✗ | ✓ | ✓ Enhanced |
| Keyboard shortcuts | ✗ | ✓ | ✓ Enhanced |
| Month view | ✗ | ✓ | ✓ Enhanced |

## Setup

1. Install dependencies:
```bash
cd apps/calendar
npm install
```

2. Run in dev mode:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Configuration

Calendar settings in `~/.config/webshell/calendar.json`:
```json
{
  "startHour": 7,
  "endHour": 20,
  "firstDayOfWeek": 1,
  "defaultView": "week"
}
```
```

### 5. Shared Setup for All Apps

**Common package.json scripts**:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext ts,tsx",
    "test": "vitest"
  }
}
```

**Common dependencies**:
```json
{
  "dependencies": {
    "webshell-sdk": "^1.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0"
  }
}
```

## Technical Notes

**Template Apps**:
- Should be copy-paste ready
- Minimal dependencies
- Well-commented code
- Cover different SDK modules

**Production Calendar**:
- Must be feature-complete
- Must be performant
- Must look professional
- Code should be exemplary

**Testing Strategy**:
- Example apps: manual testing only
- Production calendar: full test suite

**Distribution**:
- Examples: in SDK repo under `examples/`
- Calendar: separate app in `apps/calendar/`

## Reference Material

Study calendar implementations:
- FullCalendar.io (React component)
- Google Calendar (UX patterns)
- Your existing QML calendar (features to replicate)

## Definition of Done

**Example Apps**:
- All three examples functional
- Each example documented
- Work in dev and prod mode
- Can be used as templates

**Production Calendar**:
- Feature parity with QML version achieved
- Performance targets met
- Tests passing
- Documentation complete
- Can replace QML calendar in production

**Overall**:
- All manifests valid
- All apps use TypeScript
- All apps use design tokens
- Git commit: "task-4.7: Create example apps and production calendar"
```
