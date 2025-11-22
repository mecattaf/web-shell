# Permission System

The WebShell permission system implements capability-based security to control app access to system resources. Apps must explicitly request permissions in their manifest, and all API calls are enforced at runtime.

## Security Principles

- **Default Deny**: All permissions are denied by default
- **Explicit Opt-in**: Apps must declare required permissions in their manifest
- **Principle of Least Privilege**: Apps should only request minimum necessary permissions
- **Capability-based Security**: Permissions are tied to specific resources and actions
- **Audit Logging**: All sensitive operations are logged for security auditing

## Architecture

The permission system consists of three main components:

### 1. PermissionManager (Singleton)

Central permission registry that:
- Stores granted permissions per app
- Validates permission requests
- Provides audit logging
- Prevents security vulnerabilities (path traversal, etc.)

### 2. PermissionEnforcer

Per-app enforcement layer that:
- Throws errors when permissions are denied
- Logs all access attempts
- Provides non-throwing permission checks
- Integrates with WebShellAPI

### 3. PermissionPromptDialog

UI component for future user permission prompts (currently a stub for runtime permission requests).

## Permission Categories

### Calendar
```json
{
  "calendar": {
    "read": true,
    "write": false
  }
}
```

Actions:
- `read`: List and view calendar events
- `write`: Create, update, and delete calendar events

### Filesystem
```json
{
  "filesystem": {
    "read": ["~/Documents", "~/Downloads"],
    "write": ["~/Documents/MyApp"]
  }
}
```

Actions:
- `read`: Array of allowed read paths
- `write`: Array of allowed write paths

Path features:
- `~` expands to user home directory
- Paths are checked with prefix matching
- Directory traversal (`..`) is automatically blocked

### Network
```json
{
  "network": {
    "allowed_hosts": ["localhost", "api.example.com", "*.github.com"]
  }
}
```

Features:
- `localhost` must be explicitly granted
- Supports exact host matching
- Supports wildcard `*` for all hosts (use cautiously)
- Future: Domain wildcards like `*.github.com`

### Notifications
```json
{
  "notifications": {
    "send": true
  }
}
```

Actions:
- `send`: Send system notifications

### Processes
```json
{
  "processes": {
    "spawn": true
  }
}
```

Actions:
- `spawn`: Spawn new processes

### Clipboard
```json
{
  "clipboard": {
    "read": true,
    "write": true
  }
}
```

Actions:
- `read`: Read from system clipboard
- `write`: Write to system clipboard

## Usage

### Declaring Permissions in Manifest

In your `webshell.json`:

```json
{
  "version": "1.0.0",
  "name": "my-app",
  "entrypoint": "index.html",
  "permissions": {
    "calendar": {
      "read": true,
      "write": true
    },
    "filesystem": {
      "read": ["~/Documents"],
      "write": ["~/Documents/MyApp"]
    },
    "network": {
      "allowed_hosts": ["localhost", "api.myapp.com"]
    },
    "notifications": {
      "send": true
    }
  }
}
```

### Registering App Permissions

When loading an app, register its permissions:

```qml
import WebShell.Services

Component.onCompleted: {
    // Parse manifest
    const parser = Qt.createQmlObject(
        'import QtQuick; import WebShell.Services; ManifestParser {}',
        this
    );
    parser.load("file:///path/to/webshell.json");

    // Register permissions
    PermissionManager.registerApp(parser.appName, parser.permissions);
}
```

### Using WebShellAPI

Apps should use the WebShellAPI which has built-in permission enforcement:

```qml
import WebShell.Services

WebShellAPI {
    id: api
    appName: "my-app"

    Component.onCompleted: {
        // This will automatically check permissions
        try {
            const events = api.listCalendarEvents();
            console.log("Calendar events:", events);
        } catch (e) {
            console.error("Permission denied:", e.message);
        }
    }
}
```

### Direct Permission Enforcement

For custom APIs, use PermissionEnforcer:

