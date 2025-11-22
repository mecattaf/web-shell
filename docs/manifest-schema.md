# WebShell Manifest Schema (v1.0.0)

The WebShell manifest file (`webshell.json`) defines the configuration and metadata for a WebShell application. This is the declarative format that describes how web apps integrate into the shell.

**Analogous to**: `package.json`, `manifest.json`, or `.desktop` files — but specifically for WebShell.

## Quick Start

### Minimal Example
```json
{
  "$schema": "https://webshell.dev/schemas/manifest/v1.json",
  "version": "1.0.0",
  "name": "hello-world",
  "entrypoint": "index.html"
}
```

### Complete Example
```json
{
  "$schema": "https://webshell.dev/schemas/manifest/v1.json",
  "version": "1.0.0",
  "name": "calendar",
  "displayName": "Calendar",
  "description": "Weekly calendar view with event management",
  "author": "Your Name",
  "license": "MIT",

  "entrypoint": "index.html",
  "icon": "icon.svg",

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
  },

  "theme": {
    "inherit": true
  }
}
```

## Schema Reference

### Core Metadata

#### `$schema` (recommended)
- **Type**: `string`
- **Description**: Reference to the JSON schema for validation and IDE support
- **Value**: `"https://webshell.dev/schemas/manifest/v1.json"`
- **Benefits**: Enables autocomplete and validation in modern IDEs

#### `version` (required)
- **Type**: `string`
- **Description**: Semantic version of the application
- **Pattern**: `MAJOR.MINOR.PATCH[-prerelease][+build]`
- **Examples**:
  - `"1.0.0"`
  - `"2.1.3-beta.1"`
  - `"1.0.0+20250119"`
- **Validation**: Must follow semantic versioning (semver)

#### `name` (required)
- **Type**: `string`
- **Description**: Unique identifier for the application
- **Pattern**: `^[a-z0-9-]+$` (lowercase, alphanumeric, hyphens only)
- **Length**: 1-64 characters
- **Examples**: `"calendar"`, `"email-client"`, `"system-monitor"`

#### `displayName` (optional)
- **Type**: `string`
- **Description**: Human-readable display name shown in UI
- **Length**: 1-128 characters
- **Examples**: `"Calendar"`, `"Email Client"`, `"System Monitor"`
- **Default**: Uses `name` field if not specified

#### `description` (optional)
- **Type**: `string`
- **Description**: Brief description of the application
- **Length**: Max 500 characters
- **Example**: `"Weekly calendar view with event management"`

#### `author` (optional)
- **Type**: `string`
- **Description**: Author name and/or email
- **Length**: Max 256 characters
- **Examples**:
  - `"John Doe"`
  - `"WebShell Team <team@webshell.dev>"`

#### `license` (optional)
- **Type**: `string`
- **Description**: SPDX license identifier
- **Examples**: `"MIT"`, `"Apache-2.0"`, `"GPL-3.0"`, `"BSD-3-Clause"`

#### `homepage` (optional)
- **Type**: `string`
- **Format**: URI
- **Description**: Project homepage URL
- **Example**: `"https://github.com/user/calendar-app"`

#### `repository` (optional)
- **Type**: `string`
- **Format**: URI
- **Description**: Source code repository URL
- **Example**: `"https://github.com/user/calendar-app.git"`

#### `keywords` (optional)
- **Type**: `array` of strings
- **Description**: Keywords for searching and categorization
- **Max Items**: 10
- **Item Length**: 1-32 characters
- **Unique**: Yes
- **Example**: `["calendar", "productivity", "scheduling"]`

### Application Entry

#### `entrypoint` (required)
- **Type**: `string`
- **Description**: Path to the main HTML file (relative to manifest)
- **Pattern**: Must not start with `/` or contain `..`
- **Extension**: Must end with `.html` or `.htm`
- **Examples**: `"index.html"`, `"dist/index.html"`

#### `icon` (optional)
- **Type**: `string`
- **Description**: Path to application icon
- **Formats**: `.svg`, `.png`, `.ico`
- **Examples**: `"icon.svg"`, `"assets/icon.png"`

### Development Mode

#### `devServer` (optional)
- **Type**: `string`
- **Format**: URI
- **Description**: Development server URL for hot reload
- **Restrictions**: Must use `localhost` or `127.0.0.1` for security
- **Examples**: `"http://localhost:5173"`, `"http://127.0.0.1:3000"`
- **Note**: Only active when launched with `--dev` flag

#### `devMode` (optional)
- **Type**: `object`
- **Description**: Development mode configuration

##### `devMode.hotReload`
- **Type**: `boolean`
- **Description**: Enable automatic reload on file changes
- **Default**: `true`

##### `devMode.watchPaths`
- **Type**: `array` of strings
- **Description**: Glob patterns for files to watch
- **Default**: `["src/**/*"]`
- **Example**: `["src/**/*", "public/**/*", "index.html"]`

