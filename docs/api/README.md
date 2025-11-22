# WebShell SDK API Overview

 

Complete API reference for building WebShell applications with the JavaScript SDK.

 

## Introduction

 

The WebShell SDK provides a comprehensive JavaScript API for building native-like applications within the WebShell environment. All APIs are accessible via the global `webshell` object and are organized into focused modules for different capabilities.

 

## Quick Start

 

```typescript

// Wait for SDK to be ready

webshell.ready(() => {

  // Apply theme

  webshell.theme.applyTheme();

 

  // Get today's calendar events

  webshell.calendar.eventsToday().then(events => {

    console.log(`You have ${events.length} events today`);

  });

 

  // Listen for window resize

  webshell.window.onResize((size) => {

    console.log('Window resized:', size.width, size.height);

  });

 

  // Send a notification

  webshell.notifications.send({

    title: 'App Started',

    message: 'Welcome to WebShell!',

    urgency: 'low'

  });

});

```

 

## SDK Modules

 

### Core Modules

 

#### [Shell Module](./shell.md)

App lifecycle and inter-app communication.

 

**Key Features:**

- App control (launch, close, reload)

- Inter-app messaging and broadcasting

- App registry access

- Current app information

 

**Common Use Cases:**

- Launch other applications

- Send messages between apps

- Coordinate app behavior

- Get app manifest data

 

```typescript

// Launch another app

await webshell.shell.launchApp('calendar');

 

// Send message to another app

await webshell.shell.sendMessage('todo-app', 'task.created', {

  title: 'New Task',

  dueDate: new Date()

});

 

// Listen for messages

webshell.shell.onMessage((message) => {

  console.log('Received:', message.type, message.data);

});

```

 

---

 

#### [Window Module](./window.md)

Window management and appearance control.

 

**Key Features:**

- Size and position management

- Window state control (minimize, maximize, focus)

- Visual effects (blur, transparency, opacity)

- Resize and move events

 

**Common Use Cases:**

- Responsive window sizing

- Custom window positioning

- Glassmorphism effects

- Window state management

 

```typescript

// Set window size

webshell.window.setSize(800, 600);

 

// Center window on screen

webshell.window.center();

 

// Enable blur effect for glassmorphism

webshell.window.setBlur(true);

webshell.window.setOpacity(0.95);

 

// Listen for resize

webshell.window.onResize((size) => {

  // Update UI layout

});

```

 

---

 

#### [Theme Module](./theme.md)

Design token system and theme management.

 

**Key Features:**

- Color, spacing, typography, and radius tokens

- Real-time theme change notifications

- Automatic CSS variable injection

- Material Design-inspired semantic colors

 

**Common Use Cases:**

- Apply consistent theming

- React to theme changes

- Access design tokens

- Dark/light mode support

 

```typescript

// Get current theme

const theme = webshell.theme.getTheme();

 

// Apply theme as CSS variables

webshell.theme.applyTheme();

 

// Listen for theme changes

webshell.theme.onThemeChange((newTheme) => {

  // Update UI with new theme

  updateStyles(newTheme);

});

 

// Access specific tokens

const primaryColor = webshell.theme.colors.primary;

const spacing = webshell.theme.spacing.md;

```

 

---

 

### Data & Services Modules

 

#### [Calendar Module](./calendar.md)

Calendar event management and scheduling.

 

**Key Features:**

- Create, read, update, delete events

- Date range queries (today, this week, this month)

- Event change notifications

- All-day and timed events

- Attendees and reminders

 

**Common Use Cases:**

- Calendar widgets

- Event scheduling

- Reminder notifications

- Agenda views

 

```typescript

// Get today's events

const events = await webshell.calendar.eventsToday();

 

// Create a new event

await webshell.calendar.createEvent({

  title: 'Team Meeting',

  start: new Date('2025-01-20T10:00:00'),

  end: new Date('2025-01-20T11:00:00'),

  location: 'Conference Room A',

  attendees: ['alice@example.com', 'bob@example.com']

});

 

// Listen for new events

webshell.calendar.onEventCreated((event) => {

  console.log('New event:', event.title);

});

```

 

---

 

#### [Notifications Module](./notifications.md)

System notification management.

 

**Key Features:**

- Send system notifications

- Update and close notifications

- Action buttons

- Urgency levels

- Click and close event handlers

 

**Common Use Cases:**