```qml
import WebShell.Services

QtObject {
    id: myApi
    property string appName: "my-app"

    property PermissionEnforcer enforcer: PermissionEnforcer {
        appName: myApi.appName
    }

    function doSomething() {
        // Throws error if permission denied
        enforcer.enforceCalendarRead();

        // Your implementation here
    }

    function canDoSomething() {
        // Non-throwing check
        return enforcer.checkPermission("calendar", "read");
    }
}
```

### Checking Permissions

```qml
// Check if app has permission (non-throwing)
if (PermissionManager.hasPermission("my-app", "calendar", "read")) {
    // Permission granted
}

// Check filesystem access
if (PermissionManager.checkFilesystemAccess("my-app", "~/Documents/file.txt", "read")) {
    // Can read file
}

// Check network access
if (PermissionManager.checkNetworkAccess("my-app", "api.example.com")) {
    // Can access host
}
```

## Security Features

### Path Sanitization

The permission system automatically sanitizes file paths to prevent directory traversal attacks:

```qml
// Malicious path
const maliciousPath = "~/Documents/../../../etc/passwd";

// Automatically sanitized - ".." is removed
const canAccess = PermissionManager.checkFilesystemAccess(
    "my-app",
    maliciousPath,
    "read"
);
// Returns false (sanitized path doesn't match allowed paths)
```

### Audit Logging

All permission checks and access attempts are logged:

```
[PermissionManager] Registered: my-app with permissions: {...}
[PermissionManager] Denied: my-app -> calendar.write
[PermissionAudit] 2025-01-18T10:30:00.000Z | my-app | calendar | read | GRANTED
[PermissionAudit] 2025-01-18T10:30:01.000Z | my-app | calendar | write | DENIED
```

### Network Security

Special handling for localhost:

```qml
// Localhost must be explicitly granted
{
  "network": {
    "allowed_hosts": ["localhost"]  // Required for local API access
  }
}
```

Both `localhost`, `127.0.0.1`, and `::1` are treated as localhost.

## API Reference

### PermissionManager

Singleton service for managing permissions.

#### Methods

**registerApp(appName: string, permissions: object)**
- Register an app with its granted permissions
- Call this when loading an app's manifest

**hasPermission(appName: string, category: string, action: string): bool**
- Check if app has a specific permission
- Returns false if denied

**checkFilesystemAccess(appName: string, path: string, mode: string): bool**
- Check filesystem access for a path
- mode: "read" or "write"

**checkNetworkAccess(appName: string, host: string): bool**
- Check network access for a host

**revokeApp(appName: string)**
- Revoke all permissions for an app

**getAppPermissions(appName: string): object**
- Get permissions object for an app
- Returns null if app not found

**logAccess(appName: string, resource: string, action: string, granted: bool)**
- Log an access attempt for auditing

#### Signals

**permissionDenied(appName: string, permission: string)**
- Emitted when a permission is denied

**permissionGranted(appName: string, permission: string)**
- Emitted when a permission is granted

### PermissionEnforcer

Per-app permission enforcement component.

#### Properties

**appName: string**
- The application this enforcer is protecting

#### Methods (Throwing)

All enforce methods throw an Error if permission is denied:

- **enforceCalendarRead()**
- **enforceCalendarWrite()**
- **enforceFileRead(path: string)**
- **enforceFileWrite(path: string)**
- **enforceNetworkAccess(host: string)**
- **enforceNotificationSend()**
- **enforceProcessSpawn()**
- **enforceClipboardRead()**
- **enforceClipboardWrite()**

#### Methods (Non-throwing)

Safe permission checks that return bool:

- **checkPermission(category: string, action: string): bool**
- **checkFileAccess(path: string, mode: string): bool**
- **checkNetworkHost(host: string): bool**

### WebShellAPI

Permission-controlled API for app access to system resources.

#### Properties

**appName: string**
- The application using this API

#### Calendar Methods

- **listCalendarEvents(): array** - Requires calendar.read
- **addCalendarEvent(event: object): string** - Requires calendar.write
- **updateCalendarEvent(id: string, updates: object): bool** - Requires calendar.write
- **deleteCalendarEvent(id: string): bool** - Requires calendar.write

