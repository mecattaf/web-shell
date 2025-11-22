3.4
title: Create app loader component
status: To Do
created_date: 2025-01-19
milestone: milestone-3
assignees: []
labels: [qml, loader, architecture]
dependencies: [task-3.2, task-3.3]
---

## Description

Build a QML component that discovers, loads, and manages WebShell applications. This orchestrator brings together manifest parsing, permission management, and WebView instantiation.

**Key Architectural Note**: This task implements the **shared WebEngineProfile** model decided in task-1.3, where all apps share one Chromium process for memory efficiency.

## Acceptance Criteria

- [ ] WebShellLoader component created
- [ ] App discovery from filesystem
- [ ] Dynamic WebView creation using **shared profile**
- [ ] Permission registration
- [ ] Error handling for load failures
- [ ] Hot reload support for dev mode
- [ ] App lifecycle management
- [ ] **Process model verified and documented**

## Implementation Plan

1. **Create WebShellLoader Component**
```qml
// qs/modules/webshell/WebShellLoader.qml
import QtQuick
import QtWebEngine
import QtWebChannel
import qs.modules.webshell

Item {
    id: root
    
    property url appsDirectory: "file:///path/to/webshell/apps"
    property bool devMode: false
    
    property var loadedApps: ({})
    property var activeViews: ([])
    
    // Track total memory usage
    property int totalWebEngineMemory: 0
    
    signal appLoaded(string appName)
    signal appFailed(string appName, string error)
    
    Component.onCompleted: {
        discoverApps();
        
        // Log process model info
        console.log("[WebShellLoader] Using shared WebEngineProfile");
        console.log("[WebShellLoader] All apps share one Chromium process");
        console.log("[WebShellLoader] Expected memory: ~150MB total + 10-30MB per app");
    }
    
    function discoverApps() {
        console.log("[WebShellLoader] Discovering apps in:", appsDirectory);
        
        // Use Process to list directories
        const lsProcess = Quickshell.Process.exec([
            "find", appsDirectory.toString().replace("file://", ""),
            "-name", "webshell.json",
            "-type", "f"
        ]);
        
        lsProcess.finished.connect(() => {
            const output = lsProcess.readAllStandardOutput();
            const manifestPaths = output.split('\n').filter(p => p.length > 0);
            
            console.log(`[WebShellLoader] Found ${manifestPaths.length} apps`);
            
            manifestPaths.forEach(path => {
                loadApp(path);
            });
        });
    }
    
    function loadApp(manifestPath) {
        console.log("[WebShellLoader] Loading app:", manifestPath);
        
        const parser = manifestParserComponent.createObject(root, {
            manifestPath: "file://" + manifestPath
        });
        
        parser.manifestLoaded.connect(() => {
            registerApp(parser);
        });
        
        parser.manifestError.connect((error) => {
            console.error("[WebShellLoader] Failed to load:", manifestPath, error);
            appFailed(parser.appName || "unknown", error);
        });
        
        parser.load(parser.manifestPath);
    }
    
    function registerApp(parser) {
        const appName = parser.appName;
        
        // Register permissions
        PermissionManager.registerApp(appName, parser.permissions);
        
        // Store app metadata
        loadedApps[appName] = {
            name: appName,
            displayName: parser.displayName,
            manifest: parser.manifest,
            entrypoint: parser.entrypoint,
            windowConfig: parser.windowConfig,
            manifestPath: parser.manifestPath.toString()
        };
        
        console.log("[WebShellLoader] Registered app:", appName);
        appLoaded(appName);
    }
    
    function launchApp(appName) {
        const app = loadedApps[appName];
        if (!app) {
            console.error("[WebShellLoader] Unknown app:", appName);
            return null;
        }
        
        console.log("[WebShellLoader] Launching:", appName);
        
        // Create WebShellView instance
        // IMPORTANT: Uses WebShellProfile (shared)
        const view = webShellViewComponent.createObject(root, {
            appName: appName,
            source: getAppEntrypoint(app),
            windowConfig: app.windowConfig,
            permissions: app.manifest.permissions,
            // Shared profile set in WebShellView component
        });
        
        activeViews.push(view);
        
        // Track memory (estimated)
        estimateMemoryUsage();
        
        return view;
    }
    
    function estimateMemoryUsage() {
        // Rough estimates:
        // - First app: ~150MB (WebEngine runtime + DOM)
        // - Each additional app: ~20-30MB (DOM/JS only, shared runtime)
        const appCount = activeViews.length;
        const estimated = 150 + (appCount - 1) * 25; // MB
        
        totalWebEngineMemory = estimated;
        
        console.log(`[WebShellLoader] Estimated memory: ${estimated}MB for ${appCount} apps`);
        
        // Warn if getting high
        if (estimated > 500) {
            console.warn("[WebShellLoader] High memory usage:", estimated, "MB");
        }
    }
    
    function getAppEntrypoint(app) {
        const manifestDir = app.manifestPath.substring(0, app.manifestPath.lastIndexOf('/'));
        
        if (devMode && app.manifest.devServer) {
            // Use dev server URL
            return app.manifest.devServer;
        }
        
        // Use bundled entrypoint
        return `${manifestDir}/${app.entrypoint}`;
    }
    
    function closeApp(appName) {
        const index = activeViews.findIndex(v => v.appName === appName);
        if (index >= 0) {
            const view = activeViews[index];
            view.destroy();
            activeViews.splice(index, 1);
            
            estimateMemoryUsage();
            
            console.log("[WebShellLoader] Closed app:", appName);
        }
    }
    
    function reloadApp(appName) {
        closeApp(appName);
        launchApp(appName);
    }
    
    // Components
    Component {
        id: manifestParserComponent
        ManifestParser {}
    }
    
    Component {
        id: webShellViewComponent
        WebShellView {
            // Shared profile is set internally in WebShellView
            // (references WebShellProfile singleton)
        }
    }
}
```

