# WebShell Manifest Examples

This document provides real-world manifest examples for common app types. Each example includes the complete `webshell.json` configuration with explanations.

## Minimal Widget

A simple clock widget with no special permissions.

```json
{
  "$schema": "https://webshell.dev/schemas/manifest/v1.json",
  "version": "1.0.0",
  "name": "clock",
  "displayName": "Clock",
  "description": "Simple desktop clock widget",
  "entrypoint": "index.html",
  "icon": "clock.svg",

  "window": {
    "type": "widget",
    "width": 200,
    "height": 100,
    "resizable": false,
    "blur": true,
    "transparency": true,
    "alwaysOnTop": false
  },

  "theme": {
    "inherit": true
  }
}
```

**Key Features**:
- No permissions required
- Fixed size window
- Blur and transparency for modern look
- Inherits system theme

---

## Calendar Widget

Full-featured calendar with event management and notifications.

```json
{
  "$schema": "https://webshell.dev/schemas/manifest/v1.json",
  "version": "1.0.0",
  "name": "calendar",
  "displayName": "Calendar",
  "description": "Manage events and schedules with reminders",
  "author": "Your Name <you@example.com>",
  "license": "MIT",
  "entrypoint": "index.html",
  "icon": "calendar.svg",

  "permissions": {
    "calendar": {
      "read": true,
      "write": true,
      "delete": true
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
    "maxWidth": 1920,
    "maxHeight": 1080,
    "blur": true,
    "transparency": true,
    "position": "center",
    "resizable": true
  },

  "shortcuts": [
    {
      "key": "Ctrl+Alt+C",
      "action": "toggle",
      "description": "Toggle calendar visibility"
    },
    {
      "key": "Ctrl+N",
      "action": "open",
      "description": "Open calendar and create new event"
    }
  ],

  "theme": {
    "inherit": true
  }
}
```

**Key Features**:
- Full calendar access (read, write, delete)
- System notifications for reminders
- Keyboard shortcuts for quick access
- Responsive window with size constraints

---

## Email Client

Email client with network access and local cache.

```json
{
  "$schema": "https://webshell.dev/schemas/manifest/v1.json",
  "version": "1.0.0",
  "name": "mail",
  "displayName": "Mail",
  "description": "Modern email client with IMAP/SMTP support",
  "author": "Mail Team",
  "license": "GPL-3.0",
  "homepage": "https://github.com/example/mail",
  "entrypoint": "index.html",
  "icon": "mail.svg",

  "permissions": {
    "network": {
      "allowed_hosts": [
        "imap.gmail.com",
        "smtp.gmail.com",
        "imap-mail.outlook.com",
        "smtp-mail.outlook.com"
      ],
      "websockets": false
    },
    "filesystem": {
      "read": ["~/.config/mail", "~/.mail/attachments"],
      "write": ["~/.config/mail", "~/.mail/cache", "~/.mail/attachments"]
    },
    "notifications": {
      "send": true
    },
    "clipboard": {
      "write": true
    }
  },

  "window": {
    "type": "overlay",
    "width": 1200,
    "height": 800,
    "minWidth": 800,
    "minHeight": 600,
    "blur": true,
    "position": "center"
  },

  "shortcuts": [
    {
      "key": "Ctrl+Alt+M",
      "action": "toggle",
      "description": "Toggle mail client"
    },
    {
      "key": "Ctrl+R",
      "action": "focus",
      "description": "Reply to selected email"
    }
  ],

  "hooks": {
    "onStartup": "scripts/sync-on-start.js",
    "onShutdown": "scripts/cleanup-cache.js"
  }
}
```

**Key Features**:
- Network access to mail servers
- Local filesystem for config and cache
- Clipboard write for copying email addresses
- Lifecycle hooks for sync and cleanup
- Large overlay window

---

## Code Editor

Development-focused editor with filesystem and process access.

