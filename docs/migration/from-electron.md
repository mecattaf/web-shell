# Migrating from Electron to WebShell

 

This guide will help you migrate your Electron application to WebShell, taking advantage of WebShell's lightweight architecture and streamlined development model.

 

## Table of Contents

 

1. [Overview](#overview)

2. [Key Differences](#key-differences)

3. [Why Migrate?](#why-migrate)

4. [Architecture Mapping](#architecture-mapping)

5. [API Migration Reference](#api-migration-reference)

6. [Step-by-Step Migration Process](#step-by-step-migration-process)

7. [Common Patterns](#common-patterns)

8. [Troubleshooting](#troubleshooting)

9. [Migration Checklist](#migration-checklist)

 

---

 

## Overview

 

WebShell provides a simpler alternative to Electron for building desktop applications using web technologies. Unlike Electron's dual-process architecture (Main + Renderer), WebShell uses a single runtime with a unified JavaScript SDK.

 

### Quick Comparison

 

| Feature | Electron | WebShell |

|---------|----------|----------|

| **Process Model** | Multi-process (Main + Renderer) | Single runtime |

| **IPC** | `ipcMain`/`ipcRenderer` | Direct SDK calls |

| **Bundle Size** | ~50-100MB+ | ~5-10MB |

| **API Surface** | Node.js + Chromium | WebShell SDK |

| **Native Modules** | Full Node.js support | Go backend only |

| **Security** | Contextual isolation | Permission-based |

| **Distribution** | Large installers | Small packages |

 

---

 

## Key Differences

 

### Runtime Environment

 

**Electron:**

- Bundles full Chromium + Node.js runtime

- Separate Main process (Node.js) and Renderer process (Chromium)

- IPC required for Main ↔ Renderer communication

- Full access to Node.js APIs in Main process

 

**WebShell:**

- Lightweight Go runtime with WebView

- Single unified environment

- Direct SDK API calls (no IPC)

- Limited to WebShell SDK capabilities

 

### Process Model

 

**Electron:**

```

┌─────────────────┐

│  Main Process   │ ← Node.js, native modules

│  (Node.js)      │

└────────┬────────┘

         │ IPC

┌────────┴────────┐

│ Renderer Process│ ← Web content, limited Node.js

│  (Chromium)     │

└─────────────────┘

```

 

**WebShell:**

```

┌─────────────────┐

│  Go Runtime     │ ← System integration

└────────┬────────┘

         │ Bridge

┌────────┴────────┐

│  WebView        │ ← Your app (HTML/CSS/JS)

│  + SDK          │

└─────────────────┘

```

 

### IPC Communication

 

**Electron:**

```javascript

// Main process

ipcMain.handle('get-data', async () => {

  return { data: 'value' };

});

 

// Renderer process

const result = await ipcRenderer.invoke('get-data');

```

 

**WebShell:**

```javascript

// Direct SDK call (no IPC needed)

const result = await webshell.calendar.eventsToday();

```

 

### Packaging & Distribution

 

**Electron:**

- Large bundle (includes Chromium + Node.js)

- Platform-specific installers (DMG, EXE, DEB)

- Auto-updater required for updates

- 50-100MB+ download size

 

**WebShell:**

- Small app bundle (HTML/CSS/JS only)

- Simple directory structure

- Manifest-based configuration

- 1-5MB typical app size

 

---

 

## Why Migrate?

 

### Benefits of WebShell

 

**Smaller Bundle Size**

- Electron: ~100MB minimum

- WebShell: ~5MB typical

- Faster downloads and updates

 

**Simpler Architecture**

- No Main/Renderer process split

- No IPC boilerplate

- Direct API access

- Easier to understand and maintain

 

**Better Security**

- Permission-based model

- No context isolation complexity

- Clear capability declaration

- User-controlled permissions

 

**Faster Development**

- Hot reload built-in

- Simpler debugging

- Less boilerplate code

- Faster iteration cycle

 

**Lower Resource Usage**

- Single process model

- Shared system WebView

- Lower memory footprint

- Better battery life

 

### Tradeoffs

 

**Limited Node.js API**

- No direct Node.js module access

- Cannot use native addons

- Limited to WebShell SDK capabilities

- Some Electron APIs have no equivalent

 

**Platform Specificity**

- Currently Linux-focused

- May require platform-specific code

- Check WebShell platform support

 

**Ecosystem**

- Smaller community

- Fewer third-party packages

- Less mature tooling

- Different deployment model

 

**When to Stay with Electron:**

- Need specific Node.js modules

- Require native C++ addons

- Heavy use of `fs`, `child_process`, etc.

- Cross-platform Windows/Mac/Linux required

 

---

 

## Architecture Mapping

 

### Main Process → WebShell Backend

 

Electron Main process responsibilities are handled by WebShell runtime:

 

| Electron Main | WebShell Equivalent |

|---------------|---------------------|

| `app` lifecycle | `webshell.shell.app` |

| `BrowserWindow` | `webshell.window` |

| `Menu`, `Tray` | Not yet supported |

| `dialog` | Future SDK addition |

| Native modules | Go backend extensions |

 

### Renderer Process → WebShell App

 

Your Electron Renderer code becomes your WebShell app:

 

| Electron Renderer | WebShell App |

|-------------------|--------------|

| HTML/CSS/JS | HTML/CSS/JS (same) |

| `ipcRenderer` | Direct SDK calls |

| `remote` (deprecated) | SDK APIs |

| Node.js APIs | WebShell SDK |

 

### Preload Scripts → SDK Initialization

 

**Electron:**

```javascript

// preload.js

const { contextBridge, ipcRenderer } = require('electron');

 

contextBridge.exposeInMainWorld('api', {

  getData: () => ipcRenderer.invoke('get-data')

});

```

 

**WebShell:**

```javascript

// No preload needed - SDK is automatically available

webshell.ready(() => {

  // SDK ready to use

});

```

 

---

 

## API Migration Reference

 

### Window Management

 

#### Create/Configure Window

 

**Electron:**

```javascript

// Main process

const { BrowserWindow } = require('electron');

 

const win = new BrowserWindow({

  width: 800,

  height: 600,

  transparent: true,

  frame: false,

  resizable: true

});

```

 

**WebShell:**

```json

// webshell.json

{

  "window": {

    "width": 800,

    "height": 600,

    "transparency": true,

    "blur": false,

    "position": "center"

  }

}

```

 

#### Window Size/Position

 

**Electron:**

```javascript

// Renderer

const { remote } = require('electron');

const win = remote.getCurrentWindow();

 

// Get size

const [width, height] = win.getSize();

 

// Set size

win.setSize(1024, 768);

 

// Center

win.center();

```

 

**WebShell:**

```javascript

// Get size

const { width, height } = webshell.window.getSize();

 

// Set size

webshell.window.setSize(1024, 768);

 

// Center

webshell.window.center();

```

 

#### Window State

 

**Electron:**

```javascript

win.minimize();

win.maximize();

win.restore();

win.close();

```

 

**WebShell:**

```javascript

webshell.window.minimize();

webshell.window.maximize();

webshell.window.restore();

webshell.shell.app.close();

```

 

#### Window Events

 

**Electron:**

```javascript

win.on('resize', () => {

  const [width, height] = win.getSize();

  console.log('Resized:', width, height);

});

 

win.on('closed', () => {

  console.log('Window closed');

});

```

 

**WebShell:**

```javascript

webshell.window.onResize((size) => {

  console.log('Resized:', size.width, size.height);

});

 

// App close handling

window.addEventListener('beforeunload', () => {

  console.log('Window closing');

});

```

 

### Notifications

 

**Electron:**

```javascript

const { Notification } = require('electron');

 

const notification = new Notification({

  title: 'My Notification',

  body: 'Notification body text',

  icon: '/path/to/icon.png'

});

 

notification.show();

 

notification.on('click', () => {

  console.log('Notification clicked');

});

```

 

**WebShell:**

```javascript

const id = await webshell.notifications.send({

  title: 'My Notification',

  message: 'Notification body text',

  icon: '/path/to/icon.png',

  urgency: 'normal',

  timeout: 5000

});

 

webshell.notifications.onClicked((notificationId) => {

  if (notificationId === id) {

    console.log('Notification clicked');

  }

});

```

 

### System Information

 

**Electron:**

```javascript

const os = require('os');

const process = require('process');

 

// Platform

const platform = process.platform; // 'linux', 'darwin', 'win32'

 

// CPU info

const cpus = os.cpus();

 

// Memory

const totalMem = os.totalmem();

const freeMem = os.freemem();

 

// Uptime

const uptime = os.uptime();

```

 

**WebShell:**

```javascript

// System info

const info = await webshell.system.getInfo();

console.log(info.platform, info.osVersion, info.cpuCount);

 

// CPU usage

const cpuUsage = await webshell.system.getCPUUsage();

 

// Memory

const memory = await webshell.system.getMemoryUsage();

console.log(memory.total, memory.used, memory.usedPercent);

 

// Uptime

const uptime = await webshell.system.getUptime();

```

 

### Clipboard

 

**Electron:**

```javascript

const { clipboard } = require('electron');

 

// Read

const text = clipboard.readText();

 

// Write

clipboard.writeText('Hello, World!');

 

// Clear

clipboard.clear();

```

 

**WebShell:**

```javascript

// Read

const text = await webshell.system.clipboard.readText();

 

// Write

await webshell.system.clipboard.writeText('Hello, World!');

 

// Clear

await webshell.system.clipboard.clear();

```

 

### Power Management

 

**Electron:**

```javascript

const { powerMonitor } = require('electron');

 

// Battery status (renderer)

const charging = await navigator.getBattery()

  .then(battery => battery.charging);

 

// Power actions (main)

const { powerSaveBlocker } = require('electron');

const id = powerSaveBlocker.start('prevent-display-sleep');

```

 

**WebShell:**

```javascript

// Battery status

const battery = await webshell.power.getBatteryStatus();

console.log(battery.level, battery.charging);

 

// Listen for changes

webshell.power.onBatteryChange((status) => {

  console.log('Battery:', status);

});

 

// Power actions

await webshell.power.suspend();

await webshell.power.hibernate();

await webshell.power.shutdown();

await webshell.power.restart();

```

 

### App Lifecycle

 

**Electron:**

```javascript

const { app } = require('electron');

 

// App ready

app.whenReady().then(() => {

  createWindow();

});

 

// Quit

app.on('window-all-closed', () => {

  if (process.platform !== 'darwin') {

    app.quit();

  }

});

 

// Get app info

const name = app.getName();

const version = app.getVersion();

const path = app.getAppPath();

```

 

**WebShell:**

```javascript

// App ready

webshell.ready(() => {

  initializeApp();

});

 

// Quit

webshell.shell.app.close();

 

// Reload

webshell.shell.app.reload();

 

// Get app info

const name = webshell.shell.app.getName();

const manifest = webshell.shell.app.getManifest();

console.log(manifest.version);

```

 

### Dialog (Future)

 

**Electron:**

```javascript

const { dialog } = require('electron');

 

// Show message box

const result = await dialog.showMessageBox({

  type: 'question',

  buttons: ['Yes', 'No'],

  message: 'Are you sure?'

});

 

// Show open dialog

const result = await dialog.showOpenDialog({

  properties: ['openFile', 'multiSelections']

});

```

 

**WebShell:**

```javascript

// Currently not supported - use HTML dialogs

const confirmed = confirm('Are you sure?');

 

// File input

const input = document.createElement('input');

input.type = 'file';

input.click();

```

 

### Native Menus (Not Supported)

 

**Electron:**

```javascript

const { Menu, Tray } = require('electron');

 

const menu = Menu.buildFromTemplate([

  { label: 'File', submenu: [...] },

  { label: 'Edit', submenu: [...] }

]);

 

Menu.setApplicationMenu(menu);

 

const tray = new Tray('/path/to/icon.png');

```

 

**WebShell:**

```html

<!-- Create menu using HTML/CSS -->

<nav class="app-menu">

  <button>File</button>

  <button>Edit</button>

</nav>

```

 

---

 

## Step-by-Step Migration Process

 

### Step 1: Analyze Your Electron App

 

**Identify Dependencies:**

 

1. **List all Electron APIs used:**

   ```bash

   # Search for Electron imports

   grep -r "require('electron')" src/

   grep -r "from 'electron'" src/

   ```

 

2. **Check for Node.js modules:**

   ```bash

   # Find Node.js built-in modules

   grep -r "require('fs')" src/

   grep -r "require('path')" src/

   grep -r "require('child_process')" src/

   ```

 

3. **Identify native addons:**

   ```bash

   # Check for .node files or native modules

   find . -name "*.node"

   grep "node-gyp" package.json

   ```

 

**Compatibility Assessment:**

- ✅ Window management → Fully supported

- ✅ Notifications → Fully supported

- ✅ System info → Fully supported

- ✅ Clipboard → Fully supported

- ✅ Power management → Fully supported

- ⚠️ File system → Limited (via permissions)

- ⚠️ Process spawning → Limited (via permissions)

- ❌ Native menus → Not supported

- ❌ System tray → Not supported

- ❌ Native dialogs → Not supported

- ❌ Native addons → Not supported

 

### Step 2: Create WebShell Manifest

 

Create `webshell.json` based on your Electron window configuration:

 

**Electron `main.js`:**

```javascript

const win = new BrowserWindow({

  width: 1200,

  height: 800,

  transparent: true,

  frame: false,

  webPreferences: {

    nodeIntegration: false,

    contextIsolation: true,

    preload: path.join(__dirname, 'preload.js')

  }

});

```

 

**WebShell `webshell.json`:**

```json

{

  "version": "1.0.0",

  "name": "my-app",

  "displayName": "My App",

  "description": "Migrated from Electron",

  "entrypoint": "index.html",

  "icon": "icon.svg",

 

  "window": {

    "type": "widget",

    "width": 1200,

    "height": 800,

    "transparency": true,

    "blur": false,

    "position": "center"

  },

 

  "permissions": {

    "notifications": {

      "send": true

    },

    "calendar": {

      "read": true

    }

  }

}

```

 

### Step 3: Remove Main Process

 

**Delete or Archive:**

- `main.js` or `electron.js`

- `preload.js`

- Electron-specific configuration

- Native module bindings

 

**What to Keep:**

- All renderer process code (HTML/CSS/JS)

- React/Vue/Angular components

- Business logic

- Styles and assets

 

### Step 4: Replace IPC Calls

 

**Before (Electron):**

```javascript

// preload.js

contextBridge.exposeInMainWorld('api', {

  getEvents: () => ipcRenderer.invoke('calendar:get-events'),

  notify: (msg) => ipcRenderer.send('notification:show', msg)

});

 

// renderer.js

const events = await window.api.getEvents();

window.api.notify('Hello!');

```

 

**After (WebShell):**

```javascript

// Direct SDK calls

const events = await webshell.calendar.eventsToday();

await webshell.notifications.send({

  title: 'Notification',

  message: 'Hello!'

});

```

 

### Step 5: Replace Node.js APIs

 

Common replacements:

 

**File System:**

```javascript

// Electron (Main process)

const fs = require('fs');

const content = fs.readFileSync('/path/to/file', 'utf8');

 

// WebShell - use browser APIs or backend

const response = await fetch('/api/read-file');

const content = await response.text();

 

// Or localStorage for app data

localStorage.setItem('key', JSON.stringify(data));

const data = JSON.parse(localStorage.getItem('key'));

```

 

**Path Manipulation:**

```javascript

// Electron

const path = require('path');

const fullPath = path.join(__dirname, 'file.txt');

 

// WebShell - use URL or string manipulation

const fullPath = new URL('./file.txt', import.meta.url).pathname;

```

 

**Process Info:**

```javascript

// Electron

const platform = process.platform;

const env = process.env.NODE_ENV;

 

// WebShell

const info = await webshell.system.getInfo();

const platform = info.platform;

 

// Use build-time environment variables

const env = import.meta.env.MODE; // Vite

```

 

### Step 6: Update Build Configuration

 

**Remove Electron Builder:**

```json

// package.json - REMOVE these

{

  "build": {

    "appId": "com.example.app",

    "electronCompile": false,

    ...

  }

}

```

 

**Add Vite (Recommended):**

```bash

npm install -D vite

```

 

```javascript

// vite.config.js

import { defineConfig } from 'vite';

 

export default defineConfig({

  build: {

    outDir: 'dist',

    minify: 'terser'

  },

  server: {

    port: 5173

  }

});

```

 

```json

// package.json

{

  "scripts": {

    "dev": "vite",

    "build": "vite build",

    "preview": "vite preview"

  }

}

```

 

### Step 7: Update Entry Point

 

**Electron `index.html`:**

```html

<!DOCTYPE html>

<html>

<head>

  <meta charset="UTF-8">

  <title>My App</title>

</head>

<body>

  <div id="app"></div>

  <script src="./renderer.js"></script>

</body>

</html>

```

 

**WebShell `index.html`:**

```html

<!DOCTYPE html>

<html lang="en">

<head>

  <meta charset="UTF-8">

  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <title>My App</title>

  <link rel="stylesheet" href="styles.css">

</head>

<body>

  <div id="app"></div>

 

  <script type="module">

    webshell.ready(() => {

      // Apply theme

      webshell.theme.applyTheme();

 

      // Initialize app

      import('./app.js').then(module => {

        module.initialize();

      });

    });

  </script>

</body>

</html>

```

 

### Step 8: Test and Refine

 

**Test Checklist:**

- [ ] App launches successfully

- [ ] Window size/position correct

- [ ] All features functional

- [ ] Notifications working

- [ ] Settings persist

- [ ] Theme integration

- [ ] Performance acceptable

- [ ] No console errors

 

**Common Issues:**

- SDK not ready → Wrap in `webshell.ready()`

- Permission denied → Add to manifest

- Missing API → Find WebShell equivalent

- Node.js APIs → Replace with web APIs

 

---

 

## Common Patterns

 

### Window Control

 

**Electron Pattern:**

```javascript

// Main process

function createWindow() {

  const win = new BrowserWindow({ width: 800, height: 600 });

 

  ipcMain.on('minimize', () => win.minimize());

  ipcMain.on('maximize', () => win.maximize());

  ipcMain.on('close', () => win.close());

}

 

// Renderer

ipcRenderer.send('minimize');

```

 

**WebShell Pattern:**

```javascript

// Direct control

document.getElementById('minimize-btn').onclick = () => {

  webshell.window.minimize();

};

 

document.getElementById('maximize-btn').onclick = () => {

  webshell.window.maximize();

};

 

document.getElementById('close-btn').onclick = () => {

  webshell.shell.app.close();

};

```

 

### App Settings

 

**Electron Pattern:**

```javascript

// Main process with electron-store

const Store = require('electron-store');

const store = new Store();

 

ipcMain.handle('settings:get', () => {

  return store.get('settings');

});

 

ipcMain.handle('settings:set', (event, settings) => {

  store.set('settings', settings);

});

```

 

**WebShell Pattern:**

```javascript

// Use localStorage

function saveSettings(settings) {

  localStorage.setItem('app-settings', JSON.stringify(settings));

}

 

function loadSettings() {

  const json = localStorage.getItem('app-settings');

  return json ? JSON.parse(json) : {};

}

 

// Or use IndexedDB for larger data

const db = await openDB('my-app', 1);

await db.put('settings', settings);

```

 

### System Tray (Not Supported)

 

**Electron Pattern:**

```javascript

const { Tray, Menu } = require('electron');

 

const tray = new Tray('/path/to/icon.png');

tray.setContextMenu(Menu.buildFromTemplate([

  { label: 'Show', click: () => win.show() },

  { label: 'Quit', click: () => app.quit() }

]));

```

 

**WebShell Alternative:**

```javascript

// Use inter-app communication with system panel

await webshell.shell.sendMessage('system-panel', 'register-quick-action', {

  icon: 'app-icon.svg',

  label: 'My App',

  action: 'toggle-window'

});

```

 

### Auto-Updater (Different Approach)

 

**Electron Pattern:**

```javascript

const { autoUpdater } = require('electron-updater');

 

autoUpdater.checkForUpdatesAndNotify();

 

autoUpdater.on('update-downloaded', () => {

  autoUpdater.quitAndInstall();

});

```

 

**WebShell Pattern:**

```javascript

// Manual update check

async function checkForUpdates() {

  const response = await fetch('https://api.myapp.com/version');

  const { latestVersion } = await response.json();

 

  const manifest = webshell.shell.app.getManifest();

 

  if (latestVersion > manifest.version) {

    await webshell.notifications.send({

      title: 'Update Available',

      message: `Version ${latestVersion} is available`,

      actions: [

        { id: 'download', label: 'Download' }

      ]

    });

  }

}

 

webshell.notifications.onActionClicked(({ actionId }) => {

  if (actionId === 'download') {

    window.open('https://myapp.com/download');

  }

});

```

 

---

 

## Troubleshooting

 

### App Won't Start

 

**Problem:** Blank window or immediate crash

 

**Solutions:**

1. Check `webshell.json` syntax is valid

2. Verify `entrypoint` path is correct

3. Check browser console for errors

4. Ensure SDK ready callback is used:

   ```javascript

   webshell.ready(() => {

     // App initialization here

   });

   ```

 

### Permission Errors

 

**Problem:** `PERMISSION_DENIED` errors

 

**Solution:** Add required permissions to manifest:

```json

{

  "permissions": {

    "notifications": { "send": true },

    "calendar": { "read": true, "write": true }

  }

}

```

 

### IPC Replacement Issues

 

**Problem:** Don't know how to replace IPC calls

 

**Solution:** Map to SDK equivalents:

```javascript

// Old: ipcRenderer.invoke('get-system-info')

// New: await webshell.system.getInfo()

 

// Old: ipcRenderer.send('show-notification', msg)

// New: await webshell.notifications.send({ title: 'Title', message: msg })

```

 

### Missing Node.js APIs

 

**Problem:** `fs`, `path`, `os` not available

 

**Solutions:**

1. Use browser equivalents (fetch, localStorage)

2. Move file operations to backend (if supported)

3. Use WebShell SDK alternatives

4. Consider if feature is necessary

 

### Large Bundle Size After Migration

 

**Problem:** Bundle still large

 

**Solutions:**

```javascript

// 1. Enable code splitting

import { lazy } from 'react';

const Component = lazy(() => import('./Component'));

 

// 2. Tree shake dependencies

// vite.config.js

export default {

  build: {

    rollupOptions: {

      output: {

        manualChunks(id) {

          if (id.includes('node_modules')) {

            return 'vendor';

          }

        }

      }

    }

  }

};

 

// 3. Remove unused dependencies

npm prune

```

 

### Theme Not Working

 

**Problem:** App doesn't match system theme

 

**Solution:**

```javascript

webshell.ready(() => {

  // Apply theme CSS variables

  webshell.theme.applyTheme();

 

  // Listen for changes

  webshell.theme.onThemeChange((theme) => {

    console.log('Theme updated:', theme);

  });

});

```

 

---

 

## Migration Checklist

 

### Pre-Migration

- [ ] Audit all Electron API usage

- [ ] List all Node.js modules used

- [ ] Identify native addons

- [ ] Document current features

- [ ] Check WebShell API compatibility

- [ ] Plan for unsupported features

 

### Migration

- [ ] Create `webshell.json` manifest

- [ ] Remove Main process code

- [ ] Remove preload scripts

- [ ] Replace IPC calls with SDK

- [ ] Replace Node.js APIs

- [ ] Update build configuration

- [ ] Add permission declarations

- [ ] Update package.json scripts

 

### Testing

- [ ] App launches successfully

- [ ] All features work

- [ ] Window management functional

- [ ] Notifications working

- [ ] Settings persist correctly

- [ ] Theme integration works

- [ ] Performance is acceptable

- [ ] No console errors

- [ ] Permissions properly scoped

 

### Optimization

- [ ] Remove unused dependencies

- [ ] Minimize bundle size

- [ ] Optimize assets

- [ ] Test on target systems

- [ ] Profile performance

- [ ] Update documentation

 

### Distribution

- [ ] Build production version

- [ ] Test installation

- [ ] Update README

- [ ] Document permissions needed

- [ ] Create distribution package

- [ ] Update version numbers

 

---

 

## Additional Resources

 

- [WebShell SDK API Reference](../sdk-api-reference.md)

- [Getting Started Guide](../getting-started-sdk.md)

- [Permissions Guide](../permissions-guide.md)

- [Best Practices](../best-practices.md)

- [Troubleshooting](../troubleshooting-sdk.md)

 

---

 

**Migration Support:**

 

If you encounter issues during migration, please:

1. Check the [Troubleshooting Guide](../troubleshooting-sdk.md)

2. Review [example apps](../../examples/)

3. Search GitHub issues

4. Join the WebShell community Discord

 

**Happy migrating!** Your WebShell app will be lighter, simpler, and easier to maintain.
