---
id: task-1.7
title: Implement dev mode hot reload bridge
status: Completed
created_date: 2025-01-19
milestone: milestone-1
assignees: []
labels: [qml, webengine, dev-experience]
dependencies: [task-1.3, task-1.4]
---

## Description

Implement the development mode infrastructure that enables hot reload of web apps during development. This connects the QML WebEngineView to a Vite dev server and watches for file changes to trigger automatic reloads.

**Critical for DX**: Without this, developers must manually restart QuickShell on every change, making iteration extremely slow.

## Acceptance Criteria

- [ ] WebEngineView can connect to localhost dev server (Vite)
- [ ] File watching triggers reload in WebEngineView
- [ ] CORS configured correctly for localhost
- [ ] Dev mode flag switches between dev server and production bundle
- [ ] Hot reload preserves WebShell state when possible
- [ ] Error overlay for compilation failures
- [ ] Documentation for dev workflow

## Implementation Plan

1. **Create DevModeManager**
```qml
// qs/modules/webshell/DevModeManager.qml
pragma Singleton
import QtQuick
import Quickshell.Io

Singleton {
    id: root
    
    property bool enabled: false
    property string devServerUrl: "http://localhost:5173"
    
    signal reloadRequested(string appName)
    
    function startWatching(appName, appPath) {
        if (!enabled) return;
        
        const watcher = watcherComponent.createObject(root, {
            appName: appName,
            watchPath: appPath
        });
        
        watchers[appName] = watcher;
    }
    
    function stopWatching(appName) {
        const watcher = watchers[appName];
        if (watcher) {
            watcher.destroy();
            delete watchers[appName];
        }
    }
    
    property var watchers: ({})
    
    Component {
        id: watcherComponent
        
        QtObject {
            property string appName
            property string watchPath
            
            FileSystemWatcher {
                id: fsWatcher
                paths: [watchPath]
                
                onDirectoryChanged: (path) => {
                    console.log("[DevMode] Change detected:", appName);
                    // Debounce rapid changes
                    reloadTimer.restart();
                }
            }
            
            Timer {
                id: reloadTimer
                interval: 300 // 300ms debounce
                onTriggered: {
                    root.reloadRequested(appName);
                }
            }
        }
    }
}
```

2. **Update WebShellView for Dev Mode**
```qml
// In WebShellView.qml
Item {
    id: root
    
    property bool devMode: false
    property string devServerUrl: "http://localhost:5173"
    
    WebEngineView {
        id: webView
        
        url: root.devMode 
            ? root.devServerUrl
            : root.source
        
        // Allow localhost in dev mode
        settings.localContentCanAccessRemoteUrls: root.devMode
        settings.allowRunningInsecureContent: root.devMode
        
        // Dev server CORS
        profile: WebEngineProfile {
            httpUserAgent: webView.httpUserAgent + " WebShell-Dev"
            
            // Disable cache in dev mode
            httpCacheType: root.devMode 
                ? WebEngineProfile.NoCache
                : WebEngineProfile.DiskHttpCache
        }
        
        onLoadingChanged: (loadRequest) => {
            if (loadRequest.status === WebEngineView.LoadFailedStatus) {
                if (root.devMode) {
                    showDevError(loadRequest.errorString);
                }
            }
        }
    }
    
    // Dev mode error overlay
    Rectangle {
        id: errorOverlay
        visible: false
        anchors.fill: parent
        color: Qt.rgba(0.1, 0, 0, 0.95)
        z: 1000
        
        Column {
            anchors.centerIn: parent
            spacing: 20
            width: parent.width * 0.8
            
            Text {
                text: "⚠️ Dev Server Error"
                color: "#ff6b6b"
                font.pixelSize: 24
                font.weight: Font.Bold
            }
            
            Text {
                id: errorText
                color: "#ffffff"
                font.pixelSize: 14
                wrapMode: Text.Wrap
                width: parent.width
            }
            
            Button {
                text: "Retry"
                onClicked: webView.reload()
            }
        }
    }
    
    function showDevError(error) {
        errorText.text = error;
        errorOverlay.visible = true;
    }
    
    // Connect to dev mode manager
    Connections {
        target: DevModeManager
        enabled: root.devMode
        
        function onReloadRequested(appName) {
            if (appName === root.appName) {
                console.log("[WebShellView] Hot reloading:", appName);
                webView.reload();
            }
        }
    }
    
    Component.onCompleted: {
        if (devMode) {
            DevModeManager.startWatching(appName, manifestPath);
        }
    }
    
    Component.onDestruction: {
        if (devMode) {
            DevModeManager.stopWatching(appName);
        }
    }
}
```

