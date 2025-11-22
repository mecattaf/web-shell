---
id: task-1.3
title: Implement WebEngineView wrapper component
status: Done
created_date: 2025-01-19
completed_date: 2025-01-19
milestone: milestone-1
assignees: []
labels: [qml, webengine, architecture]
dependencies: [task-1.2]
---

## Description

Create a QML component that wraps QtWebEngine's WebEngineView with WebShell-specific configuration. This includes **transparent background support, sandbox configuration, and the process model decision** for running multiple web apps.

**Critical Architectural Decision**: This task establishes whether all WebShell apps share a single WebEngine process or run in isolated processes.

## Acceptance Criteria

- [ ] `WebShellView.qml` component created
- [ ] Loads web content (test with simple HTML)
- [ ] Transparent background enabled
- [ ] Proper size and positioning
- [ ] DevTools accessible for debugging
- [ ] Error handling for load failures
- [ ] **Sandbox configuration documented and implemented**
- [ ] **Process model decision documented**

## Implementation Plan

1. **Architectural Decision: Process Model**

**Option A: Shared WebEngineProfile (Recommended)**
- All WebShell apps share one Chromium process
- Lower memory overhead (~80-150MB total vs per-app)
- Apps can communicate via shared state if needed
- Security isolation via permissions (not process boundaries)

**Option B: Isolated WebEngineProfile per App**
- Each app gets its own Chromium process
- Higher memory overhead (80-150MB per app)
- Better security isolation
- Crash in one app doesn't affect others

**Recommendation**: **Shared profile** for WebShell MVP. Rationale:
- Shell apps are trusted (user-installed, manifest-based permissions)
- Memory efficiency matters for desktop shell
- Can add isolation later if needed

**Implementation**:
```qml
// Shared profile singleton
pragma Singleton
import QtQuick
import QtWebEngine

WebEngineProfile {
    id: sharedProfile
    
    storageName: "webshell-shared"
    offTheRecord: false
    persistentStoragePath: StandardPaths.writableLocation(
        StandardPaths.AppDataLocation
    ) + "/webshell"
    
    // Shared cache
    httpCacheType: WebEngineProfile.DiskHttpCache
    httpCacheMaximumSize: 100 * 1024 * 1024 // 100MB
    
    // User agent
    httpUserAgent: "WebShell/1.0 (QtWebEngine)"
}
```

2. **Create WebShellView.qml**
```qml
import QtQuick
import QtWebEngine

WebEngineView {
    id: webview
    
    // Use shared profile
    profile: WebShellProfile
    
    // Transparent background
    backgroundColor: "transparent"
    
    // Settings
    settings {
        javascriptEnabled: true
        localContentCanAccessRemoteUrls: false  // Security
        allowRunningInsecureContent: false      // Security
        pluginsEnabled: false                    // No Flash, etc.
        
        // Enable features
        javascriptCanOpenWindows: false          // Prevent popups
        javascriptCanAccessClipboard: true       // For clipboard API
        allowGeolocationOnInsecureOrigins: false
        
        // Performance
        accelerated2dCanvasEnabled: true
        webGLEnabled: true
        
        // Dev tools
        errorPageEnabled: true
    }
    
    // Properties
    property bool devMode: false
    property string appName: ""
    
    // Signals
    signal ready()
    signal loadError(string error)
    
    // Load handling
    onLoadingChanged: (loadRequest) => {
        if (loadRequest.status === WebEngineView.LoadSucceededStatus) {
            console.log("[WebShellView] Loaded:", appName);
            ready();
        } else if (loadRequest.status === WebEngineView.LoadFailedStatus) {
            console.error("[WebShellView] Load failed:", loadRequest.errorString);
            loadError(loadRequest.errorString);
        }
    }
    
    // Error handling
    onRenderProcessTerminated: (terminationStatus, exitCode) => {
        console.error("[WebShellView] Render process terminated:", 
                      terminationStatus, exitCode);
        
        if (terminationStatus === WebEngineView.CrashedTerminationStatus) {
            // Attempt reload
            reload();
        }
    }
    
    // Context menu (dev tools)
    onContextMenuRequested: (request) => {
        if (devMode) {
            request.accepted = true;
            // Show custom context menu with DevTools option
        }
    }
}
```

3. **Configure Sandbox Settings**

**Important**: QtWebEngine uses Chromium's sandbox by default on Linux. This is GOOD for security but has requirements:

**Sandbox Requirements**:
```qml
// In main.qml or shell initialization
import QtWebEngine

ShellRoot {
    Component.onCompleted: {
        // Initialize WebEngine
        // This MUST be called before creating any WebEngineView
        QtWebEngine.initialize();
        
        // Optional: Adjust sandbox (only if needed)
        // Default is secure, don't disable unless necessary
    }
}
```

**Sandbox Behavior**:
- Enabled by default (secure)
- Requires `setuid` sandbox helper: `/usr/lib/qt6/libexec/QtWebEngineProcess`
- May require kernel namespace support (`CONFIG_USER_NS=y`)

**If Sandbox Fails** (NOT RECOMMENDED):
```bash
# Launch with sandbox disabled (INSECURE)
QTWEBENGINE_DISABLE_SANDBOX=1 quickshell -p .
```

**Correct Approach**: Ensure system supports sandboxing:
```bash
# Check kernel support
zcat /proc/config.gz | grep CONFIG_USER_NS

# Verify setuid helper
ls -la /usr/lib/qt6/libexec/QtWebEngineProcess
# Should show: -rwsr-xr-x (setuid bit)
```

4. **Add Security Policies**

