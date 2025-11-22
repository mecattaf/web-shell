# Wallpaper-Based Theme Generation

## Overview

WebShell automatically generates Material You (Material Design 3) color themes from your wallpaper using Matugen. This creates a dynamic, personalized theme that adapts to your desktop aesthetic.

**Pipeline**: `Wallpaper → Color Extraction → Design Tokens → QML + CSS → Apps`

## Features

- ✅ Automatic theme generation from wallpaper
- ✅ Material 3 color scheme generation
- ✅ Support for multiple wallpaper setters (Hyprpaper, swww, feh, nitrogen)
- ✅ Light and dark theme variants
- ✅ Real-time theme updates across QML and web apps
- ✅ Fallback theme when generation fails
- ✅ Manual theme override capability
- ✅ Client-side theme generation for web apps

## Quick Start

### 1. Install Matugen

```bash
# Install via cargo
cargo install matugen

# Verify installation
matugen --version
```

### 2. Enable Automatic Theme Generation

In your QML shell configuration:

```qml
import QtQuick
import WebShell.Services

ShellRoot {
    // Enable automatic wallpaper-based theming
    Component.onCompleted: {
        WebShellTheme.autoGenerateFromWallpaper = true
    }
}
```

### 3. Set Your Wallpaper

Use your preferred wallpaper setter:

```bash
# Hyprpaper (Hyprland)
hyprctl hyprpaper wallpaper "DP-1,~/wallpapers/sunset.jpg"

# swww (Wayland)
swww img ~/wallpapers/sunset.jpg

# feh (X11)
feh --bg-scale ~/wallpapers/sunset.jpg
```

The theme will automatically update based on your wallpaper!

## How It Works

### Architecture

```
┌─────────────────┐
│   Wallpaper     │ (hyprpaper, swww, feh, etc.)
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ WallpaperWatcher│ Detects wallpaper changes
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ ThemeGenerator  │ Runs Matugen to extract colors
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Design Tokens   │ Material 3 color scheme
└────────┬────────┘
         │
         ├─────────────┬──────────────┐
         ↓             ↓              ↓
  ┌──────────┐  ┌──────────┐  ┌──────────┐
  │   QML    │  │   CSS    │  │  Apps    │
  │  Theme   │  │Variables │  │          │
  └──────────┘  └──────────┘  └──────────┘
```

### Components

#### 1. WallpaperWatcher

Monitors wallpaper changes from various sources:

- **Hyprpaper** (Hyprland): `hyprctl hyprpaper listactive`
- **swww** (Wayland): `swww query`
- **feh** (X11): `~/.fehbg`
- **nitrogen** (X11): `~/.config/nitrogen/bg-saved.cfg`

Polls every 5 seconds for changes and emits `wallpaperChanged` signal.

#### 2. ThemeGenerator

Executes Matugen to extract colors:

```bash
matugen image /path/to/wallpaper.jpg --json hex
```

Maps Matugen's Material 3 output to WebShell design tokens:

- **Primary colors**: Main brand color from wallpaper
- **Secondary/Tertiary**: Harmonious accent colors
- **Surface colors**: Background layers at different elevations
- **Semantic colors**: Error, warning, success, info
- **Text colors**: Contrast-safe text colors

#### 3. WebShellTheme

Updates all theme properties and notifies:

- QML widgets (immediate visual update)
- WebView components (via CSS variable injection)
- Web applications (via `webshellthemeupdate` event)

## Configuration

### Manual Theme Generation

Trigger theme generation manually:

```qml
// Generate from specific wallpaper
WebShellTheme.generateFromWallpaper("/path/to/wallpaper.jpg")
```

### Theme Mode

Choose light or dark variant:

```qml
// Set theme mode
WebShellTheme.setThemeMode("dark")  // "light", "dark", or "auto"

// Generate with specific mode
ThemeGenerator.generateFromWallpaper("/path/to/wallpaper.jpg", "light")
```

### Manual Wallpaper Path

Set wallpaper path manually if auto-detection fails:

```qml
WallpaperWatcher.setWallpaper("/path/to/wallpaper.jpg")
```

### Disable Auto-Generation

