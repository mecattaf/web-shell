# Development Mode

Development mode enables hot reload of web apps during development by connecting the QML WebEngineView to a Vite dev server. This dramatically improves developer experience by eliminating the need to manually restart QuickShell on every change.

## Quick Start

### 1. Start Your Dev Server

```bash
cd my-app
npm run dev  # Starts Vite on localhost:5173
```

### 2. Configure Your Manifest

Add the `devServer` field to your `webshell.json`:

```json
{
  "name": "my-app",
  "version": "1.0.0",
  "entrypoint": "index.html",
  "devServer": "http://localhost:5173",
  "devMode": {
    "hotReload": true,
    "watchPaths": ["src/**/*"],
    "ignorePaths": ["node_modules/**", "dist/**", ".git/**"]
  }
}
```

### 3. Launch QuickShell in Dev Mode

```bash
quickshell -p . --dev
```

## How It Works

### Architecture Overview

```
┌─────────────────┐         ┌──────────────────┐
│  Vite Dev       │ HTTP    │  WebEngineView   │
│  Server         │◄────────┤  (QML)           │
│  localhost:5173 │         │                  │
└─────────────────┘         └──────────────────┘
        │                            │
        │                            │
        │ File Changes               │ Reload Signal
        ▼                            ▼
┌─────────────────┐         ┌──────────────────┐
│  FileSystem     │         │  DevModeManager  │
│  src/**/*       │────────►│  (QML Singleton) │
└─────────────────┘         └──────────────────┘
```

1. **WebShellView** connects to the Vite dev server URL instead of loading local files
2. **FileSystemWatcher** monitors your source directory for changes
3. **DevModeManager** debounces file changes and triggers reload signals
4. **WebEngineView** reloads when it receives the reload signal

### What Triggers Hot Reload

✅ **Automatic reload on:**
- Changes to any file in `src/`
- Changes to `index.html`
- Changes to any file matching `watchPaths` patterns
- Vite HMR updates (reflected after reload)

❌ **Requires manual restart:**
- Changes to `webshell.json` manifest
- Changes to QML files
- Installation of new npm packages

## Configuration

### Manifest Schema

```json
{
  "name": "my-app",
  "version": "1.0.0",
  "entrypoint": "index.html",

  // Dev server URL (optional)
  "devServer": "http://localhost:5173",

  // Dev mode configuration (optional)
  "devMode": {
    // Enable hot reload (default: true)
    "hotReload": true,

    // Paths to watch for changes (glob patterns)
    "watchPaths": [
      "src/**/*",
      "public/**/*",
      "index.html"
    ],

    // Paths to ignore (glob patterns)
    "ignorePaths": [
      "node_modules/**",
      "dist/**",
      ".git/**",
      "**/*.test.ts"
    ]
  },

  // Other manifest fields...
  "permissions": {},
  "window": {}
}
```

### Vite Configuration

Configure Vite to allow CORS for QuickShell:

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    port: 5173,
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  }
});
```

### WebShellView Configuration

```qml
WebShellView {
    id: webview

    appName: "my-app"
    devMode: true
    devServerUrl: "http://localhost:5173"
    manifestPath: "/path/to/app/directory"
    source: "file:///path/to/app/dist/index.html"

    onReady: {
        console.log("App loaded successfully");
    }

    onLoadError: (error) => {
        console.error("Load error:", error);
    }
}
```

## Features

### Error Overlay

When the dev server fails to load, an error overlay is displayed with:
- Error message details
- Retry button to attempt reload
- Dismissible on successful load

![Dev Error Overlay](https://via.placeholder.com/600x400?text=Dev+Error+Overlay)

### DevTools Integration

**F12**: Open Chrome DevTools inspector
**F5**: Manual reload

```qml
// Programmatic access
webview.openInspector()
webview.reload()
```

### File Watching

The dev mode manager automatically watches your app directory and triggers reloads on file changes:

```qml
// Access the dev mode manager
DevModeManager.enabled = true
DevModeManager.startWatching("my-app", "/path/to/app")

// Signals
DevModeManager.reloadRequested.connect((appName) => {
    console.log("Reload requested for:", appName);
});
```

### Dev Server Health Check

Check if the dev server is running before connecting:

```qml
DevServerChecker {
    url: "http://localhost:5173"

    onChecked: (success) => {
        if (success) {
            console.log("Dev server is available");
        } else {
            console.warn("Dev server is not available");
        }
    }

    onAvailabilityChanged: (available) => {
        console.log("Server availability changed:", available);
    }
}
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `F5` | Reload the current app |
| `F12` | Open Chrome DevTools inspector |
| `Ctrl+R` | Reload (standard browser shortcut) |

## Troubleshooting

### Dev server not available

**Symptom**: Error overlay shows "Dev Server Error"

**Solutions**:
1. Ensure Vite is running: `npm run dev`
2. Check the port number matches `devServer` in manifest
3. Verify firewall isn't blocking localhost connections
4. Check Vite output for errors

