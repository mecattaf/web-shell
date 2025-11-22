# WebShell QML Theme System

This document describes the WebShell theme system that mirrors design tokens from `src/style/design-tokens.json` into QML, enabling consistent theming across QML widgets and WebShell applications.

## Overview

The theme system consists of three main components:

1. **WebShellTheme** - Singleton that holds all theme values
2. **ThemeLoader** - Component that loads and watches for theme changes
3. **ThemedWebShellView** - WebView wrapper that propagates themes to web apps

## Quick Start

### Using WebShellTheme in QML

Import the singleton and use theme properties directly:

```qml
import QtQuick
import WebShell.Services

Rectangle {
    color: WebShellTheme.colSurface

    Text {
        text: "Hello WebShell"
        color: WebShellTheme.colText
        font.family: WebShellTheme.fontFamilyBase
        font.pixelSize: WebShellTheme.fontSizeM
    }
}
```

### Using ThemedWebShellView

Replace `WebShellView` with `ThemedWebShellView` to automatically inject theme into web apps:

```qml
import QtQuick
import Components

ThemedWebShellView {
    id: webView
    appName: "myapp"
    source: "qrc:/apps/myapp/index.html"

    // Theme is automatically injected on load
    // and updated when theme changes
}
```

### Accessing Theme in Web Apps

The theme is available in your web application via:

**JavaScript Object:**
```javascript
// Access theme values
const primaryColor = window.webShellTheme.colors.primary;
const spacing = window.webShellTheme.spacing.m;

// Listen for theme changes
window.addEventListener('webshellthemeupdate', (event) => {
    console.log('Theme updated:', event.detail);
    // Re-render or update styles
});
```

**CSS Variables:**
```css
.button {
    background-color: var(--color-primary);
    color: var(--color-on-primary);
    padding: var(--space-m);
    border-radius: var(--radius-m);
    font-family: var(--font-family-base);
    font-size: var(--font-size-m);
}

.card {
    background-color: var(--color-surface-high);
    border: var(--border-width-thin) solid var(--color-border);
    transition: all var(--animation-duration-normal) var(--animation-easing-standard);
}
```

## WebShellTheme API

### Color Properties

All colors from the design tokens are available as QML color properties:

```qml
// Surface colors
WebShellTheme.colSurface           // #1a1a1a
WebShellTheme.colSurfaceHigh       // #2d2d2d
WebShellTheme.colSurfaceHighest    // #383838
WebShellTheme.colSurfaceLow        // #1e1e1e

// Text colors
WebShellTheme.colText              // #e3e3e3
WebShellTheme.colTextSecondary     // #c7c7c7

// Primary colors
WebShellTheme.colPrimary           // #ef8354
WebShellTheme.colOnPrimary         // #2d1e1a
WebShellTheme.colPrimaryContainer
WebShellTheme.colOnPrimaryContainer

// Secondary, Tertiary, Error, Warning, Success, Info colors
// Follow the same pattern: col[Name], colOn[Name], col[Name]Container, colOn[Name]Container

// Borders
WebShellTheme.colBorder            // #8e8e8e
WebShellTheme.colBorderFocus       // #4a4a4a

// Background
WebShellTheme.colBackground        // #121212
WebShellTheme.colOnBackground      // #e3e3e3
```

### Spacing Properties

```qml
WebShellTheme.spaceXs    // 4
WebShellTheme.spaceS     // 8
WebShellTheme.spaceM     // 16
WebShellTheme.spaceL     // 24
WebShellTheme.spaceXl    // 32
WebShellTheme.spaceXxl   // 48
```

### Typography Properties

```qml
// Font families
WebShellTheme.fontFamilyBase       // "Inter, system-ui, ..."
WebShellTheme.fontFamilyMonospace  // "JetBrains Mono, ..."
WebShellTheme.fontFamilyHeading    // "Inter, system-ui, ..."

// Font sizes
WebShellTheme.fontSizeXs     // 12
WebShellTheme.fontSizeS      // 14
WebShellTheme.fontSizeM      // 16
WebShellTheme.fontSizeL      // 18
WebShellTheme.fontSizeXl     // 20
WebShellTheme.fontSizeXxl    // 24
WebShellTheme.fontSizeXxxl   // 32

// Font weights
WebShellTheme.fontWeightNormal    // 400
WebShellTheme.fontWeightMedium    // 500
WebShellTheme.fontWeightSemibold  // 600
WebShellTheme.fontWeightBold      // 700

// Line heights
WebShellTheme.lineHeightTight     // 1.2
WebShellTheme.lineHeightNormal    // 1.5
WebShellTheme.lineHeightRelaxed   // 1.75
```

