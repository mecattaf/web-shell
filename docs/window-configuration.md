# Window Configuration

The window configuration system in WebShell allows you to control the size, position, appearance, and behavior of app windows through manifest-defined properties.

## Overview

Window configuration is managed through three main components:

1. **WindowConfig** - Manages window properties (size, position, appearance)
2. **WindowTypeBehavior** - Defines type-specific behaviors (floating, z-index, modal)
3. **WindowAnimations** - Provides smooth transitions and animations

## Window Types

WebShell supports four window types, each with specific defaults:

### Widget
Floating, resizable windows for apps
```json
{
  "window": {
    "type": "widget",
    "width": 800,
    "height": 600,
    "position": "center",
    "resizable": true,
    "movable": true,
    "blur": true,
    "transparency": true
  }
}
```

### Panel
Fixed panels typically used for toolbars or docks
```json
{
  "window": {
    "type": "panel",
    "width": -1,
    "height": 60,
    "position": "top-center",
    "resizable": false,
    "movable": false,
    "blur": true
  }
}
```

### Overlay
Fullscreen overlays with high z-index
```json
{
  "window": {
    "type": "overlay",
    "width": -1,
    "height": -1,
    "position": "center",
    "blur": true,
    "transparency": true
  }
}
```

### Dialog
Modal dialogs for user interactions
```json
{
  "window": {
    "type": "dialog",
    "width": 400,
    "height": 300,
    "position": "center",
    "resizable": false,
    "movable": true,
    "blur": true
  }
}
```

## Configuration Properties

### Dimensions

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `width` | int | 800 | Window width in pixels (-1 for full width) |
| `height` | int | 600 | Window height in pixels (-1 for full height) |
| `minWidth` | int | 400 | Minimum window width |
| `minHeight` | int | 300 | Minimum window height |
| `maxWidth` | int | -1 | Maximum width (-1 = unlimited) |
| `maxHeight` | int | -1 | Maximum height (-1 = unlimited) |

### Position

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `position` | string | "center" | Position preset (see below) |
| `x` | int | -1 | X coordinate (-1 = use position string) |
| `y` | int | -1 | Y coordinate (-1 = use position string) |

**Position presets:**
- `center` - Center of screen
- `top-left`, `top-center`, `top-right`
- `left-center`, `right-center`
- `bottom-left`, `bottom-center`, `bottom-right`

### Margins

```json
{
  "window": {
    "margins": {
      "top": 0,
      "right": 0,
      "bottom": 0,
      "left": 0
    }
  }
}
```

### Behavior

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `resizable` | boolean | true | Allow window resizing |
| `movable` | boolean | true | Allow window dragging |

### Appearance

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `blur` | boolean | true | Enable background blur |
| `blurRadius` | number | 20 | Blur intensity (0-100) |
| `transparency` | boolean | true | Enable transparency |
| `opacity` | number | 1.0 | Window opacity (0.0-1.0) |

## Usage in QML

### Basic Usage

```qml
WebShellView {
    windowConfig: {
        return {
            type: "widget",
            width: 600,
            height: 400,
            position: "center",
            resizable: true,
            blur: true
        };
    }
}
```

### With WebShellContainer

```qml
WebShellContainer {
    containerType: "widget"
    enableBlur: true
    blurRadius: 20
    windowConfig: {
        return {
            type: "widget",
            width: 800,
            height: 600,
            minWidth: 400,
            minHeight: 300,
            position: "center"
        };
    }
}
```

## Window Behaviors

Different window types have different default behaviors:

| Behavior | Widget | Panel | Overlay | Dialog |
|----------|--------|-------|---------|--------|
| Floating | ✓ | ✗ | ✓ | ✓ |
| Always on Top | ✗ | ✓ | ✓ | ✓ |
| Show in Taskbar | ✗ | ✗ | ✗ | ✗ |
| Close on Focus Loss | ✗ | ✗ | ✓ | ✗ |
| Modal | ✗ | ✗ | ✗ | ✓ |
| Fullscreen | ✗ | ✗ | ✓ | ✗ |
| Z-Index | 100 | 800 | 1000 | 900 |