- Event reminders

- Status updates

- User alerts

- Interactive notifications

 

```typescript

// Send a notification

const id = await webshell.notifications.send({

  title: 'New Message',

  message: 'You have a new message from Alice',

  icon: '/icons/message.png',

  urgency: 'normal',

  actions: [

    { id: 'reply', label: 'Reply' },

    { id: 'dismiss', label: 'Dismiss' }

  ]

});

 

// Handle notification clicks

webshell.notifications.onActionClicked(({ notificationId, actionId }) => {

  if (actionId === 'reply') {

    openReplyDialog();

  }

});

```

 

---

 

### System Modules

 

#### [Power Module](./power.md)

Battery and power management.

 

**Key Features:**

- Battery status monitoring

- Charging state detection

- Power actions (shutdown, restart, suspend, hibernate)

- Battery level and time estimates

- Real-time battery change events

 

**Common Use Cases:**

- Battery indicators

- Power management

- Low battery warnings

- System power control

 

```typescript

// Get battery status

const battery = await webshell.power.getBatteryStatus();

console.log(`Battery: ${battery.level}%`);

console.log(`Charging: ${battery.charging}`);

console.log(`Time remaining: ${battery.timeToEmpty} minutes`);

 

// Monitor battery changes

webshell.power.onBatteryChange((status) => {

  if (status.level < 20 && !status.charging) {

    showLowBatteryWarning();

  }

});

 

// System power control

await webshell.power.suspend(); // Sleep

```

 

---

 

#### [System Module](./system.md)

System information and resources.

 

**Key Features:**

- System information (platform, OS, CPU)

- Resource monitoring (CPU, memory, disk)

- Clipboard operations

- Command execution

- System uptime

 

**Common Use Cases:**

- System monitors

- Resource dashboards

- Clipboard managers

- Task automation

 

```typescript

// Get system info

const info = await webshell.system.getInfo();

console.log(`Platform: ${info.platform}`);

console.log(`OS: ${info.osVersion}`);

 

// Monitor resources

const cpuUsage = await webshell.system.getCPUUsage();

const memory = await webshell.system.getMemoryUsage();

console.log(`CPU: ${cpuUsage}%`);

console.log(`Memory: ${memory.usedPercent}%`);

 

// Clipboard operations

await webshell.system.clipboard.writeText('Hello, World!');

const text = await webshell.system.clipboard.readText();

```

 

---

 

### Advanced Module

 

#### IPC Module

Low-level backend communication for advanced use cases.

 

**Key Features:**

- Direct backend method calls

- Custom event streams

- Raw message passing

- Backend event subscriptions

 

**Common Use Cases:**

- Custom backend integration

- Advanced system features

- Plugin development

- Performance-critical operations

 

```typescript

// Call custom backend method

const result = await webshell.ipc.call('customMethod', {

  param1: 'value1',

  param2: 42

});

 

// Subscribe to backend events

webshell.ipc.on('backend.event', (data) => {

  console.log('Backend event:', data);

});

 

// Stream data from backend

const stream = webshell.ipc.stream('data-channel');

for await (const data of stream) {

  console.log('Stream data:', data);

}

```

 

---

 

## Common Types

 

### CalendarEvent

```typescript

interface CalendarEvent {

  id: string;

  title: string;

  start: Date;

  end: Date;

  allDay?: boolean;

  description?: string;

  location?: string;

  color?: string;

  attendees?: string[];

  reminders?: number[];

  created: Date;

  updated: Date;

}

```

 

### Theme

```typescript

interface Theme {

  colors: ColorTokens;

  spacing: SpacingTokens;

  typography: TypographyTokens;

  radii: RadiusTokens;

}

 

interface ColorTokens {

  primary: string;

  onPrimary: string;

  surface: string;

  onSurface: string;

  background: string;

  onBackground: string;

  error: string;

  // ... more colors

}

```

 

### NotificationOptions

```typescript

interface NotificationOptions {

  title: string;

  message: string;

  icon?: string;

  urgency?: 'low' | 'normal' | 'critical';

  timeout?: number;

  actions?: Array<{

    id: string;

    label: string;

  }>;

}

```

 

### BatteryStatus

```typescript

interface BatteryStatus {

  level: number;        // 0-100

  charging: boolean;

  timeToEmpty?: number; // minutes

  timeToFull?: number;  // minutes

}

```

 

### WindowSize

