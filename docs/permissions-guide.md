# WebShell Permissions Guide

## Permission Model

WebShell uses a capability-based security model where apps must explicitly declare required permissions in their manifest. This guide helps you understand how to request and use permissions effectively.

> **Note**: For technical implementation details, see [Permission System](./permission-system.md).

## Security Principles

- **Default Deny**: All permissions are denied by default
- **Explicit Declaration**: Apps must list all required permissions in `webshell.json`
- **Least Privilege**: Request only the minimum permissions needed
- **User Awareness**: Users can review permissions before installing apps
- **Runtime Enforcement**: Permission checks occur on every API call

## Permission Categories

### Calendar

Access to calendar data and events.

**Declaration**:
```json
"permissions": {
  "calendar": {
    "read": true,
    "write": true,
    "delete": false
  }
}
```

**Capabilities**:
- `read`: View calendar events and schedules
- `write`: Create and modify calendar events
- `delete`: Remove calendar events

**Example Use Cases**:
- **Read-only calendar widget**: Only `read` permission
- **Event editor**: Both `read` and `write`
- **Calendar sync tool**: Full access with `delete`

**API Usage**:
```javascript
// Requires calendar.read permission
const events = await webshell.calendar.list();

// Requires calendar.write permission
await webshell.calendar.create({
  title: "Team Meeting",
  start: "2025-01-20T10:00:00Z",
  end: "2025-01-20T11:00:00Z"
});

// Requires calendar.delete permission
await webshell.calendar.delete(eventId);
```

### Contacts

Access to contact information.

**Declaration**:
```json
"permissions": {
  "contacts": {
    "read": true,
    "write": false,
    "delete": false
  }
}
```

**Capabilities**:
- `read`: Access contact information
- `write`: Create and modify contacts
- `delete`: Remove contacts

**Example Use Cases**:
- **Contact picker**: Only `read` permission
- **Contact manager**: Full access
- **Email autocomplete**: Only `read` permission

### Filesystem

Access to the local filesystem with path-specific permissions.

**Declaration**:
```json
"permissions": {
  "filesystem": {
    "read": ["~/Documents", "~/Downloads"],
    "write": ["~/Documents/MyApp"],
    "watch": ["~/Documents/MyApp"]
  }
}
```

**Path Features**:
- **Home expansion**: `~` expands to user home directory
- **Glob patterns**: Use wildcards for flexible matching
- **Security**: Parent directory access (`..`) is automatically blocked
- **Prefix matching**: `/home/user/Documents` matches `/home/user/Documents/file.txt`

**Path Examples**:
```json
"filesystem": {
  "read": [
    "~/Documents",              // All files in Documents
    "~/Downloads/*.pdf",        // Only PDF files in Downloads
    "/tmp/app-cache"            // Specific directory
  ],
  "write": [
    "~/Documents/MyApp",        // App-specific directory
    "~/.config/myapp"           // App configuration
  ],
  "watch": [
    "~/Documents/MyApp"         // Watch for file changes
  ]
}
```

**Best Practices**:
- Use specific paths instead of broad directory access
- Separate read and write permissions
- Keep write access minimal
- Use app-specific subdirectories

**Example Use Cases**:
- **Document editor**: Read/write in `~/Documents`
- **Download manager**: Read from `~/Downloads`
- **Configuration manager**: Read/write in `~/.config/myapp`

### Network

Access to network resources with host-specific permissions.

**Declaration**:
```json
"permissions": {
  "network": {
    "allowed_hosts": ["localhost", "api.example.com", "*.github.com"],
    "websockets": true
  }
}
```

**Host Format**:
- **Exact match**: `"api.example.com"`
- **Wildcard**: `"*"` (all hosts - use with caution)
- **Localhost**: Must be explicitly granted
  - Accepts: `localhost`, `127.0.0.1`, `::1`

**Important Security Notes**:
- `localhost` must be explicitly listed to prevent SSRF attacks
- Wildcard `*` grants access to ALL hosts
- Future: Domain wildcards like `*.github.com`

**Examples**:
```json
// Local development
"network": {
  "allowed_hosts": ["localhost"],
  "websockets": false
}

// API access
"network": {
  "allowed_hosts": ["api.example.com", "cdn.example.com"],
  "websockets": true
}

// Unrestricted (not recommended)
"network": {
  "allowed_hosts": ["*"],
  "websockets": true
}
```

