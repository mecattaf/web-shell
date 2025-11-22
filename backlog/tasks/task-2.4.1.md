---
id: task-2.4.1
title: Integrate wallpaper-based theme generation (Matugen)
status: Done
created_date: 2025-01-19
milestone: milestone-2
assignees: []
labels: [theme, automation]
dependencies: [task-2.2, task-2.4]
---

## Description

Integrate automated theme generation from wallpaper using Matugen (or equivalent tool). This creates the "wallpaper → colors → tokens → QML + CSS" pipeline that was central to the original DMS vision.

**Why This Matters**: Dynamic theming based on wallpaper is a key differentiator of modern desktop shells. WebShell must support this to compete with DMS/Material You aesthetics.

## Acceptance Criteria

- [ ] Matugen (or alternative) integrated into build process
- [ ] Wallpaper changes trigger theme regeneration
- [ ] Generated colors map to design tokens
- [ ] Tokens propagate to both QML and WebView CSS
- [ ] Color schemes support light/dark variants
- [ ] Fallback theme when wallpaper extraction fails
- [ ] Documentation for theme generation

## Implementation Plan

1. **Research & Choose Tool**

**Option A: Matugen** (Material You generator)
```bash
# Install
cargo install matugen

# Generate from wallpaper
matugen image /path/to/wallpaper.jpg
```

**Option B: Material Color Utilities**
```bash
npm install @material/material-color-utilities
```

**Option C: pywal**
```bash
pip install pywal
```

**Recommendation**: Matugen for Material 3 compliance, or Material Color Utilities for pure JS implementation.

2. **Create Theme Generator Service**

**File**: `qs/modules/webshell/ThemeGenerator.qml`
```qml
pragma Singleton
import QtQuick
import Quickshell.Io

Singleton {
    id: root
    
    property string wallpaperPath: ""
    property bool generating: false
    
    signal themeGenerated(string tokensJson)
    signal generationFailed(string error)
    
    function generateFromWallpaper(imagePath) {
        if (generating) {
            console.warn("[ThemeGenerator] Already generating");
            return;
        }
        
        console.log("[ThemeGenerator] Generating from:", imagePath);
        generating = true;
        wallpaperPath = imagePath;
        
        // Execute matugen
        const process = Quickshell.Process.exec([
            "matugen",
            "image",
            imagePath,
            "--json",
            "stdout"
        ]);
        
        process.finished.connect(() => {
            generating = false;
            
            if (process.exitCode === 0) {
                const output = process.readAllStandardOutput();
                parseMatugenOutput(output);
            } else {
                const error = process.readAllStandardError();
                generationFailed("Matugen failed: " + error);
            }
        });
    }
    
    function parseMatugenOutput(output) {
        try {
            const matugenColors = JSON.parse(output);
            const tokens = mapToDesignTokens(matugenColors);
            themeGenerated(JSON.stringify(tokens));
        } catch (e) {
            generationFailed("JSON parse error: " + e);
        }
    }
    
    function mapToDesignTokens(matugenColors) {
        // Map Matugen's Material You colors to our token schema
        const scheme = matugenColors.colors.dark; // or .light
        
        return {
            version: "1.0.0",
            colors: {
                // Surfaces
                surface: scheme.surface,
                surfaceHigh: scheme.surfaceContainerHigh,
                surfaceHighest: scheme.surfaceContainerHighest,
                onSurface: scheme.onSurface,
                onSurfaceVariant: scheme.onSurfaceVariant,
                
                // Primary
                primary: scheme.primary,
                onPrimary: scheme.onPrimary,
                primaryContainer: scheme.primaryContainer,
                onPrimaryContainer: scheme.onPrimaryContainer,
                
                // Secondary
                secondary: scheme.secondary,
                onSecondary: scheme.onSecondary,
                secondaryContainer: scheme.secondaryContainer,
                onSecondaryContainer: scheme.onSecondaryContainer,
                
                // Tertiary
                tertiary: scheme.tertiary,
                onTertiary: scheme.onTertiary,
                
                // Error
                error: scheme.error,
                onError: scheme.onError,
                
                // Outline
                outline: scheme.outline,
                outlineVariant: scheme.outlineVariant,
                
                // Background
                background: scheme.background,
                onBackground: scheme.onBackground
            },
            // Preserve other token categories
            spacing: { /* from base tokens */ },
            typography: { /* from base tokens */ },
            radii: { /* from base tokens */ }
        };
    }
}
```

