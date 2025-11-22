# WebShell Container System

Standardized QML container components that define the structural layout of the WebShell. These containers handle blur, transparency, positioning, and provide mounting points for WebShell apps.

## Overview

The container system provides a modular, composable architecture for building shell layouts. Each container type serves a specific purpose and integrates with the WebShellTheme for consistent styling.

## Container Hierarchy

```
Root Window
├── PanelContainer (z: 10)
│   ├── ClockWidget
│   ├── SystemTrayWidget
│   └── LauncherWidget
├── DockContainer (z: 15)
│   └── App Icons
├── WidgetContainer (z: 20)
│   └── CalendarWebShellView
├── NotificationAreaContainer (z: 90)
│   └── Notification Stack
└── OverlayContainer (z: 100)
    └── SearchWebShellView
```

## Container Types

### ShellContainer (Base)

The base container that all other containers inherit from or use as a foundation.

**Features:**
- Blur support (compositor-level)
- Transparency with configurable opacity
- Shadow/elevation effects
- Theme integration via WebShellTheme
- Focus management
- Z-order management

**Properties:**
```qml
ShellContainer {
    enableBlur: false           // Enable background blur
    blurRadius: 20              // Blur intensity (0-100)
    containerType: "panel"      // Container type identifier
    hasFocus: false             // Focus state
    enableShadow: false         // Enable drop shadow
    shadowRadius: 8             // Shadow blur radius
    shadowColor: Qt.rgba(0, 0, 0, 0.3)  // Shadow color
    backgroundOpacity: 0.95     // Background opacity (0-1)
}
```

**Example:**
```qml
import WebShell.Containers
import WebShell.Services

ShellContainer {
    enableBlur: true
    containerType: "custom"
    width: 400
    height: 300

    // Your content here
    Text {
        anchors.centerIn: parent
        text: "Custom Container"
        color: WebShellTheme.colText
    }
}
```

### PanelContainer

Top/bottom/left/right panel for system widgets and status information.

**Features:**
- Blur enabled by default
- Horizontal or vertical layout (automatic based on position)
- Configurable positioning
- Auto-sizing

**Properties:**
```qml
PanelContainer {
    position: "top"             // "top", "bottom", "left", "right"
    panelSize: 60               // Height (horizontal) or width (vertical)
    panelMargin: 16             // Margin from screen edges
}
```

**Example:**
```qml
import WebShell.Containers
import WebShell.Services

PanelContainer {
    position: "top"
    panelSize: 60

    // Widgets are automatically laid out horizontally
    Rectangle {
        width: 200
        height: 40
        color: WebShellTheme.colPrimary
        radius: WebShellTheme.radiusM

        Text {
            anchors.centerIn: parent
            text: "Clock Widget"
            color: WebShellTheme.colOnPrimary
        }
    }
}
```

### OverlayContainer

Full-screen overlay for modal dialogs, search, launcher, etc.

**Features:**
- Full-screen with centered content
- Strong blur effect
- Dark backdrop
- Show/hide animations
- Keyboard handling (ESC to close)

**Properties:**
```qml
OverlayContainer {
    active: false               // Show/hide overlay
    contentWidthRatio: 0.8      // Content width as ratio of screen
    contentHeightRatio: 0.8     // Content height as ratio of screen
}
```

**Functions:**
- `show()` - Show the overlay
- `hide()` - Hide the overlay
- `toggle()` - Toggle visibility

**Example:**
```qml
import WebShell.Containers
import QtQuick

OverlayContainer {
    id: searchOverlay

    contentItem {
        // Your overlay content
        Column {
            anchors.fill: parent
            spacing: 16

            Text {
                text: "Search"
                font.pixelSize: 32
                color: WebShellTheme.colText
            }

            Rectangle {
                width: parent.width
                height: 50
                color: WebShellTheme.colSurfaceHigh
                radius: WebShellTheme.radiusM
            }
        }
    }

    // Toggle with keyboard shortcut
    Shortcut {
        sequence: "Meta+Space"
        onActivated: searchOverlay.toggle()
    }
}
```

### WidgetContainer

Floating widget container for standalone apps.

**Features:**
- Configurable size and position
- Elevation/shadow
- Draggable (optional)
- Minimize/maximize
- Auto z-order management

**Properties:**
```qml
WidgetContainer {
    draggable: false            // Enable drag to move
    minimized: false            // Minimized state
    defaultSize: Qt.size(400, 600)      // Default width, height
    defaultPosition: Qt.point(100, 100) // Default x, y
}
```

**Example:**
```qml
import WebShell.Containers
import WebShell.Services

WidgetContainer {
    draggable: true
    defaultSize: Qt.size(500, 700)
    defaultPosition: Qt.point(100, 100)

    // Your widget content
    Column {
        anchors.fill: parent
        spacing: WebShellTheme.spaceM

        Text {
            text: "Calendar Widget"
            font.pixelSize: WebShellTheme.fontSizeXl
            color: WebShellTheme.colText
        }

        // Calendar view...
    }
}
```

