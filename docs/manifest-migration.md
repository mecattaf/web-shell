# Manifest Migration Guide

This guide helps you migrate existing applications from other platforms to WebShell.

## From Electron

### Overview

Electron apps use `package.json` and optional configuration files for app metadata and window management. WebShell consolidates this into a single `webshell.json` manifest.

### Basic Migration

**Electron** (`package.json`):
```json
{
  "name": "my-app",
  "version": "1.0.0",
  "description": "My desktop app",
  "main": "main.js",
  "author": "Your Name",
  "license": "MIT",
  "build": {
    "appId": "com.example.myapp",
    "productName": "My App"
  }
}
```

**WebShell** (`webshell.json`):
```json
{
  "$schema": "https://webshell.dev/schemas/manifest/v1.json",
  "version": "1.0.0",
  "name": "my-app",
  "displayName": "My App",
  "description": "My desktop app",
  "author": "Your Name",
  "license": "MIT",
  "entrypoint": "index.html"
}
```

### Key Differences

| Electron | WebShell | Notes |
|----------|----------|-------|
| `package.json` | `webshell.json` | Separate manifest file |
| `main` (JS file) | `entrypoint` (HTML file) | WebShell is web-first |
| `build.productName` | `displayName` | User-facing name |
| `build.appId` | `name` | Unique identifier |
| No permission model | Explicit permissions | Security-first approach |

### Window Configuration

**Electron** (`main.js`):
```javascript
const { BrowserWindow } = require('electron');

const win = new BrowserWindow({
  width: 800,
  height: 600,
  minWidth: 400,
  minHeight: 300,
  title: 'My App',
  resizable: true,
  frame: true,
  transparent: false,
  alwaysOnTop: false
});
```

**WebShell** (`webshell.json`):
```json
{
  "window": {
    "width": 800,
    "height": 600,
    "minWidth": 400,
    "minHeight": 300,
    "title": "My App",
    "resizable": true,
    "transparency": false,
    "alwaysOnTop": false
  }
}
```

### Permissions

Electron apps have full system access by default. WebShell requires explicit permissions.

**Electron** (implicit):
```javascript
// Electron apps can do anything by default
const fs = require('fs');
const { net } = require('electron');
const { exec } = require('child_process');
```

**WebShell** (explicit):
```json
{
  "permissions": {
    "filesystem": {
      "read": ["~/Documents"],
      "write": ["~/Documents/MyApp"]
    },
    "network": {
      "allowed_hosts": ["api.example.com"]
    },
    "processes": {
      "spawn": true,
      "allowed_commands": ["git"]
    }
  }
}
```

### IPC and Native APIs

Electron's IPC and native modules aren't available in WebShell. Use the WebShellAPI instead:

**Electron**:
```javascript
// Renderer process
const { ipcRenderer } = require('electron');

// Request from main process
const result = await ipcRenderer.invoke('read-file', '/path/to/file');

// Main process
ipcMain.handle('read-file', async (event, path) => {
  return fs.readFileSync(path, 'utf8');
});
```

**WebShell**:
```javascript
// Direct API access
const content = await webshell.fs.readFile('~/Documents/file.txt');
```

### Migration Checklist

- [ ] Create `webshell.json` with basic metadata
- [ ] Convert `main` to `entrypoint` (HTML file)
- [ ] Migrate window configuration to manifest
- [ ] Identify required permissions
- [ ] Replace IPC calls with WebShellAPI
- [ ] Remove Node.js native modules
- [ ] Test in WebShell environment

---

## From Chrome Extensions

### Overview

Chrome extensions use `manifest.json` with a different structure than WebShell. The permission model is similar but more granular in WebShell.

### Basic Migration

**Chrome Extension** (`manifest.json`):
```json
{
  "manifest_version": 3,
  "name": "My Extension",
  "version": "1.0.0",
  "description": "My Chrome extension",
  "icons": {
    "128": "icon.png"
  },
  "action": {
    "default_popup": "popup.html"
  },
  "permissions": [
    "storage",
    "notifications"
  ],
  "host_permissions": [
    "https://api.example.com/*"
  ]
}
```

