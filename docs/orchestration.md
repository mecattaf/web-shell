# Multi-App Orchestration System

This document describes the multi-app orchestration system implemented in WebShell, which enables running multiple apps simultaneously with proper z-order management, focus coordination, inter-app communication, and resource tracking.

## Overview

The orchestration system consists of four main components:

1. **AppOrchestrator** - Central coordinator for managing running apps
2. **AppMessaging** - Inter-app communication system
3. **ResourceManager** - Resource tracking and monitoring
4. **AppSwitcher** - Visual UI for switching between apps

## Architecture

### AppOrchestrator

**Location:** `quickshell/Services/AppOrchestrator.qml`

The AppOrchestrator is the central component that manages multiple running apps. It builds on top of WebShellLoader and provides:

- **Z-order management** with predefined layers:
  - Panel layer: z = 10
  - Widget layer: z = 100
  - Overlay layer: z = 1000
  - Dialog layer: z = 2000

- **Focus coordination** - tracking which app is currently focused
- **Lifecycle management** - handling app launch, pause, resume, and close events
- **App state tracking** - maintaining metadata about running apps

#### Key Functions

```qml
// Launch an app (or focus if already running)
AppOrchestrator.launchApp(appName)

// Close a running app
AppOrchestrator.closeApp(appName)

// Focus/bring to front
AppOrchestrator.focusApp(appName)

// Get list of running apps
AppOrchestrator.getRunningApps()

// Cycle through apps
AppOrchestrator.focusNextApp()
AppOrchestrator.focusPreviousApp()
```

#### Signals

```qml
signal appLaunched(string appName)
signal appClosed(string appName)
signal appFocused(string appName)
signal appPaused(string appName)
```

### AppMessaging

**Location:** `quickshell/Services/AppMessaging.qml`

The AppMessaging system enables apps to communicate with each other through a message-passing interface.

#### Features

- **Handler registration** - Apps register message handlers
- **Message routing** - Route messages from one app to another
- **Message queuing** - Queue messages for apps that haven't registered yet
- **Broadcast support** - Send messages to all running apps
- **Request/response pattern** - Send requests and wait for responses

#### Key Functions

```qml
// Register a message handler
AppMessaging.registerHandler(appName, (message) => {
    console.log("Received:", message.type, message.data);
});

// Send a message
AppMessaging.sendMessage(fromApp, toApp, messageType, data)

// Broadcast to all apps
AppMessaging.broadcast(fromApp, messageType, data)

// Request/response pattern
AppMessaging.sendRequest(fromApp, toApp, requestType, data, callback, timeout)
```

#### Message Format

```javascript
{
    from: "sender-app",
    to: "recipient-app",
    type: "message-type",
    data: { /* payload */ },
    timestamp: 1234567890
}
```

### ResourceManager

**Location:** `quickshell/Services/ResourceManager.qml`

The ResourceManager tracks resource usage across running apps.

#### Features

- **Memory monitoring** - Tracks memory usage per app using performance.memory API
- **Resource limits** - Enforces per-app and total memory limits
- **Usage reporting** - Provides detailed resource usage reports
- **Warning system** - Emits warnings when approaching limits

#### Key Functions

```qml
// Get resource usage for an app
ResourceManager.getAppResourceUsage(appName)

// Get report for all apps
ResourceManager.getResourceReport()

// Get formatted summary
ResourceManager.getResourceSummary()

// Check if limits exceeded
ResourceManager.isMemoryLimitExceeded()
```

#### Resource Limits

- **Per-app limit:** 500 MB
- **Total limit:** 2 GB
- **Monitoring interval:** 30 seconds

### AppSwitcher

**Location:** `quickshell/Components/AppSwitcher.qml`

Visual overlay UI component for switching between running apps.

#### Features

- **Visual app list** - Shows all running apps with metadata
- **Status indicators** - Shows which app is active/paused
- **Quick switching** - Click to switch to any app
- **Close buttons** - Close apps from the switcher
- **Keyboard navigation** - Esc to close

#### Usage

```qml
// Include in your main UI
AppSwitcher {
    id: appSwitcher
}

// Toggle visibility
Shortcut {
    sequence: "Alt+Tab"
    onActivated: appSwitcher.toggle()
}
```

## Integration with WebShellAPI

The WebShellAPI has been extended with lifecycle events and messaging support:

### Lifecycle Events

```javascript
// In your web app
window.webshell.onAppResumed = () => {
    console.log("App resumed/focused");
};

window.webshell.onAppPaused = () => {
    console.log("App paused/unfocused");
};

window.webshell.onAppWillClose = () => {
    console.log("App is closing - cleanup time!");
};

// Check if app is active
if (window.webshell.isActive) {
    // App has focus
}
```

### Inter-App Messaging

```javascript
// Register message handler
window.webshell.registerMessageHandler((message) => {
    console.log(`Message from ${message.from}:`, message.type, message.data);

    if (message.type === 'open-file') {
        openFile(message.data.path);
    }
});

// Send message to another app
window.webshell.sendMessage('email-app', 'compose', {
    to: 'user@example.com',
    subject: 'Hello'
});

// Broadcast to all apps
window.webshell.broadcastMessage('theme-changed', {
    theme: 'dark'
});
```

