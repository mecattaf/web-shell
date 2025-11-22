# WebShell SDK API Reference

Complete API documentation for the WebShell JavaScript SDK.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Core Concepts](#core-concepts)
3. [API Modules](#api-modules)
   - [Shell Module](#shell-module)
   - [Window Module](#window-module)
   - [Theme Module](#theme-module)
   - [Calendar Module](#calendar-module)
   - [Notifications Module](#notifications-module)
   - [Power Module](#power-module)
   - [System Module](#system-module)
   - [IPC Module](#ipc-module)
4. [Error Handling](#error-handling)
5. [TypeScript Support](#typescript-support)
6. [Examples](#examples)

---

## Getting Started

### Installation

The WebShell SDK is automatically available in WebShell applications via the global `webshell` object.

```typescript
// Access via global object
webshell.ready(() => {
  console.log('WebShell is ready!');
});
```

### Initialization

The SDK initializes automatically when your app loads. Use the `ready()` callback to execute code when initialization is complete:

```typescript
webshell.ready(() => {
  const appName = webshell.shell.app.getName();
  console.log(`Running app: ${appName}`);
});
```

---

## Core Concepts

### Modules

The SDK is organized into focused modules:
- **shell**: App lifecycle and inter-app communication
- **window**: Window management and appearance
- **theme**: Theme tokens and updates
- **calendar**: Calendar event management
- **notifications**: System notifications
- **power**: Battery and power management
- **system**: System information and resources
- **ipc**: Direct backend communication

### Async Operations

Most SDK operations are asynchronous and return Promises:

```typescript
const events = await webshell.calendar.eventsToday();
const batteryStatus = await webshell.power.getBatteryStatus();
```

### Event Handlers

Subscribe to events using `on*` methods that return unsubscribe functions:

```typescript
const unsubscribe = webshell.window.onResize((size) => {
  console.log('Window resized:', size);
});

// Later, to unsubscribe:
unsubscribe();
```

---

## API Modules

### Shell Module

**Access**: `webshell.shell`

Manages app lifecycle and inter-app communication.

#### App Control

Get information about the current app:

```typescript
// Get current app name
const name = webshell.shell.app.getName();

// Get app manifest
const manifest = webshell.shell.app.getManifest();

// Close current app
webshell.shell.app.close();

// Reload current app
webshell.shell.app.reload();
```

#### Inter-App Communication

Send messages between apps:

```typescript
// Send to specific app
await webshell.shell.sendMessage('todo-app', 'task.created', {
  title: 'New Task',
  dueDate: new Date()
});

// Broadcast to all apps
await webshell.shell.broadcast('theme.changed', { theme: 'dark' });

// Listen for messages
webshell.shell.onMessage((message) => {
  console.log('Received:', message);
});
```

#### App Registry

Manage other apps:

```typescript
// List all apps
const apps = await webshell.shell.listApps();

// Launch an app
await webshell.shell.launchApp('calendar');

// Close an app
await webshell.shell.closeApp('music');
```

---

### Window Module

**Access**: `webshell.window`

Control window size, position, and appearance.

#### Size Management

```typescript
// Get current size
const size = webshell.window.getSize();
console.log(size.width, size.height);

// Set size
webshell.window.setSize(800, 600);

// Listen for resize
webshell.window.onResize((size) => {
  console.log('New size:', size);
});
```

#### Position Management

```typescript
// Get position
const pos = webshell.window.getPosition();

// Set position
webshell.window.setPosition(100, 100);

// Center on screen
webshell.window.center();
```

#### Appearance

```typescript
// Enable blur effect
webshell.window.setBlur(true);

// Set opacity
webshell.window.setOpacity(0.95);

// Enable transparency
webshell.window.setTransparency(true);
```

#### Window State

```typescript
// Minimize
webshell.window.minimize();

// Maximize
webshell.window.maximize();

// Restore
webshell.window.restore();

// Focus
webshell.window.focus();
```

---

### Theme Module

**Access**: `webshell.theme`

Access current theme tokens and react to theme changes.

#### Get Theme Tokens

```typescript
// Get color tokens
const colors = webshell.theme.getColors();
console.log(colors.primary, colors.surface);

// Get spacing tokens
const spacing = webshell.theme.getSpacing();

// Get typography tokens
const typography = webshell.theme.getTypography();

// Get radius tokens
const radii = webshell.theme.getRadii();

// Get complete theme
const theme = webshell.theme.getTheme();
```

#### React to Theme Changes

```typescript
webshell.theme.onThemeChange((theme) => {
  console.log('Theme changed:', theme);
  // Update UI with new theme
});
```

#### Apply Theme

Automatically inject theme as CSS variables:

```typescript
webshell.theme.applyTheme();
```

---

### Calendar Module

**Access**: `webshell.calendar`

Manage calendar events.

#### Create Events

```typescript
const event = await webshell.calendar.createEvent({
  title: 'Team Meeting',
  start: new Date('2025-01-20T10:00:00'),
  end: new Date('2025-01-20T11:00:00'),
  description: 'Weekly team sync',
  color: '#FF5733'
});
```

#### Read Events

```typescript
// Get today's events
const todayEvents = await webshell.calendar.eventsToday();

// Get this week's events
const weekEvents = await webshell.calendar.eventsThisWeek();

// Get events in date range
const events = await webshell.calendar.listEvents(
  new Date('2025-01-01'),
  new Date('2025-01-31')
);

// Get specific event
const event = await webshell.calendar.getEvent('event-id');
```

#### Update Events

```typescript
await webshell.calendar.updateEvent('event-id', {
  title: 'Updated Meeting Title',
  start: new Date('2025-01-20T11:00:00')
});
```

#### Delete Events

```typescript
await webshell.calendar.deleteEvent('event-id');
```

#### Listen for Changes

```typescript
webshell.calendar.onEventCreated((event) => {
  console.log('New event:', event);
});

webshell.calendar.onEventUpdated((event) => {
  console.log('Event updated:', event);
});

webshell.calendar.onEventDeleted((eventId) => {
  console.log('Event deleted:', eventId);
});
```

---

### Notifications Module

**Access**: `webshell.notifications`

Send and manage system notifications.

#### Send Notifications

```typescript
const notificationId = await webshell.notifications.send({
  title: 'New Message',
  message: 'You have a new message from Alice',
  icon: '/icons/message.png',
  urgency: 'normal',
  timeout: 5000,
  actions: [
    { id: 'reply', label: 'Reply' },
    { id: 'dismiss', label: 'Dismiss' }
  ]
});
```

#### Update Notifications

```typescript
await webshell.notifications.update(notificationId, {
  title: 'Updated Message',
  message: 'Message content updated'
});
```

#### Close Notifications

```typescript
await webshell.notifications.close(notificationId);
```

#### Listen for Events

```typescript
webshell.notifications.onClicked((id) => {
  console.log('Notification clicked:', id);
});

webshell.notifications.onClosed((id) => {
  console.log('Notification closed:', id);
});

webshell.notifications.onActionClicked(({ notificationId, actionId }) => {
  console.log('Action clicked:', actionId);
});
```

---

### Power Module

**Access**: `webshell.power`

Monitor battery and control power actions.

#### Battery Status

```typescript
const battery = await webshell.power.getBatteryStatus();
console.log('Battery level:', battery.level);
console.log('Charging:', battery.charging);
console.log('Time to empty:', battery.timeToEmpty);
```

#### Listen for Battery Changes

```typescript
webshell.power.onBatteryChange((status) => {
  console.log('Battery changed:', status);
});
```

#### Power Actions

```typescript
// Shutdown
await webshell.power.shutdown();

// Restart
await webshell.power.restart();

// Suspend (sleep)
await webshell.power.suspend();

// Hibernate
await webshell.power.hibernate();
```

---

### System Module

**Access**: `webshell.system`

Access system information and resources.

#### System Information

```typescript
const info = await webshell.system.getInfo();
console.log('Platform:', info.platform);
console.log('OS Version:', info.osVersion);
console.log('CPU Count:', info.cpuCount);

const uptime = await webshell.system.getUptime();
console.log('Uptime:', uptime, 'seconds');
```

#### Resource Monitoring

```typescript
// CPU usage
const cpuUsage = await webshell.system.getCPUUsage();
console.log('CPU:', cpuUsage + '%');

// Memory usage
const memory = await webshell.system.getMemoryUsage();
console.log('Memory:', memory.usedPercent + '%');

// Disk usage
const disks = await webshell.system.getDiskUsage();
disks.forEach(disk => {
  console.log(disk.path, disk.usedPercent + '%');
});
```

#### Clipboard

```typescript
// Read from clipboard
const text = await webshell.system.clipboard.readText();

// Write to clipboard
await webshell.system.clipboard.writeText('Hello, World!');

// Clear clipboard
await webshell.system.clipboard.clear();
```

#### Execute Commands

```typescript
const result = await webshell.system.exec('ls', ['-la', '/tmp']);
console.log('Output:', result.stdout);
console.log('Exit code:', result.exitCode);
```

---

### IPC Module

**Access**: `webshell.ipc`

Direct communication with the Go backend for advanced use cases.

#### Call Backend Methods

```typescript
const result = await webshell.ipc.call('customMethod', {
  param1: 'value1',
  param2: 42
});
```

#### Send Messages

```typescript
await webshell.ipc.send('custom.event', { data: 'value' });
```

#### Subscribe to Events

```typescript
const unsubscribe = webshell.ipc.on('backend.event', (data) => {
  console.log('Backend event:', data);
});

// Later: unsubscribe()
```

#### Streaming

```typescript
const stream = webshell.ipc.stream('data-channel');

for await (const data of stream) {
  console.log('Stream data:', data);
}
```

---

## Error Handling

### WebShellError

All SDK errors extend `WebShellError`:

```typescript
import { WebShellError } from 'webshell-sdk';

try {
  await webshell.calendar.createEvent({ ... });
} catch (err) {
  if (err instanceof WebShellError) {
    console.error('Error code:', err.code);
    console.error('Message:', err.message);
    console.error('Details:', err.details);
  }
}
```

### Error Codes

Common error codes:
- `BRIDGE_NOT_INITIALIZED`: Bridge not ready
- `APP_NOT_FOUND`: App doesn't exist
- `CALENDAR_EVENT_NOT_FOUND`: Event not found
- `PERMISSION_DENIED`: Insufficient permissions
- See `WebShellErrorCode` enum for complete list

---

## TypeScript Support

The SDK is fully typed with TypeScript:

```typescript
import type {
  CalendarEvent,
  NotificationOptions,
  BatteryStatus,
  Theme
} from 'webshell-sdk';

// All APIs are fully typed
const events: CalendarEvent[] = await webshell.calendar.eventsToday();
const theme: Theme = webshell.theme.getTheme();
```

---

## Examples

### Complete App Example

```typescript
import { webshell, WebShellError } from 'webshell-sdk';

// Wait for SDK to be ready
webshell.ready(async () => {
  try {
    // Get app info
    const appName = webshell.shell.app.getName();
    console.log(`Starting ${appName}`);

    // Apply theme
    webshell.theme.applyTheme();

    // Listen for theme changes
    webshell.theme.onThemeChange((theme) => {
      document.body.style.backgroundColor = theme.colors.surface;
    });

    // Get today's events
    const events = await webshell.calendar.eventsToday();
    console.log(`You have ${events.length} events today`);

    // Show notification
    await webshell.notifications.send({
      title: 'App Started',
      message: `${appName} is ready!`,
      urgency: 'low'
    });

    // Listen for window resize
    webshell.window.onResize((size) => {
      console.log('Window size:', size);
    });

  } catch (err) {
    if (err instanceof WebShellError) {
      console.error('WebShell error:', err.code, err.message);
    }
  }
});
```

### React Integration

```typescript
import { useEffect, useState } from 'react';
import { webshell } from 'webshell-sdk';

function useTheme() {
  const [theme, setTheme] = useState(webshell.theme.getTheme());

  useEffect(() => {
    const unsubscribe = webshell.theme.onThemeChange(setTheme);
    return unsubscribe;
  }, []);

  return theme;
}

function useCalendarEvents() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    webshell.calendar.eventsToday().then(setEvents);

    const unsubscribe = webshell.calendar.onEventCreated((event) => {
      setEvents(prev => [...prev, event]);
    });

    return unsubscribe;
  }, []);

  return events;
}
```

---

## Additional Resources

- [WebShell Architecture](./ARCHITECTURE.md)
- [App Development Guide](./app-development.md)
- [Manifest Format](./manifest-format.md)
- [Bridge Implementation](../src/bridge/README.md)