**WebShell** (`webshell.json`):
```json
{
  "$schema": "https://webshell.dev/schemas/manifest/v1.json",
  "version": "1.0.0",
  "name": "my-extension",
  "displayName": "My Extension",
  "description": "My Chrome extension",
  "icon": "icon.png",
  "entrypoint": "popup.html",

  "permissions": {
    "filesystem": {
      "read": ["~/.config/my-extension"],
      "write": ["~/.config/my-extension"]
    },
    "notifications": {
      "send": true
    },
    "network": {
      "allowed_hosts": ["api.example.com"]
    }
  },

  "window": {
    "type": "widget",
    "width": 400,
    "height": 600
  }
}
```

### Permission Mapping

| Chrome Extension | WebShell | Notes |
|------------------|----------|-------|
| `storage` | `filesystem` | Different APIs |
| `notifications` | `notifications` | Similar |
| `clipboardRead` | `clipboard.read` | Explicit read/write |
| `clipboardWrite` | `clipboard.write` | Separate permissions |
| `host_permissions` | `network.allowed_hosts` | WebShell uses hosts, not URL patterns |

### Background Scripts

Chrome extensions use background service workers. WebShell uses lifecycle hooks:

**Chrome Extension**:
```json
{
  "background": {
    "service_worker": "background.js"
  }
}
```

**WebShell**:
```json
{
  "hooks": {
    "onStartup": "scripts/startup.js",
    "onShutdown": "scripts/shutdown.js"
  }
}
```

### Content Scripts

WebShell doesn't inject scripts into web pages. If your extension relies on content scripts, it won't translate directly to WebShell.

### Migration Checklist

- [ ] Create `webshell.json` from `manifest.json`
- [ ] Map Chrome permissions to WebShell permissions
- [ ] Convert background scripts to lifecycle hooks
- [ ] Replace `chrome.storage` with `webshell.fs`
- [ ] Update icon paths
- [ ] Configure window size for popup
- [ ] Remove content scripts (not supported)
- [ ] Test in WebShell environment

---

## From Progressive Web Apps (PWA)

### Overview

PWAs use `manifest.json` (web manifest) for metadata. WebShell manifests are similar but include additional desktop-specific features.

### Basic Migration