2. **Verify Shared Profile Usage**

**In WebShellView.qml** (from task-1.3):
```qml
import QtQuick
import QtWebEngine

WebEngineView {
    id: webview
    
    // ✓ Uses shared profile (defined in task-1.3)
    profile: WebShellProfile
    
    // Log profile info on creation
    Component.onCompleted: {
        console.log("[WebShellView]", appName, "using shared profile:", profile.storageName);
    }
}
```

**Shared Profile Singleton** (created in task-1.3):
```qml
// qs/modules/webshell/WebShellProfile.qml
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
    
    // Shared cache for all apps
    httpCacheType: WebEngineProfile.DiskHttpCache
    httpCacheMaximumSize: 100 * 1024 * 1024 // 100MB shared
    
    Component.onCompleted: {
        console.log("[WebShellProfile] Shared profile initialized");
        console.log("[WebShellProfile] Storage:", persistentStoragePath);
    }
}
```

3. **Document Process Model**

**File**: `docs/ARCHITECTURE.md` (addition)
```markdown
# WebShell Architecture

## Process Model

WebShell uses a **shared WebEngineProfile** model where all apps run in a single Chromium process.

### Why Shared?

**Memory Efficiency**:
- First app: ~150MB (WebEngine runtime + DOM)
- Each additional app: +20-30MB (DOM/JS only)
- 5 apps: ~270MB total

vs Isolated Model:
- Each app: ~150MB
- 5 apps: ~750MB total

**Trade-offs**:

| Aspect | Shared Profile | Isolated Profile |
|--------|----------------|------------------|
| Memory | ✓ Lower | ✗ Higher |
| Security | Permission-based | Process isolation |
| Crash isolation | ✗ Shared fate | ✓ Independent |
| Startup | ✓ Faster | ✗ Slower |
| Communication | ✓ Easier | ✗ Harder |

**Security Model**:
- Apps are isolated via **manifest-based permissions**
- Go backend enforces capability model
- Sandboxing at Chromium level (all apps sandboxed together)
- Suitable for trusted shell apps

### Implementation

All WebShellView instances reference:
```qml
profile: WebShellProfile  // Singleton
```

This means:
- One Chromium process
- Shared cache (100MB)
- Shared cookie storage
- Shared local storage (isolated by origin)

### Future Considerations

If isolation becomes necessary:
1. Add `isolated: true` to manifest
2. Create separate WebEngineProfile for that app
3. Accept memory overhead for that specific app

For now: shared model is sufficient for shell use case.
```

4. **Add Memory Monitoring**

```qml
// In WebShellLoader
Timer {
    interval: 60000 // Check every minute
    running: devMode
    repeat: true
    
    onTriggered: {
        console.log("[WebShellLoader] Active apps:", activeViews.length);
        console.log("[WebShellLoader] Estimated memory:", totalWebEngineMemory, "MB");
        
        // Could query actual memory via /proc if needed
        // or via custom C++ code
    }
}
```

5. **Create WebShellView Component** (ensure it uses shared profile)