3. **Watch Wallpaper Changes**

**File**: `qs/modules/webshell/WallpaperWatcher.qml`
```qml
pragma Singleton
import QtQuick
import Quickshell.Io

Singleton {
    id: root
    
    property string wallpaperPath: ""
    
    signal wallpaperChanged(string newPath)
    
    Component.onCompleted: {
        // Detect wallpaper from various sources
        detectWallpaper();
        
        // Watch for changes
        startWatching();
    }
    
    function detectWallpaper() {
        // Try Hyprland
        const hyprlandWallpaper = detectHyprlandWallpaper();
        if (hyprlandWallpaper) {
            wallpaperPath = hyprlandWallpaper;
            return;
        }
        
        // Try swww
        const swwwWallpaper = detectSwwwWallpaper();
        if (swwwWallpaper) {
            wallpaperPath = swwwWallpaper;
            return;
        }
        
        // Try nitrogen/feh cache
        // ...
    }
    
    function detectHyprlandWallpaper() {
        // Query hyprctl for current wallpaper
        const process = Quickshell.Process.exec([
            "hyprctl",
            "hyprpaper",
            "listactive"
        ]);
        
        process.finished.connect(() => {
            if (process.exitCode === 0) {
                const output = process.readAllStandardOutput();
                // Parse output to get wallpaper path
                return parseHyprpaperOutput(output);
            }
        });
    }
    
    function startWatching() {
        // Watch hyprpaper socket for changes
        FileSystemWatcher {
            paths: [
                "/tmp/hypr/" + Qt.getenv("HYPRLAND_INSTANCE_SIGNATURE") + "/.hyprpaper.sock"
            ]
            onFileChanged: {
                console.log("[WallpaperWatcher] Wallpaper changed");
                detectWallpaper();
                if (wallpaperPath) {
                    wallpaperChanged(wallpaperPath);
                }
            }
        }
    }
}
```

4. **Connect to Theme System**

**Update**: `qs/modules/webshell/WebShellTheme.qml`
```qml
pragma Singleton
import QtQuick

Singleton {
    id: root
    
    // ... existing properties
    
    // Auto-generate on wallpaper change
    Connections {
        target: WallpaperWatcher
        function onWallpaperChanged(wallpaperPath) {
            console.log("[WebShellTheme] Regenerating theme from:", wallpaperPath);
            ThemeGenerator.generateFromWallpaper(wallpaperPath);
        }
    }
    
    Connections {
        target: ThemeGenerator
        function onThemeGenerated(tokensJson) {
            const tokens = JSON.parse(tokensJson);
            
            // Update QML properties
            updateFromTokens(tokens);
            
            // Save to disk
            saveTokensToDisk(tokensJson);
            
            // Notify WebViews
            themeChanged();
        }
        
        function onGenerationFailed(error) {
            console.error("[WebShellTheme] Generation failed:", error);
            // Fall back to default theme
        }
    }
    
    function saveTokensToDisk(tokensJson) {
        const file = Qt.resolvedUrl("~/.config/webshell/design-tokens.json");
        // Write JSON to file
        // (Use File API or Process with echo/tee)
    }
}
```

5. **Implement Fallback Strategy**

```qml
QtObject {
    id: themeFallback
    
    readonly property var defaultTokens: ({
        colors: {
            surface: "#1a1a1a",
            primary: "#ef8354",
            // ... complete fallback token set
        }
    })
    
    function getFallbackTheme() {
        return defaultTokens;
    }
}
```

6. **Add Manual Theme Override**

```qml
// Allow manual theme selection
property string themeMode: "auto" // "auto", "light", "dark", "custom"

function setThemeMode(mode) {
    themeMode = mode;
    
    if (mode === "custom") {
        // Load from custom theme file
    } else {
        // Regenerate from wallpaper with mode
        ThemeGenerator.generateFromWallpaper(
            WallpaperWatcher.wallpaperPath,
            mode // "light" or "dark"
        );
    }
}
```

7. **Create JS/TS Utility**

