---
id: task-3.6
title: Add multi-app orchestration
status: To Do
created_date: 2025-01-18
milestone: milestone-3
assignees: []
labels: [qml, orchestration]
dependencies: [task-3.4, task-3.5]
---

## Description

Implement the orchestration layer that manages multiple WebShell apps running simultaneously. This handles z-order, focus management, inter-app communication, and resource management.

## Acceptance Criteria

- [ ] Multiple apps can run concurrently
- [ ] Z-order management working
- [ ] Focus management implemented
- [ ] Inter-app messaging system
- [ ] Resource sharing and isolation
- [ ] App lifecycle events
- [ ] Documentation complete

## Implementation Plan

1. **Create App Orchestrator**
````qml
// qs/modules/webshell/AppOrchestrator.qml
pragma Singleton
import QtQuick

Singleton {
    id: root
    
    property var runningApps: ([])
    property string focusedApp: ""
    property int nextZOrder: 100
    
    signal appLaunched(string appName)
    signal appClosed(string appName)
    signal appFocused(string appName)
    
    function launchApp(appName) {
        // Check if already running
        const existing = runningApps.find(app => app.name === appName);
        if (existing) {
            focusApp(appName);
            return existing.view;
        }
        
        // Launch new instance
        const view = WebShellLoader.launchApp(appName);
        if (view) {
            const appInstance = {
                name: appName,
                view: view,
                zOrder: nextZOrder++,
                launchedAt: Date.now()
            };
            
            runningApps.push(appInstance);
            view.z = appInstance.zOrder;
            
            focusApp(appName);
            appLaunched(appName);
            
            return view;
        }
        
        return null;
    }
    
    function closeApp(appName) {
        const index = runningApps.findIndex(app => app.name === appName);
        if (index >= 0) {
            const app = runningApps[index];
            app.view.destroy();
            runningApps.splice(index, 1);
            
            // Focus next app
            if (runningApps.length > 0) {
                focusApp(runningApps[runningApps.length - 1].name);
            }
            
            appClosed(appName);
        }
    }
    
    function focusApp(appName) {
        const app = runningApps.find(a => a.name === appName);
        if (!app) return;
        
        // Bring to front
        app.zOrder = nextZOrder++;
        app.view.z = app.zOrder;
        
        // Set focus
        app.view.forceActiveFocus();
        focusedApp = appName;
        
        appFocused(appName);
    }
    
    function getRunningApps() {
        return runningApps.map(app => ({
            name: app.name,
            launchedAt: app.launchedAt,
            focused: app.name === focusedApp
        }));
    }
    
    function sendMessage(fromApp, toApp, message) {
        const targetApp = runningApps.find(app => app.name === toApp);
        if (!targetApp) {
            console.warn("[AppOrchestrator] Target app not running:", toApp);
            return false;
        }
        
        // Send message via WebChannel
        targetApp.view.webView.runJavaScript(`
            if (window.webshell && window.webshell.onMessage) {
                window.webshell.onMessage({
                    from: '${fromApp}',
                    data: ${JSON.stringify(message)}
                });
            }
        `);
        
        return true;
    }
}
````

2. **Implement Focus Management**
````qml
// FocusManager.qml
pragma Singleton
import QtQuick

Singleton {
    id: root
    
    property var focusStack: ([])
    
    signal focusChanged(string appName)
    
    function pushFocus(appName) {
        // Remove if already in stack
        const index = focusStack.indexOf(appName);
        if (index >= 0) {
            focusStack.splice(index, 1);
        }
        
        // Add to top
        focusStack.push(appName);
        focusChanged(appName);
    }
    
    function popFocus() {
        if (focusStack.length > 0) {
            const app = focusStack.pop();
            
            // Focus next in stack
            if (focusStack.length > 0) {
                const nextApp = focusStack[focusStack.length - 1];
                focusChanged(nextApp);
                return nextApp;
            }
        }
        return null;
    }
    
    function getCurrentFocus() {
        return focusStack.length > 0 
            ? focusStack[focusStack.length - 1]
            : null;
    }
}
````

3. **Add Inter-App Messaging**
````qml
// AppMessaging.qml
pragma Singleton
import QtQuick

Singleton {
    id: root
    
    property var messageHandlers: ({})
    
    function registerHandler(appName, handler) {
        messageHandlers[appName] = handler;
    }
    
    function sendMessage(fromApp, toApp, messageType, data) {
        console.log(`[AppMessaging] ${fromApp} -> ${toApp}: ${messageType}`);
        
        const handler = messageHandlers[toApp];
        if (!handler) {
            console.warn("[AppMessaging] No handler for:", toApp);
            return false;
        }
        
        try {
            handler({
                from: fromApp,
                type: messageType,
                data: data,
                timestamp: Date.now()
            });
            return true;
        } catch (e) {
            console.error("[AppMessaging] Handler error:", e);
            return false;
        }
    }
    
    function broadcast(fromApp, messageType, data) {
        Object.keys(messageHandlers).forEach(appName => {
            if (appName !== fromApp) {
                sendMessage(fromApp, appName, messageType, data);
            }
        });
    }
}
````