##### `devMode.ignorePaths`
- **Type**: `array` of strings
- **Description**: Glob patterns for files to ignore
- **Default**: `["node_modules/**", "dist/**"]`
- **Example**: `["node_modules/**", "dist/**", ".git/**", "**/*.test.ts"]`

### Permissions

WebShell follows a **default-deny security model**. All permissions default to `false` or empty arrays. Applications must explicitly request each permission.

#### `permissions.calendar`
```json
"calendar": {
  "read": false,    // Read calendar events
  "write": false,   // Create and modify events
  "delete": false   // Delete events
}
```

#### `permissions.contacts`
```json
"contacts": {
  "read": false,    // Read contact information
  "write": false,   // Create and modify contacts
  "delete": false   // Delete contacts
}
```

#### `permissions.filesystem`
```json
"filesystem": {
  "read": [],    // Array of allowed read paths
  "write": [],   // Array of allowed write paths
  "watch": []    // Array of paths to watch for changes
}
```
- **Path Format**: Supports `~` expansion and glob patterns
- **Examples**:
  - `["~/.config/myapp"]`
  - `["/tmp/app-cache"]`
  - `["~/Documents/*.txt"]`

#### `permissions.network`
```json
"network": {
  "allowed_hosts": [],  // Array of allowed hosts/domains
  "websockets": false   // Enable WebSocket connections
}
```
- **Host Format**: Domain names or wildcards
- **Examples**:
  - `["localhost"]`
  - `["api.example.com", "*.github.com"]`
  - `["imap.gmail.com", "smtp.gmail.com"]`

#### `permissions.notifications`
```json
"notifications": {
  "send": false  // Send system notifications
}
```

#### `permissions.clipboard`
```json
"clipboard": {
  "read": false,   // Read from clipboard
  "write": false   // Write to clipboard
}
```

#### `permissions.processes`
```json
"processes": {
  "spawn": false,           // Spawn new system processes
  "allowed_commands": []    // Whitelist of allowed commands (if spawn is true)
}
```
- **Example**: `{"spawn": true, "allowed_commands": ["git", "npm", "ls"]}`
- **Security**: Command whitelist is enforced when `spawn` is `true`

#### `permissions.system`
```json
"system": {
  "power": false,  // Control power management (shutdown, suspend, etc.)
  "audio": false   // Access audio input/output
}
```

#### `permissions.api` (legacy)
- **Type**: `array` of strings
- **Description**: Simple API permissions (deprecated in favor of specific permissions)
- **Values**: `["clipboard", "notifications", "filesystem", "network", "process"]`
- **Note**: Kept for backward compatibility

### Window Configuration

#### `window.type`
- **Type**: `string`
- **Values**: `"widget"` | `"panel"` | `"overlay"` | `"dialog"`
- **Default**: `"widget"`

**Window Types**:
- **widget**: Standalone application window (standard behavior)
- **panel**: Docked panel component (attaches to screen edges)
- **overlay**: Full-screen or large modal overlay
- **dialog**: Modal dialog box (always on top)

#### Window Dimensions

```json
"window": {
  "width": 1280,        // Initial width (100-7680 px)
  "height": 720,        // Initial height (100-4320 px)
  "minWidth": 400,      // Minimum width
  "minHeight": 300,     // Minimum height
  "maxWidth": 1920,     // Maximum width
  "maxHeight": 1080     // Maximum height
}
```

#### Window Appearance

```json
"window": {
  "title": "My App",           // Window title (defaults to displayName or name)
  "resizable": true,           // Allow resizing
  "blur": false,               // Background blur effect (requires compositor)
  "transparency": false,       // Transparent background (requires compositor)
  "position": "center",        // Initial position
  "alwaysOnTop": false,        // Keep above other windows
  "showInTaskbar": true        // Show in taskbar
}
```

**Position Values**: `"center"`, `"top-left"`, `"top-right"`, `"bottom-left"`, `"bottom-right"`

#### Window Margins (for panels)

```json
"window": {
  "margins": {
    "top": 0,
    "right": 0,
    "bottom": 0,
    "left": 0
  }
}
```
- **Use Case**: Positioning panels relative to screen edges
- **Units**: Pixels

### Theme Configuration

```json
"theme": {
  "inherit": true,      // Inherit system theme
  "overrides": {        // CSS variable overrides
    "--primary-color": "#3b82f6",
    "--background-color": "#1e1e2e",
    "--text-color": "#cdd6f4"
  }
}
```

- **Inheritance**: When `inherit` is `true`, system theme colors/fonts are used
- **Overrides**: CSS custom properties injected into root element
- **Variables**: Any valid CSS variable can be overridden

### Dependencies

