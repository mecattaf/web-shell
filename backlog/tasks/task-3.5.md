---
id: task-3.5
title: Implement window configuration
status: Done
created_date: 2025-01-18
completed_date: 2025-01-19
milestone: milestone-3
assignees: []
labels: [qml, window-management]
dependencies: [task-3.4]
---

## Description

Implement the window configuration system that applies manifest-defined window properties to WebShell views. This controls size, position, blur, transparency, and behavior of app windows.

## Acceptance Criteria

- [x] WindowConfig component created
- [x] All window properties supported
- [x] Blur/transparency working
- [x] Positioning logic implemented
- [x] Resize constraints enforced
- [x] Integration with containers
- [x] Documentation complete

## Implementation Plan

1. **Create WindowConfig Component**
````qml
// qs/modules/webshell/WindowConfig.qml
import QtQuick

QtObject {
    id: root
    
    // Window type
    property string type: "widget" // widget, panel, overlay, dialog
    
    // Dimensions
    property int width: 800
    property int height: 600
    property int minWidth: 400
    property int minHeight: 300
    property int maxWidth: -1 // -1 = unlimited
    property int maxHeight: -1
    
    // Behavior
    property bool resizable: true
    property bool movable: true
    
    // Appearance
    property bool blur: true
    property real blurRadius: 20
    property bool transparency: true
    property real opacity: 1.0
    
    // Position
    property string position: "center" // center, top-left, top-right, etc.
    property int x: -1 // -1 = use position string
    property int y: -1
    
    // Margins (from screen edges)
    property int marginTop: 0
    property int marginRight: 0
    property int marginBottom: 0
    property int marginLeft: 0
    
    // Load from manifest
    function fromManifest(manifestWindowConfig) {
        if (!manifestWindowConfig) return;
        
        type = manifestWindowConfig.type || type;
        width = manifestWindowConfig.width || width;
        height = manifestWindowConfig.height || height;
        minWidth = manifestWindowConfig.minWidth || minWidth;
        minHeight = manifestWindowConfig.minHeight || minHeight;
        maxWidth = manifestWindowConfig.maxWidth || maxWidth;
        maxHeight = manifestWindowConfig.maxHeight || maxHeight;
        resizable = manifestWindowConfig.resizable ?? resizable;
        blur = manifestWindowConfig.blur ?? blur;
        transparency = manifestWindowConfig.transparency ?? transparency;
        position = manifestWindowConfig.position || position;
        
        if (manifestWindowConfig.margins) {
            const m = manifestWindowConfig.margins;
            marginTop = m.top || 0;
            marginRight = m.right || 0;
            marginBottom = m.bottom || 0;
            marginLeft = m.left || 0;
        }
    }
    
    // Calculate actual position from string
    function calculatePosition(containerWidth, containerHeight, parentWidth, parentHeight) {
        let posX = x;
        let posY = y;
        
        if (posX === -1 || posY === -1) {
            // Use position string
            switch (position) {
                case "center":
                    posX = (parentWidth - containerWidth) / 2;
                    posY = (parentHeight - containerHeight) / 2;
                    break;
                case "top-left":
                    posX = marginLeft;
                    posY = marginTop;
                    break;
                case "top-right":
                    posX = parentWidth - containerWidth - marginRight;
                    posY = marginTop;
                    break;
                case "bottom-left":
                    posX = marginLeft;
                    posY = parentHeight - containerHeight - marginBottom;
                    break;
                case "bottom-right":
                    posX = parentWidth - containerWidth - marginRight;
                    posY = parentHeight - containerHeight - marginBottom;
                    break;
                case "top-center":
                    posX = (parentWidth - containerWidth) / 2;
                    posY = marginTop;
                    break;
                case "bottom-center":
                    posX = (parentWidth - containerWidth) / 2;
                    posY = parentHeight - containerHeight - marginBottom;
                    break;
            }
        }
        
        return { x: posX, y: posY };
    }
    
    // Enforce size constraints
    function constrainSize(requestedWidth, requestedHeight) {
        let w = requestedWidth;
        let h = requestedHeight;
        
        // Minimum
        w = Math.max(w, minWidth);
        h = Math.max(h, minHeight);
        
        // Maximum
        if (maxWidth > 0) w = Math.min(w, maxWidth);
        if (maxHeight > 0) h = Math.min(h, maxHeight);
        
        return { width: w, height: h };
    }
}
````