```json
{
  "$schema": "https://webshell.dev/schemas/manifest/v1.json",
  "version": "1.0.0",
  "name": "code-editor",
  "displayName": "Code Editor",
  "description": "Lightweight code editor with syntax highlighting",
  "author": "Dev Tools Inc",
  "license": "MIT",
  "repository": "https://github.com/example/code-editor",
  "keywords": ["editor", "development", "coding"],
  "entrypoint": "index.html",
  "icon": "editor.svg",

  "permissions": {
    "filesystem": {
      "read": ["~/Documents", "~/Projects", "~/workspace"],
      "write": ["~/Documents", "~/Projects", "~/workspace"],
      "watch": ["~/Projects", "~/workspace"]
    },
    "processes": {
      "spawn": true,
      "allowed_commands": ["git", "npm", "node", "python", "make"]
    },
    "clipboard": {
      "read": true,
      "write": true
    },
    "network": {
      "allowed_hosts": ["localhost"],
      "websockets": false
    }
  },

  "window": {
    "type": "widget",
    "width": 1400,
    "height": 900,
    "minWidth": 800,
    "minHeight": 600
  },

  "shortcuts": [
    {
      "key": "Ctrl+O",
      "action": "focus",
      "description": "Open file browser"
    },
    {
      "key": "Ctrl+S",
      "action": "focus",
      "description": "Save current file"
    }
  ],

  "devServer": "http://localhost:5173",
  "devMode": {
    "hotReload": true,
    "watchPaths": ["src/**/*", "public/**/*"],
    "ignorePaths": ["node_modules/**", "dist/**", ".git/**"]
  }
}
```

**Key Features**:
- Broad filesystem access for projects
- Process spawning for build tools
- File watching for live reload
- Development server support
- Keyboard shortcuts for common actions

---

## System Monitor

System monitoring tool with power management.

```json
{
  "$schema": "https://webshell.dev/schemas/manifest/v1.json",
  "version": "1.0.0",
  "name": "system-monitor",
  "displayName": "System Monitor",
  "description": "Monitor CPU, memory, and system resources",
  "entrypoint": "index.html",
  "icon": "monitor.svg",

  "permissions": {
    "system": {
      "power": true,
      "audio": false
    },
    "processes": {
      "spawn": true,
      "allowed_commands": ["top", "ps", "df", "free"]
    },
    "filesystem": {
      "read": ["/proc", "/sys"]
    }
  },

  "window": {
    "type": "widget",
    "width": 600,
    "height": 400,
    "minWidth": 400,
    "minHeight": 300,
    "blur": true,
    "transparency": true,
    "alwaysOnTop": true
  },

  "shortcuts": [
    {
      "key": "Ctrl+Alt+Esc",
      "action": "toggle",
      "description": "Toggle system monitor"
    }
  ],

  "theme": {
    "inherit": true,
    "overrides": {
      "--monitor-bg": "rgba(0, 0, 0, 0.7)",
      "--cpu-color": "#ff6b6b",
      "--mem-color": "#4ecdc4"
    }
  }
}
```

**Key Features**:
- System power management
- Process spawning for system commands
- Read access to `/proc` and `/sys`
- Always on top for monitoring
- Custom theme overrides

---

## Music Player

Audio player with filesystem and audio permissions.

```json
{
  "$schema": "https://webshell.dev/schemas/manifest/v1.json",
  "version": "1.0.0",
  "name": "music-player",
  "displayName": "Music Player",
  "description": "Play your favorite music with style",
  "entrypoint": "index.html",
  "icon": "music.svg",

  "permissions": {
    "filesystem": {
      "read": ["~/Music", "~/Downloads"],
      "watch": ["~/Music"]
    },
    "system": {
      "audio": true
    },
    "notifications": {
      "send": true
    },
    "clipboard": {
      "write": true
    }
  },

  "window": {
    "type": "widget",
    "width": 400,
    "height": 600,
    "minWidth": 300,
    "minHeight": 400,
    "blur": true,
    "transparency": true,
    "position": "bottom-right"
  },

  "shortcuts": [
    {
      "key": "Ctrl+Alt+P",
      "action": "toggle",
      "description": "Play/Pause music"
    },
    {
      "key": "Ctrl+Alt+N",
      "action": "focus",
      "description": "Next track"
    }
  ],

  "hooks": {
    "onSuspend": "scripts/pause-playback.js",
    "onResume": "scripts/resume-playback.js"
  }
}
```

