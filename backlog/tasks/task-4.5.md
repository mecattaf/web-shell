---
id: task-4.5
title: Implement system services API
status: To Do
created_date: 2025-01-19
milestone: milestone-4
assignees: []
labels: [sdk, implementation]
dependencies: [task-4.2]
---

## Description

Implement system service modules providing access to calendar, notifications, power, system info, clipboard, and **generic backend IPC**. This connects WebShell apps to Go backend services and enables custom backend integrations.

**Key Addition**: Includes a generic `ipc.call()` method for apps that need direct backend access beyond predefined services (e.g., custom databases, external APIs).

## Acceptance Criteria

- [ ] CalendarModule with full CRUD operations
- [ ] NotificationModule with send/update/close
- [ ] PowerModule with battery status and power actions
- [ ] SystemModule with info, resources, clipboard
- [ ] **IPCModule with generic backend proxy**
- [ ] All modules use permission enforcement
- [ ] Event subscriptions working (onEventCreated, onBatteryChange, etc.)
- [ ] Error handling with specific error codes
- [ ] Tests for each module

## Implementation Plan

### 1. Calendar Module (as before)
- Implement CRUD methods: listEvents, getEvent, createEvent, updateEvent, deleteEvent
- Add convenience queries: eventsToday, eventsThisWeek, eventsThisMonth
- Set up event subscriptions: onEventCreated, onEventUpdated, onEventDeleted
- Connect to QML CalendarService via bridge

### 2. Notification Module (as before)
- Implement send() with NotificationOptions
- Add update() and close() methods
- Support notification actions/buttons
- Handle click/close events

### 3. Power Module (as before)
- Implement getBatteryStatus()
- Add battery change subscription
- Implement power actions: shutdown, restart, suspend, hibernate

### 4. System Module (as before)
- Add getInfo() for OS, hostname, uptime
- Implement resource monitoring: getCPUUsage, getMemoryUsage, getDiskUsage
- Create clipboard sub-module: readText, writeText, clear
- Add exec() for process spawning (requires permission)

### 5. **IPC Module (NEW - Generic Backend Proxy)**

**Purpose**: Allow apps to make custom backend calls beyond predefined services.

**Use Cases**:
- Apps with custom Go backend services
- Direct database access (proxied through Go)
- External API calls (proxied for security)
- Custom business logic

**Implementation**:

**File**: `src/modules/ipc.ts`
```typescript
import { Bridge } from '../bridge';

export class IPCModule {
  private bridge: Bridge;
  private eventHandlers: Map<string, Set<Function>> = new Map();
  
  constructor(bridge: Bridge) {
    this.bridge = bridge;
    this.setupEventForwarding();
  }
  
  /**
   * Call a custom backend method
   * 
   * @param method - Backend method name (e.g., "database.query")
   * @param params - Method parameters
   * @returns Promise with backend response
   * 
   * @example
   * const users = await ipc.call('database.query', {
   *   table: 'users',
   *   where: { active: true }
   * });
   */
  async call(method: string, params?: any): Promise<any> {
    return this.bridge.call('ipc.call', {
      method,
      params
    });
  }
  
  /**
   * Send a message to backend without waiting for response
   */
  async send(message: string, data?: any): Promise<void> {
    await this.bridge.call('ipc.send', {
      message,
      data
    });
  }
  
  /**
   * Subscribe to backend events
   * 
   * @example
   * ipc.on('user:created', (user) => {
   *   console.log('New user:', user);
   * });
   */
  on(event: string, handler: (data: any) => void): () => void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
      
      // Register with backend
      this.bridge.call('ipc.subscribe', { event });
    }
    
    this.eventHandlers.get(event)!.add(handler);
    
    // Return unsubscribe function
    return () => {
      const handlers = this.eventHandlers.get(event);
      if (handlers) {
        handlers.delete(handler);
        
        if (handlers.size === 0) {
          this.eventHandlers.delete(event);
          this.bridge.call('ipc.unsubscribe', { event });
        }
      }
    };
  }
  
  /**
   * Remove event handler
   */
  off(event: string, handler: Function): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }
  
  /**
   * Stream data from backend
   * 
   * @example
   * for await (const chunk of ipc.stream('logs')) {
   *   console.log(chunk);
   * }
   */
  async *stream(channel: string): AsyncIterableIterator<any> {
    // Implementation would use WebSocket or similar
    // for now, stub for future implementation
    throw new Error('Streaming not yet implemented');
  }
  
  private setupEventForwarding(): void {
    this.bridge.on('ipc-event', (event: { name: string; data: any }) => {
      const handlers = this.eventHandlers.get(event.name);
      if (handlers) {
        handlers.forEach(handler => {
          try {
            handler(event.data);
          } catch (err) {
            console.error(`[IPC] Event handler error (${event.name}):`, err);
          }
        });
      }
    });
  }
}
```

**Add to SDK**:
```typescript
// In src/index.ts
export class WebShellSDK {
  // ...
  public ipc: IPCModule;
  
  constructor() {
    // ...
    this.ipc = new IPCModule(this.bridge);
  }
}
```

