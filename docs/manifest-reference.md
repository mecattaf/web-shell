# WebShell Manifest Reference

## Overview

The `webshell.json` manifest defines how your web application integrates into the WebShell environment. This reference provides a quick lookup guide for all manifest fields.

> **Note**: For complete details with validation rules and TypeScript types, see [Manifest Schema](./manifest-schema.md).

## Required Fields

### version
- **Type**: `string`
- **Pattern**: `X.Y.Z` (semantic versioning)
- **Example**: `"1.0.0"`

Specifies the manifest format version. Must follow semantic versioning.

### name
- **Type**: `string`
- **Pattern**: `^[a-z0-9-]+$`
- **Length**: 1-64 characters
- **Example**: `"calendar"`

Unique identifier for your app. Must be lowercase alphanumeric with hyphens only.

### entrypoint
- **Type**: `string`
- **Extension**: `.html` or `.htm`
- **Example**: `"index.html"`, `"dist/index.html"`

Path to the main HTML file, relative to manifest location. Must not escape the app directory.

## Optional Fields

### displayName
- **Type**: `string`
- **Length**: 1-128 characters
- **Example**: `"Calendar"`
- **Default**: Uses `name` field

Human-readable name shown in UI.

### description
- **Type**: `string`
- **Length**: Max 500 characters
- **Example**: `"Manage your events and schedules"`

Brief description of app functionality.

### icon
- **Type**: `string`
- **Formats**: `.svg`, `.png`, `.ico`
- **Example**: `"icon.svg"`, `"assets/icon.png"`

Path to app icon (relative to manifest).

### author
- **Type**: `string`
- **Length**: Max 256 characters
- **Examples**: `"John Doe"`, `"WebShell Team <team@webshell.dev>"`

Author name and/or email.

### license
- **Type**: `string`
- **Examples**: `"MIT"`, `"Apache-2.0"`, `"GPL-3.0"`

SPDX license identifier.

### homepage
- **Type**: `string`
- **Format**: URI
- **Example**: `"https://github.com/user/calendar-app"`

Project homepage URL.

### repository
- **Type**: `string`
- **Format**: URI
- **Example**: `"https://github.com/user/calendar-app.git"`

Source code repository URL.

### keywords
- **Type**: `array` of strings
- **Max Items**: 10
- **Item Length**: 1-32 characters
- **Example**: `["calendar", "productivity", "scheduling"]`

Keywords for searching and categorization.

## Permissions

WebShell uses a **default-deny** security model. All permissions must be explicitly requested.

### calendar
```json
"calendar": {
  "read": boolean,
  "write": boolean,
  "delete": boolean
}
```

**Use Cases**:
- `read`: List and view calendar events
- `write`: Create and modify events
- `delete`: Remove events

### contacts
```json
"contacts": {
  "read": boolean,
  "write": boolean,
  "delete": boolean
}
```

**Use Cases**:
- `read`: Access contact information
- `write`: Create and modify contacts
- `delete`: Remove contacts

### filesystem
```json
"filesystem": {
  "read": string[],    // Allowed read paths
  "write": string[],   // Allowed write paths
  "watch": string[]    // Paths to watch for changes
}
```

**Path Patterns**:
- `~` expands to user home directory
- Relative paths not allowed
- Parent directory access (`..`) blocked automatically
- Supports glob patterns

**Examples**:
```json
"filesystem": {
  "read": ["~/Documents", "~/Downloads"],
  "write": ["~/Documents/MyApp"]
}
```

### network
```json
"network": {
  "allowed_hosts": string[],  // Allowed hosts/domains
  "websockets": boolean       // Enable WebSocket connections
}
```

**Host Format**:
- Exact domain names: `"api.example.com"`
- Wildcards: `"*"` (all hosts - use cautiously)
- localhost must be explicit: `"localhost"`

**Examples**:
```json
"network": {
  "allowed_hosts": ["localhost", "api.example.com"],
  "websockets": true
}
```

### notifications
```json
"notifications": {
  "send": boolean  // Send system notifications
}
```

### clipboard
```json
"clipboard": {
  "read": boolean,   // Read from clipboard
  "write": boolean   // Write to clipboard
}
```

### processes
```json
"processes": {
  "spawn": boolean,           // Spawn new system processes
  "allowed_commands": string[]  // Whitelist of allowed commands
}
```

**Example**:
```json
"processes": {
  "spawn": true,
  "allowed_commands": ["git", "npm", "ls"]
}
```

### system
```json
"system": {
  "power": boolean,  // Control power management
  "audio": boolean   // Access audio input/output
}
```

## Window Configuration

### window.type
- **Type**: `string`
- **Values**: `"widget"` | `"panel"` | `"overlay"` | `"dialog"`
- **Default**: `"widget"`

**Window Types**:
- `widget`: Standalone application window
- `panel`: Docked panel component (screen edges)
- `overlay`: Full-screen or large modal overlay
- `dialog`: Modal dialog box (always on top)

### Window Dimensions
```json
"window": {
  "width": number,        // Initial width (100-7680 px)
  "height": number,       // Initial height (100-4320 px)
  "minWidth": number,     // Minimum width
  "minHeight": number,    // Minimum height
  "maxWidth": number,     // Maximum width
  "maxHeight": number     // Maximum height
}
```