2. **Update WebShellView to Use WindowConfig**
````qml
// Updated WebShellView.qml
Item {
    id: root
    
    property string appName: ""
    property url source
    property var windowConfig: ({})
    
    // Parse window config
    WindowConfig {
        id: config
        Component.onCompleted: {
            fromManifest(root.windowConfig);
        }
    }
    
    // Apply dimensions
    width: config.width
    height: config.height
    
    // Calculate position
    property var calculatedPosition: config.calculatePosition(
        width, height,
        parent.width, parent.height
    )
    
    x: calculatedPosition.x
    y: calculatedPosition.y
    
    // Container with config-driven properties
    WebShellContainer {
        id: container
        anchors.fill: parent
        containerType: config.type
        enableBlur: config.blur
        blurRadius: config.blurRadius
        opacity: config.opacity
        
        // Resize handle (if resizable)
        MouseArea {
            visible: config.resizable
            anchors.right: parent.right
            anchors.bottom: parent.bottom
            width: 16
            height: 16
            cursorShape: Qt.SizeFDiagCursor
            
            property point startPos
            property size startSize
            
            onPressed: (mouse) => {
                startPos = Qt.point(mouse.x, mouse.y);
                startSize = Qt.size(root.width, root.height);
            }
            
            onPositionChanged: (mouse) => {
                if (pressed) {
                    const delta = Qt.point(
                        mouse.x - startPos.x,
                        mouse.y - startPos.y
                    );
                    
                    const newSize = config.constrainSize(
                        startSize.width + delta.x,
                        startSize.height + delta.y
                    );
                    
                    root.width = newSize.width;
                    root.height = newSize.height;
                }
            }
        }
        
        WebEngineView {
            id: webView
            anchors.fill: parent
            // ... rest of WebEngineView config
        }
    }
}
````

3. **Add Window Type Behaviors**
````qml
// WindowTypeBehavior.qml
QtObject {
    id: root
    
    property string type: "widget"
    
    readonly property var behaviors: ({
        "widget": {
            floating: true,
            alwaysOnTop: false,
            showInTaskbar: false,
            closeOnFocusLoss: false
        },
        "panel": {
            floating: false,
            alwaysOnTop: true,
            showInTaskbar: false,
            closeOnFocusLoss: false
        },
        "overlay": {
            floating: true,
            alwaysOnTop: true,
            showInTaskbar: false,
            closeOnFocusLoss: true,
            fullscreen: true
        },
        "dialog": {
            floating: true,
            alwaysOnTop: true,
            showInTaskbar: false,
            closeOnFocusLoss: false,
            modal: true
        }
    })
    
    function getBehavior(property) {
        return behaviors[type]?.[property] ?? false;
    }
}
````

4. **Add Animation Support**
````qml
// WindowAnimations.qml
Item {
    id: root
    
    property Item target
    
    // Slide in from position
    function slideIn(from) {
        const startX = target.x;
        const startY = target.y;
        
        switch (from) {
            case "top":
                target.y = -target.height;
                break;
            case "bottom":
                target.y = parent.height;
                break;
            case "left":
                target.x = -target.width;
                break;
            case "right":
                target.x = parent.width;
                break;
        }
        
        // Animate to original position
        slideAnimation.to = Qt.point(startX, startY);
        slideAnimation.start();
    }
    
    PropertyAnimation {
        id: slideAnimation
        target: root.target
        properties: "x,y"
        duration: 250
        easing.type: Easing.OutCubic
    }
    
    // Fade in
    function fadeIn() {
        target.opacity = 0;
        fadeAnimation.start();
    }
    
    NumberAnimation {
        id: fadeAnimation
        target: root.target
        property: "opacity"
        from: 0
        to: 1
        duration: 200
        easing.type: Easing.OutQuad
    }
    
    // Scale in
    function scaleIn() {
        target.scale = 0.9;
        target.opacity = 0;
        scaleAnimation.start();
    }
    
    ParallelAnimation {
        id: scaleAnimation
        NumberAnimation {
            target: root.target
            property: "scale"
            from: 0.9
            to: 1.0
            duration: 200
            easing.type: Easing.OutBack
        }
        NumberAnimation {
            target: root.target
            property: "opacity"
            from: 0
            to: 1
            duration: 200
        }
    }
}
````

## Technical Notes

**Type-specific Defaults**:
````qml
const typeDefaults = {
    widget: {
        width: 800,
        height: 600,
        blur: true,
        transparency: true
    },
    panel: {
        width: -1, // full width
        height: 60,
        blur: true,
        position: "top-center"
    },
    overlay: {
        width: -1, // full width
        height: -1, // full height
        blur: true,
        transparency: true,
        position: "center"
    },
    dialog: {
        width: 400,
        height: 300,
        blur: true,
        position: "center"
    }
};
````

**Multi-monitor Support**:
````qml
function getScreenGeometry() {
    // Get screen where cursor is
    return Qt.application.screens[0].geometry;
}
````

**Window Snapping**:
````qml
function snapToEdge(x, y, threshold = 20) {
    const screen = getScreenGeometry();
    
    if (x < threshold) return { x: 0, y: y };
    if (x > screen.width - width - threshold) {
        return { x: screen.width - width, y: y };
    }
    
    return { x: x, y: y };
}
````

## Reference Material

Study QuickShell window management:
````bash
cd quickshell-mirror/quickshell
grep -r "FloatingWindow" .
grep -r "PanelWindow" .
````

## Definition of Done

- WindowConfig component working
- All properties supported
- Positioning logic correct
- Resize constraints enforced
- Animations working
- Git commit: "task-3.5: Implement window configuration"
