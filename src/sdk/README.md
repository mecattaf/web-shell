# WebShell SDK

The WebShell SDK provides a clean, type-safe JavaScript/TypeScript API for building WebShell applications.

## Overview

The SDK is organized into focused modules that provide access to shell functionality:

- **shell**: App lifecycle and inter-app communication
- **window**: Window management and appearance
- **theme**: Theme tokens and updates
- **calendar**: Calendar event management
- **notifications**: System notifications
- **power**: Battery and power management
- **system**: System information and resources
- **ipc**: Direct backend communication

## Architecture

```
┌─────────────────────────────────────┐
│      WebShell Applications          │
│  (Use high-level SDK API)           │
└─────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│         SDK Layer (This)             │
│  • Clean, typed API surface          │
│  • Promise-based async operations    │
│  • Event handling abstractions       │
│  • Error handling                    │
└─────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│     WebShellBridge (Low-level)       │
│  • QtWebChannel communication        │
│  • Callback-based QML calls          │
│  • Signal/slot connections           │
└─────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│      QML Layer (QuickShell)          │
│  • Thin proxy to Go backend          │
└─────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│      Go Backend (IPC Server)         │
│  • Business logic                    │
│  • System integration                │
└─────────────────────────────────────┘
```

## Design Principles

### 1. Web Standards First
Use web standards wherever possible (Date, URL, etc.)

```typescript
// Good: Uses standard Date objects
const events = await webshell.calendar.listEvents(
  new Date('2025-01-01'),
  new Date('2025-01-31')
);
```

### 2. Async by Default
All I/O operations return Promises:

```typescript
// All async operations are Promise-based
const battery = await webshell.power.getBatteryStatus();
const info = await webshell.system.getInfo();
```

### 3. Type Safety
Full TypeScript support with complete type definitions:

```typescript
import type { CalendarEvent, Theme } from 'webshell-sdk';

const event: CalendarEvent = await webshell.calendar.getEvent('id');
const theme: Theme = webshell.theme.getTheme();
```

### 4. Event-Driven
Reactive API with event handlers that return unsubscribe functions:

```typescript
const unsubscribe = webshell.theme.onThemeChange((theme) => {
  console.log('Theme changed:', theme);
});

// Later: clean up
unsubscribe();
```

### 5. Minimal Surface Area
Expose only what's necessary, keep the API surface small and focused.

### 6. Tree-Shakeable
Modules can be imported individually:

```typescript
import { calendar, notifications } from 'webshell-sdk';

// Only calendar and notifications code is included
```

## Usage

### Global API

The SDK is available globally via `window.webshell`:

```typescript
webshell.ready(() => {
  const appName = webshell.shell.app.getName();
  console.log('App:', appName);
});
```

### Module Imports

For better tree-shaking, import specific modules:

```typescript
import { calendar, notifications } from 'webshell-sdk';

await calendar.createEvent({ ... });
await notifications.send({ ... });
```

### TypeScript

Import types for full type safety:

```typescript
import type {
  CalendarEvent,
  NotificationOptions,
  BatteryStatus
} from 'webshell-sdk';
```

## Error Handling

All errors extend `WebShellError`:

```typescript
import { WebShellError, WebShellErrorCode } from 'webshell-sdk';

try {
  await webshell.calendar.createEvent({ ... });
} catch (err) {
  if (err instanceof WebShellError) {
    switch (err.code) {
      case WebShellErrorCode.CALENDAR_INVALID_DATE:
        console.error('Invalid date provided');
        break;
      case WebShellErrorCode.PERMISSION_DENIED:
        console.error('Permission denied');
        break;
      default:
        console.error('Error:', err.message);
    }
  }
}
```

## File Structure

```
src/sdk/
├── index.ts              # Main entry point, exports everything
├── webshell.ts           # Main WebShell interface
├── types.ts              # Common types used across modules
├── errors.ts             # Error classes and codes
├── shell.ts              # Shell module interface
├── window.ts             # Window module interface
├── theme.ts              # Theme module interface
├── calendar.ts           # Calendar module interface
├── notifications.ts      # Notifications module interface
├── power.ts              # Power module interface
├── system.ts             # System module interface
└── ipc.ts                # IPC module interface
```

## Implementation Status

### Phase 1: API Design ✅
- [x] Complete API surface designed
- [x] TypeScript definitions created
- [x] Error handling patterns defined
- [x] Documentation outline created

### Phase 2: Implementation (Next)
- [ ] Implement SDK modules using WebShellBridge
- [ ] Add runtime initialization
- [ ] Create global `webshell` object
- [ ] Implement event handling system

### Phase 3: Testing & Refinement
- [ ] Write unit tests for SDK modules
- [ ] Write integration tests with bridge
- [ ] Create example applications
- [ ] Performance optimization

## Next Steps

1. **Implement SDK Runtime**: Create implementations of each module interface that use the `WebShellBridge` underneath
2. **Global Object**: Create initialization code that exposes the `webshell` global object
3. **Example Apps**: Build example applications using the SDK to validate the API design
4. **React Hooks**: Create React hooks for common operations (`useTheme`, `useCalendarEvents`, etc.)

## Related Files

- [Bridge Implementation](../bridge/webshell-bridge.ts)
- [API Documentation](../../docs/sdk-api-reference.md)
- [Architecture](../../ARCHITECTURE.md)

## Contributing

When adding new SDK features:

1. **Design First**: Update interfaces in the appropriate module file
2. **Type Safety**: Ensure full TypeScript support
3. **Documentation**: Add examples to API documentation
4. **Testing**: Write tests before implementation
5. **Error Handling**: Use appropriate error codes

## API Design References

The SDK API design is inspired by:
- **Electron API**: Desktop app framework
- **Tauri API**: Lightweight desktop framework
- **Raycast Extensions API**: Clean, focused API design
- **Chrome Extension API**: Web-standard approach