## Example Usage

### Launching Multiple Apps

```qml
// Launch multiple apps
AppOrchestrator.launchApp("calendar");
AppOrchestrator.launchApp("email");
AppOrchestrator.launchApp("notes");

// Apps are automatically tracked and focused
```

### App Communication Example

**App A (sender):**
```javascript
// Request data from another app
window.webshell.sendMessage('database-app', 'query', {
    table: 'users',
    filter: { active: true }
});
```

**App B (receiver):**
```javascript
window.webshell.registerMessageHandler((message) => {
    if (message.type === 'query') {
        const results = database.query(message.data);

        // Send response back
        window.webshell.sendMessage(message.from, 'query-results', {
            results: results
        });
    }
});
```

### Resource Monitoring

```qml
// Get resource usage report
Timer {
    interval: 60000 // Every minute
    running: true
    repeat: true

    onTriggered: {
        const report = ResourceManager.getResourceReport();
        report.forEach(usage => {
            console.log(`${usage.app}: ${usage.memoryMB} MB`);
        });

        // Check if limits exceeded
        if (ResourceManager.isMemoryLimitExceeded()) {
            console.warn("Memory limit exceeded!");

            // Close least important apps
            const apps = ResourceManager.getAppsByMemoryUsage();
            AppOrchestrator.closeApp(apps[0]);
        }
    }
}
```

### Focus Management

```qml
// Keyboard shortcuts for app switching
Shortcut {
    sequence: "Alt+Tab"
    onActivated: AppOrchestrator.focusNextApp()
}

Shortcut {
    sequence: "Alt+Shift+Tab"
    onActivated: AppOrchestrator.focusPreviousApp()
}

// Show app switcher
Shortcut {
    sequence: "Meta+Tab"
    onActivated: appSwitcher.show()
}
```

## Z-Order Management

The system uses predefined z-order layers to ensure proper stacking:

```qml
function getZLayer(windowType) {
    switch (windowType) {
        case "panel": return 10;    // Always at bottom
        case "widget": return 100;  // Normal apps
        case "overlay": return 1000; // Overlays
        case "dialog": return 2000;  // Dialogs on top
        default: return 100;
    }
}
```

Within each layer, apps are stacked based on their focus order. When an app is focused, it receives a new z-order value that brings it to the top of its layer.

## Focus Stealing Prevention

The system implements focus stealing prevention:

- Only user-initiated actions can change focus
- System messages don't automatically steal focus
- Apps can request focus but can't force it
- Dialogs and overlays have precedence

## Best Practices

### For App Developers

1. **Register message handlers early** in your app lifecycle
2. **Handle lifecycle events** to pause/resume work appropriately
3. **Clean up resources** when receiving `appWillClose`
4. **Use meaningful message types** for inter-app communication
5. **Test with multiple instances** of your app

### For Shell Developers

1. **Monitor resource usage** regularly
2. **Implement memory limits** appropriate for your system
3. **Provide visual feedback** for app state changes
4. **Use AppSwitcher** for user convenience
5. **Log orchestration events** for debugging

## Debugging

Enable debug logging to see orchestration events:

```qml
// Enable verbose logging
AppOrchestrator.getDebugInfo()
AppMessaging.getDebugInfo()
ResourceManager.getResourceSummary()
```

Console output will show:
- App launch/close events
- Focus changes
- Message routing
- Resource usage
- Z-order changes

## Performance Considerations

- **Memory:** Each app adds ~25-50 MB overhead
- **CPU:** Minimal overhead for orchestration
- **Resource monitoring:** Runs every 30 seconds
- **Message passing:** Negligible overhead for typical use

## Future Enhancements

Possible future improvements:

1. **App grouping** - Group related apps together
2. **Virtual desktops** - Multiple workspaces
3. **App persistence** - Save/restore app state
4. **Window snapping** - Snap apps to screen regions
5. **Advanced IPC** - Shared memory, streams
6. **Resource quotas** - Per-app CPU/network limits

## Troubleshooting

### App not launching
- Check if app is registered: `WebShellLoader.getLoadedApps()`
- Verify manifest is valid
- Check console for errors

### Focus not working
- Ensure app view has `focus: true`
- Check z-order values
- Verify window type is set correctly

### Messages not delivered
- Verify handler is registered: `AppMessaging.hasHandler(appName)`
- Check message queue: `AppMessaging.getQueueLength(appName)`
- Verify app names match exactly

### High memory usage
- Check resource report: `ResourceManager.getResourceReport()`
- Close unused apps
- Force garbage collection: `ResourceManager.forceGarbageCollection()`

## API Reference

See individual component files for complete API documentation:

- `AppOrchestrator.qml` - App lifecycle and coordination
- `AppMessaging.qml` - Inter-app communication
- `ResourceManager.qml` - Resource tracking
- `WebShellAPI.qml` - Web app API interface
- `AppSwitcher.qml` - UI component

## Related Documents

- [App Development Guide](./app-development.md)
- [Permission System](./permissions.md)
- [Window Management](./window-management.md)