**QML Backend Bridge**:
```qml
// In WebShellApi.qml
QtObject {
    id: api
    
    // Generic IPC proxy
    function ipcCall(params) {
        const { method, params: methodParams } = JSON.parse(params);
        
        // Route to Go backend
        const result = GoBackend.call(method, methodParams);
        return JSON.stringify(result);
    }
    
    function ipcSend(params) {
        const { message, data } = JSON.parse(params);
        GoBackend.send(message, data);
    }
    
    function ipcSubscribe(params) {
        const { event } = JSON.parse(params);
        GoBackend.subscribe(appName, event);
    }
    
    // Forward backend events to JS
    Connections {
        target: GoBackend
        function onEventEmitted(appName, eventName, data) {
            if (appName === api.appName) {
                api.ipcEventReceived(JSON.stringify({
                    name: eventName,
                    data: data
                }));
            }
        }
    }
    
    signal ipcEventReceived(string event)
}
```

**Go Backend Integration**:

The Go backend needs a generic RPC handler:

```go
// backend/ipc/handler.go
type Handler struct {
    methods map[string]func(params json.RawMessage) (interface{}, error)
    events  map[string][]chan interface{}
}

func (h *Handler) Call(method string, params json.RawMessage) (interface{}, error) {
    fn, ok := h.methods[method]
    if !ok {
        return nil, fmt.Errorf("method not found: %s", method)
    }
    return fn(params)
}

func (h *Handler) RegisterMethod(name string, fn func(json.RawMessage) (interface{}, error)) {
    h.methods[name] = fn
}

func (h *Handler) Emit(event string, data interface{}) {
    channels, ok := h.events[event]
    if !ok {
        return
    }
    for _, ch := range channels {
        select {
        case ch <- data:
        default:
            // Channel full, skip
        }
    }
}
```

**Example: Database Proxy**:

```go
// backend/services/database.go
func RegisterDatabaseService(ipc *ipc.Handler) {
    ipc.RegisterMethod("database.query", func(params json.RawMessage) (interface{}, error) {
        var req struct {
            Table string                 `json:"table"`
            Where map[string]interface{} `json:"where"`
        }
        
        if err := json.Unmarshal(params, &req); err != nil {
            return nil, err
        }
        
        // Execute query (safely!)
        results, err := db.Query(req.Table, req.Where)
        return results, err
    })
}
```

**Usage Example**:

```typescript
import { webshell } from 'webshell-sdk';

// Custom database query
const users = await webshell.ipc.call('database.query', {
  table: 'users',
  where: { active: true },
  limit: 10
});

// Subscribe to backend events
webshell.ipc.on('user:created', (user) => {
  console.log('New user created:', user);
});

// Custom API call
const weather = await webshell.ipc.call('api.fetchWeather', {
  city: 'Paris'
});
```

**Security Considerations**:

1. **Permission Required**:
```json
{
  "permissions": {
    "ipc": {
      "methods": ["database.query", "api.fetchWeather"]
    }
  }
}
```

2. **Validation in Go Backend**:
```go
func (h *Handler) Call(method string, params json.RawMessage) (interface{}, error) {
    // Check if app has permission for this method
    if !hasPermission(appName, method) {
        return nil, ErrPermissionDenied
    }
    
    // ... execute method
}
```

### 6. Permission Integration (Updated)

**Manifest**:
```json
{
  "permissions": {
    "calendar": { "read": true, "write": true },
    "notifications": { "send": true },
    "system": { "clipboard": true },
    "ipc": {
      "methods": ["database.query", "custom.method"]
    }
  }
}
```

**Enforcement**:
```typescript
// In each module
async call(method: string, params: any) {
  // Permission check happens in QML/Go backend
  try {
    return await this.bridge.call(method, params);
  } catch (err) {
    if (err.code === 'PERMISSION_DENIED') {
      throw new WebShellError(
        `Permission denied: ${method}`,
        'PERMISSION_DENIED'
      );
    }
    throw err;
  }
}
```

### 7. Error Codes (Extended)

```typescript
export enum ErrorCode {
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  NOT_FOUND = 'NOT_FOUND',
  INVALID_INPUT = 'INVALID_INPUT',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  METHOD_NOT_FOUND = 'METHOD_NOT_FOUND',
  BACKEND_ERROR = 'BACKEND_ERROR',
  TIMEOUT = 'TIMEOUT'
}
```

## Technical Notes

**Generic IPC vs Specific Services**:
- Use specific services (calendar, power, etc.) when available
- Use IPC for custom/app-specific backend logic
- IPC is more flexible but less type-safe

**Database Safety**:
- Always proxy database access through Go backend
- Never expose raw SQL to web layer
- Use parameterized queries
- Enforce row-level security

**Performance**:
- IPC calls have same latency as specific services (~5-50ms)
- Batch multiple calls when possible
- Cache results client-side

**Type Safety**:
Consider generating TypeScript types from Go:
```bash
# Example using tygo
tygo generate ./backend/services
```

## Reference Material

Study IPC patterns:
- Tauri Commands: https://tauri.app/v1/guides/features/command/
- Electron IPC: https://www.electronjs.org/docs/latest/api/ipc-main

Study Go backend:
```bash
cd backend/
cat services/*.go
```

## Definition of Done

- All five modules implemented and functional
- IPC module supports custom backend calls
- Permission checks in place
- Event subscriptions working
- Error handling comprehensive
- Integration tests passing
- Database proxy example working
- Git commit: "task-4.5: Implement system services API with generic IPC"
```
</document>

Let me continue with the remaining improved tasks in the next response.