```qml
WebShellTheme.autoGenerateFromWallpaper = false
```

## QML API

### WebShellTheme

**Properties:**
- `autoGenerateFromWallpaper: bool` - Enable/disable automatic generation

**Methods:**
- `generateFromWallpaper(path: string)` - Manually trigger generation
- `setThemeMode(mode: string)` - Set theme mode ("light", "dark", "auto")

**Signals:**
- `themeChanged()` - Emitted when theme is updated

**Example:**

```qml
import WebShell.Services

Item {
    Component.onCompleted: {
        // Enable auto-generation
        WebShellTheme.autoGenerateFromWallpaper = true
    }

    Connections {
        target: WebShellTheme

        function onThemeChanged() {
            console.log("Theme updated!")
            // React to theme change
        }
    }

    Rectangle {
        color: WebShellTheme.colPrimary
    }
}
```

### ThemeGenerator

**Properties:**
- `wallpaperPath: string` - Current wallpaper path
- `generating: bool` - Whether generation is in progress
- `themeMode: string` - Current theme mode
- `lastError: string` - Last error message

**Methods:**
- `generateFromWallpaper(imagePath: string, mode: string)` - Generate theme
- `setThemeMode(mode: string)` - Set theme mode

**Signals:**
- `themeGenerated(tokensJson: string)` - Emitted when theme is ready
- `generationFailed(error: string)` - Emitted on failure

**Example:**

```qml
import WebShell.Services

Item {
    Connections {
        target: ThemeGenerator

        function onThemeGenerated(tokensJson: string) {
            console.log("Theme generated successfully")
        }

        function onGenerationFailed(error: string) {
            console.error("Generation failed:", error)
        }
    }

    Button {
        text: "Generate Theme"
        onClicked: {
            ThemeGenerator.generateFromWallpaper("/path/to/image.jpg")
        }
    }
}
```

### WallpaperWatcher

**Properties:**
- `wallpaperPath: string` - Current wallpaper path
- `wallpaperSource: string` - Source of wallpaper detection
- `watching: bool` - Whether watching is active

**Methods:**
- `detectWallpaper()` - Manually trigger detection
- `setWallpaper(path: string)` - Set wallpaper path manually
- `startWatching()` / `stopWatching()` - Control watching

**Signals:**
- `wallpaperChanged(newPath: string)` - Emitted when wallpaper changes

**Example:**

```qml
import WebShell.Services

Item {
    Component.onCompleted: {
        console.log("Current wallpaper:", WallpaperWatcher.wallpaperPath)
    }

    Connections {
        target: WallpaperWatcher

        function onWallpaperChanged(newPath: string) {
            console.log("Wallpaper changed to:", newPath)
        }
    }
}
```

## Web App Integration

### Accessing Generated Theme

The generated theme is automatically available in your web apps:

#### JavaScript API

```javascript
// Access current theme
const theme = window.webShellTheme;
console.log("Primary color:", theme.colors.primary);

// Listen for theme updates
window.addEventListener('webshellthemeupdate', (event) => {
    console.log('Theme updated:', event.detail);
    updateAppColors(event.detail);
});
```

#### CSS Variables

```css
.my-component {
    background: var(--color-primary);
    color: var(--color-on-primary);
    padding: var(--space-m);
    border-radius: var(--radius-l);
}
```

### Client-Side Theme Generation

Web apps can also generate themes client-side:

```typescript
import { generateThemeFromImage, applyTokensToDocument } from '@/style/theme-generator';

// Generate theme from image URL
const tokens = await generateThemeFromImage('/wallpapers/sunset.jpg', {
    mode: 'dark',
    includeNonColorTokens: true
});

// Apply to document
applyTokensToDocument(tokens);

// Or convert to CSS
import { tokensToCss } from '@/style/theme-generator';
const css = tokensToCss(tokens);
```

## Color Scheme Details

### Material 3 Color Roles

Matugen generates these color roles:

