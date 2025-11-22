# WebShell Manifest Best Practices

This guide provides recommended patterns and best practices for creating WebShell manifests that are secure, maintainable, and user-friendly.

## Permission Minimization

### Principle of Least Privilege

**DO**: Request only the permissions your app actually needs.

```json
{
  "permissions": {
    "calendar": {
      "read": true
    }
  }
}
```

**DON'T**: Request excessive permissions "just in case."

```json
{
  "permissions": {
    "calendar": {
      "read": true,
      "write": true,
      "delete": true
    },
    "filesystem": {
      "read": ["/"],
      "write": ["/"]
    },
    "network": {
      "allowed_hosts": ["*"]
    }
  }
}
```

**Why**: Users are more likely to trust and install apps with minimal permissions.

---

### Specific Filesystem Paths

**DO**: Use specific, app-relevant directories.

```json
{
  "permissions": {
    "filesystem": {
      "read": ["~/Documents", "~/Downloads"],
      "write": ["~/Documents/MyApp"]
    }
  }
}
```

**DON'T**: Request broad filesystem access.

```json
{
  "permissions": {
    "filesystem": {
      "read": ["~"],
      "write": ["~"]
    }
  }
}
```

**Why**: Limits potential damage if the app is compromised.

---

### Limited Network Access

**DO**: Specify exact hosts your app needs.

```json
{
  "permissions": {
    "network": {
      "allowed_hosts": ["api.myapp.com", "cdn.myapp.com"]
    }
  }
}
```

**DON'T**: Use wildcard unless you're building a browser.

```json
{
  "permissions": {
    "network": {
      "allowed_hosts": ["*"]
    }
  }
}
```

**Why**: Prevents unauthorized data exfiltration and SSRF attacks.

---

## Window Configuration

### Sensible Defaults

**DO**: Specify reasonable default window sizes.

```json
{
  "window": {
    "width": 800,
    "height": 600,
    "minWidth": 400,
    "minHeight": 300,
    "maxWidth": 1920,
    "maxHeight": 1080
  }
}
```

**DON'T**: Make windows too small or too large.

```json
{
  "window": {
    "width": 100,
    "height": 50
  }
}
```

**Why**: Good defaults provide better user experience across different screen sizes.

---

### Appropriate Window Types

**DO**: Choose the right window type for your app.

```json
// Widget for standalone apps
{
  "window": {
    "type": "widget"
  }
}

// Panel for system components
{
  "window": {
    "type": "panel"
  }
}

// Overlay for modal interfaces
{
  "window": {
    "type": "overlay"
  }
}

// Dialog for alerts/prompts
{
  "window": {
    "type": "dialog"
  }
}
```

**DON'T**: Use `dialog` for your main app window.

```json
{
  "window": {
    "type": "dialog",
    "width": 1600,
    "height": 1000
  }
}
```

**Why**: Window types have specific UX implications.

---

### Responsive Design

**DO**: Set min/max constraints for responsive layouts.

```json
{
  "window": {
    "width": 1000,
    "height": 700,
    "minWidth": 600,
    "minHeight": 400,
    "resizable": true
  }
}
```

**DON'T**: Make large windows non-resizable.

```json
{
  "window": {
    "width": 1600,
    "height": 1000,
    "resizable": false
  }
}
```

**Why**: Users have different screen sizes and preferences.

---

## App Naming

### Use Descriptive, Lowercase Names

**DO**: Choose clear, kebab-case names.

```json
{
  "name": "calendar",
  "displayName": "Calendar"
}

{
  "name": "task-manager",
  "displayName": "Task Manager"
}

{
  "name": "note-editor",
  "displayName": "Note Editor"
}
```

**DON'T**: Use unclear, uppercase, or special characters.

```json
{
  "name": "MyApp"
}

{
  "name": "app123"
}

{
  "name": "THE_BEST_APP"
}

{
  "name": "my.cool.app"
}
```

**Why**: The `name` field is used in URLs, file paths, and IDs—keep it simple.

---

### Provide Display Names

**DO**: Always set a user-friendly display name.

```json
{
  "name": "music-player",
  "displayName": "Music Player"
}
```

**DON'T**: Rely on the `name` field for UI display.

```json
{
  "name": "music-player"
  // No displayName - UI will show "music-player"
}
```

**Why**: Display names are shown to users in menus and dialogs.

---

## Metadata Completeness

### Include All Relevant Fields

**DO**: Provide complete metadata for better discoverability.

```json
{
  "version": "1.0.0",
  "name": "calendar",
  "displayName": "Calendar",
  "description": "Manage events and schedules with ease",
  "author": "Your Name <you@example.com>",
  "license": "MIT",
  "homepage": "https://github.com/user/calendar",
  "repository": "https://github.com/user/calendar.git",
  "keywords": ["calendar", "productivity", "scheduling"],
  "icon": "calendar.svg"
}
```

**DON'T**: Skip optional metadata.

```json
{
  "version": "1.0.0",
  "name": "calendar",
  "entrypoint": "index.html"
}
```