### Window Appearance
```json
"window": {
  "title": string,            // Window title
  "resizable": boolean,       // Allow resizing
  "blur": boolean,            // Background blur effect
  "transparency": boolean,    // Transparent background
  "position": string,         // Initial position
  "alwaysOnTop": boolean,     // Keep above other windows
  "showInTaskbar": boolean    // Show in taskbar
}
```

**Position Values**: `"center"`, `"top-left"`, `"top-right"`, `"bottom-left"`, `"bottom-right"`

### Window Margins (for panels)
```json
"window": {
  "margins": {
    "top": number,
    "right": number,
    "bottom": number,
    "left": number
  }
}
```

Used for positioning panels relative to screen edges (in pixels).

## Development Mode

### devServer
- **Type**: `string`
- **Format**: URI
- **Restrictions**: Must use `localhost` or `127.0.0.1`
- **Examples**: `"http://localhost:5173"`, `"http://127.0.0.1:3000"`

Development server URL for hot reload. Only active with `--dev` flag.

### devMode
```json
"devMode": {
  "hotReload": boolean,      // Enable auto-reload (default: true)
  "watchPaths": string[],    // Files to watch
  "ignorePaths": string[]    // Files to ignore
}
```

**Defaults**:
- `watchPaths`: `["src/**/*"]`
- `ignorePaths`: `["node_modules/**", "dist/**"]`

## Theme Configuration

```json
"theme": {
  "inherit": boolean,      // Inherit system theme
  "overrides": {           // CSS variable overrides
    "--primary-color": "#3b82f6",
    "--background-color": "#1e1e2e",
    "--text-color": "#cdd6f4"
  }
}
```

When `inherit` is `true`, system theme colors/fonts are automatically used.

## Dependencies

```json
"dependencies": {
  "go_services": string[],        // Required Go backend services
  "qml_services": string[],       // Required QML/QuickShell services
  "webshell_version": string      // Minimum WebShell version
}
```

**Examples**:
```json
"dependencies": {
  "go_services": ["CalendarService", "AuthService"],
  "qml_services": ["WindowManager"],
  "webshell_version": "1.0.0"
}
```

## Lifecycle Hooks

```json
"hooks": {
  "onStartup": string,    // Run when app starts
  "onShutdown": string,   // Run when app closes
  "onSuspend": string,    // Run when system suspends
  "onResume": string      // Run when system resumes
}
```

JavaScript file paths relative to manifest.

**Use Cases**:
- `onStartup`: Initialization, data loading
- `onShutdown`: Cleanup, save state
- `onSuspend`: Pause operations, save state
- `onResume`: Resume operations, sync data

## Keyboard Shortcuts

```json
"shortcuts": [
  {
    "key": "Ctrl+Alt+C",
    "action": "toggle",
    "description": "Toggle calendar visibility"
  }
]
```

### Shortcut Properties

**key**: Keyboard combination
- Modifiers: `Ctrl`, `Alt`, `Shift`, `Super` (Win/Cmd)
- Examples: `"Ctrl+Alt+C"`, `"Super+T"`, `"Shift+F1"`

**action**: Action to perform
- Values: `"open"`, `"close"`, `"toggle"`, `"minimize"`, `"maximize"`, `"focus"`

**description**: Human-readable description (max 128 chars)

## Quick Reference Examples

### Minimal Widget
```json
{
  "version": "1.0.0",
  "name": "clock",
  "entrypoint": "index.html",
  "window": {
    "type": "widget",
    "width": 200,
    "height": 100
  }
}
```

### Calendar App
```json
{
  "version": "1.0.0",
  "name": "calendar",
  "displayName": "Calendar",
  "entrypoint": "index.html",
  "permissions": {
    "calendar": {
      "read": true,
      "write": true
    },
    "notifications": {
      "send": true
    }
  },
  "window": {
    "type": "widget",
    "width": 800,
    "height": 600,
    "blur": true
  }
}
```

### Development Mode App
```json
{
  "version": "1.0.0",
  "name": "my-app",
  "entrypoint": "index.html",
  "devServer": "http://localhost:5173",
  "devMode": {
    "hotReload": true,
    "watchPaths": ["src/**/*", "public/**/*"]
  }
}
```

## Validation

### JSON Schema
```json
{
  "$schema": "https://webshell.dev/schemas/manifest/v1.json"
}
```

Including `$schema` enables IDE autocomplete and validation.

### CLI Validation
```bash
npm install -g ajv-cli
ajv validate -s schemas/webshell-manifest.schema.json -d webshell.json
```

## Related Documentation

- [Manifest Schema](./manifest-schema.md) - Complete specification with validation rules
- [Permissions Guide](./permissions-guide.md) - Detailed permission documentation
- [Manifest Examples](./manifest-examples.md) - Real-world examples
- [Best Practices](./manifest-best-practices.md) - Recommended patterns
- [Troubleshooting](./manifest-troubleshooting.md) - Common issues and solutions
- [Migration Guide](./manifest-migration.md) - Migrating from other platforms
- [Getting Started](./getting-started.md) - Quick start guide
