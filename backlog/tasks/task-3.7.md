---
id: task-3.7
title: Write manifest documentation
status: To Do
created_date: 2025-01-18
milestone: milestone-3
assignees: []
labels: [documentation]
dependencies: [task-3.1, task-3.2, task-3.3, task-3.4, task-3.5, task-3.6]
---

## Description

Create comprehensive documentation for the WebShell manifest system, covering all fields, permissions, examples, and best practices.

## Acceptance Criteria

- [ ] Manifest specification documented
- [ ] All fields explained with examples
- [ ] Permission model documented
- [ ] Migration guides written
- [ ] Best practices guide created
- [ ] Example manifests for common apps
- [ ] Troubleshooting guide

## Implementation Plan

1. **Create Manifest Reference**

**File**: `docs/manifest-reference.md`
````markdown
# WebShell Manifest Reference

## Overview

The `webshell.json` manifest defines how your web application integrates
into the WebShell environment.

## Required Fields

### version
- Type: `string`
- Pattern: `X.Y.Z` (semantic versioning)
- Example: `"1.0.0"`

Specifies the manifest format version.

### name
- Type: `string`
- Pattern: `^[a-z0-9-]+$`
- Example: `"calendar"`

Unique identifier for your app. Must be lowercase alphanumeric with hyphens.

### entrypoint
- Type: `string`
- Example: `"index.html"`

Path to the main HTML file, relative to manifest location.

## Optional Fields

### displayName
- Type: `string`
- Example: `"Calendar"`

Human-readable name shown in UI.

### description
- Type: `string`
- Example: `"Manage your events and schedules"`

Brief description of app functionality.

### icon
- Type: `string`
- Example: `"icon.svg"`

Path to app icon (relative to manifest).

## Permissions

...
````

2. **Create Permission Guide**

**File**: `docs/permissions-guide.md`
````markdown
# WebShell Permissions Guide

## Permission Model

WebShell uses a capability-based security model. Apps must explicitly
declare required permissions in their manifest.

## Permission Categories

### calendar
Access to calendar data and events.

**Fields**:
```json
"calendar": {
  "read": boolean,
  "write": boolean,
  "delete": boolean
}
```

**Example Use Cases**:
- Calendar widget: read-only
- Event editor: read + write
- Sync tool: full access

### filesystem
Access to local filesystem.

**Fields**:
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
- Parent directory access blocked (`..`)

**Examples**:
```json
"filesystem": {
  "read": ["~/Documents"],
  "write": ["~/Downloads"]
}
```

...
````

3. **Create Examples Guide**

**File**: `docs/manifest-examples.md`
````markdown
# WebShell Manifest Examples

## Minimal Widget
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

## Calendar App
```json
{
  "version": "1.0.0",
  "name": "calendar",
  "displayName": "Calendar",
  "description": "Manage events and schedules",
  "entrypoint": "index.html",
  "icon": "calendar.svg",
  
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
    "minWidth": 400,
    "minHeight": 300,
    "blur": true,
    "transparency": true,
    "position": "center"
  }
}
```

## Email Client
```json
{
  "version": "1.0.0",
  "name": "mail",
  "displayName": "Mail",
  "entrypoint": "index.html",
  
  "permissions": {
    "network": {
      "allowed_hosts": [
        "imap.gmail.com",
        "smtp.gmail.com"
      ]
    },
    "filesystem": {
      "read": ["~/.mail/config"],
      "write": ["~/.mail/cache"]
    },
    "notifications": {
      "send": true
    }
  },
  
  "window": {
    "type": "overlay",
    "blur": true
  }
}
```

...
````

4. **Create Best Practices Guide**

**File**: `docs/manifest-best-practices.md`
````markdown
# WebShell Manifest Best Practices

## Permission Minimization

**DO**: Request only permissions you actually need
```json
"permissions": {
  "calendar": { "read": true }  // Only read, no write
}
```

**DON'T**: Request excessive permissions
```json
"permissions": {
  "calendar": { "read": true, "write": true, "delete": true },
  "filesystem": { "read": ["/"], "write": ["/"] },
  "network": { "allowed_hosts": ["*"] }
}
```

## Window Configuration

**DO**: Specify sensible defaults
```json
"window": {
  "width": 800,
  "height": 600,
  "minWidth": 400,
  "minHeight": 300
}
```

**DON'T**: Make windows too small or too large
```json
"window": {
  "width": 100,    // Too small
  "height": 5000   // Too large
}
```

## App Naming

**DO**: Use descriptive, lowercase names
- `calendar`
- `task-manager`
- `note-editor`

**DON'T**: Use unclear or uppercase names
- `MyApp`
- `app123`
- `THE_BEST_APP`

...
````

5. **Create Troubleshooting Guide**

**File**: `docs/manifest-troubleshooting.md`
````markdown
# Manifest Troubleshooting

## Common Errors

### "Missing required field: version"
**Cause**: Manifest is missing the `version` field.
**Solution**: Add version field:
```json
{
  "version": "1.0.0",
  ...
}
```

### "Invalid app name format"
**Cause**: App name contains uppercase or special characters.
**Solution**: Use lowercase alphanumeric with hyphens only:
```json
{
  "name": "my-app",  // ✓ Correct
  "name": "MyApp",   // ✗ Wrong
  ...
}
```

### "Permission denied: calendar.write"
**Cause**: App is trying to write calendar events without permission.
**Solution**: Add write permission to manifest:
```json
"permissions": {
  "calendar": {
    "write": true
  }
}
```

...
````

6. **Create Migration Guide**

**File**: `docs/manifest-migration.md**
````markdown
# Manifest Migration Guide

## From Electron

### package.json → webshell.json

**Electron**:
```json
{
  "name": "my-app",
  "main": "main.js",
  "build": {
    "appId": "com.example.myapp"
  }
}
```

**WebShell**:
```json
{
  "version": "1.0.0",
  "name": "my-app",
  "entrypoint": "index.html"
}
```

### Key Differences
- WebShell doesn't use `main.js` (web-only)
- No build configuration (use Vite)
- Explicit permission model

...
````

## Technical Notes

**Documentation Structure**:
````
docs/
├── README.md
├── getting-started.md
├── manifest-reference.md
├── permissions-guide.md
├── manifest-examples.md
├── manifest-best-practices.md
├── manifest-troubleshooting.md
└── manifest-migration.md
````

**Interactive Examples**:
Consider creating a documentation website with:
- Interactive manifest builder
- Live validation
- Copy-paste examples

## Reference Material

Study documentation styles:
- MDN Web Docs (for structure)
- Electron Docs (for migration guides)
- VSCode Extension Docs (for manifest reference)

## Definition of Done

- All documentation files created
- Examples tested and working
- Best practices documented
- Troubleshooting guide complete
- Git commit: "task-3.7: Write manifest documentation"