**Why**: Complete metadata helps users discover and trust your app.

---

### Use Semantic Versioning

**DO**: Follow semantic versioning strictly.

```json
{
  "version": "1.0.0"   // Initial release
}

{
  "version": "1.1.0"   // New feature (backward compatible)
}

{
  "version": "2.0.0"   // Breaking change
}

{
  "version": "1.0.1"   // Bug fix
}
```

**DON'T**: Use arbitrary version numbers.

```json
{
  "version": "v1"
}

{
  "version": "2025-01-19"
}

{
  "version": "latest"
}
```

**Why**: Semantic versioning communicates compatibility expectations.

---

## Schema Validation

### Always Include $schema

**DO**: Reference the JSON schema for IDE support.

```json
{
  "$schema": "https://webshell.dev/schemas/manifest/v1.json",
  "version": "1.0.0",
  "name": "my-app",
  "entrypoint": "index.html"
}
```

**DON'T**: Skip the schema reference.

```json
{
  "version": "1.0.0",
  "name": "my-app",
  "entrypoint": "index.html"
}
```

**Why**: Enables autocomplete and validation in modern IDEs.

---

### Validate Before Deployment

**DO**: Test your manifest with the JSON schema validator.

```bash
npm install -g ajv-cli
ajv validate -s schemas/webshell-manifest.schema.json -d webshell.json
```

**DON'T**: Deploy without validation.

**Why**: Catch errors early before users encounter them.

---

## Development Workflow

### Use Dev Mode for Local Development

**DO**: Configure development server for hot reload.

```json
{
  "devServer": "http://localhost:5173",
  "devMode": {
    "hotReload": true,
    "watchPaths": ["src/**/*", "public/**/*"],
    "ignorePaths": ["node_modules/**", "dist/**"]
  }
}
```

**DON'T**: Skip dev mode configuration.

**Why**: Hot reload speeds up development significantly.

---

### Separate Dev and Production Configs

**DO**: Use different manifests or environment-specific builds.

```json
// webshell.dev.json
{
  "devServer": "http://localhost:5173",
  "devMode": {
    "hotReload": true
  }
}

// webshell.json (production)
{
  "entrypoint": "dist/index.html"
}
```

**DON'T**: Include dev server URLs in production manifests.

**Why**: Prevents accidental exposure of local development servers.

---

## Lifecycle Management

### Use Hooks for State Management

**DO**: Implement lifecycle hooks for proper initialization and cleanup.

```json
{
  "hooks": {
    "onStartup": "scripts/init.js",
    "onShutdown": "scripts/cleanup.js",
    "onSuspend": "scripts/pause.js",
    "onResume": "scripts/resume.js"
  }
}
```

**Example `scripts/init.js`**:
```javascript
// Initialize database connection
// Load cached data
// Sync with server
```

**Example `scripts/cleanup.js`**:
```javascript
// Close database connection
// Save state
// Clear temporary files
```

**Why**: Proper lifecycle management prevents data loss and resource leaks.

---

## Keyboard Shortcuts

### Provide Useful Shortcuts

**DO**: Add shortcuts for common actions.

```json
{
  "shortcuts": [
    {
      "key": "Ctrl+Alt+C",
      "action": "toggle",
      "description": "Toggle calendar visibility"
    },
    {
      "key": "Ctrl+N",
      "action": "focus",
      "description": "Create new event"
    }
  ]
}
```

**DON'T**: Omit shortcuts for frequently used apps.

**Why**: Power users appreciate keyboard shortcuts for quick access.

---

### Use Standard Modifiers

**DO**: Stick to common modifier combinations.

```json
{
  "shortcuts": [
    {"key": "Ctrl+Alt+C", "action": "toggle"},
    {"key": "Super+T", "action": "open"}
  ]
}
```

**DON'T**: Use complex or conflicting shortcuts.

```json
{
  "shortcuts": [
    {"key": "Ctrl+Alt+Shift+Super+F12", "action": "toggle"}
  ]
}
```

**Why**: Simple shortcuts are easier to remember and less likely to conflict.

---

## Theme Integration

### Inherit System Theme

**DO**: Use system theme for consistency.

```json
{
  "theme": {
    "inherit": true
  }
}
```

**DON'T**: Hard-code colors that conflict with system themes.

```json
{
  "theme": {
    "inherit": false,
    "overrides": {
      "--background": "#ffffff",
      "--text": "#000000"
    }
  }
}
```

**Why**: Apps should respect user's theme preferences (light/dark mode).

---

### Use Theme Overrides Sparingly

**DO**: Override only brand-specific colors.

```json
{
  "theme": {
    "inherit": true,
    "overrides": {
      "--primary-color": "#3b82f6",
      "--brand-accent": "#8b5cf6"
    }
  }
}
```

**DON'T**: Override all theme variables.

```json
{
  "theme": {
    "inherit": true,
    "overrides": {
      "--background": "#000",
      "--text": "#fff",
      "--primary": "#f00",
      // ... 50 more overrides
    }
  }
}
```

