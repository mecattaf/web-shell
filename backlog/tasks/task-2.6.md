---
id: task-2.6
title: Implement shell container primitives
status: Done
created_date: 2025-01-18
milestone: milestone-2
assignees: []
labels: [shell, layout, qml]
dependencies: [task-2.4, task-2.5]
---

## Description

Create standardized QML container components that define the structural layout of the shell. These containers handle blur, transparency, positioning, and provide mounting points for WebShell apps.

**This incorporates the "Shell Layout + Container Views" system into the Seed UI Kit.**

## Acceptance Criteria

- [x] Panel container with blur support
- [x] Overlay container with backdrop
- [x] Widget container with elevation
- [x] Dock/launcher container
- [x] Notification area container
- [x] All containers use WebShellTheme tokens
- [x] Blur regions properly configured
- [x] Z-order management working
- [x] Documentation of container hierarchy

## Implementation Plan

1. **Create Base Container**
```qml
// qs/modules/webshell/containers/WebShellContainer.qml
import QtQuick
import qs.modules.webshell

Rectangle {
    id: root
    
    property bool enableBlur: false
    property real blurRadius: 20
    property string containerType: "panel"
    
    color: "transparent"
    radius: WebShellTheme.radiusLg
    
    // Blur layer (compositor-handled)
    layer.enabled: enableBlur
    layer.effect: /* Blur configuration */
    
    // Background with theme color
    Rectangle {
        anchors.fill: parent
        color: WebShellTheme.colSurface
        opacity: 0.95
        radius: parent.radius
    }
}
```

2. **Panel Container**
```qml
// containers/PanelContainer.qml
WebShellContainer {
    id: panel
    containerType: "panel"
    enableBlur: true
    
    // Standard panel sizing
    height: 60
    anchors {
        left: parent.left
        right: parent.right
        top: parent.top
        margins: WebShellTheme.spaceM
    }
    
    // Content area for widgets/apps
    Row {
        id: contentArea
        anchors.fill: parent
        anchors.margins: WebShellTheme.spaceS
        spacing: WebShellTheme.spaceS
    }
}
```

3. **Overlay Container**
```qml
// containers/OverlayContainer.qml
WebShellContainer {
    id: overlay
    containerType: "overlay"
    enableBlur: true
    blurRadius: 30
    
    anchors.fill: parent
    z: 100
    
    // Backdrop
    Rectangle {
        anchors.fill: parent
        color: "#000000"
        opacity: 0.5
    }
    
    // Content area (centered)
    Item {
        id: contentArea
        anchors.centerIn: parent
        width: parent.width * 0.8
        height: parent.height * 0.8
    }
}
```

4. **Widget Container**
```qml
// containers/WidgetContainer.qml
WebShellContainer {
    id: widget
    containerType: "widget"
    enableBlur: true
    
    width: 400
    height: 600
    
    // Shadow/elevation
    layer.enabled: true
    layer.effect: DropShadow {
        radius: WebShellTheme.shadowRadius2
        // ... shadow config
    }
    
    // Mounting point
    Item {
        id: contentArea
        anchors.fill: parent
        anchors.margins: WebShellTheme.spaceM
    }
}
```

5. **Container Registry**
```qml
// WebShellContainerRegistry.qml
pragma Singleton
import QtQuick

QtObject {
    id: root
    
    property var panels: []
    property var overlays: []
    property var widgets: []
    
    function registerContainer(type, container) {
        switch(type) {
            case "panel":
                panels.push(container);
                break;
            case "overlay":
                overlays.push(container);
                break;
            case "widget":
                widgets.push(container);
                break;
        }
    }
    
    function getZOrder(type) {
        // Define z-ordering rules
        const zLayers = {
            "panel": 10,
            "widget": 20,
            "overlay": 100
        };
        return zLayers[type] || 0;
    }
}
```

6. **Focus Management**
```qml
// FocusManager.qml
QtObject {
    id: focusManager
    
    property var activeContainer: null
    
    function requestFocus(container) {
        if (activeContainer) {
            activeContainer.hasFocus = false;
        }
        activeContainer = container;
        container.hasFocus = true;
        container.forceActiveFocus();
    }
}
```

## Technical Notes

**Blur Configuration**:
```qml
layer.enabled: true
layer.effect: ShaderEffect {
    property variant source: ShaderEffectSource {
        sourceItem: /* wallpaper/background */
        sourceRect: /* container bounds */
    }
    fragmentShader: "blur.frag"
}
```

**Compositor Integration**:
- Ensure Wayland protocols support per-region blur
- Test with Hyprland, KWin, Sway
- Verify transparency + blur work together

**Container Hierarchy**:
```
Root Window
├── PanelContainer (z: 10)
│   ├── ClockWidget
│   ├── SystemTrayWidget
│   └── LauncherWidget
├── WidgetContainer (z: 20)
│   └── CalendarWebShellView
└── OverlayContainer (z: 100)
    └── SearchWebShellView
```

**CSS Equivalents** (for WebShell apps):
```css
.ws-panel {
  /* Matches QML PanelContainer */
  background: var(--color-surface);
  backdrop-filter: blur(20px);
}
```

## Reference Material

Study DMS layout:
```bash
cd DankMaterialShell/quickshell
grep -r "Rectangle {" Modules/*/
cat Modules/Panel/*.qml
```

Study blur implementation:
```bash
grep -r "layer.effect" quickshell/
```

## Definition of Done

- All container types implemented
- Blur working on supported compositors
- Z-order management functional
- Container registry operational
- Focus management working
- Documentation complete
- Git commit: "task-2.6: Implement shell container primitives"