| Role | Usage | Example |
|------|-------|---------|
| `primary` | Main brand color | Buttons, FABs, active states |
| `on-primary` | Text on primary | Button text |
| `primary-container` | Containers in primary | Chips, cards |
| `on-primary-container` | Text on containers | Chip text |
| `secondary` | Secondary accent | Secondary buttons |
| `tertiary` | Tertiary accent | Highlights, special UI |
| `error` | Error states | Error messages, alerts |
| `surface` | Background surfaces | Cards, dialogs |
| `on-surface` | Text on surfaces | Body text |
| `outline` | Borders | Dividers, borders |

### Light vs Dark Themes

The same wallpaper generates different colors for light and dark modes:

**Dark Mode:**
- Lower luminance colors
- Higher contrast for text
- Darker surfaces

**Light Mode:**
- Higher luminance colors
- Lighter surfaces
- Darker text for contrast

## Fallback Strategy

If theme generation fails, WebShell:

1. **Keeps current theme** - No visual disruption
2. **Logs error** - Check console for diagnostics
3. **Allows retry** - Manual trigger available

Common failure reasons:

- Matugen not installed
- Invalid image path
- Corrupted image file
- Insufficient color data in image

## Troubleshooting

### Theme Not Updating

**Check Matugen installation:**
```bash
which matugen
matugen --version
```

**Check logs:**
```qml
// Look for these messages in QuickShell logs
[WallpaperWatcher] Wallpaper changed
[ThemeGenerator] Generating theme from: /path/to/wallpaper.jpg
[WebShellTheme] Theme updated from generated tokens
```

**Enable auto-generation:**
```qml
WebShellTheme.autoGenerateFromWallpaper = true
```

### Colors Look Wrong

**Try different mode:**
```qml
WebShellTheme.setThemeMode("light")  // or "dark"
```

**Use different wallpaper:**
- Wallpapers with rich, varied colors work best
- Very dark or very light images may produce poor results

**Manual override:**
Use a custom theme if automatic generation doesn't work well.

### Wallpaper Not Detected

**Set manually:**
```qml
WallpaperWatcher.setWallpaper("/path/to/wallpaper.jpg")
```

**Check wallpaper source:**
```qml
console.log(WallpaperWatcher.wallpaperSource)
// Should show: "hyprpaper", "swww", "feh", or "nitrogen"
```

**Supported wallpaper setters:**
- Hyprland: hyprpaper
- Wayland: swww, swaybg
- X11: feh, nitrogen

## Performance

### Generation Time

- **Matugen execution**: 100-500ms
- **Theme update**: <50ms
- **Total pipeline**: ~500ms

### Optimization Tips

1. **Debouncing**: Wallpaper changes are debounced by 1 second
2. **Polling interval**: Adjust if needed (default: 5 seconds)
3. **Lazy loading**: Auto-generation is disabled by default

## Advanced Usage

### Custom Color Mapping

Override specific colors after generation:

```qml
Connections {
    target: ThemeGenerator

    function onThemeGenerated(tokensJson: string) {
        // Parse and modify tokens
        let tokens = JSON.parse(tokensJson);

        // Override error color to always be red
        tokens.colors.error.value = "#ff0000";

        // Apply modified tokens
        WebShellTheme.updateFromTokens(JSON.stringify(tokens));
    }
}
```

### Per-Monitor Wallpapers

If you have different wallpapers per monitor:

```qml
// Detect primary monitor's wallpaper
WallpaperWatcher.detectWallpaper()

// Or set manually for specific monitor
WallpaperWatcher.setWallpaper(getPrimaryMonitorWallpaper())
```

### Saving Generated Themes

Save generated themes for reuse:

```qml
Connections {
    target: ThemeGenerator

    function onThemeGenerated(tokensJson: string) {
        // Save to file for later use
        WebShellTheme.saveTokensToDisk(tokensJson)
    }
}
```

Note: File I/O currently requires C++ backend implementation.

## Best Practices

1. **Choose colorful wallpapers**: Rich, varied colors produce better themes
2. **Test both modes**: Ensure light and dark modes look good
3. **Provide fallback**: Always have a default theme
4. **Debounce changes**: Avoid excessive regeneration
5. **Cache generated themes**: Store themes keyed by wallpaper path
6. **Validate colors**: Ensure sufficient contrast for accessibility

## Examples

### Basic Setup