```qml
// WebShellView.qml
import QtQuick
import QtWebEngine
import QtWebChannel

Item {
    id: root
    
    property string appName: ""
    property url source
    property var windowConfig: ({})
    property var permissions: ({})
    
    width: windowConfig.width || 800
    height: windowConfig.height || 600
    
    // Container with blur
    WebShellContainer {
        id: container
        anchors.fill: parent
        containerType: windowConfig.type || "widget"
        enableBlur: windowConfig.blur || false
        
        WebEngineView {
            id: webView
            anchors.fill: parent
            url: root.source
            
            // ✓ CRITICAL: Use shared profile
            profile: WebShellProfile
            
            backgroundColor: "transparent"
            
            settings.javascriptEnabled: true
            settings.localContentCanAccessRemoteUrls: false
            
            webChannel: WebChannel {
                id: channel
                registeredObjects: ({
                    shell: shellApi
                })
            }
            
            onLoadingChanged: (loadRequest) => {
                if (loadRequest.status === WebEngineView.LoadSucceededStatus) {
                    console.log("[WebShellView] Loaded:", appName, "(shared profile)");
                } else if (loadRequest.status === WebEngineView.LoadFailedStatus) {
                    console.error("[WebShellView] Load failed:", appName, loadRequest.errorString);
                }
            }
        }
    }
    
    // API object for this app
    WebShellApi {
        id: shellApi
        appName: root.appName
    }
}
```

6. **Add Hot Reload Support**
```qml
// In WebShellLoader
FileSystemWatcher {
    id: appWatcher
    enabled: devMode
    
    paths: Object.keys(loadedApps).map(name => {
        return loadedApps[name].manifestPath.replace("webshell.json", "");
    })
    
    onDirectoryChanged: (path) => {
        console.log("[WebShellLoader] App changed:", path);
        
        // Find which app changed
        const changedApp = Object.keys(loadedApps).find(name => {
            return loadedApps[name].manifestPath.startsWith(path);
        });
        
        if (changedApp) {
            reloadApp(changedApp);
        }
    }
}
```

7. **Create App Registry**
```qml
// WebShellRegistry.qml
pragma Singleton
import QtQuick

Singleton {
    id: root
    
    property var apps: ({})
    property var views: ([])
    
    signal appRegistered(string appName)
    signal appLaunched(string appName)
    signal appClosed(string appName)
    
    function register(appName, metadata) {
        apps[appName] = metadata;
        appRegistered(appName);
    }
    
    function launch(appName) {
        const view = loader.launchApp(appName);
        if (view) {
            views.push(view);
            appLaunched(appName);
        }
        return view;
    }
    
    function close(appName) {
        loader.closeApp(appName);
        views = views.filter(v => v.appName !== appName);
        appClosed(appName);
    }
    
    function listApps() {
        return Object.keys(apps).map(name => apps[name]);
    }
}
```

## Technical Notes

**App Directory Structure**:
```
/home/user/.config/webshell/apps/
├── calendar/
│   ├── webshell.json
│   ├── index.html
│   ├── dist/
│   └── assets/
├── email/
│   ├── webshell.json
│   └── ...
└── crm/
    ├── webshell.json
    └── ...
```

**Shared Profile Benefits**:
- Apps share compiled JS engine (V8)
- Apps share GPU process
- Apps share network stack
- Faster subsequent app launches

**Shared Profile Risks**:
- One app crash can affect others
- Local storage shared by origin (but apps have unique origins via file:///)
- Must trust all shell apps

**Dev Mode Features**:
```qml
// Support dev server URLs
"devServer": "http://localhost:5173"

// Hot reload on file changes
FileSystemWatcher monitors app directories
```

**Error Recovery**:
```qml
function handleLoadError(appName, error) {
    console.error(`[WebShellLoader] ${appName} failed:`, error);
    
    // Show error notification
    NotificationService.send({
        title: "App Load Failed",
        message: `${appName}: ${error}`,
        urgency: "critical"
    });
    
    // Remove from active views
    closeApp(appName);
}
```

## Reference Material

Study DMS plugin loading:
```bash
cd DankMaterialShell/quickshell
cat Services/PluginService.qml
grep -r "Component.createObject" .
```

Study WebEngineProfile docs:
https://doc.qt.io/qt-6/qml-qtwebengine-webengineprofile.html

## Definition of Done

- WebShellLoader implemented
- App discovery working
- Dynamic loading functional using shared profile
- Hot reload working in dev mode
- Error handling robust
- Process model documented in ARCHITECTURE.md
- Memory monitoring functional
- Git commit: "task-3.4: Create app loader with shared WebEngine profile"