```json
"dependencies": {
  "go_services": ["CalendarService", "AuthService"],
  "qml_services": ["WindowManager"],
  "webshell_version": "1.0.0"
}
```

#### `dependencies.go_services`
- **Type**: `array` of strings
- **Description**: Required Go backend services
- **Unique**: Yes

#### `dependencies.qml_services`
- **Type**: `array` of strings
- **Description**: Required QML/QuickShell services
- **Unique**: Yes

#### `dependencies.webshell_version`
- **Type**: `string`
- **Description**: Minimum required WebShell version
- **Pattern**: `MAJOR.MINOR.PATCH`
- **Example**: `"1.0.0"`

### Lifecycle Hooks

```json
"hooks": {
  "onStartup": "startup.js",       // Run when app starts
  "onShutdown": "cleanup.js",      // Run when app closes
  "onSuspend": "suspend.js",       // Run when system suspends
  "onResume": "resume.js"          // Run when system resumes
}
```

- **Type**: JavaScript file paths (relative to manifest)
- **Use Cases**: Initialization, cleanup, state management, synchronization

### Keyboard Shortcuts

```json
"shortcuts": [
  {
    "key": "Ctrl+Alt+C",
    "action": "toggle",
    "description": "Toggle calendar visibility"
  },
  {
    "key": "Ctrl+N",
    "action": "open",
    "description": "Open calendar and focus new event"
  }
]
```

#### Shortcut Properties

- **key**: Keyboard combination (platform-agnostic format)
  - Modifiers: `Ctrl`, `Alt`, `Shift`, `Super` (Win/Cmd key)
  - Examples: `"Ctrl+Alt+C"`, `"Super+T"`, `"Shift+F1"`

- **action**: Action to perform
  - Values: `"open"`, `"close"`, `"toggle"`, `"minimize"`, `"maximize"`, `"focus"`

- **description**: Human-readable description (max 128 chars)

## Validation Rules

### Automated Validation

The JSON schema (`schemas/webshell-manifest.schema.json`) provides:
- Type checking
- Pattern validation
- Range constraints
- Required field enforcement

### Runtime Validation

WebShell performs additional checks at runtime:

1. **File Existence**:
   - `entrypoint` file must exist
   - `icon` file must exist (if specified)
   - Hook scripts must exist (if specified)

2. **Permission Conflicts**:
   - No duplicate permissions
   - Unknown permissions logged as warnings

3. **Window Constraints**:
   - `minWidth` ≤ `width` ≤ `maxWidth`
   - `minHeight` ≤ `height` ≤ `maxHeight`

4. **Path Security**:
   - `entrypoint` must not escape app directory
   - Filesystem paths validated for security

### Validation Tools

**IDE Validation** (with `$schema`):
- VS Code, IntelliJ, WebStorm provide real-time validation

**CLI Validation**:
```bash
npm install -g ajv-cli
ajv validate -s schemas/webshell-manifest.schema.json -d webshell.json
```

## Loading Manifest

WebShell automatically searches for `webshell.json` in:

1. Current directory
2. Parent directories (up to 3 levels)
3. User's app directory (`~/.local/share/webshell/apps/`)

**Explicit Path**:
```bash
quickshell -p /path/to/app
```

## Schema Evolution

This schema follows **semantic versioning**:

- **Patch** (1.0.x): Bug fixes, documentation (no breaking changes)
- **Minor** (1.x.0): New optional fields (backward compatible)
- **Major** (x.0.0): Breaking changes to existing fields

**Current Version**: `1.0.0`

### Migration Strategy

- Major version increments require migration
- Migration tools provided for breaking changes
- Old manifests supported for one major version

## Security Considerations

### Default-Deny Model
- All permissions default to `false` or empty arrays
- Explicit opt-in required for every capability
- Principle of least privilege

### User Confirmation
Sensitive permissions may require user approval:
- Filesystem write access
- Process spawning
- Network access to non-localhost hosts
- Power management

### Capability-Based Security
- Permissions are capability-based, not identity-based
- Fine-grained control (e.g., specific filesystem paths)
- Revocable at runtime

### Sandboxing
- Applications run in isolated contexts
- No access to system resources without permission
- Network requests restricted to allowed hosts

## Examples

See the `examples/manifests/` directory for complete examples:

- **minimal.webshell.json**: Bare minimum configuration
- **calendar-app.webshell.json**: Full-featured calendar widget
- **email-client.webshell.json**: Email client with network access

## TypeScript Type Definition