**PWA** (`manifest.json`):
```json
{
  "name": "My App",
  "short_name": "App",
  "description": "My progressive web app",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [
    {
      "src": "icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

**WebShell** (`webshell.json`):
```json
{
  "$schema": "https://webshell.dev/schemas/manifest/v1.json",
  "version": "1.0.0",
  "name": "my-app",
  "displayName": "My App",
  "description": "My progressive web app",
  "entrypoint": "index.html",
  "icon": "icon-192.png",

  "window": {
    "type": "widget",
    "width": 1024,
    "height": 768
  },

  "theme": {
    "inherit": true,
    "overrides": {
      "--background-color": "#ffffff",
      "--theme-color": "#000000"
    }
  }
}
```

### Field Mapping

| PWA | WebShell | Notes |
|-----|----------|-------|
| `name` | `displayName` | User-facing name |
| `short_name` | `name` | Identifier |
| `start_url` | `entrypoint` | HTML file path |
| `display` | `window.type` | Different values |
| `theme_color` | `theme.overrides` | CSS variables |
| `icons` | `icon` | Single icon path |

### Display Mode Mapping

| PWA `display` | WebShell `window.type` |
|---------------|------------------------|
| `standalone` | `widget` |
| `fullscreen` | `overlay` |
| `minimal-ui` | `widget` |
| `browser` | `widget` |

### Service Workers

PWAs use service workers for offline functionality. WebShell apps run in a different context:

**PWA**:
```javascript
// Register service worker
navigator.serviceWorker.register('/sw.js');
```

**WebShell**:
```javascript
// Use lifecycle hooks for caching logic
// Implement in hooks.onStartup
```

### Migration Checklist

- [ ] Create `webshell.json` from PWA manifest
- [ ] Map `name` and `short_name` correctly
- [ ] Convert `start_url` to `entrypoint`
- [ ] Choose appropriate `window.type`
- [ ] Map theme colors to CSS variables
- [ ] Convert service worker logic to hooks (if needed)
- [ ] Add necessary permissions
- [ ] Test offline functionality

---

## From Flatpak

### Overview

Flatpak uses `{app-id}.json` or `{app-id}.yaml` for metadata and permissions. WebShell has a similar permission model.

### Basic Migration

**Flatpak** (`com.example.MyApp.json`):
```json
{
  "app-id": "com.example.MyApp",
  "runtime": "org.freedesktop.Platform",
  "runtime-version": "23.08",
  "sdk": "org.freedesktop.Sdk",
  "command": "myapp",
  "finish-args": [
    "--share=network",
    "--share=ipc",
    "--socket=x11",
    "--filesystem=xdg-documents:ro",
    "--filesystem=xdg-download:rw"
  ]
}
```

**WebShell** (`webshell.json`):
```json
{
  "$schema": "https://webshell.dev/schemas/manifest/v1.json",
  "version": "1.0.0",
  "name": "myapp",
  "displayName": "MyApp",
  "entrypoint": "index.html",

  "permissions": {
    "network": {
      "allowed_hosts": ["*"]
    },
    "filesystem": {
      "read": ["~/Documents"],
      "write": ["~/Downloads"]
    }
  }
}
```

### Permission Mapping

| Flatpak | WebShell | Notes |
|---------|----------|-------|
| `--share=network` | `network.allowed_hosts` | Specify hosts |
| `--filesystem=xdg-documents:ro` | `filesystem.read: ["~/Documents"]` | Read-only |
| `--filesystem=xdg-download:rw` | `filesystem.read/write: ["~/Downloads"]` | Read-write |
| `--socket=pulseaudio` | `system.audio` | Audio access |
| `--talk-name=org.freedesktop.Notifications` | `notifications.send` | Notifications |

### Migration Checklist

- [ ] Extract app-id to create `name`
- [ ] Map Flatpak finish-args to WebShell permissions
- [ ] Convert filesystem paths (xdg-* to ~/)
- [ ] Add `entrypoint` (HTML file)
- [ ] Test permissions in WebShell
- [ ] Verify XDG directories map correctly

---

## From .desktop Files (Linux)

### Overview

`.desktop` files are used for application launchers on Linux. WebShell manifests provide similar metadata with additional configuration.

### Basic Migration

**.desktop File**:
```ini
[Desktop Entry]
Version=1.0
Name=My Application
Comment=A useful application
Exec=/usr/bin/myapp
Icon=/usr/share/icons/myapp.png
Terminal=false
Type=Application
Categories=Utility;
```

**WebShell** (`webshell.json`):
```json
{
  "$schema": "https://webshell.dev/schemas/manifest/v1.json",
  "version": "1.0.0",
  "name": "myapp",
  "displayName": "My Application",
  "description": "A useful application",
  "entrypoint": "index.html",
  "icon": "myapp.png",
  "keywords": ["utility"]
}
```

### Field Mapping

| .desktop | WebShell | Notes |
|----------|----------|-------|
| `Name` | `displayName` | User-facing name |
| `Comment` | `description` | App description |
| `Icon` | `icon` | Icon path |
| `Categories` | `keywords` | For searching |
| `Exec` | N/A | WebShell uses HTML entrypoint |

### Migration Checklist

- [ ] Create `webshell.json`
- [ ] Map Name to displayName
- [ ] Convert Comment to description
- [ ] Update icon path
- [ ] Create HTML entrypoint
- [ ] Map Categories to keywords

---

## From No Manifest

### Starting Fresh

If you have a web app without any manifest:

**Step 1**: Create basic `webshell.json`:

```json
{
  "$schema": "https://webshell.dev/schemas/manifest/v1.json",
  "version": "1.0.0",
  "name": "my-app",
  "entrypoint": "index.html"
}
```

**Step 2**: Add metadata:

```json
{
  "$schema": "https://webshell.dev/schemas/manifest/v1.json",
  "version": "1.0.0",
  "name": "my-app",
  "displayName": "My App",
  "description": "Brief description of your app",
  "author": "Your Name",
  "license": "MIT",
  "icon": "icon.svg",
  "entrypoint": "index.html"
}
```

**Step 3**: Identify and add permissions:

```json
{
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
    },
    "network": {
      "allowed_hosts": ["api.example.com"]
    }
  }
}
```

**Step 4**: Configure window:

```json
{
  "window": {
    "type": "widget",
    "width": 1000,
    "height": 700,
    "minWidth": 600,
    "minHeight": 400,
    "blur": true,
    "position": "center"
  }
}
```

**Step 5**: Add advanced features:

```json
{
  "shortcuts": [
    {
      "key": "Ctrl+Alt+M",
      "action": "toggle",
      "description": "Toggle app visibility"
    }
  ],

  "hooks": {
    "onStartup": "scripts/init.js",
    "onShutdown": "scripts/cleanup.js"
  },

  "theme": {
    "inherit": true
  }
}
```

---

## Common Migration Patterns

### Replacing File System APIs

**Node.js / Electron**:
```javascript
const fs = require('fs');
const content = fs.readFileSync('/path/to/file.txt', 'utf8');
fs.writeFileSync('/path/to/file.txt', 'content');
```

**WebShell**:
```javascript
const content = await webshell.fs.readFile('~/Documents/file.txt');
await webshell.fs.writeFile('~/Documents/file.txt', 'content');
```

### Replacing Network APIs

**Node.js / Electron**:
```javascript
const https = require('https');
https.get('https://api.example.com/data', (res) => {
  // Handle response
});
```

**WebShell**:
```javascript
const response = await fetch('https://api.example.com/data');
const data = await response.json();
```

### Replacing Process APIs

**Node.js / Electron**:
```javascript
const { exec } = require('child_process');
exec('git status', (error, stdout, stderr) => {
  console.log(stdout);
});
```

**WebShell**:
```javascript
const result = await webshell.processes.spawn('git', ['status']);
console.log(result.stdout);
```

---

## Testing After Migration

### Validation Checklist

1. **Manifest Validation**:
   ```bash
   ajv validate -s schemas/webshell-manifest.schema.json -d webshell.json
   ```

2. **Permission Testing**:
   - Test each permission individually
   - Verify error handling for denied permissions

3. **Window Testing**:
   - Test different window sizes
   - Test on different screen resolutions
   - Verify window type behavior

4. **Cross-platform Testing**:
   - Test on Linux, macOS, Windows
   - Verify path handling (~ expansion)
   - Check permission behavior

5. **Performance Testing**:
   - Compare with original platform
   - Check startup time
   - Monitor resource usage

---

## Migration Tools

### Automated Manifest Converter

Create a script to automate basic conversion:

```javascript
// electron-to-webshell.js
const fs = require('fs');