```bash
# Verify dev server is running
curl http://localhost:5173
```

### Hot reload not working

**Symptom**: Changes to source files don't trigger reload

**Solutions**:
1. Check QuickShell console for file watcher errors
2. Ensure app directory is readable
3. Verify `watchPaths` in manifest includes your source files
4. Try manual reload with F5

```bash
# Check file permissions
ls -la /path/to/app/src
```

### CORS errors

**Symptom**: Console shows CORS policy errors

**Solutions**:
1. Add CORS headers to `vite.config.ts` (see Configuration section)
2. Ensure `localContentCanAccessRemoteUrls` is enabled in dev mode
3. Check that dev server URL uses `http://localhost` not `http://127.0.0.1`

### Page loads blank

**Symptom**: WebEngineView shows empty white page

**Solutions**:
1. Check browser console (F12) for JavaScript errors
2. Verify Vite dev server is serving content correctly
3. Check that `entrypoint` in manifest matches Vite's HTML file
4. Try loading the dev server URL directly in a browser

## Best Practices

### 1. Use Environment Variables

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    port: parseInt(process.env.VITE_PORT || '5173'),
  }
});
```

```json
// webshell.json
{
  "devServer": "${DEV_SERVER_URL:-http://localhost:5173}"
}
```

### 2. Separate Dev and Production Builds

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

### 3. Use Debouncing

File changes are automatically debounced (300ms) to avoid excessive reloads during rapid changes.

### 4. Preserve State

Since WebEngine reload destroys JavaScript state, use:
- `localStorage` or `sessionStorage` for persistence
- State serialization in your app
- Vite's HMR API for in-place module updates

```typescript
// Example: Preserve state across reloads
if (import.meta.hot) {
  import.meta.hot.accept();

  // Restore state on reload
  const savedState = localStorage.getItem('app-state');
  if (savedState) {
    restoreState(JSON.parse(savedState));
  }
}
```

### 5. Clean Exit

The DevModeManager automatically cleans up watchers when apps are destroyed:

```qml
Component.onDestruction: {
    if (devMode) {
        DevModeManager.stopWatching(appName);
    }
}
```

## Advanced Usage

### Custom File Watcher

```qml
import Quickshell.Io

FileSystemWatcher {
    paths: ["/path/to/watch"]

    onDirectoryChanged: (path) => {
        console.log("Directory changed:", path);
        // Custom reload logic
    }

    onFileChanged: (path) => {
        console.log("File changed:", path);
        // Custom reload logic
    }
}
```

### Multiple Dev Servers

```qml
// App 1
WebShellView {
    devMode: true
    devServerUrl: "http://localhost:5173"
}

// App 2
WebShellView {
    devMode: true
    devServerUrl: "http://localhost:5174"
}
```

### Conditional Dev Mode

```qml
WebShellView {
    property bool isDevelopment: Qt.application.arguments.includes("--dev")

    devMode: isDevelopment
    url: isDevelopment
        ? "http://localhost:5173"
        : Qt.resolvedUrl("file:///app/dist/index.html")
}
```

## Reference Material

### Related Documentation
- [Vite Dev Server](https://vitejs.dev/guide/api-javascript.html#vitedevserver)
- [Qt WebEngine](https://doc.qt.io/qt-6/qtwebengine-index.html)
- [QuickShell FileSystemWatcher](https://quickshell.outfoxxed.me/docs/io/filesystemwatcher/)

### Similar Implementations
- [Electron's loadURL()](https://www.electronjs.org/docs/latest/api/browser-window#winloadurlurl-options)
- [Tauri's dev server proxy](https://tauri.app/v1/guides/development/development-cycle)
- [VS Code webview dev mode](https://code.visualstudio.com/api/extension-guides/webview)

## API Reference

### DevModeManager

```qml
// Singleton
import WebShell.Services

DevModeManager {
    property bool enabled
    property string devServerUrl

    signal reloadRequested(string appName)

    function startWatching(appName, appPath)
    function stopWatching(appName)
    function stopAll()
    function getWatchedApps()
}
```

### DevServerChecker

```qml
import WebShell.Components

DevServerChecker {
    property string url
    property int checkInterval
    property int timeout
    property bool available
    property string lastError

    signal checked(bool success)
    signal availabilityChanged(bool available)

    function check()
    function startChecking()
    function stopChecking()
}
```

### WebShellView (Dev Mode Extensions)

```qml
import WebShell.Components

WebShellView {
    property bool devMode
    property string devServerUrl
    property string manifestPath
    property url source

    function reload()
    function showDevError(error)
    function openInspector()
}
```

## Examples

See the example implementation in `quickshell/Components/WebShellContainer.qml` for a complete reference.

## Contributing

When modifying dev mode functionality:
1. Test with both Vite and other dev servers
2. Verify hot reload works with file changes
3. Check error handling for offline dev server
4. Ensure CORS configuration is documented
5. Update this documentation with any new features