```qml
import QtQuick
import Quickshell
import WebShell.Services

ShellRoot {
    id: root

    Component.onCompleted: {
        // Enable automatic theme generation
        WebShellTheme.autoGenerateFromWallpaper = true

        // Set initial theme mode
        WebShellTheme.setThemeMode("dark")

        console.log("Wallpaper-based theming enabled")
    }

    PanelWindow {
        color: WebShellTheme.colSurface

        Column {
            Text {
                text: "Primary Color Demo"
                color: WebShellTheme.colPrimary
                font.pixelSize: WebShellTheme.fontSizeXxl
            }

            Rectangle {
                width: 200
                height: 50
                color: WebShellTheme.colPrimaryContainer
                radius: WebShellTheme.radiusL

                Text {
                    anchors.centerIn: parent
                    text: "Container"
                    color: WebShellTheme.colOnPrimaryContainer
                }
            }
        }
    }
}
```

### Manual Theme Control

```qml
import QtQuick
import QtQuick.Controls
import WebShell.Services

Item {
    Column {
        Button {
            text: "Generate from Wallpaper"
            onClicked: {
                const wallpaper = WallpaperWatcher.wallpaperPath
                if (wallpaper) {
                    ThemeGenerator.generateFromWallpaper(wallpaper)
                } else {
                    console.warn("No wallpaper detected")
                }
            }
        }

        Button {
            text: "Toggle Light/Dark"
            onClicked: {
                const currentMode = ThemeGenerator.themeMode
                const newMode = currentMode === "dark" ? "light" : "dark"
                WebShellTheme.setThemeMode(newMode)
            }
        }

        Text {
            text: `Current wallpaper: ${WallpaperWatcher.wallpaperPath}`
        }

        Text {
            text: `Theme mode: ${ThemeGenerator.themeMode}`
        }

        Text {
            text: ThemeGenerator.generating ? "Generating..." : "Ready"
            color: ThemeGenerator.generating ? "orange" : "green"
        }
    }
}
```

### React Component Example

```tsx
import React, { useEffect, useState } from 'react';

export function ThemedComponent() {
    const [theme, setTheme] = useState(window.webShellTheme);

    useEffect(() => {
        const handleThemeUpdate = (event: CustomEvent) => {
            setTheme(event.detail);
        };

        window.addEventListener('webshellthemeupdate', handleThemeUpdate);
        return () => window.removeEventListener('webshellthemeupdate', handleThemeUpdate);
    }, []);

    return (
        <div style={{
            backgroundColor: `var(--color-surface)`,
            color: `var(--color-text)`,
            padding: `var(--space-l)`,
            borderRadius: `var(--radius-m)`,
        }}>
            <h1 style={{ color: `var(--color-primary)` }}>
                Dynamic Theme Demo
            </h1>
            <p>Current primary color: {theme.colors.primary}</p>
        </div>
    );
}
```

## Reference

### Matugen Documentation
- GitHub: https://github.com/InioX/matugen
- Wiki: https://github.com/InioX/matugen/wiki

### Material You Resources
- Color system: https://m3.material.io/styles/color/overview
- Dynamic color: https://m3.material.io/styles/color/dynamic-color/overview
- Color roles: https://m3.material.io/styles/color/roles

### Related Documentation
- [Theme System](../quickshell/THEME.md)
- [Design Tokens](./design-tokens-generator.md)
- [Theme Extraction](./theme-extraction.md)

## Implementation Status

- ✅ Matugen integration
- ✅ Wallpaper detection (Hyprpaper, swww, feh, nitrogen)
- ✅ Theme generation (Material 3 color schemes)
- ✅ QML theme updates
- ✅ WebView CSS variable injection
- ✅ Light/dark mode support
- ✅ Fallback theme strategy
- ✅ Client-side TypeScript utility
- ✅ Documentation

## Future Enhancements

- [ ] C++ file system watcher for real-time updates
- [ ] Theme caching system
- [ ] Custom color extractor plugins
- [ ] Per-app theme overrides
- [ ] Theme preset management
- [ ] Visual theme editor
- [ ] Accessibility contrast validation
- [ ] Theme transition animations