const packageJson = JSON.parse(fs.readFileSync('package.json'));

const webshellManifest = {
  "$schema": "https://webshell.dev/schemas/manifest/v1.json",
  version: packageJson.version,
  name: packageJson.name,
  displayName: packageJson.build?.productName || packageJson.name,
  description: packageJson.description,
  author: packageJson.author,
  license: packageJson.license,
  entrypoint: "index.html",

  window: {
    type: "widget",
    width: 1024,
    height: 768
  }
};

fs.writeFileSync('webshell.json', JSON.stringify(webshellManifest, null, 2));
console.log('Created webshell.json');
```

Run:
```bash
node electron-to-webshell.js
```

---

## Getting Help

### Resources

- [Manifest Reference](./manifest-reference.md)
- [Permissions Guide](./permissions-guide.md)
- [Examples](./manifest-examples.md)
- [Troubleshooting](./manifest-troubleshooting.md)

### Community

- GitHub Issues: Report migration issues
- Documentation: Detailed guides
- Community Forum: Ask questions

---

## Summary

Key differences when migrating to WebShell:

1. **Web-first**: WebShell uses HTML entrypoints, not native executables
2. **Explicit permissions**: All capabilities must be declared
3. **Single manifest**: Configuration consolidated in `webshell.json`
4. **Modern API**: Promise-based WebShellAPI instead of callbacks
5. **Security-focused**: Default-deny permission model

Take migration one step at a time, and test thoroughly after each change.