### DockContainer

Application launcher dock (macOS-style or taskbar).

**Features:**
- Icon layout (horizontal or vertical)
- Auto-hiding
- Configurable positioning
- Icon magnification support (implement in child items)

**Properties:**
```qml
DockContainer {
    position: "bottom"          // "bottom", "left", "right"
    dockSize: 70                // Height or width
    iconSize: 48                // Default icon size
    iconSpacing: 16             // Spacing between icons
    autoHide: false             // Auto-hide when not in use
    revealed: true              // Current visibility state
}
```

**Example:**
```qml
import WebShell.Containers
import WebShell.Services

DockContainer {
    position: "bottom"
    autoHide: true

    // App icons
    Repeater {
        model: ["Files", "Terminal", "Browser", "Settings"]

        Rectangle {
            width: dock.iconSize
            height: dock.iconSize
            color: WebShellTheme.colSurfaceHigh
            radius: WebShellTheme.radiusM

            Text {
                anchors.centerIn: parent
                text: modelData[0]
                color: WebShellTheme.colText
                font.pixelSize: WebShellTheme.fontSizeL
            }

            MouseArea {
                anchors.fill: parent
                onClicked: console.log("Launch:", modelData)
            }
        }
    }
}
```

### NotificationAreaContainer

Notification stack for system and app notifications.

**Features:**
- Vertical stack layout
- Auto-dismiss with timeout
- Slide-in animations
- Multiple notification types (info, success, warning, error)
- Configurable corner positioning

**Properties:**
```qml
NotificationAreaContainer {
    position: "top-right"       // Corner position
    maxNotifications: 5         // Max concurrent notifications
    notificationWidth: 350      // Width of notifications
    defaultTimeout: 5000        // Auto-dismiss timeout (ms)
}
```

**Functions:**
- `addNotification(title, message, type)` - Add a notification
- `removeNotification(index)` - Remove a specific notification
- `clearAll()` - Clear all notifications

**Example:**
```qml
import WebShell.Containers
import QtQuick

NotificationAreaContainer {
    id: notifications
    position: "top-right"

    Component.onCompleted: {
        // Test notification
        notifications.addNotification(
            "Welcome",
            "WebShell container system loaded",
            "success"
        )
    }
}

// Trigger from elsewhere
Button {
    onClicked: {
        notifications.addNotification(
            "Action Complete",
            "The operation finished successfully",
            "info"
        )
    }
}
```

## Registry & Focus Management

### WebShellContainerRegistry

Singleton that manages all container instances.

**Properties:**
- `panels: []` - Array of all panel containers
- `overlays: []` - Array of all overlay containers
- `widgets: []` - Array of all widget containers
- `docks: []` - Array of all dock containers
- `notifications: []` - Array of all notification containers

**Functions:**
- `registerContainer(type, container)` - Register a container
- `unregisterContainer(type, container)` - Unregister a container
- `getZOrder(type)` - Get base z-order for type
- `bringToFront(type, container)` - Bring container to front
- `getContainers(type)` - Get all containers of type
- `getAllContainers()` - Get all containers
- `clearType(type)` - Destroy all containers of type
- `getHierarchyInfo()` - Get debug hierarchy info

**Example:**
```qml
import WebShell.Containers

// Get all widgets
var widgets = WebShellContainerRegistry.getContainers("widget")
console.log("Widget count:", widgets.length)

// Bring a widget to front
WebShellContainerRegistry.bringToFront("widget", myWidget)

// Debug info
console.log(WebShellContainerRegistry.getHierarchyInfo())
```

### FocusManager

Singleton that manages focus between containers.

**Properties:**
- `activeContainer` - Currently focused container
- `focusHistory: []` - Array of previously focused containers

**Signals:**
- `focusChanged(container)` - Emitted when focus changes

**Functions:**
- `requestFocus(container)` - Give focus to a container
- `clearFocus()` - Clear focus from current container
- `focusPrevious()` - Focus previous in history
- `focusNextWidget()` - Focus next widget
- `focusPreviousWidget()` - Focus previous widget
- `hasFocus(container)` - Check if container has focus
- `getDebugInfo()` - Get debug info

**Example:**
```qml
import WebShell.Containers

// Request focus for a widget
MouseArea {
    onClicked: {
        FocusManager.requestFocus(myWidget)
    }
}

// Keyboard shortcuts for widget switching
Shortcut {
    sequence: "Alt+Tab"
    onActivated: FocusManager.focusNextWidget()
}

Shortcut {
    sequence: "Alt+Shift+Tab"
    onActivated: FocusManager.focusPreviousWidget()
}

// Listen for focus changes
Connections {
    target: FocusManager
    function onFocusChanged(container) {
        console.log("Focus changed to:", container.containerType)
    }
}
```