```typescript
interface WebShellManifest {
  // Core metadata (required)
  version: string;
  name: string;
  entrypoint: string;

  // Optional metadata
  $schema?: string;
  displayName?: string;
  description?: string;
  author?: string;
  license?: string;
  homepage?: string;
  repository?: string;
  keywords?: string[];
  icon?: string;

  // Development
  devServer?: string;
  devMode?: {
    hotReload?: boolean;
    watchPaths?: string[];
    ignorePaths?: string[];
  };

  // Permissions (default-deny)
  permissions?: {
    calendar?: {
      read?: boolean;
      write?: boolean;
      delete?: boolean;
    };
    contacts?: {
      read?: boolean;
      write?: boolean;
      delete?: boolean;
    };
    filesystem?: {
      read?: string[];
      write?: string[];
      watch?: string[];
    };
    network?: {
      allowed_hosts?: string[];
      websockets?: boolean;
    };
    notifications?: {
      send?: boolean;
    };
    clipboard?: {
      read?: boolean;
      write?: boolean;
    };
    processes?: {
      spawn?: boolean;
      allowed_commands?: string[];
    };
    system?: {
      power?: boolean;
      audio?: boolean;
    };
    api?: string[];  // Legacy
  };

  // Window configuration
  window?: {
    type?: 'widget' | 'panel' | 'overlay' | 'dialog';
    width?: number;
    height?: number;
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
    title?: string;
    resizable?: boolean;
    blur?: boolean;
    transparency?: boolean;
    transparent?: boolean;  // Alias
    position?: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    margins?: {
      top?: number;
      right?: number;
      bottom?: number;
      left?: number;
    };
    alwaysOnTop?: boolean;
    showInTaskbar?: boolean;
  };

  // Theme
  theme?: {
    inherit?: boolean;
    overrides?: Record<string, string>;
  };

  // Dependencies
  dependencies?: {
    go_services?: string[];
    qml_services?: string[];
    webshell_version?: string;
  };

  // Lifecycle hooks
  hooks?: {
    onStartup?: string;
    onShutdown?: string;
    onSuspend?: string;
    onResume?: string;
  };

  // Keyboard shortcuts
  shortcuts?: Array<{
    key: string;
    action: 'open' | 'close' | 'toggle' | 'minimize' | 'maximize' | 'focus';
    description?: string;
  }>;
}
```

## Future Enhancements

Planned additions for future versions:

### v1.1.0 (Minor)
- `categories`: Application categories for app stores
- `screenshots`: Screenshot URLs for documentation
- `changelog`: Path to changelog file

### v1.2.0 (Minor)
- `plugins`: Plugin system for extensibility
- `i18n`: Internationalization configuration
- `updates`: Auto-update configuration

### v2.0.0 (Major - Breaking)
- Restructured permissions model
- Enhanced dependency resolution
- Plugin API formalization

## Related Documentation

- [Getting Started Guide](./getting-started.md)
- [Development Mode Guide](./dev-mode.md)
- [Theming System](./theming.md)
- [Wallpaper Theme Generation](./wallpaper-theme-generation.md)
- [Example Manifests](../examples/manifests/README.md)
- [JSON Schema File](../schemas/webshell-manifest.schema.json)

## Migration Guide

### From No Manifest

If you're using WebShell without a manifest:

1. Create `webshell.json` in your app root:
```json
{
  "$schema": "https://webshell.dev/schemas/manifest/v1.json",
  "version": "1.0.0",
  "name": "my-app",
  "entrypoint": "index.html"
}
```

2. Add required permissions
3. Configure window properties
4. Test thoroughly

### From Legacy Simple Permissions

Old format:
```json
{
  "permissions": {
    "api": ["clipboard", "notifications"]
  }
}
```

New format:
```json
{
  "permissions": {
    "clipboard": {
      "read": true,
      "write": true
    },
    "notifications": {
      "send": true
    }
  }
}
```

**Note**: Legacy `api` array is still supported but deprecated.

## Best Practices

1. **Always include `$schema`** for IDE support
2. **Use semantic versioning** strictly
3. **Request minimal permissions** (principle of least privilege)
4. **Provide complete metadata** for better user experience
5. **Define window constraints** for consistent UX
6. **Use lifecycle hooks** for proper initialization/cleanup
7. **Add keyboard shortcuts** for power users
8. **Version your dependencies** to ensure compatibility
9. **Test validation** before deployment
10. **Document your permissions** in your app's README

## Reference Material

The WebShell manifest format draws inspiration from:
- [Chrome Extension manifest.json](https://developer.chrome.com/docs/extensions/mv3/manifest/)
- [Electron package.json](https://www.electronjs.org/docs/latest/tutorial/application-distribution)
- [PWA manifest.json](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Flatpak metadata](https://docs.flatpak.org/en/latest/manifests.html)
- [.desktop files](https://specifications.freedesktop.org/desktop-entry-spec/latest/)

## Support

For questions, issues, or contributions:
- GitHub Issues: [webshell/issues](https://github.com/webshell/webshell/issues)
- Documentation: [webshell.dev/docs](https://webshell.dev/docs)
- Community: [webshell.dev/community](https://webshell.dev/community)