### Border Properties

```qml
// Border radius
WebShellTheme.radiusNone   // 0
WebShellTheme.radiusS      // 4
WebShellTheme.radiusM      // 8
WebShellTheme.radiusL      // 12
WebShellTheme.radiusXl     // 16
WebShellTheme.radiusFull   // 9999

// Border width
WebShellTheme.borderWidthThin    // 1
WebShellTheme.borderWidthMedium  // 2
WebShellTheme.borderWidthThick   // 4
```

### Animation Properties

```qml
// Durations (in milliseconds)
WebShellTheme.animationDurationFast     // 150
WebShellTheme.animationDurationNormal   // 250
WebShellTheme.animationDurationSlow     // 400

// Easing curves
WebShellTheme.animationEasingStandard    // "cubic-bezier(0.4, 0.0, 0.2, 1)"
WebShellTheme.animationEasingDecelerate  // "cubic-bezier(0.0, 0.0, 0.2, 1)"
WebShellTheme.animationEasingAccelerate  // "cubic-bezier(0.4, 0.0, 1, 1)"
```

### Methods

**updateFromTokens(tokensJson: string)**

Update all theme properties from a design tokens JSON string:

```qml
const tokensJson = `{"colors": {"primary": {"value": "#ff0000"}}, ...}`;
WebShellTheme.updateFromTokens(tokensJson);
```

**toJSON(): object**

Get current theme as a JavaScript object:

```qml
const themeData = WebShellTheme.toJSON();
console.log(JSON.stringify(themeData));
```

### Signals

**themeChanged()**

Emitted when any theme property changes:

```qml
Connections {
    target: WebShellTheme

    function onThemeChanged() {
        console.log("Theme has been updated!");
        // React to theme change
    }
}
```

## ThemeLoader Component

The ThemeLoader handles loading design tokens and provides DMS compatibility.

### Basic Usage

```qml
import QtQuick
import Components

ThemeLoader {
    id: themeLoader

    // Optional: Path to design tokens file
    tokenFilePath: Qt.resolvedUrl("../../src/style/design-tokens.json")

    // Optional: Enable DMS compatibility
    useDmsCompatibility: true
    appearance: Appearance  // Reference to DMS Appearance object

    onThemeLoaded: {
        console.log("Theme loaded successfully")
    }

    onThemeFailed: (error) => {
        console.error("Failed to load theme:", error)
    }
}
```

### DMS Compatibility

When `useDmsCompatibility` is enabled and an `appearance` object is provided, ThemeLoader will:

1. Map DMS `Appearance.colors.*` to `WebShellTheme.col*`
2. Map DMS `Appearance.spacing.*` to `WebShellTheme.space*`
3. Map DMS `Appearance.font.*` to `WebShellTheme.font*`
4. Map DMS `Appearance.rounding.*` to `WebShellTheme.radius*`
5. Listen for DMS theme changes and update WebShellTheme accordingly

This ensures backward compatibility with existing DMS widgets while allowing WebShell apps to use the same theme.

## ThemedWebShellView Component

A wrapper around WebShellView that automatically injects and updates theme in web applications.

### Properties

- `autoInjectTheme: bool` - Automatically inject theme on page load (default: `true`)
- `liveThemeUpdates: bool` - Push theme updates to WebView in real-time (default: `true`)

### Methods

**injectTheme()**

Inject current theme as JavaScript object into `window.webShellTheme`:

```qml
webView.injectTheme()
```

**injectThemeCSS()**

Inject theme as CSS custom properties:

```qml
webView.injectThemeCSS()
```

**updateTheme()**

Update both JS object and CSS variables:

```qml
webView.updateTheme()
```

## Token Naming Convention

Design tokens are mapped from JSON to QML using the following convention:

| JSON                       | QML Property              |
|----------------------------|---------------------------|
| `colors.surface`           | `colSurface`              |
| `colors.primary`           | `colPrimary`              |
| `colors.on-primary`        | `colOnPrimary`            |
| `spacing.m`                | `spaceM`                  |
| `typography.fontSize.xl`   | `fontSizeXl`              |
| `border.radius.lg`         | `radiusLg`                |
| `animation.duration.fast`  | `animationDurationFast`   |

CSS variables use kebab-case with prefixes:

| Theme Property        | CSS Variable                |
|-----------------------|-----------------------------|
| `colPrimary`          | `--color-primary`           |
| `spaceM`              | `--space-m`                 |
| `fontSizeXl`          | `--font-size-xl`            |
| `radiusM`             | `--radius-m`                |

