# WebShell QtWebChannel Bridge

This module provides a TypeScript client for bidirectional communication between JavaScript and QML using QtWebChannel.

## Architecture

```
JavaScript/TypeScript <-> QtWebChannel <-> QML (thin proxy) <-> Go Backend (IPC)
```

The bridge follows a clean separation of concerns:
- **JS/TS**: Application logic and UI
- **QtWebChannel**: Qt's built-in communication layer
- **QML BridgeService**: Thin proxy (~80 lines), forwards all calls to Go
- **Go Backend**: Business logic, multiple adapters (IPC, MCP)

## Installation

The bridge is included in the WebShell project. No additional installation required.

## Usage

### Basic Example

```typescript
import { WebShellBridge } from './bridge';

// Create and initialize bridge
const bridge = new WebShellBridge();
await bridge.initialize();

// Call QML/Go backend methods
const result = await bridge.echo('Hello from JavaScript!');
console.log(result);
// { success: true, data: "QML bridge received: Hello from JavaScript!", timestamp: ... }
```

### Using Global Singleton

```typescript
import { initializeBridge } from './bridge';

// Initialize global bridge instance
const bridge = await initializeBridge();

// Use throughout your application
const info = await bridge.getBridgeInfo();
console.log(info);
```

### Generic Method Calls

```typescript
// Call any backend method
const result = await bridge.call('service.method', {
  param1: 'value1',
  param2: 42
});
```

### Event Handling (QML -> JS)

```typescript
// Register event handler
bridge.on('shellEvent', (data) => {
  console.log('Event received:', data);
});

// Remove event handler
const handler = (data) => console.log(data);
bridge.on('shellEvent', handler);
bridge.off('shellEvent', handler);
```

### React Integration

```typescript
import { useState, useEffect } from 'react';
import { getGlobalBridge } from './bridge';

function MyComponent() {
  const [bridge] = useState(() => getGlobalBridge());
  const [data, setData] = useState(null);

  useEffect(() => {
    bridge.initialize().then(async () => {
      const result = await bridge.call('getData');
      setData(result);
    });
  }, [bridge]);

  return <div>{data && JSON.stringify(data)}</div>;
}
```

## API Reference

### WebShellBridge

#### Methods

- `initialize(): Promise<void>` - Initialize the bridge connection
- `echo(message: string): Promise<any>` - Test method that echoes a message
- `call(method: string, params?: any): Promise<any>` - Call any backend method
- `getBridgeInfo(): Promise<any>` - Get bridge information
- `on(eventType: string, handler: Function): void` - Register event handler
- `off(eventType: string, handler: Function): void` - Remove event handler
- `ready: boolean` - Check if bridge is initialized

#### Example: Full Application Integration

```typescript
import { initializeBridge } from './bridge';

async function main() {
  try {
    const bridge = await initializeBridge();

    // Register event handlers
    bridge.on('notification', (data) => {
      console.log('Notification:', data);
    });

    // Make calls to backend
    const result = await bridge.call('app.getData', { id: 123 });
    console.log('Data:', result);

    // Handle user actions
    document.getElementById('button')?.addEventListener('click', async () => {
      const response = await bridge.call('app.performAction', {
        action: 'save',
        data: { ... }
      });
      console.log('Action result:', response);
    });
  } catch (error) {
    console.error('Bridge initialization failed:', error);
  }
}

main();
```

## QML Side (BridgeService.qml)

The QML side is a thin proxy that forwards all calls to the Go backend:

```qml
// BridgeService.qml
QtObject {
    function echo(message: string): var {
        // Forward to Go backend via IPC
        return GoBackend.call("bridge.echo", { message: message })
    }

    function call(method: string, params: var): var {
        // Generic call forwarder
        return GoBackend.call(method, params)
    }

    // Signals for QML -> JS communication
    signal notifyJS(string message)
    signal shellEvent(string eventType, var eventData)
}
```

## Error Handling

```typescript
try {
  const result = await bridge.call('someMethod', params);
  if (!result.success) {
    console.error('Method failed:', result.error);
  }
} catch (error) {
  console.error('Bridge error:', error);
}
```

## Testing

See `src/components/BridgeDemo.tsx` for a comprehensive example that demonstrates:
- Bridge initialization
- Method calls (JS -> QML -> Go)
- Event handling (QML -> JS)
- Error handling
- Status monitoring

## Development Notes

- The bridge requires QtWebEngine to function
- `qwebchannel.js` must be available at `/qwebchannel.js`
- All communication is asynchronous
- QML BridgeService is a thin proxy (~80 lines)
- Business logic lives in Go backend, not QML
- Future: MCP adapter for LLM integration

## Troubleshooting

### Bridge not initializing

**Error**: "QtWebChannel transport not available"

**Solution**: Make sure you're running in QtWebEngine environment (QuickShell)

### qwebchannel.js not loading

**Error**: "Failed to load qwebchannel.js"

**Solution**: Ensure `public/qwebchannel.js` exists and is being served by Vite

### Bridge methods not working

**Solution**: Check that:
1. Bridge is initialized: `await bridge.initialize()`
2. BridgeService is properly registered in QML
3. WebChannel is configured in WebEngineView
