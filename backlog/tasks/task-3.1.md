---
id: task-3.1
title: Design webshell.json manifest schema
status: Done
created_date: 2025-01-18
milestone: milestone-3
assignees: []
labels: [architecture, specification]
---

## Description

Define the JSON schema for WebShell application manifests. This is the declarative format that describes how web apps integrate into the shell (permissions, window config, entry points, etc).

**This is analogous to package.json, manifest.json, or .desktop files — but specifically for WebShell.**

## Acceptance Criteria

- [x] JSON schema specification completed
- [x] Schema covers all required fields
- [x] Validation rules defined
- [x] Example manifests created
- [x] Documentation written
- [x] Schema versioned for future evolution

## Implementation Plan

1. **Define Core Schema Structure**
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
    },
    "filesystem": {
      "read": ["/path/to/allowed/dir"],
      "write": []
    },
    "network": {
      "allowed_hosts": ["localhost"]
    },
    "processes": {
      "spawn": false
    }
  },
  
  "window": {
    "type": "widget",
    "width": 800,
    "height": 600,
    "minWidth": 400,
    "minHeight": 300,
    "resizable": true,
    "blur": true,
    "transparency": true,
    "position": "center"
  },
  
  "theme": {
    "inherit": true,
    "overrides": {}
  },
  
  "dependencies": {
    "go_services": ["CalendarService"],
    "qml_services": []
  }
}
```

2. **Define Permission Types**

**Calendar**:
```json
"calendar": {
  "read": boolean,
  "write": boolean,
  "delete": boolean
}
```

**Filesystem**:
```json
"filesystem": {
  "read": string[],  // allowed paths
  "write": string[],
  "watch": string[]
}
```

**Network**:
```json
"network": {
  "allowed_hosts": string[],
  "websockets": boolean
}
```

**System**:
```json
"system": {
  "power": boolean,
  "clipboard": boolean,
  "notifications": boolean
}
```

3. **Define Window Configuration**

**Window Types**:
- `widget` - standalone widget container
- `panel` - docked panel component
- `overlay` - full-screen overlay
- `dialog` - modal dialog

**Window Properties**:
```typescript
interface WindowConfig {
  type: 'widget' | 'panel' | 'overlay' | 'dialog';
  width?: number;
  height?: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  resizable?: boolean;
  blur?: boolean;
  transparency?: boolean;
  position?: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  margins?: { top: number; right: number; bottom: number; left: number; };
}
```

4. **Create JSON Schema File**
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "WebShell Manifest",
  "type": "object",
  "required": ["version", "name", "entrypoint"],
  "properties": {
    "version": {
      "type": "string",
      "pattern": "^\\d+\\.\\d+\\.\\d+$"
    },
    "name": {
      "type": "string",
      "pattern": "^[a-z0-9-]+$"
    },
    "entrypoint": {
      "type": "string"
    },
    "permissions": {
      "type": "object",
      "properties": {
        // ... define all permission schemas
      }
    },
    // ... rest of schema
  }
}
```

5. **Create Example Manifests**

**Calendar App**:
```json
{
  "version": "1.0.0",
  "name": "calendar",
  "displayName": "Calendar",
  "entrypoint": "index.html",
  "permissions": {
    "calendar": { "read": true, "write": true },
    "notifications": { "send": true }
  },
  "window": {
    "type": "widget",
    "width": 800,
    "height": 600,
    "blur": true
  }
}
```

**Email Client**:
```json
{
  "version": "1.0.0",
  "name": "mail",
  "displayName": "Mail",
  "entrypoint": "index.html",
  "permissions": {
    "network": { "allowed_hosts": ["imap.gmail.com"] },
    "filesystem": { "read": ["~/.mail"] },
    "notifications": { "send": true }
  },
  "window": {
    "type": "overlay",
    "blur": true
  }
}
```

## Technical Notes

**Versioning Strategy**:
- Follow semantic versioning
- Major version increments for breaking changes
- Provide migration tools between versions

**Security Considerations**:
- Default-deny for all permissions
- Explicit opt-in required
- User confirmation for sensitive permissions
- Capability-based security model

**Future Extensions**:
```json
"hooks": {
  "onStartup": "startup.js",
  "onShutdown": "cleanup.js"
},
"shortcuts": [
  {
    "key": "Ctrl+Alt+C",
    "action": "open"
  }
]
```

## Reference Material

Study existing manifest formats:
- Chrome Extension manifest.json
- Electron's package.json
- PWA manifest.json
- Flatpak metadata
- .desktop files

## Definition of Done

- JSON schema specification complete
- All fields documented
- Example manifests created
- Validation rules defined
- Documentation written
- Git commit: "task-3.1: Design webshell.json manifest schema"