```typescript

interface WindowSize {

  width: number;

  height: number;

}

 

interface WindowPosition {

  x: number;

  y: number;

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

 

### Common Error Codes

 

- `BRIDGE_NOT_INITIALIZED`: SDK not ready (use `webshell.ready()`)

- `APP_NOT_FOUND`: Specified app doesn't exist

- `CALENDAR_EVENT_NOT_FOUND`: Calendar event not found

- `CALENDAR_INVALID_DATE`: Invalid date or date range

- `PERMISSION_DENIED`: Insufficient permissions

- `NETWORK_ERROR`: Network request failed

- `INVALID_ARGUMENT`: Invalid function argument

 

### Error Handling Best Practices

 

```typescript

// Always wrap async operations in try-catch

try {

  const events = await webshell.calendar.eventsToday();

  displayEvents(events);

} catch (err) {

  if (err instanceof WebShellError) {

    switch (err.code) {

      case 'PERMISSION_DENIED':

        showPermissionDialog();

        break;

      case 'CALENDAR_EVENT_NOT_FOUND':

        showNotFoundMessage();

        break;

      default:

        showGenericError(err.message);

    }

  }

}

```

 

---

 

## Permission System

 

### Declaring Permissions

 

Apps must declare required permissions in `webshell.json`:

 

```json

{

  "name": "my-app",

  "permissions": {

    "calendar": {

      "read": true,

      "write": true

    },

    "notifications": {

      "send": true

    },

    "system": {

      "read": true

    }

  }

}

```

 

### Permission Levels

 

#### Calendar Permissions

- `calendar.read`: Read calendar events

- `calendar.write`: Create and update events

- `calendar.delete`: Delete events

 

#### System Permissions

- `system.read`: Read system information and resources

- `power.read`: Read battery status

- `power.control`: Execute power actions

 

#### Clipboard Permissions

- `clipboard.read`: Read clipboard contents

- `clipboard.write`: Write to clipboard

 

#### Process Permissions

- `process.spawn`: Execute system commands (with allowed list)

 

See the [Permissions Guide](../permissions-guide.md) for complete details.

 

---

 

## Framework Integration

 

### React

 

```typescript

import { useEffect, useState } from 'react';

import { webshell } from 'webshell-sdk';

 

// Custom hook for theme

function useTheme() {

  const [theme, setTheme] = useState(webshell.theme.getTheme());

 

  useEffect(() => {

    const unsubscribe = webshell.theme.onThemeChange(setTheme);

    return unsubscribe;

  }, []);

 

  return theme;

}

 

// Custom hook for calendar events

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

 

// Component usage

function MyApp() {

  const theme = useTheme();

  const events = useCalendarEvents();

 

  return (

    <div style={{ backgroundColor: theme.colors.surface }}>

      <h1>Today's Events: {events.length}</h1>

      {events.map(event => (

        <div key={event.id}>{event.title}</div>

      ))}

    </div>

  );

}

```

 

### Vue

 

```typescript

import { ref, onMounted, onUnmounted } from 'vue';

import { webshell } from 'webshell-sdk';

 

// Composable for theme

export function useTheme() {

  const theme = ref(webshell.theme.getTheme());

  let unsubscribe;

 

  onMounted(() => {

    unsubscribe = webshell.theme.onThemeChange((newTheme) => {

      theme.value = newTheme;

    });

  });

 

  onUnmounted(() => {

    if (unsubscribe) unsubscribe();

  });

 

  return { theme };

}

 

// Component

<template>

  <div :style="{ backgroundColor: theme.colors.surface }">

    <h1>Events: {{ events.length }}</h1>

  </div>

</template>

 

<script setup>

const { theme } = useTheme();

const events = ref([]);

 

onMounted(async () => {

  events.value = await webshell.calendar.eventsToday();

});

</script>

```

 

### Svelte

 

```typescript

// store.js

import { writable } from 'svelte/store';

import { webshell } from 'webshell-sdk';

 

export const theme = writable(webshell.theme.getTheme());

 

webshell.theme.onThemeChange((newTheme) => {

  theme.set(newTheme);

});

 

// Component.svelte

<script>

  import { theme } from './store';

  import { onMount } from 'svelte';

 

  let events = [];

 

  onMount(async () => {

    events = await webshell.calendar.eventsToday();

  });

</script>

 

