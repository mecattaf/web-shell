---
id: task-4.1
title: Design SDK API surface
status: Done
created_date: 2025-01-18
completed_date: 2025-11-19
milestone: milestone-4
assignees: []
labels: [api-design, sdk]
---

## Description

Design the complete JavaScript SDK API surface that web developers will use to interact with WebShell. This defines the developer experience and must be intuitive, type-safe, and comprehensive.

## Acceptance Criteria

- [x] Complete API surface designed
- [x] API organized into logical modules
- [x] TypeScript definitions created
- [x] API follows web standards where possible
- [x] Error handling patterns defined
- [x] Documentation outline created

## Implementation Plan

1. **Core API Structure**
````typescript
// WebShell SDK API Design

declare namespace webshell {
  // Version info
  const version: string;
  
  // Core modules
  const shell: ShellModule;
  const window: WindowModule;
  const theme: ThemeModule;
  const calendar: CalendarModule;
  const notifications: NotificationModule;
  const power: PowerModule;
  const system: SystemModule;
  const ipc: IPCModule;
  
  // Lifecycle
  function ready(callback: () => void): void;
  function onMessage(handler: MessageHandler): void;
}
````

2. **Shell Module**
````typescript
interface ShellModule {
  // App management
  app: {
    getName(): string;
    getManifest(): Manifest;
    close(): void;
    reload(): void;
  };
  
  // Inter-app communication
  sendMessage(target: string, type: string, data: any): Promise<void>;
  broadcast(type: string, data: any): Promise<void>;
  onMessage(handler: (msg: AppMessage) => void): void;
  
  // Apps registry
  listApps(): Promise<AppInfo[]>;
  launchApp(name: string): Promise<void>;
  closeApp(name: string): Promise<void>;
}
````

3. **Window Module**
````typescript
interface WindowModule {
  // Size
  getSize(): { width: number; height: number };
  setSize(width: number, height: number): void;
  resize(width: number, height: number): void;
  
  // Position
  getPosition(): { x: number; y: number };
  setPosition(x: number, y: number): void;
  center(): void;
  
  // Appearance
  setBlur(enabled: boolean): void;
  setOpacity(opacity: number): void;
  setTransparency(enabled: boolean): void;
  
  // State
  minimize(): void;
  maximize(): void;
  restore(): void;
  focus(): void;
  
  // Events
  onResize(handler: (size: WindowSize) => void): void;
  onMove(handler: (pos: WindowPosition) => void): void;
  onFocus(handler: () => void): void;
  onBlur(handler: () => void): void;
}
````

4. **Theme Module**
````typescript
interface ThemeModule {
  // Current theme
  getColors(): ColorTokens;
  getSpacing(): SpacingTokens;
  getTypography(): TypographyTokens;
  getRadii(): RadiusTokens;
  
  // Updates
  onThemeChange(handler: (theme: Theme) => void): void;
  
  // Apply theme
  applyTheme(): void;
  
  // Current values
  colors: ColorTokens;
  spacing: SpacingTokens;
  typography: TypographyTokens;
}

interface ColorTokens {
  surface: string;
  surfaceHigh: string;
  primary: string;
  onPrimary: string;
  secondary: string;
  onSecondary: string;
  // ... etc
}
````

5. **Calendar Module**
````typescript
interface CalendarModule {
  // Events
  listEvents(start: Date, end: Date): Promise<CalendarEvent[]>;
  getEvent(id: string): Promise<CalendarEvent>;
  createEvent(event: CreateEventInput): Promise<CalendarEvent>;
  updateEvent(id: string, updates: UpdateEventInput): Promise<CalendarEvent>;
  deleteEvent(id: string): Promise<void>;
  
  // Queries
  eventsToday(): Promise<CalendarEvent[]>;
  eventsThisWeek(): Promise<CalendarEvent[]>;
  eventsThisMonth(): Promise<CalendarEvent[]>;
  
  // Changes
  onEventCreated(handler: (event: CalendarEvent) => void): void;
  onEventUpdated(handler: (event: CalendarEvent) => void): void;
  onEventDeleted(handler: (id: string) => void): void;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  description?: string;
  color?: string;
}
````

6. **Notification Module**
````typescript
interface NotificationModule {
  // Send notifications
  send(notification: NotificationOptions): Promise<string>;
  update(id: string, updates: NotificationOptions): Promise<void>;
  close(id: string): Promise<void>;
  
  // Events
  onClicked(handler: (id: string) => void): void;
  onClosed(handler: (id: string) => void): void;
}

interface NotificationOptions {
  title: string;
  message: string;
  icon?: string;
  urgency?: 'low' | 'normal' | 'critical';
  timeout?: number;
  actions?: NotificationAction[];
}
````

7. **Power Module**
````typescript
interface PowerModule {
  // Battery
  getBatteryStatus(): Promise<BatteryStatus>;
  onBatteryChange(handler: (status: BatteryStatus) => void): void;
  
  // Power actions
  shutdown(): Promise<void>;
  restart(): Promise<void>;
  suspend(): Promise<void>;
  hibernate(): Promise<void>;
}

interface BatteryStatus {
  level: number; // 0-100
  charging: boolean;
  timeToEmpty?: number; // minutes
  timeToFull?: number; // minutes
}
````

8. **System Module**
````typescript
interface SystemModule {
  // Info
  getInfo(): Promise<SystemInfo>;
  getUptime(): Promise<number>;
  
  // Resources
  getCPUUsage(): Promise<number>;
  getMemoryUsage(): Promise<MemoryInfo>;
  getDiskUsage(): Promise<DiskInfo[]>;
  
  // Clipboard
  clipboard: {
    readText(): Promise<string>;
    writeText(text: string): Promise<void>;
    clear(): Promise<void>;
  };
  
  // Processes
  exec(command: string, args: string[]): Promise<ExecResult>;
}
````

9. **IPC Module** (direct Go backend access)
````typescript
interface IPCModule {
  // Generic IPC
  call(method: string, params: any): Promise<any>;
  send(message: string, data: any): Promise<void>;
  
  // Streaming
  stream(channel: string): AsyncIterableIterator<any>;
  
  // Subscribe to events
  on(event: string, handler: (data: any) => void): void;
  off(event: string, handler: (data: any) => void): void;
}
````

10. **Error Handling Pattern**
````typescript
class WebShellError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
  }
}

// Usage
try {
  await webshell.calendar.createEvent({ ... });
} catch (err) {
  if (err instanceof WebShellError) {
    console.error(`Error ${err.code}:`, err.message);
  }
}
````

## Technical Notes

**API Design Principles**:
- Follow web standards (use Date, URL, etc.)
- Async by default (Promises)
- Type-safe (full TypeScript support)
- Tree-shakeable (import only what you need)
- Minimal surface area (but complete)

**Namespace Organization**:
````typescript
import { webshell } from 'webshell-sdk';

// OR individual imports
import { calendar, notifications } from 'webshell-sdk';
````

**React Hooks** (future):
````typescript
// Custom hooks for React apps
function useTheme() { ... }
function useCalendarEvents() { ... }
function useBattery() { ... }
````

## Reference Material

Study API design:
- Electron API
- Tauri API
- Raycast Extensions API
- Chrome Extension API

## Definition of Done

- Complete API surface designed
- TypeScript definitions created
- API documented with examples
- Design reviewed and approved
- Git commit: "task-4.1: Design SDK API surface"