**Example Use Cases**:
- **Local dev server**: Only `localhost`
- **API client**: Specific API domains
- **Web browser**: Wildcard `*` (with user awareness)
- **Chat app**: Specific hosts with `websockets: true`

### Notifications

Send system notifications to the user.

**Declaration**:
```json
"permissions": {
  "notifications": {
    "send": true
  }
}
```

**Capabilities**:
- `send`: Display system notifications with title, message, and icon

**API Usage**:
```javascript
// Requires notifications.send permission
await webshell.notifications.send({
  title: "New Event",
  message: "Team meeting starts in 15 minutes",
  icon: "calendar-icon.png"
});
```

**Example Use Cases**:
- Calendar reminders
- Email notifications
- Task completion alerts
- System status updates

### Clipboard

Access to the system clipboard.

**Declaration**:
```json
"permissions": {
  "clipboard": {
    "read": true,
    "write": true
  }
}
```

**Capabilities**:
- `read`: Read clipboard contents
- `write`: Write to clipboard

**API Usage**:
```javascript
// Requires clipboard.read permission
const text = await webshell.clipboard.read();

// Requires clipboard.write permission
await webshell.clipboard.write("Hello, World!");
```

**Example Use Cases**:
- **Code editor**: Read/write for copy/paste
- **Password manager**: Write passwords to clipboard
- **Snippet manager**: Read/write text snippets

### Processes

Spawn and manage system processes.

**Declaration**:
```json
"permissions": {
  "processes": {
    "spawn": true,
    "allowed_commands": ["git", "npm", "ls", "cat"]
  }
}
```

**Security**:
- When `spawn` is `true`, only commands in `allowed_commands` can be executed
- Command whitelist is strictly enforced
- No shell injection possible

**API Usage**:
```javascript
// Requires processes.spawn permission
const result = await webshell.processes.spawn("git", ["status"]);
console.log(result.stdout);
```

**Example Use Cases**:
- **IDE**: Run `git`, `npm`, build tools
- **Terminal emulator**: Full command access
- **File browser**: Run `ls`, `cat`, etc.

**Warning**: Process spawning is a powerful permission. Only grant to trusted apps.

### System

Access to system-level features.

**Declaration**:
```json
"permissions": {
  "system": {
    "power": true,
    "audio": true
  }
}
```

**Capabilities**:
- `power`: Control power management (shutdown, restart, suspend)
- `audio`: Access audio input/output devices

**Example Use Cases**:
- **Power management**: `power` permission
- **Music player**: `audio` permission
- **Voice recorder**: `audio` permission
- **System monitor**: `power` permission for suspend/hibernate

**Warning**: These are sensitive permissions that affect the entire system.

## Permission Workflows

### Declaring Permissions

Add permissions to your `webshell.json`:

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
    "notifications": {
      "send": true
    },
    "filesystem": {
      "read": ["~/Documents"],
      "write": ["~/Documents/MyApp"]
    }
  }
}
```

### Checking Permissions

Before making API calls, check if permission is granted:

```javascript
// Check single permission
if (webshell.permissions.has("calendar", "read")) {
  const events = await webshell.calendar.list();
}

// Check file access
if (webshell.permissions.canAccessFile("~/Documents/file.txt", "read")) {
  const content = await webshell.fs.readFile("~/Documents/file.txt");
}

// Check network access
if (webshell.permissions.canAccessHost("api.example.com")) {
  const response = await fetch("https://api.example.com/data");
}
```

### Handling Permission Errors

Always handle permission denials gracefully:

```javascript
try {
  const events = await webshell.calendar.list();
  displayCalendar(events);
} catch (error) {
  if (error.code === "PERMISSION_DENIED") {
    showMessage("Calendar access is required. Please grant permission in settings.");
  } else {
    console.error("Failed to load calendar:", error);
  }
}
```

## Permission Request Patterns

### Minimal Permissions

Request only what you need:

```json
// Good: Read-only calendar widget
"permissions": {
  "calendar": {
    "read": true
  }
}

// Bad: Excessive permissions
"permissions": {
  "calendar": {
    "read": true,
    "write": true,
    "delete": true
  },
  "filesystem": {
    "read": ["/"],
    "write": ["/"]
  }
}
```

### Specific Paths

Use specific filesystem paths:

```json
// Good: Specific directories
"permissions": {
  "filesystem": {
    "read": ["~/Documents", "~/Downloads"],
    "write": ["~/Documents/MyApp"]
  }
}