**File**: `sdk/src/utils/theme-generator.ts`
```typescript
/**
 * Client-side theme generation utility
 * (Optional: for apps that want to generate themes themselves)
 */

import { 
  argbFromHex, 
  themeFromSourceColor, 
  applyTheme 
} from '@material/material-color-utilities';

export async function generateThemeFromImage(
  imageUrl: string
): Promise<Theme> {
  // Extract primary color from image
  const primaryColor = await extractPrimaryColor(imageUrl);
  
  // Generate Material You theme
  const theme = themeFromSourceColor(argbFromHex(primaryColor));
  
  // Map to WebShell token format
  return mapToWebShellTokens(theme);
}

async function extractPrimaryColor(imageUrl: string): Promise<string> {
  // Use color-thief or similar
  const img = new Image();
  img.src = imageUrl;
  
  await new Promise(resolve => img.onload = resolve);
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, 1, 1);
  
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  return `#${r.toString(16)}${g.toString(16)}${b.toString(16)}`;
}
```

8. **Documentation**

**File**: `docs/theme-generation.md`
```markdown
# Wallpaper-Based Theme Generation

## Overview

WebShell automatically generates color themes from your wallpaper using Material You (Material Design 3) principles.

## How It Works

1. **Wallpaper Detection**: Monitors your wallpaper setter (hyprpaper, swww, etc.)
2. **Color Extraction**: Extracts primary colors using Matugen
3. **Theme Generation**: Creates Material 3 color schemes (light + dark)
4. **Token Update**: Updates design tokens (JSON → QML + CSS)
5. **Propagation**: All apps and QML widgets update automatically

## Requirements

Install Matugen:
```bash
cargo install matugen
```

## Configuration

### Automatic (Default)

WebShell watches for wallpaper changes automatically:
```qml
// No configuration needed
```

### Manual Trigger

Regenerate theme on demand:
```qml
ThemeGenerator.generateFromWallpaper("/path/to/wallpaper.jpg");
```

### Theme Mode

Choose light, dark, or auto:
```qml
WebShellTheme.setThemeMode("dark"); // "light", "dark", "auto"
```

## Custom Themes

Override automatic generation:

1. Create custom token file:
```json
{
  "version": "1.0.0",
  "colors": {
    "primary": "#your-color",
    ...
  }
}
```

2. Load custom theme:
```qml
WebShellTheme.setThemeMode("custom");
WebShellTheme.loadCustomTheme("~/.config/webshell/my-theme.json");
```

## Troubleshooting

### Theme not updating

- Check if Matugen is installed: `which matugen`
- Check QuickShell logs for errors
- Verify wallpaper path is correct

### Colors look wrong

- Try regenerating: `ThemeGenerator.generateFromWallpaper(...)`
- Check wallpaper has sufficient color data
- Use manual color selection if needed

## Advanced

### Custom Color Extraction

Implement your own color extractor:
```qml
ThemeGenerator.setColorExtractor(function(imagePath) {
    // Custom logic
    return { primary: "#color", secondary: "#color" };
});
```

### Per-App Theme Overrides

Apps can request custom themes:
```typescript
await webshell.theme.setCustomColors({
  primary: "#custom-primary"
});
```
```

## Technical Notes

**Performance**:
- Theme generation takes 100-500ms
- Cache generated themes to avoid regenerating on every change
- Debounce wallpaper change events (e.g., 1s delay)

**Color Quality**:
- Matugen uses k-means clustering for primary color selection
- Quality depends on wallpaper color diversity
- Fallback to neutral theme if extraction fails

**Compatibility**:
- Works with Hyprland, Sway, i3 (via various wallpaper setters)
- X11: feh, nitrogen
- Wayland: swww, hyprpaper, swaybg

**Alternative Tools**:
- `pywal`: Python-based, simpler but less accurate
- `@material/material-color-utilities`: Pure JS, client-side
- Custom extractors via API

## Reference Material

Matugen:
- GitHub: https://github.com/InioX/matugen
- Docs: https://github.com/InioX/matugen/wiki

Material You:
- Color system: https://m3.material.io/styles/color/overview
- Dynamic color: https://m3.material.io/styles/color/dynamic-color/overview

## Definition of Done

- Matugen integrated
- Wallpaper watching implemented
- Theme generation working
- QML + CSS tokens update automatically
- Fallback theme functional
- Documentation complete
- Tested with multiple wallpapers
- Git commit: "task-2.4.1: Integrate Matugen theme generation"