4. **Resource Management**
````qml
// ResourceManager.qml
pragma Singleton
import QtQuick

Singleton {
    id: root
    
    property var resourceUsage: ({})
    
    readonly property int maxMemoryPerApp: 500 * 1024 * 1024 // 500MB
    readonly property int maxTotalMemory: 2 * 1024 * 1024 * 1024 // 2GB
    
    function trackApp(appName, view) {
        resourceUsage[appName] = {
            view: view,
            memoryEstimate: 150 * 1024 * 1024, // Base estimate
            cpuTime: 0,
            networkRequests: 0
        };
        
        // Monitor memory (if possible)
        monitorMemory(appName, view);
    }
    
    function monitorMemory(appName, view) {
        // Execute JS to get memory info
        view.webView.runJavaScript(`
            if (performance.memory) {
                JSON.stringify({
                    used: performance.memory.usedJSHeapSize,
                    total: performance.memory.totalJSHeapSize
                });
            }
        `, (result) => {
            if (result) {
                const memory = JSON.parse(result);
                resourceUsage[appName].memoryEstimate = memory.used;
            }
        });
    }
    
    function getTotalMemoryUsage() {
        return Object.values(resourceUsage).reduce(
            (sum, usage) => sum + usage.memoryEstimate,
            0
        );
    }
    
    function isMemoryLimitExceeded() {
        return getTotalMemoryUsage() > maxTotalMemory;
    }
    
    function getResourceReport() {
        return Object.keys(resourceUsage).map(appName => ({
            app: appName,
            memory: resourceUsage[appName].memoryEstimate,
            cpu: resourceUsage[appName].cpuTime,
            network: resourceUsage[appName].networkRequests
        }));
    }
}
````

5. **Lifecycle Events**
````qml
// In WebShellApi.qml
QtObject {
    id: api
    
    // Lifecycle signals
    signal appResumed()
    signal appPaused()
    signal appWillClose()
    
    property bool isActive: false
    
    Connections {
        target: AppOrchestrator
        function onAppFocused(appName) {
            if (appName === api.appName) {
                isActive = true;
                appResumed();
            } else if (isActive) {
                isActive = false;
                appPaused();
            }
        }
        
        function onAppClosed(appName) {
            if (appName === api.appName) {
                appWillClose();
            }
        }
    }
}
````

6. **App Switcher UI**
````qml
// AppSwitcher.qml
Rectangle {
    id: switcher
    
    visible: false
    anchors.fill: parent
    color: Qt.rgba(0, 0, 0, 0.7)
    
    ListView {
        id: appList
        anchors.centerIn: parent
        width: parent.width * 0.6
        height: parent.height * 0.8
        
        model: AppOrchestrator.getRunningApps()
        spacing: 10
        
        delegate: Rectangle {
            width: appList.width
            height: 80
            radius: 10
            color: modelData.focused 
                ? Qt.rgba(1, 1, 1, 0.2)
                : Qt.rgba(1, 1, 1, 0.1)
            
            Row {
                anchors.fill: parent
                anchors.margins: 10
                spacing: 10
                
                Text {
                    text: modelData.name
                    color: "white"
                    font.pixelSize: 20
                }
            }
            
            MouseArea {
                anchors.fill: parent
                onClicked: {
                    AppOrchestrator.focusApp(modelData.name);
                    switcher.visible = false;
                }
            }
        }
    }
    
    // Close on Escape
    Keys.onEscapePressed: {
        visible = false;
    }
}

// Global shortcut: Alt+Tab
Shortcut {
    sequence: "Alt+Tab"
    onActivated: {
        appSwitcher.visible = !appSwitcher.visible;
    }
}
````

## Technical Notes

**Z-Order Management**:
````qml
// Panel layer: z = 10
// Widget layer: z = 20-1000
// Overlay layer: z = 1000+
// Dialog layer: z = 2000+

function getZLayer(windowType) {
    const layers = {
        "panel": 10,
        "widget": 100,
        "overlay": 1000,
        "dialog": 2000
    };
    return layers[windowType] || 100;
}
````

**Focus Stealing Prevention**:
````qml
function requestFocus(appName) {
    // Only allow focus change if:
    // 1. User explicitly requested it
    // 2. No dialog is open
    // 3. Not in middle of text input
    
    if (hasOpenDialog() || isTyping()) {
        console.warn("Focus change blocked");
        return false;
    }
    
    AppOrchestrator.focusApp(appName);
    return true;
}
````

**Inter-App Communication Example**:
````javascript
// In one app
window.webshell.sendMessage('email', 'open', {
    messageId: '12345'
});

// In email app
window.webshell.onMessage = (msg) => {
    if (msg.type === 'open') {
        openEmail(msg.data.messageId);
    }
};
````

## Reference Material

Study compositor integration:
````bash
cd quickshell-mirror/quickshell
grep -r "WindowManager" .
````

## Definition of Done

- Multi-app support working
- Z-order management functional
- Focus management implemented
- Inter-app messaging working
- Resource tracking active
- App switcher functional
- Git commit: "task-3.6: Add multi-app orchestration"
