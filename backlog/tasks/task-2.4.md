---
id: task-2.4
title: Create QML theme mirror system
status: Done
created_date: 2025-01-18
milestone: milestone-2
assignees: []
labels: [qml, theme]
dependencies: [task-2.2]
---

## Description

Create a QML singleton that mirrors the design token values, ensuring QML widgets and WebShell apps use identical theme values. This enables synchronization when themes change.

## Acceptance Criteria

- [x] QML singleton created (WebShellTheme.qml)
- [x] All token values exposed as QML properties
- [x] Watches for token updates
- [x] Emits signals on theme changes
- [x] Compatible with existing DMS theme system
- [x] Documentation for QML usage

## Implementation Plan

1. **Create Theme Singleton**
```qml
// qs/modules/webshell/WebShellTheme.qml
pragma Singleton
import QtQuick

QtObject {
    id: root
    
    // Signal emitted when theme changes
    signal themeChanged()
    
    // Colors
    readonly property color colSurface: "#1a1a1a"
    readonly property color colPrimary: "#ef8354"
    // ... etc
    
    // Spacing
    readonly property int spaceXs: 4
    readonly property int spaceS: 8
    // ... etc
    
    // Typography
    readonly property string fontSans: "Inter"
    readonly property int fontSizeXs: 12
    // ... etc
    
    // Radii
    readonly property int radiusSm: 6
    readonly property int radiusMd: 12
    // ... etc
    
    // Function to update theme from JSON
    function updateFromTokens(tokensJson) {
        // Parse and update properties
        const tokens = JSON.parse(tokensJson);
        
        // Batch property updates
        // ...
        
        themeChanged();
    }
}
```

2. **Integrate with DMS Theme**
   - Read from Appearance.* if available
   - Fall back to token defaults
   - Support both systems during transition

3. **Create Update Mechanism**
   - Watch token file for changes
   - Reload on wallpaper change (matugen integration)
   - Propagate to all QML widgets and WebViews

4. **Add Theme Provider**
```qml
// Wrapper for WebShellView
Item {
    id: themedView
    
    Connections {
        target: WebShellTheme
        function onThemeChanged() {
            // Push new theme to WebView
            webView.runJavaScript(
                `window.updateTheme(${JSON.stringify(WebShellTheme)})`
            );
        }
    }
}
```

## Technical Notes

**Token to QML Mapping**:
```
JSON "color-surface" → QML "colSurface"
JSON "space-m" → QML "spaceM"
JSON "radius-lg" → QML "radiusLg"
```

**DMS Compatibility**:
```qml
// Support both systems
readonly property color colPrimary: Appearance.colors?.colPrimary ?? "#ef8354"
```

**Hot Reload Support**:
```qml
FileSystemWatcher {
    path: "/path/to/design-tokens.json"
    onFileChanged: {
        WebShellTheme.updateFromTokens(/* ... */);
    }
}
```

## Reference Material

Study DMS theme singleton:
```bash
cd DankMaterialShell/quickshell/Common
cat Theme.qml
cat Appearance.qml
```

## Definition of Done

- WebShellTheme.qml singleton created
- All token values mirrored
- Theme change propagation working
- DMS compatibility maintained
- Documentation written
- Git commit: "task-2.4: Create QML theme mirror system"