3. **Update WebShellLoader for Dev Mode**
```qml
// In WebShellLoader.qml
function launchApp(appName) {
    const app = loadedApps[appName];
    if (!app) return null;
    
    // Check for dev server in manifest
    const devServer = app.manifest.devServer;
    const useDevMode = devMode && devServer;
    
    const view = webShellViewComponent.createObject(root, {
        appName: appName,
        source: getAppEntrypoint(app),
        devMode: useDevMode,
        devServerUrl: devServer || "http://localhost:5173",
        manifestPath: app.manifestPath,
        windowConfig: app.windowConfig,
        permissions: app.manifest.permissions
    });
    
    return view;
}
```

4. **Add Dev Server Check**
```qml
// DevServerChecker.qml
QtObject {
    id: root
    
    property string url: "http://localhost:5173"
    property bool available: false
    
    signal checked()
    
    function check() {
        // Simple HTTP HEAD request to check if server is running
        const xhr = new XMLHttpRequest();
        xhr.open("HEAD", url);
        xhr.timeout = 2000;
        
        xhr.onreadystatechange = function() {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                available = (xhr.status === 200);
                checked();
            }
        };
        
        xhr.ontimeout = function() {
            available = false;
            checked();
        };
        
        xhr.onerror = function() {
            available = false;
            checked();
        };
        
        xhr.send();
    }
    
    Timer {
        id: checkTimer
        interval: 5000
        repeat: true
        running: true
        onTriggered: root.check()
    }
    
    Component.onCompleted: check()
}
```

5. **Update Manifest Schema for Dev Server**
```json
{
  "devServer": "http://localhost:5173",
  "devMode": {
    "hotReload": true,
    "watchPaths": ["src/**/*"],
    "ignorePaths": ["node_modules/**"]
  }
}
```

6. **Create Dev Mode Documentation**

**File**: `docs/dev-mode.md`
```markdown
# Development Mode

## Setup

1. **Start your dev server**:
```bash
cd my-app
npm run dev  # Starts Vite on localhost:5173
```

2. **Configure manifest**:
```json
{
  "name": "my-app",
  "entrypoint": "index.html",
  "devServer": "http://localhost:5173"
}
```

3. **Launch QuickShell in dev mode**:
```bash
quickshell -p . --dev
```

## Hot Reload

Changes to your source files will automatically reload the app in QuickShell.

**What triggers reload:**
- Changes to any file in `src/`
- Changes to `index.html`
- Vite HMR updates

**What doesn't trigger reload:**
- Changes to `webshell.json` (requires full restart)
- Changes to QML files (requires QuickShell restart)

## Troubleshooting

### "Dev server not available"
- Ensure Vite is running on the correct port
- Check firewall/network settings
- Verify `devServer` URL in manifest

### Hot reload not working
- Check QuickShell console for file watcher errors
- Ensure app directory is writable
- Try manual reload: press F5 in the app
```

## Technical Notes

**Dev Server Detection**:
Before launching in dev mode, check if the dev server is actually running:
```qml
DevServerChecker {
    url: app.manifest.devServer
    onChecked: {
        if (!available) {
            console.warn("Dev server not available:", url);
            // Fall back to production bundle
        }
    }
}
```

**File Watching Patterns**:
Watch only source directories, not build output or node_modules:
```qml
FileSystemWatcher {
    paths: [
        appPath + "/src",
        appPath + "/public"
    ]
    // Ignore node_modules, .git, dist, etc.
}
```

**State Preservation**:
WebEngine reload destroys JS state. For state preservation:
- Use localStorage/sessionStorage
- Implement state serialization in app
- OR: Use Vite's HMR API for in-place updates

**CORS Configuration**:
Vite dev server needs CORS headers for QuickShell:
```typescript
// vite.config.ts
export default {
  server: {
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  }
}
```

## Reference Material

Study hot reload implementations:
- Electron's `loadURL()` with reload on change
- Tauri's dev server proxy
- VS Code webview dev mode

Study Vite HMR:
```bash
npm create vite@latest
# Study generated vite.config.ts
```

## Definition of Done

- Dev mode flag switches source correctly
- File watching triggers reload
- CORS configured for localhost
- Error overlay shows compilation failures
- Documentation complete
- Tested with Vite + React
- Git commit: "task-1.7: Implement dev mode hot reload bridge"

