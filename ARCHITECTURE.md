# WebShell Architecture

This document outlines the key architectural decisions and design patterns used in WebShell.

## Table of Contents

- [Overview](#overview)
- [WebEngine Process Model](#webengine-process-model)
- [Component Architecture](#component-architecture)
- [Security Model](#security-model)
- [Memory Management](#memory-management)

## Overview

WebShell is a desktop shell built on QuickShell that integrates web technologies using QtWebEngine. It allows running web applications with native system integration while maintaining security and performance.

## WebEngine Process Model

### Decision: Shared WebEngineProfile

**Date**: 2025-01-19
**Status**: Implemented in task-1.3

#### Rationale

We chose to use a **shared WebEngineProfile** for all WebShell applications rather than isolated profiles per app. This decision was made based on the following considerations:

#### Option A: Shared Profile (Selected)

**Benefits:**
- **Lower memory overhead**: ~80-150MB total for all apps vs. per-app overhead
- **Faster startup**: Single Chromium process initialization
- **Resource efficiency**: Shared cache, DNS cache, and network stack
- **Simpler architecture**: Single process to manage and monitor
- **Inter-app communication**: Apps can communicate via shared state if needed

**Trade-offs:**
- **Security isolation**: Apps share the same process boundary
- **Crash propagation**: A crash in the render process affects all apps
- **Resource contention**: Apps compete for shared resources

#### Option B: Isolated Profiles (Rejected for MVP)

**Benefits:**
- **Better security isolation**: Each app in its own process
- **Crash isolation**: One app crashing doesn't affect others
- **Resource isolation**: Each app has dedicated resources

**Trade-offs:**
- **Higher memory overhead**: 80-150MB per app
- **Slower startup**: Multiple Chromium processes to initialize
- **Increased complexity**: Multiple processes to manage

#### Implementation

The shared profile is implemented as a QML singleton in `quickshell/Components/WebShellProfile.qml`:

```qml
pragma Singleton
import QtQuick
import QtWebEngine

WebEngineProfile {
    storageName: "webshell-shared"
    offTheRecord: false
    persistentStoragePath: StandardPaths.writableLocation(
        StandardPaths.AppDataLocation
    ) + "/webshell"

    httpCacheType: WebEngineProfile.DiskHttpCache
    httpCacheMaximumSize: 100 * 1024 * 1024 // 100MB

    httpUserAgent: "WebShell/1.0 (QtWebEngine)"
}
```

All `WebShellView` instances reference this shared profile:

```qml
WebEngineView {
    profile: WebShellProfile
    // ...
}
```

#### Memory Estimates

**With Shared Profile:**
- WebEngine runtime: ~80MB (once)
- Per-app overhead: ~10-30MB (DOM/JS state)
- 5 apps total: ~230MB

**With Isolated Profiles:**
- Per-app: ~80-150MB
- 5 apps total: ~650MB

#### Security Considerations

Since we're using a shared profile, security is enforced through:

1. **Permission-based security**: Manifest-based permissions system
2. **Navigation restrictions**: URLs filtered by `onNavigationRequested` handler
3. **Content Security Policy**: Injected CSP headers
4. **Sandboxing**: Chromium sandbox enabled by default
5. **Trusted apps**: Only user-installed, manifest-validated apps are loaded

This approach is suitable for WebShell because:
- Apps are trusted (user-installed, not arbitrary web content)
- Apps are defined by manifests with explicit permissions
- Memory efficiency is critical for a desktop shell
- Apps are cooperative, not adversarial

#### Future Considerations

If stronger isolation is needed in the future, we can:
- Migrate to isolated profiles per app
- Implement process-level isolation
- Add sandboxing layers beyond Chromium's default

The current architecture allows for this migration without breaking changes to the WebShellView API.

## Component Architecture

### Core Components

#### WebShellProfile (Singleton)
- **Location**: `quickshell/Components/WebShellProfile.qml`
- **Purpose**: Shared WebEngine profile for all apps
- **Type**: QML Singleton
- **Responsibilities**:
  - Manage persistent storage
  - Configure HTTP cache
  - Set user agent
  - Provide shared network stack

#### WebShellLoader (Singleton)
- **Location**: `quickshell/Services/WebShellLoader.qml`
- **Purpose**: App discovery, loading, and lifecycle management
- **Type**: QML Singleton
- **Implemented**: task-3.4
- **Responsibilities**:
  - Discover apps from filesystem
  - Load and parse app manifests
  - Register apps with PermissionManager
  - Create and manage WebShellView instances
  - Track memory usage across all apps
  - Handle app lifecycle (launch, close, reload)
  - Support hot reload in dev mode

**Key Features:**
- **App Discovery**: Scans `~/.config/webshell/apps` for `webshell.json` manifests
- **Dynamic Loading**: Creates WebShellView instances on demand
- **Memory Tracking**: Estimates total memory usage based on shared profile model
- **Lifecycle Management**: Launch, close, reload apps
- **Dev Mode Support**: Integrates with DevModeManager for hot reload

**Memory Estimation Formula:**
```javascript
// Base memory: ~150MB for first app (WebEngine runtime + DOM)
// Each additional app: ~25MB (DOM/JS only, shares runtime)
totalMemory = 150 + (appCount - 1) * 25
```

#### WebShellView
- **Location**: `quickshell/Components/WebShellView.qml`
- **Purpose**: WebEngine wrapper with WebShell-specific configuration
- **Responsibilities**:
  - Render web content with transparent background
  - Enforce navigation security policies
  - Handle load events and errors
  - Provide DevTools access in dev mode
  - Log JavaScript console messages
  - Manage render process crashes

#### WebShellContainer
- **Location**: `quickshell/Components/WebShellContainer.qml`
- **Purpose**: Container for WebShellView instances
- **Responsibilities**:
  - Host WebShellView
  - Handle layout and positioning
  - Manage app lifecycle

#### ManifestParser
- **Location**: `quickshell/Services/ManifestParser.qml`
- **Purpose**: Parse and validate app manifests
- **Implemented**: task-3.2
- **Responsibilities**:
  - Load webshell.json files
  - Validate manifest format
  - Extract app metadata
  - Provide permission information

#### PermissionManager (Singleton)
- **Location**: `quickshell/Services/PermissionManager.qml`
- **Purpose**: Manage app permissions and enforce access control
- **Type**: QML Singleton
- **Implemented**: task-3.3
- **Responsibilities**:
  - Register app permissions
  - Enforce permission checks
  - Audit access attempts
  - Manage filesystem and network access

### Component Hierarchy

```
ShellRoot
└── WebShell (Scope)
    ├── QtWebEngine.initialize()
    ├── WebShellLoader (Singleton)
    │   ├── App Discovery
    │   ├── ManifestParser instances
    │   └── View Management
    ├── PermissionManager (Singleton)
    └── ShellWindow
        └── WebShellContainer
            └── WebShellView
                └── WebEngineView (Qt)
                    └── WebShellProfile (Singleton)
```

### App Lifecycle

The complete lifecycle of a WebShell app follows these stages:

#### 1. Discovery Phase
```javascript
// WebShellLoader discovers apps on initialization
WebShellLoader.initialize()
  → discoverApps()
    → Process.exec("find ~/.config/webshell/apps -name webshell.json")
    → For each manifest found: loadApp(manifestPath)
```

#### 2. Loading Phase
```javascript
// Each app is loaded and validated
loadApp(manifestPath)
  → Create ManifestParser instance
  → ManifestParser.load(manifestPath)
  → Validate manifest format
  → Parse permissions, entrypoint, window config
  → On success: registerApp()
  → On error: emit appFailed signal
```

#### 3. Registration Phase
```javascript
// App is registered with the system
registerApp(parser, manifestPath)
  → PermissionManager.registerApp(appName, permissions)
  → Store app metadata in loadedApps registry
  → Emit appLoaded signal
  → App is now ready to launch
```

#### 4. Launch Phase
```javascript
// User or system launches the app
WebShellLoader.launchApp(appName)
  → Get app metadata from registry
  → Determine entrypoint URL (dev server or bundled)
  → Create WebShellView instance with shared profile
  → Add view to activeViews array
  → Update memory estimate
  → Emit appLaunched signal
  → WebShellView loads content
```

#### 5. Running Phase
```javascript
// App is active and running
WebShellView
  → Uses shared WebShellProfile
  → Enforces navigation restrictions
  → Handles JavaScript console messages
  → Responds to user interactions
  → In dev mode: watches for file changes
```

#### 6. Closure Phase
```javascript
// App is closed by user or system
WebShellLoader.closeApp(appName)
  → Find view in activeViews array
  → Destroy WebShellView instance
  → Remove from activeViews
  → Update memory estimate
  → Emit appClosed signal
  → App metadata remains in registry for re-launch
```

#### 7. Reload Phase (Dev Mode)
```javascript
// Hot reload in development
DevModeManager detects file change
  → Emit reloadRequested signal
  → WebShellLoader.reloadApp(appName)
    → closeApp(appName)
    → launchApp(appName)
```

### App Directory Structure

WebShell expects apps to follow this structure:

```
~/.config/webshell/apps/
├── my-app/
│   ├── webshell.json          # Manifest (required)
│   ├── index.html             # Entrypoint
│   ├── assets/
│   │   ├── icon.svg
│   │   └── style.css
│   └── dist/                  # Built files (optional)
│       └── bundle.js
└── another-app/
    ├── webshell.json
    └── ...
```

**Manifest Example (webshell.json):**
```json
{
  "version": "1.0.0",
  "name": "my-app",
  "displayName": "My Application",
  "entrypoint": "index.html",
  "devServer": "http://localhost:5173",
  "window": {
    "type": "widget",
    "width": 400,
    "height": 300,
    "blur": true
  },
  "permissions": {
    "calendar": {
      "read": true,
      "write": false
    },
    "filesystem": {
      "read": ["~/Documents"],
      "write": []
    },
    "network": {
      "allowed_hosts": ["api.example.com"]
    }
  }
}
```

## Security Model

### Defense in Depth

WebShell implements multiple layers of security:

#### 1. Chromium Sandbox (Process Level)
- **Status**: Enabled by default
- **Mechanism**: Chromium's multi-process sandbox
- **Requirements**:
  - Setuid sandbox helper: `/usr/lib/qt6/libexec/QtWebEngineProcess`
  - Kernel namespace support: `CONFIG_USER_NS=y`

#### 2. Navigation Restrictions (Network Level)
- **Allowed protocols**: `file://`, `qrc://`
- **Dev mode**: `http://localhost`, `http://127.0.0.1`
- **Blocked**: All external URLs by default

```qml
onNavigationRequested: (request) => {
    // Only allow local resources
    if (!url.startsWith('file://') &&
        !url.startsWith('qrc://') &&
        !isLocalhost(url)) {
        request.action = WebEngineNavigationRequest.IgnoreRequest;
    }
}
```

#### 3. WebEngine Settings (API Level)
```qml
settings {
    localContentCanAccessRemoteUrls: false
    allowRunningInsecureContent: false
    javascriptCanOpenWindows: false
    pluginsEnabled: false
}
```

#### 4. Content Security Policy (Content Level)
- Injected via JavaScript after page load
- Restricts inline scripts, external resources
- Configurable per-app via manifest

#### 5. Manifest Permissions (App Level)
- Future: Apps declare required permissions
- Runtime permission prompts
- Capability-based security model

### Threat Model

**In Scope:**
- Malicious web content in loaded apps
- XSS attacks via injected content
- Unauthorized network access
- Data exfiltration attempts

**Out of Scope (Trusted):**
- WebShell system code
- QuickShell runtime
- User-installed app manifests
- Local file system (within app directory)

## Memory Management

### Shared Resources

**Shared across all apps:**
- WebEngine runtime (~80MB)
- Network stack (DNS cache, connection pool)
- HTTP cache (disk-based, 100MB limit)
- Font cache
- Image decoder cache

**Per-app resources:**
- DOM tree
- JavaScript heap
- Render tree
- Layout state

### Memory Monitoring

In dev mode, WebShellView logs memory usage. For production, consider:
- Implement memory pressure callbacks
- Periodic garbage collection triggers
- App suspension for backgrounded apps

### Cache Configuration

```qml
WebEngineProfile {
    httpCacheType: WebEngineProfile.DiskHttpCache
    httpCacheMaximumSize: 100 * 1024 * 1024 // 100MB
    persistentStoragePath: "~/.local/share/webshell"
}
```

## Rendering Pipeline

### Transparent Background Support

WebShell supports transparent backgrounds for compositor blur effects:

```qml
WebEngineView {
    backgroundColor: "transparent"
}
```

**Rendering flow:**
1. Web content renders to offscreen buffer
2. Buffer composited by Qt Scene Graph
3. Qt renders to window with transparency
4. Compositor applies blur to background

**Requirements:**
- `backgroundColor: "transparent"` in WebEngineView
- Compositor must support transparency
- Web content should use `background: transparent`

## Development and Debugging

### DevTools Access

When `devMode: true`:
- F12 opens DevTools inspector
- Remote debugging on port 9222
- JavaScript console messages logged to terminal
- Extended error reporting

```qml
WebShellView {
    devMode: true
    devToolsPort: 9222
}
```

### Console Message Forwarding

All JavaScript console messages are forwarded to the terminal:

```
[WebShellView:app-name] INFO: User clicked button app.js:42
[WebShellView:app-name] ERROR: Failed to load resource app.js:103
```

## Performance Considerations

### Cold Start Optimization

- QtWebEngine initialized once at shell startup
- Shared profile reduces per-app overhead
- First app load: ~500ms
- Subsequent apps: ~100-200ms

### Runtime Performance

- Hardware-accelerated rendering enabled
- WebGL enabled for graphics-intensive apps
- Accelerated 2D canvas
- Shared GPU process

## Window Configuration

**Date**: 2025-01-19
**Status**: Implemented in task-3.5

### Overview

WebShell implements a comprehensive window configuration system that allows apps to control their window appearance, behavior, and position through manifest-defined properties.

### Components

The system consists of three main components:

1. **WindowConfig** (`quickshell/Components/WindowConfig.qml`)
   - Manages window properties (size, position, appearance)
   - Loads configuration from manifest
   - Enforces size constraints
   - Calculates positions from presets

2. **WindowTypeBehavior** (`quickshell/Components/WindowTypeBehavior.qml`)
   - Defines type-specific behaviors
   - Manages z-index ordering
   - Controls modal and focus behavior

3. **WindowAnimations** (`quickshell/Components/WindowAnimations.qml`)
   - Provides window transitions
   - Type-specific default animations
   - Slide, fade, and scale effects

### Window Types

WebShell supports four window types:

| Type | Use Case | Default Size | Behavior |
|------|----------|--------------|----------|
| **widget** | Standard apps | 800×600 | Resizable, movable, centered |
| **panel** | Toolbars, docks | Full width × 60px | Fixed, top-aligned, always on top |
| **overlay** | Fullscreen UI | Fullscreen | Fixed, high z-index, modal |
| **dialog** | Modal dialogs | 400×300 | Fixed size, movable, modal |

### Configuration Properties

Window configuration is defined in the app manifest:

```json
{
  "window": {
    "type": "widget",
    "width": 800,
    "height": 600,
    "minWidth": 400,
    "minHeight": 300,
    "position": "center",
    "resizable": true,
    "movable": true,
    "blur": true,
    "blurRadius": 20,
    "transparency": true,
    "opacity": 0.95
  }
}
```

### Position Presets

Windows can be positioned using string presets:

- `center` - Screen center
- `top-left`, `top-center`, `top-right`
- `left-center`, `right-center`
- `bottom-left`, `bottom-center`, `bottom-right`

Or with explicit coordinates:

```json
{
  "window": {
    "x": 100,
    "y": 100
  }
}
```

### Blur and Transparency

Windows support background blur and transparency for modern UI effects:

```qml
WebShellContainer {
    enableBlur: true
    blurRadius: 20
    backgroundColor: Qt.rgba(0.1, 0.1, 0.1, 0.85)
}
```

**Requirements:**
- Compositor support for transparency
- QtQuick.Effects MultiEffect for blur
- Hardware acceleration recommended

### Resize and Move

**Resize Handle:**
- Visible on resizable windows
- Bottom-right corner drag
- Enforces min/max constraints
- Visual indicator on hover

**Move Handle:**
- Full window drag for movable windows
- Disabled during resize
- Optional edge snapping

### Animations

Windows animate on appearance based on type:

- **Widget**: Scale in from 0.9 (OutBack easing)
- **Panel**: Slide in from top (OutCubic)
- **Overlay**: Fade in (OutQuad)
- **Dialog**: Scale in (OutBack)

Custom animations available:

```qml
WindowAnimations {
    target: window
    enabled: true
}

animations.slideIn("left")
animations.fadeIn()
animations.scaleIn()
```

### Z-Index Management

Windows are layered by type:

| Type | Z-Index |
|------|---------|
| Overlay | 1000 |
| Dialog | 900 |
| Panel | 800 |
| Widget | 100 |

### Size Constraints

Windows automatically enforce size constraints:

```qml
function constrainSize(requestedWidth, requestedHeight) {
    let w = Math.max(requestedWidth, minWidth);
    let h = Math.max(requestedHeight, minHeight);

    if (maxWidth > 0) w = Math.min(w, maxWidth);
    if (maxHeight > 0) h = Math.min(h, maxHeight);

    return { width: w, height: h };
}
```

### Type-Specific Defaults

Each window type has sensible defaults:

```qml
const typeDefaults = {
    widget: { width: 800, height: 600, blur: true, resizable: true },
    panel: { width: -1, height: 60, blur: true, resizable: false },
    overlay: { width: -1, height: -1, blur: true, resizable: false },
    dialog: { width: 400, height: 300, blur: true, resizable: false }
};
```

### Performance Considerations

- **Blur effects** are GPU-intensive (use sparingly)
- **Animations** can be disabled via `enabled: false`
- **Transparency** requires compositor support
- **Large blur radius** impacts frame rate

### Testing

Run window configuration tests:

```bash
quickshell -p quickshell/Tests/WindowConfigTest.qml
```

See also: `docs/window-configuration.md` for detailed usage guide.

## Future Enhancements

### Potential Improvements

1. **App Suspension**: Suspend backgrounded apps to save resources
2. **Isolated Profiles**: Optional per-app isolation for sensitive apps
3. **Memory Limits**: Per-app memory quotas
4. **Network Quotas**: Rate limiting for network requests
5. **WebChannel Integration**: Qt/QML ↔ JavaScript bridge for native APIs
6. **Multi-Monitor Support**: Target specific monitors, remember positions per-monitor
7. **Window Snapping**: Snap to screen edges and other windows
8. **Tiling Support**: Automatic window tiling and layouts

---

**Document Version**: 1.2
**Last Updated**: 2025-01-19
**Related Tasks**: task-1.3, task-3.2, task-3.3, task-3.4, task-3.5