**Why**: Too many overrides defeat the purpose of theme inheritance.

---

## Security Considerations

### Document Permission Usage

**DO**: Explain why each permission is needed in your README.

```markdown
## Permissions

This app requires the following permissions:

- **Calendar (read/write)**: To display and manage your events
- **Notifications (send)**: To remind you of upcoming events
- **Filesystem (write ~/Documents/MyApp)**: To save exported calendars
```

**Why**: Transparency builds user trust.

---

### Validate User Input

**DO**: Always sanitize and validate user input, especially for filesystem and network operations.

```javascript
// Good: Validate file path
function saveFile(userPath, content) {
  const sanitized = sanitizePath(userPath);
  if (!isAllowedPath(sanitized)) {
    throw new Error("Path not allowed");
  }
  return webshell.fs.writeFile(sanitized, content);
}
```

**DON'T**: Trust user input blindly.

```javascript
// Bad: Direct use of user input
function saveFile(userPath, content) {
  return webshell.fs.writeFile(userPath, content);
}
```

**Why**: Prevents path traversal and other injection attacks.

---

### Audit Third-Party Dependencies

**DO**: Review permissions required by third-party libraries.

**DON'T**: Blindly include libraries that request excessive permissions.

**Why**: Your app is responsible for all code it executes.

---

## Testing

### Test Permission Denials

**DO**: Test your app with various permission configurations.

```javascript
// Test graceful degradation
if (!webshell.permissions.has("calendar", "read")) {
  showMessage("Calendar access required for this feature");
  disableCalendarUI();
}
```

**Why**: Ensures graceful handling of missing permissions.

---

### Test Different Window Sizes

**DO**: Test your app at minimum, default, and maximum window sizes.

**DON'T**: Only test at your development resolution.

**Why**: Users have different screen sizes.

---

### Test Theme Compatibility

**DO**: Test with both light and dark system themes.

**DON'T**: Assume users use the same theme as you.

**Why**: Poor contrast in dark mode is a common issue.

---

## Documentation

### Maintain a README

**DO**: Create comprehensive documentation.

```markdown
# My App

## Installation
## Usage
## Permissions
## Configuration
## Troubleshooting
## License
```

**Why**: Good documentation reduces support requests.

---

### Document Configuration Options

**DO**: Explain all manifest fields you use.

```markdown
## Manifest Configuration

- `devServer`: Set to your local dev server URL
- `permissions.calendar`: Required for event management
- `window.blur`: Enable for modern aesthetic (requires compositor)
```

**Why**: Helps users customize your app.

---

## Version Management

### Keep Changelog

**DO**: Maintain a CHANGELOG.md.

```markdown
# Changelog

## [1.1.0] - 2025-01-19
### Added
- Dark mode support
- Keyboard shortcuts

### Fixed
- Calendar sync issues

## [1.0.0] - 2025-01-01
- Initial release
```

**Why**: Users want to know what changed between versions.

---

### Use Git Tags

**DO**: Tag releases in your repository.

```bash
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

**Why**: Makes it easy to find specific versions.

---

## Distribution

### Provide Installation Instructions

**DO**: Make installation easy.

```markdown
## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/user/my-app.git
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Launch the app:
   ```bash
   webshell launch ./webshell.json
   ```
```

**Why**: Lower barrier to entry increases adoption.

---

### Include Example Configuration

**DO**: Provide a sample `webshell.json` with comments.

```jsonc
{
  "$schema": "https://webshell.dev/schemas/manifest/v1.json",
  "version": "1.0.0",
  "name": "my-app",
  "entrypoint": "index.html",

  // Optional: Add your dev server URL during development
  "devServer": "http://localhost:5173",

  // Configure permissions based on your needs
  "permissions": {
    "calendar": {
      "read": true  // Required for displaying events
    }
  }
}
```

**Why**: Examples are easier to understand than documentation.

---

## Summary Checklist

Before publishing your app, ensure:

- [ ] Minimal permissions requested
- [ ] `$schema` included for validation
- [ ] Semantic versioning used
- [ ] Complete metadata (description, author, license, etc.)
- [ ] Sensible window defaults
- [ ] Keyboard shortcuts for common actions
- [ ] Lifecycle hooks for state management
- [ ] System theme inheritance enabled
- [ ] README with permission explanations
- [ ] Tested with different themes and window sizes
- [ ] Validated manifest with JSON schema
- [ ] CHANGELOG maintained
- [ ] Installation instructions provided

---

## Related Documentation

- [Manifest Reference](./manifest-reference.md) - Field reference
- [Permissions Guide](./permissions-guide.md) - Permission details
- [Manifest Examples](./manifest-examples.md) - Real-world examples
- [Troubleshooting](./manifest-troubleshooting.md) - Common issues
- [Migration Guide](./manifest-migration.md) - Platform migration
- [Manifest Schema](./manifest-schema.md) - Complete specification