**Key Features**:
- Filesystem access to music library
- Audio system permission
- File watching for new music
- Media key shortcuts
- Suspend/resume hooks

---

## Password Manager

Secure password manager with clipboard access.

```json
{
  "$schema": "https://webshell.dev/schemas/manifest/v1.json",
  "version": "1.0.0",
  "name": "password-manager",
  "displayName": "Password Manager",
  "description": "Secure password storage and management",
  "author": "Security Inc",
  "license": "Apache-2.0",
  "entrypoint": "index.html",
  "icon": "lock.svg",

  "permissions": {
    "filesystem": {
      "read": ["~/.config/passwords"],
      "write": ["~/.config/passwords"]
    },
    "clipboard": {
      "write": true
    },
    "network": {
      "allowed_hosts": ["api.haveibeenpwned.com"],
      "websockets": false
    }
  },

  "window": {
    "type": "dialog",
    "width": 500,
    "height": 700,
    "minWidth": 400,
    "minHeight": 500,
    "alwaysOnTop": true,
    "position": "center"
  },

  "shortcuts": [
    {
      "key": "Ctrl+Alt+L",
      "action": "toggle",
      "description": "Toggle password manager"
    }
  ],

  "hooks": {
    "onStartup": "scripts/unlock-vault.js",
    "onShutdown": "scripts/lock-vault.js"
  }
}
```

**Key Features**:
- Secure filesystem storage
- Clipboard write for auto-fill
- Network access for breach checking
- Dialog window type (always on top)
- Vault lock/unlock hooks

---

## File Manager

Comprehensive file browser with full filesystem access.

```json
{
  "$schema": "https://webshell.dev/schemas/manifest/v1.json",
  "version": "1.0.0",
  "name": "file-manager",
  "displayName": "File Manager",
  "description": "Browse and manage your files",
  "entrypoint": "index.html",
  "icon": "folder.svg",

  "permissions": {
    "filesystem": {
      "read": ["~"],
      "write": ["~"],
      "watch": ["~"]
    },
    "processes": {
      "spawn": true,
      "allowed_commands": [
        "ls", "cat", "mkdir", "rm", "cp", "mv",
        "chmod", "chown", "ln", "touch"
      ]
    },
    "clipboard": {
      "read": true,
      "write": true
    },
    "notifications": {
      "send": true
    }
  },

  "window": {
    "type": "widget",
    "width": 1000,
    "height": 700,
    "minWidth": 600,
    "minHeight": 400
  },

  "shortcuts": [
    {
      "key": "Ctrl+Alt+F",
      "action": "toggle",
      "description": "Toggle file manager"
    }
  ]
}
```

**Key Features**:
- Full home directory access
- Process spawning for file operations
- Clipboard for copy/paste
- Notifications for long operations

---

## Chat Application

Real-time chat with WebSocket support.

```json
{
  "$schema": "https://webshell.dev/schemas/manifest/v1.json",
  "version": "1.0.0",
  "name": "chat",
  "displayName": "Chat",
  "description": "Real-time messaging application",
  "entrypoint": "index.html",
  "icon": "chat.svg",

  "permissions": {
    "network": {
      "allowed_hosts": ["chat.example.com", "api.example.com"],
      "websockets": true
    },
    "filesystem": {
      "read": ["~/.config/chat"],
      "write": ["~/.config/chat", "~/.cache/chat"]
    },
    "notifications": {
      "send": true
    },
    "clipboard": {
      "write": true
    },
    "system": {
      "audio": true
    }
  },

  "window": {
    "type": "widget",
    "width": 800,
    "height": 900,
    "minWidth": 400,
    "minHeight": 500,
    "blur": true,
    "position": "right"
  },

  "shortcuts": [
    {
      "key": "Ctrl+Alt+T",
      "action": "toggle",
      "description": "Toggle chat window"
    }
  ],

  "hooks": {
    "onStartup": "scripts/connect.js",
    "onShutdown": "scripts/disconnect.js",
    "onSuspend": "scripts/pause-connection.js",
    "onResume": "scripts/resume-connection.js"
  }
}
```