// Bad: Broad access
"permissions": {
  "filesystem": {
    "read": ["~"],
    "write": ["~"]
  }
}
```

### Limited Network Access

Restrict network access to required hosts:

```json
// Good: Specific APIs
"permissions": {
  "network": {
    "allowed_hosts": ["api.myapp.com", "cdn.myapp.com"]
  }
}

// Acceptable for browsers: Wildcard
"permissions": {
  "network": {
    "allowed_hosts": ["*"]
  }
}
```

## Common Permission Combinations

### Calendar Widget
```json
"permissions": {
  "calendar": {
    "read": true
  },
  "notifications": {
    "send": true
  }
}
```

### Email Client
```json
"permissions": {
  "network": {
    "allowed_hosts": ["imap.gmail.com", "smtp.gmail.com"],
    "websockets": true
  },
  "filesystem": {
    "read": ["~/.mail/config"],
    "write": ["~/.mail/cache"]
  },
  "notifications": {
    "send": true
  },
  "clipboard": {
    "write": true
  }
}
```

### Code Editor
```json
"permissions": {
  "filesystem": {
    "read": ["~/Documents", "~/Projects"],
    "write": ["~/Documents", "~/Projects"]
  },
  "processes": {
    "spawn": true,
    "allowed_commands": ["git", "npm", "node"]
  },
  "clipboard": {
    "read": true,
    "write": true
  }
}
```

### File Manager
```json
"permissions": {
  "filesystem": {
    "read": ["~"],
    "write": ["~"]
  },
  "processes": {
    "spawn": true,
    "allowed_commands": ["ls", "cat", "mkdir", "rm", "cp", "mv"]
  },
  "clipboard": {
    "write": true
  }
}
```

## Security Best Practices

### 1. Request Minimum Permissions
Only request permissions your app actually uses.

### 2. Explain Permission Usage
Document why each permission is needed in your app's README.

### 3. Handle Denials Gracefully
Provide fallback behavior when permissions are denied.

### 4. Use Specific Paths
Avoid broad filesystem access. Use app-specific directories.

### 5. Avoid Wildcards
Don't use network wildcard `*` unless absolutely necessary.

### 6. Audit Dependencies
Review third-party code for permission usage.

### 7. Test Permission Denials
Test your app with permissions disabled to ensure graceful degradation.

### 8. Update Documentation
Keep your app's permission documentation up to date.

## Troubleshooting

### Permission Denied Error

**Error**: `Permission denied: calendar.read`

**Solution**: Add the permission to your manifest:
```json
"permissions": {
  "calendar": {
    "read": true
  }
}
```

### File Access Denied

**Error**: `Permission denied: filesystem.read for /home/user/Documents/file.txt`

**Solution**: Add the path to allowed read paths:
```json
"permissions": {
  "filesystem": {
    "read": ["~/Documents"]
  }
}
```

### Network Access Denied

**Error**: `Permission denied: network access to api.example.com`

**Solution**: Add the host to allowed hosts:
```json
"permissions": {
  "network": {
    "allowed_hosts": ["api.example.com"]
  }
}
```

### Localhost Access Denied

**Error**: `Permission denied: network access to localhost`

**Solution**: Explicitly grant localhost access:
```json
"permissions": {
  "network": {
    "allowed_hosts": ["localhost"]
  }
}
```

## Future Enhancements

### Runtime Permission Requests

In future versions, apps will be able to request permissions at runtime:

```javascript
// Future API
const granted = await webshell.permissions.request("calendar.read");
if (granted) {
  // Permission granted by user
}
```

### Temporary Permissions

Grant permissions for limited time:

```javascript
// Future API
await webshell.permissions.requestTemporary("filesystem.read", {
  paths: ["~/Downloads"],
  duration: 3600000  // 1 hour
});
```

### Permission Scopes

More granular permissions:

```json
// Future: Fine-grained network permissions
"permissions": {
  "network": {
    "allowed_hosts": ["*.github.com"],
    "allowed_ports": [80, 443],
    "protocols": ["https"]
  }
}
```

## Related Documentation

- [Permission System](./permission-system.md) - Technical implementation details
- [Manifest Reference](./manifest-reference.md) - Complete manifest field reference
- [Manifest Schema](./manifest-schema.md) - Full schema specification
- [Best Practices](./manifest-best-practices.md) - Recommended patterns
- [Troubleshooting](./manifest-troubleshooting.md) - Common issues and solutions
- [Examples](./manifest-examples.md) - Real-world permission examples