**Content Security Policy** (injected into loaded apps):
```qml
WebEngineView {
    onLoadingChanged: (loadRequest) => {
        if (loadRequest.status === WebEngineView.LoadSucceededStatus) {
            // Inject CSP
            runJavaScript(`
                const meta = document.createElement('meta');
                meta.httpEquiv = 'Content-Security-Policy';
                meta.content = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';";
                document.head.appendChild(meta);
            `);
        }
    }
}
```

**URL Filtering**:
```qml
onNavigationRequested: (request) => {
    // Only allow file:// and qrc:// in production
    // Allow localhost in dev mode
    const url = request.url.toString();
    
    if (devMode) {
        // Allow localhost dev servers
        if (url.startsWith('http://localhost') || 
            url.startsWith('http://127.0.0.1')) {
            request.action = WebEngineNavigationRequest.AcceptRequest;
            return;
        }
    }
    
    // Allow local resources
    if (url.startsWith('file://') || 
        url.startsWith('qrc://')) {
        request.action = WebEngineNavigationRequest.AcceptRequest;
        return;
    }
    
    // Block everything else
    console.warn("[WebShellView] Blocked navigation to:", url);
    request.action = WebEngineNavigationRequest.IgnoreRequest;
}
```

5. **Add DevTools Access**

```qml
WebEngineView {
    id: webview
    
    property int devToolsPort: 9222
    
    Component.onCompleted: {
        if (devMode) {
            // Enable remote debugging
            settings.devToolsEnabled = true;
            
            console.log("[WebShellView] DevTools available at: http://localhost:" + devToolsPort);
        }
    }
    
    function openInspector() {
        // This requires QtWebEngine 6.2+
        webview.triggerWebAction(WebEngineView.InspectElement);
    }
    
    Shortcut {
        sequence: "F12"
        onActivated: openInspector()
    }
}
```

6. **Test Loading**

Create test HTML:

**File**: `test.html`
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body {
            background: transparent;
            color: white;
            font-family: system-ui;
            padding: 40px;
        }
    </style>
</head>
<body>
    <h1>WebShell Test</h1>
    <p>If you see this, WebEngineView is working!</p>
    <button onclick="testBridge()">Test Bridge</button>
    
    <script>
        function testBridge() {
            console.log('Qt available:', typeof qt !== 'undefined');
            console.log('WebChannel transport:', qt?.webChannelTransport);
        }
    </script>
</body>
</html>
```

Test loading:
```qml
WebShellView {
    anchors.fill: parent
    url: "file://" + Qt.resolvedUrl("test.html")
    devMode: true
}
```

7. **Memory Optimization**

**Shared Profile Benefits**:
```qml
// With shared profile, total memory usage:
// - WebEngine runtime: ~80MB (once)
// - Per-app overhead: ~10-30MB (just DOM/JS)
// - 5 apps: ~230MB total

// With isolated profiles, total memory:
// - Per-app: ~80-150MB each
// - 5 apps: ~650MB total
```

**Memory Monitoring**:
```qml
Timer {
    interval: 60000 // Every minute
    running: devMode
    repeat: true
    
    onTriggered: {
        // Log memory usage (requires custom C++ code or /proc parsing)
        console.log("[WebShellView] Memory check");
    }
}
```

## Technical Notes

**Critical WebEngine Settings**:
```qml
WebEngineView {
    backgroundColor: "transparent"  // REQUIRED for blur
    
    settings.javascriptEnabled: true
    settings.localContentCanAccessRemoteUrls: false  // Security
    
    profile: WebEngineProfile {
        offTheRecord: false  // Persist cache
        persistentStoragePath: "..."
    }
}
```

**Transparent Background**:
- Required for compositor blur to show through
- Must set `backgroundColor: "transparent"`
- WebView renders into texture composited by Qt Scene Graph

**Process Model Trade-offs**:

| Aspect | Shared Profile | Isolated Profile |
|--------|----------------|------------------|
| Memory | Lower (~150MB total) | Higher (~150MB per app) |
| Security | Permission-based | Process-based |
| Crash isolation | Shared fate | Independent |
| Communication | Easier | Harder |
| Cold start | Faster | Slower |

**Sandbox Verification**:
```bash
# Test sandbox is working
quickshell -p . 2>&1 | grep -i sandbox

# If you see "Running without sandbox" → FIX IT
# Sandbox should be enabled in production
```

**DMS Reference**:
DMS doesn't use WebEngine, but study their widget patterns:
```bash
cd DankMaterialShell/quickshell
grep -r "Component {" Widgets/
# Study: property bindings, signals, lifecycle
```

## Reference Material

**Qt Documentation**:
- QtWebEngine QML Types: https://doc.qt.io/qt-6/qtwebengine-qmlmodule.html
- WebEngineView: https://doc.qt.io/qt-6/qml-qtwebengine-webengineview.html
- WebEngineProfile: https://doc.qt.io/qt-6/qml-qtwebengine-webengineprofile.html
- Security Considerations: https://doc.qt.io/qt-6/qtwebengine-platform-notes.html

**Chromium Sandbox**:
- Linux Sandboxing: https://chromium.googlesource.com/chromium/src/+/master/docs/linux/sandboxing.md

## Definition of Done

- WebShellView.qml loads HTML successfully
- Transparent background works
- DevTools accessible via F12
- Sandbox enabled and verified
- Shared profile architecture documented
- Security policies implemented
- Integrated into WebShell.qml
- Process model decision documented in ARCHITECTURE.md
- Git commit: "task-1.3: Implement WebEngineView wrapper with sandbox"