<div style="background-color: {$theme.colors.surface}">

  <h1>Events: {events.length}</h1>

</div>

```

 

---

 

## TypeScript Support

 

The SDK is fully typed with TypeScript definitions:

 

```typescript

import type {

  CalendarEvent,

  NotificationOptions,

  BatteryStatus,

  Theme,

  WindowSize,

  AppMessage

} from 'webshell-sdk';

 

// All APIs are fully typed

const events: CalendarEvent[] = await webshell.calendar.eventsToday();

const theme: Theme = webshell.theme.getTheme();

const battery: BatteryStatus = await webshell.power.getBatteryStatus();

```

 

### Type Imports

 

```typescript

// Import types from the SDK

import type {

  // Calendar types

  CalendarEvent,

  CreateEventInput,

  UpdateEventInput,

 

  // Theme types

  Theme,

  ColorTokens,

  SpacingTokens,

  TypographyTokens,

  RadiusTokens,

 

  // Notification types

  NotificationOptions,

 

  // Power types

  BatteryStatus,

 

  // System types

  SystemInfo,

  MemoryUsage,

  DiskUsage,

 

  // Common types

  UnsubscribeFn,

  EventHandler

} from 'webshell-sdk';

```

 

---

 

## Complete Example

 

Here's a complete example demonstrating multiple modules:

 

```typescript

import { webshell, WebShellError } from 'webshell-sdk';

 

// Wait for SDK to be ready

webshell.ready(async () => {

  try {

    // Get app info

    const appName = webshell.shell.app.getName();

    console.log(`Starting ${appName}`);

 

    // Apply theme and listen for changes

    webshell.theme.applyTheme();

    webshell.theme.onThemeChange((theme) => {

      document.body.style.backgroundColor = theme.colors.background;

    });

 

    // Set up window

    webshell.window.setSize(800, 600);

    webshell.window.center();

    webshell.window.setBlur(true);

 

    // Get today's events

    const events = await webshell.calendar.eventsToday();

    console.log(`You have ${events.length} events today`);

 

    // Display events

    const container = document.getElementById('events');

    events.forEach(event => {

      const div = document.createElement('div');

      div.textContent = `${event.title} at ${event.start.toLocaleTimeString()}`;

      container.appendChild(div);

    });

 

    // Send startup notification

    await webshell.notifications.send({

      title: `${appName} Started`,

      message: `You have ${events.length} events today`,

      urgency: 'low'

    });

 

    // Monitor battery

    webshell.power.onBatteryChange((battery) => {

      if (battery.level < 20 && !battery.charging) {

        webshell.notifications.send({

          title: 'Low Battery',

          message: `${battery.level}% remaining`,

          urgency: 'critical'

        });

      }

    });

 

    // Listen for inter-app messages

    webshell.shell.onMessage((message) => {

      console.log('Received message:', message);

      if (message.type === 'refresh') {

        location.reload();

      }

    });

 

    // Handle window resize

    webshell.window.onResize((size) => {

      console.log('Window resized:', size.width, size.height);

    });

 

  } catch (err) {

    if (err instanceof WebShellError) {

      console.error('WebShell error:', err.code, err.message);

 

      if (err.code === 'PERMISSION_DENIED') {

        showPermissionError();

      }

    } else {

      console.error('Unexpected error:', err);

    }

  }

});

 

// Cleanup on unload

window.addEventListener('beforeunload', () => {

  console.log('App closing - saving state...');

  localStorage.setItem('lastRun', new Date().toISOString());

});

```

 

---

 

## Module Links

 

- [Shell Module](./shell.md) - App lifecycle and inter-app communication

- [Window Module](./window.md) - Window management and appearance

- [Theme Module](./theme.md) - Design tokens and theming

- [Calendar Module](./calendar.md) - Calendar event management

- [Notifications Module](./notifications.md) - System notifications

- [Power Module](./power.md) - Battery and power management

- [System Module](./system.md) - System information and resources

 

## Related Documentation

 

- [Getting Started Guide](../getting-started-sdk.md) - Build your first app

- [Concepts & Architecture](../concepts.md) - Understand WebShell architecture

- [Permissions Guide](../permissions-guide.md) - Permission system details

- [Manifest Reference](../manifest-reference.md) - App manifest specification

- [Theming Guide](../theming.md) - Theme customization

- [SDK API Reference](../sdk-api-reference.md) - Complete API reference

 