## Z-Order Layers

The container system defines standard z-order layers:

| Layer | Z-Order | Container Type |
|-------|---------|----------------|
| Panels | 10+ | PanelContainer |
| Dock | 15+ | DockContainer |
| Widgets | 20+ | WidgetContainer |
| Notifications | 90+ | NotificationAreaContainer |
| Overlays | 100+ | OverlayContainer |

Containers within the same layer are stacked in order of creation, with newer containers appearing on top.

## Blur Implementation

### Qt MultiEffect (Current)

The current implementation uses Qt's `MultiEffect` for blur, which works well in desktop environments:

```qml
layer.enabled: enableBlur
layer.effect: MultiEffect {
    blurEnabled: root.enableBlur
    blur: 1.0
    blurMax: Math.round(root.blurRadius)
    blurMultiplier: 0.5
}
```

### Wayland Compositor Blur (Future)

For production Wayland environments, compositor-specific blur protocols should be used:

```qml
// Hyprland blur
layer.enabled: true
layer.effect: ShaderEffect {
    property variant source: ShaderEffectSource {
        sourceItem: wallpaper
        sourceRect: Qt.rect(root.x, root.y, root.width, root.height)
    }
    fragmentShader: "qrc:/blur.frag"
}
```

## CSS Equivalents for WebShell Apps

WebShell apps (HTML/CSS) can use equivalent styles:

```css
/* Panel-like appearance */
.ws-panel {
    background: var(--color-surface);
    backdrop-filter: blur(20px);
    border-radius: var(--radius-lg);
    padding: var(--space-s);
}

/* Widget-like appearance */
.ws-widget {
    background: var(--color-surface);
    backdrop-filter: blur(20px);
    border-radius: var(--radius-lg);
    box-shadow: var(--elevation-medium);
    padding: var(--space-m);
}

/* Overlay-like appearance */
.ws-overlay {
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(30px);
}
```

## Complete Example

```qml
import QtQuick
import WebShell.Containers
import WebShell.Services

Item {
    id: root
    anchors.fill: parent

    // Top panel
    PanelContainer {
        position: "top"

        // System tray, clock, etc.
    }

    // Bottom dock
    DockContainer {
        position: "bottom"
        autoHide: true

        // App icons
    }

    // Floating widget
    WidgetContainer {
        id: calendarWidget
        draggable: true
        defaultPosition: Qt.point(100, 100)
        defaultSize: Qt.size(400, 500)

        // Calendar content
    }

    // Notification area
    NotificationAreaContainer {
        id: notifications
        position: "top-right"
    }

    // Search overlay
    OverlayContainer {
        id: searchOverlay

        contentItem {
            // Search UI
        }
    }

    // Global shortcuts
    Shortcut {
        sequence: "Meta+Space"
        onActivated: searchOverlay.toggle()
    }

    Shortcut {
        sequence: "Alt+Tab"
        onActivated: FocusManager.focusNextWidget()
    }
}
```

## Compositor Integration

### Supported Compositors

The container system is designed to work with modern Wayland compositors:

- **Hyprland**: Full blur and transparency support
- **KWin**: Full blur and transparency support
- **Sway**: Basic transparency (blur via layer-shell)
- **Wayfire**: Full blur and transparency support

### Testing Blur

To test blur functionality:

1. Ensure compositor supports blur
2. Enable blur in compositor config
3. Set `enableBlur: true` on containers
4. Adjust `blurRadius` for desired effect

### Performance Considerations

- Blur is GPU-intensive; use sparingly
- Lower `blurRadius` values perform better
- Consider disabling blur on lower-end hardware
- Use compositor-specific optimizations when available

## Best Practices

1. **Use appropriate container types**: Don't use WidgetContainer for panels, etc.
2. **Respect z-order layers**: Keep containers in their designated layers
3. **Theme consistency**: Always use WebShellTheme for styling
4. **Focus management**: Use FocusManager for keyboard navigation
5. **Performance**: Minimize blur usage, especially on overlapping containers
6. **Accessibility**: Ensure sufficient contrast with blur/transparency
7. **Registration**: Let containers self-register (done automatically)

## Future Enhancements

- [ ] Per-container background wallpaper sampling
- [ ] Advanced blur algorithms (kawase, dual-kawase)
- [ ] Material design elevation system
- [ ] Container animations (slide, fade, scale)
- [ ] Gesture support (swipe to dismiss, etc.)
- [ ] Multi-monitor support
- [ ] Container templates/presets
- [ ] Theme-aware blur intensity

## Reference Material

- [Qt MultiEffect Documentation](https://doc.qt.io/qt-6/qml-qtquick-effects-multieffect.html)
- [Wayland Protocols](https://wayland.app/protocols/)
- [Hyprland Blur](https://wiki.hyprland.org/Configuring/Variables/#blur)
- [Material Design Elevation](https://m3.material.io/styles/elevation/overview)