**Key Features**:
- WebSocket support for real-time communication
- Audio for notification sounds
- Connection lifecycle management
- Message notifications

---

## Web Browser

Full-featured browser with unrestricted network access.

```json
{
  "$schema": "https://webshell.dev/schemas/manifest/v1.json",
  "version": "1.0.0",
  "name": "browser",
  "displayName": "Web Browser",
  "description": "Fast and secure web browser",
  "entrypoint": "index.html",
  "icon": "browser.svg",

  "permissions": {
    "network": {
      "allowed_hosts": ["*"],
      "websockets": true
    },
    "filesystem": {
      "read": ["~/Downloads"],
      "write": ["~/Downloads", "~/.config/browser", "~/.cache/browser"]
    },
    "clipboard": {
      "read": true,
      "write": true
    },
    "notifications": {
      "send": true
    }
  },

  "window": {
    "type": "widget",
    "width": 1600,
    "height": 1000,
    "minWidth": 800,
    "minHeight": 600
  },

  "shortcuts": [
    {
      "key": "Ctrl+Alt+B",
      "action": "toggle",
      "description": "Toggle browser"
    },
    {
      "key": "Ctrl+T",
      "action": "focus",
      "description": "New tab"
    }
  ]
}
```

**Key Features**:
- Unrestricted network access (wildcard)
- Downloads directory access
- Full clipboard access
- Large default window

---

## Panel Widget (Top Bar)

System panel that docks to screen edge.

```json
{
  "$schema": "https://webshell.dev/schemas/manifest/v1.json",
  "version": "1.0.0",
  "name": "top-panel",
  "displayName": "Top Panel",
  "description": "System panel with clock and status indicators",
  "entrypoint": "index.html",
  "icon": "panel.svg",

  "permissions": {
    "system": {
      "power": true,
      "audio": true
    },
    "network": {
      "allowed_hosts": ["localhost"]
    },
    "notifications": {
      "send": true
    }
  },

  "window": {
    "type": "panel",
    "width": 1920,
    "height": 40,
    "resizable": false,
    "blur": true,
    "transparency": true,
    "alwaysOnTop": true,
    "showInTaskbar": false,
    "position": "top-left",
    "margins": {
      "top": 0,
      "right": 0,
      "bottom": 0,
      "left": 0
    }
  },

  "theme": {
    "inherit": true,
    "overrides": {
      "--panel-bg": "rgba(0, 0, 0, 0.8)",
      "--panel-text": "#ffffff"
    }
  }
}
```

**Key Features**:
- Panel type window (docks to edge)
- System power and audio control
- Fixed height, full width
- Custom panel theming
- Hidden from taskbar

---

## Development Server Proxy

Development tool with localhost access.

```json
{
  "$schema": "https://webshell.dev/schemas/manifest/v1.json",
  "version": "1.0.0",
  "name": "dev-proxy",
  "displayName": "Dev Proxy",
  "description": "Development server proxy and debugger",
  "entrypoint": "index.html",

  "permissions": {
    "network": {
      "allowed_hosts": ["localhost", "127.0.0.1", "*.local"],
      "websockets": true
    },
    "filesystem": {
      "read": ["~/Projects"],
      "write": ["~/.config/dev-proxy"]
    }
  },

  "window": {
    "type": "widget",
    "width": 900,
    "height": 700
  },

  "devServer": "http://localhost:5173",
  "devMode": {
    "hotReload": true,
    "watchPaths": ["src/**/*"],
    "ignorePaths": ["node_modules/**", "dist/**"]
  }
}
```

**Key Features**:
- Local network access
- WebSocket support
- Development mode configuration
- Hot reload for development

---

## Summary

These examples demonstrate:
- **Permission combinations** for different app types
- **Window configurations** (widget, panel, overlay, dialog)
- **Keyboard shortcuts** for user convenience
- **Lifecycle hooks** for state management
- **Theme customization** options
- **Development mode** setup

For more information, see:
- [Manifest Reference](./manifest-reference.md)
- [Permissions Guide](./permissions-guide.md)
- [Best Practices](./manifest-best-practices.md)
- [Manifest Schema](./manifest-schema.md)