#### Filesystem Methods

- **readFile(path: string): string** - Requires filesystem.read for path
- **writeFile(path: string, content: string): bool** - Requires filesystem.write for path
- **listDirectory(path: string): array** - Requires filesystem.read for path

#### Network Methods

- **fetch(url: string, options: object): response** - Requires network access to host

#### Notification Methods

- **sendNotification(message: string, options: object)** - Requires notifications.send

#### Process Methods

- **spawnProcess(command: string, args: array): handle** - Requires processes.spawn

#### Clipboard Methods

- **readClipboard(): string** - Requires clipboard.read
- **writeClipboard(text: string)** - Requires clipboard.write

#### Permission Check Methods

- **hasPermission(category: string, action: string): bool**
- **canAccessFile(path: string, mode: string): bool**
- **canAccessHost(host: string): bool**

## Testing

Run the permission system test suite:

```bash
# Run with quickshell test runner
quickshell --test quickshell/Tests/PermissionSystemTest.qml
```

Test coverage includes:
- Permission registration
- Category-based permissions
- Filesystem path matching
- Network host matching
- Path sanitization
- Permission enforcement
- Audit logging

## Future Enhancements

### Runtime Permission Requests

```qml
// Future: Request permission at runtime
PermissionManager.requestPermission("my-app", "calendar.read")
    .then(granted => {
        if (granted) {
            // Permission granted by user
        }
    });
```

### Temporary Permissions

```qml
// Future: Grant temporary permission
PermissionManager.grantTemporaryPermission(
    "my-app",
    "filesystem.read",
    3600000  // 1 hour in ms
);
```

### Permission Scopes

```qml
// Future: More granular network permissions
{
  "network": {
    "allowed_hosts": ["*.github.com"],  // Domain wildcards
    "allowed_ports": [80, 443],         // Port restrictions
    "protocols": ["https"]              // Protocol restrictions
  }
}
```

## Best Practices

1. **Minimal Permissions**: Only request permissions your app actually needs
2. **Graceful Degradation**: Handle permission denials gracefully
3. **User Communication**: Explain why permissions are needed
4. **Security Audits**: Regularly review audit logs
5. **Path Specificity**: Use specific paths instead of broad directory access
6. **Network Restrictions**: Avoid wildcard `*` for network hosts when possible

## Example: Complete App Integration

```qml
// MyApp.qml
import QtQuick
import WebShell.Services

Item {
    id: root

    // Load manifest
    ManifestParser {
        id: manifest
        Component.onCompleted: {
            load("file:///path/to/webshell.json");
        }
        onManifestLoaded: {
            // Register permissions
            PermissionManager.registerApp(appName, permissions);

            // Initialize API
            api.appName = appName;
        }
    }

    // Use API with automatic permission enforcement
    WebShellAPI {
        id: api
    }

    // Example usage
    function loadCalendar() {
        try {
            const events = api.listCalendarEvents();
            console.log("Loaded", events.length, "events");
        } catch (e) {
            console.error("Failed to load calendar:", e.message);
            // Show error to user
        }
    }

    function checkBeforeAccess() {
        // Check permission first
        if (api.hasPermission("calendar", "read")) {
            loadCalendar();
        } else {
            console.log("Calendar access not granted");
            // Show message to user about missing permission
        }
    }
}
```

## Security Considerations

1. **Manifest Integrity**: Ensure manifest files can't be tampered with
2. **Path Traversal**: Automatically prevented by sanitization
3. **Localhost Access**: Requires explicit permission to prevent SSRF
4. **Audit Logs**: Consider persisting logs for security analysis
5. **Permission Prompts**: Future user prompts should be clear and non-dismissible
6. **Process Isolation**: Consider sandboxing apps with limited permissions

## Related Documentation

- [Manifest Schema](manifest-schema.md)
- [Getting Started](getting-started.md)
- [Test Guide](TEST_GUIDE.md)