## Complete Example

### QML Shell with Theme

```qml
import QtQuick
import QtQuick.Controls
import Quickshell
import Components
import WebShell.Services

ShellRoot {
    id: root

    // Initialize theme loader
    ThemeLoader {
        id: themeLoader
        useDmsCompatibility: true
        appearance: Appearance
    }

    // Main window
    PanelWindow {
        anchors {
            left: true
            top: true
        }

        width: 400
        height: 600

        // Use theme colors
        color: WebShellTheme.colSurface

        Column {
            anchors.fill: parent
            spacing: WebShellTheme.spaceM
            padding: WebShellTheme.spaceL

            // Themed header
            Text {
                text: "WebShell App"
                color: WebShellTheme.colPrimary
                font.family: WebShellTheme.fontFamilyHeading
                font.pixelSize: WebShellTheme.fontSizeXxl
                font.weight: WebShellTheme.fontWeightBold
            }

            // Themed WebView
            ThemedWebShellView {
                id: webView
                width: parent.width - WebShellTheme.spaceL * 2
                height: parent.height - 100
                appName: "dashboard"
                source: "qrc:/apps/dashboard/index.html"

                // Theme is automatically injected and updated
            }
        }
    }
}
```

### Web App Using Theme

```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            margin: 0;
            padding: var(--space-l);
            background: var(--color-surface);
            color: var(--color-text);
            font-family: var(--font-family-base);
            font-size: var(--font-size-m);
        }

        .card {
            background: var(--color-surface-high);
            border-radius: var(--radius-l);
            padding: var(--space-l);
            margin-bottom: var(--space-m);
        }

        .button {
            background: var(--color-primary);
            color: var(--color-on-primary);
            border: none;
            border-radius: var(--radius-m);
            padding: var(--space-s) var(--space-m);
            font-weight: var(--font-weight-medium);
            cursor: pointer;
            transition: all var(--animation-duration-normal) var(--animation-easing-standard);
        }

        .button:hover {
            background: var(--color-primary-container);
        }
    </style>
</head>
<body>
    <div class="card">
        <h1>Welcome to WebShell</h1>
        <p>This app uses the WebShell theme system.</p>
        <button class="button" onclick="logTheme()">Log Theme</button>
    </div>

    <script>
        // Access theme in JavaScript
        function logTheme() {
            console.log('Current theme:', window.webShellTheme);
        }

        // Listen for theme changes
        window.addEventListener('webshellthemeupdate', (event) => {
            console.log('Theme updated!', event.detail);
            // You could update your app's appearance here
        });
    </script>
</body>
</html>
```

## Hot Reload Support

For development, you can enable file watching to automatically reload theme changes:

```qml
ThemeLoader {
    watchForChanges: true  // Enable in dev mode
}
```

Note: File watching currently requires C++ integration. This is a placeholder for future implementation.

## Integration with Matugen

When using Matugen for wallpaper-based theming:

1. Matugen updates the design tokens file
2. ThemeLoader detects the change (if watching is enabled)
3. WebShellTheme properties are updated
4. ThemedWebShellView propagates changes to all web apps
5. Web apps receive `webshellthemeupdate` event and can react accordingly

## Best Practices

1. **Use semantic color names**: Prefer `colPrimary` over hardcoded colors
2. **Use spacing tokens**: Use `spaceM`, `spaceL` instead of magic numbers
3. **Use typography tokens**: Apply `fontSizeM`, `fontWeightBold` for consistency
4. **Listen for theme changes**: Make your web apps reactive to theme updates
5. **Test with different themes**: Ensure your UI works with various color schemes
6. **Fallback gracefully**: If theme is not available, provide sensible defaults

## Troubleshooting

**Theme not updating in WebView:**
- Ensure `ThemedWebShellView` is used instead of `WebShellView`
- Check that `autoInjectTheme` and `liveThemeUpdates` are enabled
- Verify WebView is fully loaded before theme injection

**DMS compatibility not working:**
- Ensure `useDmsCompatibility: true` in ThemeLoader
- Verify `appearance` property points to valid DMS Appearance object
- Check console for warnings about missing Appearance properties

**CSS variables not available:**
- Theme CSS is injected after page load - ensure DOM is ready
- Check browser console for injection errors
- Verify ThemedWebShellView is being used

## Future Enhancements

- [ ] C++ file system watcher for real-time token updates
- [ ] Theme variant switching (light/dark mode)
- [ ] Theme preset system
- [ ] Visual theme editor
- [ ] Theme validation and linting
