# WebShell Manifest Examples

This directory contains example `webshell.json` manifest files demonstrating various configurations and use cases.

## Examples

### Minimal Configuration
**File**: `minimal.webshell.json`

The absolute minimum required fields for a WebShell application:
- `version`: Semantic version
- `name`: Unique identifier
- `entrypoint`: Main HTML file

```json
{
  "$schema": "https://webshell.dev/schemas/manifest/v1.json",
  "version": "1.0.0",
  "name": "hello-world",
  "entrypoint": "index.html"
}
```

### Calendar Application
**File**: `calendar-app.webshell.json`

A full-featured calendar widget demonstrating:
- Calendar permissions (read, write, delete)
- Notifications
- Filesystem access for configuration
- Widget window type with blur and transparency
- Theme inheritance and overrides
- Service dependencies
- Lifecycle hooks
- Keyboard shortcuts

**Key Features**:
- 800x600 resizable window with blur effect
- Calendar data access
- System notifications for events
- Keyboard shortcut: `Ctrl+Alt+C` to toggle

### Email Client
**File**: `email-client.webshell.json`

A modern email client showcasing:
- Network permissions with multiple allowed hosts
- IMAP/SMTP server access
- Filesystem access for mail storage
- Clipboard integration
- Contacts read access
- Overlay window type
- Multiple lifecycle hooks

**Key Features**:
- 1200x800 overlay window
- Network access to mail servers (Gmail, Outlook, Fastmail)
- Mail storage in `~/.mail` directory
- Automatic inbox synchronization
- Keyboard shortcut: `Ctrl+Alt+M` to toggle

## Using These Examples

### Validation
All examples include the `$schema` field which enables:
- IDE autocomplete and validation (VS Code, IntelliJ, etc.)
- Schema validation with tools like `ajv-cli`

To validate a manifest:
```bash
npm install -g ajv-cli
ajv validate -s schemas/webshell-manifest.schema.json -d examples/manifests/calendar-app.webshell.json
```

### Integration
To use an example as a starting point:

1. Copy the example to your project root:
```bash
cp examples/manifests/minimal.webshell.json ./webshell.json
```

2. Customize the fields for your application

3. Launch with WebShell:
```bash
quickshell -p .
```

## Permission Guidelines

### Default-Deny Security
All permissions default to `false` or empty arrays. Applications must explicitly request each permission they need.

### Permission Types

**Calendar**: Read, write, delete calendar events
```json
"calendar": {
  "read": true,
  "write": true,
  "delete": false
}
```

**Filesystem**: Path-based access control
```json
"filesystem": {
  "read": ["~/.config/myapp"],
  "write": ["~/.config/myapp"],
  "watch": ["~/Documents"]
}
```

**Network**: Host whitelist and WebSocket control
```json
"network": {
  "allowed_hosts": ["api.example.com", "*.github.com"],
  "websockets": true
}
```

**Notifications**: System notification permission
```json
"notifications": {
  "send": true
}
```

**Clipboard**: Read and write separately controlled
```json
"clipboard": {
  "read": true,
  "write": true
}
```

**Processes**: Command execution with whitelist
```json
"processes": {
  "spawn": true,
  "allowed_commands": ["git", "npm"]
}
```

## Window Types

### Widget
Standalone application window (default)
- Standard window decorations
- Appears in taskbar
- Can be minimized/maximized

### Panel
Docked panel component
- Attaches to screen edges
- Uses `margins` for positioning
- Typically not resizable

### Overlay
Full-screen or large modal overlay
- Can cover entire screen
- Often with transparency/blur
- Good for main application windows

### Dialog
Modal dialog box
- Always on top
- Typically smaller
- Blocks interaction with parent window

## Theme System

### Inherit System Theme
```json
"theme": {
  "inherit": true
}
```

### Custom Overrides
```json
"theme": {
  "inherit": true,
  "overrides": {
    "--primary-color": "#3b82f6",
    "--background-color": "#1e1e2e",
    "--text-color": "#cdd6f4"
  }
}
```

CSS variables are automatically injected into the application's root element.

## Best Practices

1. **Always include `$schema`** for IDE support and validation
2. **Use semantic versioning** for the `version` field
3. **Request minimal permissions** - only what you actually need
4. **Provide descriptive metadata** - `displayName`, `description`, `author`
5. **Define window constraints** - `minWidth`, `minHeight` for better UX
6. **Use lifecycle hooks** for initialization and cleanup
7. **Add keyboard shortcuts** for power users
8. **Version your dependencies** with `webshell_version`

## Testing Your Manifest

### Check Required Fields
Ensure you have at minimum:
- `version`
- `name`
- `entrypoint`

### Verify File Paths
- `entrypoint` must exist
- `icon` (if specified) must exist
- Hook scripts must exist

### Test Permissions
Start with minimal permissions and add only what you need when you need it.

### Validate Schema
Use the JSON schema for validation before deploying.

## Additional Resources

- [Full Manifest Schema Documentation](../../docs/manifest-schema.md)
- [Permission System Guide](../../docs/permissions.md) (future)
- [Window Management](../../docs/windows.md) (future)
- [Theme System](../../docs/theming.md)