## Animations

Windows automatically animate when appearing based on their type:

- **Widget**: Scale in
- **Panel**: Slide in from top
- **Overlay**: Fade in
- **Dialog**: Scale in

### Custom Animations

```qml
WindowAnimations {
    id: animations
    target: myWindow
    enabled: true
}

// Trigger animations
animations.slideIn("left")
animations.fadeIn()
animations.scaleIn()
animations.slideInWithFade("bottom")
```

## Size Constraints

Windows automatically enforce size constraints:

```qml
// In WindowConfig
function constrainSize(requestedWidth, requestedHeight) {
    let w = Math.max(requestedWidth, minWidth);
    let h = Math.max(requestedHeight, minHeight);

    if (maxWidth > 0) w = Math.min(w, maxWidth);
    if (maxHeight > 0) h = Math.min(h, maxHeight);

    return { width: w, height: h };
}
```

## Edge Snapping

Windows can snap to screen edges when dragged near them:

```qml
function snapToEdge(x, y, threshold = 20) {
    const screen = getScreenGeometry();

    if (x < threshold) return { x: 0, y: y };
    if (x > screen.width - width - threshold) {
        return { x: screen.width - width, y: y };
    }

    return { x: x, y: y };
}
```

## Resize Handles

Resizable windows show a handle in the bottom-right corner:

```qml
MouseArea {
    visible: config.resizable
    anchors.right: parent.right
    anchors.bottom: parent.bottom
    width: 16
    height: 16
    cursorShape: Qt.SizeFDiagCursor

    // Resize logic with constraints
}
```

## Move Handles

Movable windows can be dragged from anywhere:

```qml
MouseArea {
    enabled: config.movable
    anchors.fill: parent

    onPositionChanged: (mouse) => {
        if (pressed && config.movable) {
            root.x = startWindowPos.x + delta.x;
            root.y = startWindowPos.y + delta.y;
        }
    }
}
```

## Example Manifest

Complete window configuration in a WebShell manifest:

```json
{
  "name": "My App",
  "version": "1.0.0",
  "window": {
    "type": "widget",
    "width": 1024,
    "height": 768,
    "minWidth": 640,
    "minHeight": 480,
    "maxWidth": 1920,
    "maxHeight": 1080,
    "position": "center",
    "resizable": true,
    "movable": true,
    "blur": true,
    "blurRadius": 20,
    "transparency": true,
    "opacity": 0.95,
    "margins": {
      "top": 0,
      "right": 0,
      "bottom": 0,
      "left": 0
    }
  }
}
```

## Testing

Run the window configuration test:

```bash
quickshell -p quickshell/Tests/WindowConfigTest.qml
```

This demonstrates all window types with interactive controls.

## Best Practices

1. **Choose the right window type** - Use widget for apps, panel for toolbars, overlay for fullscreen UI, dialog for modals
2. **Set appropriate constraints** - Define minWidth/minHeight to prevent windows from becoming too small
3. **Use blur sparingly** - Blur is expensive; consider disabling on low-end systems
4. **Test on multiple screen sizes** - Ensure position and size work on different resolutions
5. **Provide sensible defaults** - Don't make users configure everything

## Performance Considerations

- **Blur effects** are GPU-intensive; consider providing a "reduced motion" setting
- **Transparency** requires compositor support; provide fallbacks
- **Animations** can be disabled via `WindowAnimations.enabled = false`
- **Large windows** with blur may impact performance on older hardware

## Multi-Monitor Support

Windows can detect and position themselves on specific monitors:

```qml
function getScreenGeometry() {
    // Get screen where cursor is
    return Qt.application.screens[0].geometry;
}
```

Future enhancements will support:
- Target specific monitor by index
- Remember window positions per-monitor
- Snap between monitors
