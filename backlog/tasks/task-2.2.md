---
id: task-2.2
title: Extract DMS theme to design token format
status: Done
created_date: 2025-01-19
completed_date: 2025-11-19
milestone: milestone-2
assignees: []
labels: [design-system, theme]
dependencies: [task-2.1]
---

## Description

Extract all theme values from DankMaterialShell's QML theme system and convert them into the design token JSON format. This creates the bridge between existing QML theming and the new unified token system.

**Scope Note**: This task focuses on extracting the *existing static theme*. Dynamic wallpaper-based theme generation (via Matugen) is handled separately in **task-2.4.1**.

## Acceptance Criteria

- [x] All DMS color roles extracted and mapped
- [x] Typography scale captured (font families, sizes, weights)
- [x] Spacing scale documented
- [x] Elevation/shadow system preserved
- [x] Border radii captured
- [x] Animation timings extracted
- [x] Token file validates against schema (task-2.1)
- [x] Documentation of QML→Token mappings
- [x] **Note added about Matugen integration happening in task-2.4.1**

## Implementation Plan

1. **Analyze DMS Theme Structure**
   - Study `quickshell/Common/Theme.qml`
   - Review `docs/CUSTOM_THEMES.md`
   - Map Appearance.colors.* properties
   - Document all theme singletons

2. **Extract Color System**
```json
{
  "colors": {
    "surface": {
      "value": "{{colSurfaceContainer}}",
      "qmlPath": "Appearance.colors.colSurfaceContainer",
      "description": "Default surface color for containers"
    },
    "surfaceHigh": {
      "value": "{{colSurfaceContainerHigh}}",
      "qmlPath": "Appearance.colors.colSurfaceContainerHigh",
      "description": "Elevated surface color"
    },
    "primary": {
      "value": "{{colPrimary}}",
      "qmlPath": "Appearance.colors.colPrimary",
      "description": "Primary brand color"
    },
    "onPrimary": {
      "value": "{{colOnPrimary}}",
      "qmlPath": "Appearance.colors.colOnPrimary",
      "description": "Text color on primary background"
    }
    // ... all Material 3 color roles
  }
}
```

3. **Extract Typography**

Map font properties:
```json
{
  "typography": {
    "fontFamily": {
      "value": "{{Appearance.font.family}}",
      "qmlPath": "Appearance.font.family",
      "fallback": "Inter, system-ui, sans-serif"
    },
    "sizes": {
      "xs": {
        "value": "{{Appearance.font.pixelSize.small}}px",
        "qmlPath": "Appearance.font.pixelSize.small"
      },
      "sm": {
        "value": "{{Appearance.font.pixelSize.medium}}px",
        "qmlPath": "Appearance.font.pixelSize.medium"
      },
      "md": {
        "value": "{{Appearance.font.pixelSize.normal}}px",
        "qmlPath": "Appearance.font.pixelSize.normal"
      },
      "lg": {
        "value": "{{Appearance.font.pixelSize.large}}px",
        "qmlPath": "Appearance.font.pixelSize.large"
      },
      "xl": {
        "value": "{{Appearance.font.pixelSize.larger}}px",
        "qmlPath": "Appearance.font.pixelSize.larger"
      }
    },
    "weights": {
      "normal": 400,
      "medium": 500,
      "bold": 700
    }
  }
}
```

4. **Extract Spacing & Layout**

Map padding/margin scales:
```json
{
  "spacing": {
    "xs": {
      "value": "4px",
      "description": "Minimal spacing"
    },
    "s": {
      "value": "8px",
      "description": "Small spacing"
    },
    "m": {
      "value": "16px",
      "description": "Medium spacing (default)"
    },
    "l": {
      "value": "24px",
      "description": "Large spacing"
    },
    "xl": {
      "value": "32px",
      "description": "Extra large spacing"
    }
  }
}
```

5. **Extract Border Radii**

Map rounding values:
```json
{
  "radii": {
    "sm": {
      "value": "{{Appearance.rounding.small}}px",
      "qmlPath": "Appearance.rounding.small",
      "description": "Small radius (buttons, chips)"
    },
    "md": {
      "value": "{{Appearance.rounding.normal}}px",
      "qmlPath": "Appearance.rounding.normal",
      "description": "Medium radius (cards)"
    },
    "lg": {
      "value": "{{Appearance.rounding.large}}px",
      "qmlPath": "Appearance.rounding.large",
      "description": "Large radius (panels, modals)"
    },
    "full": {
      "value": "{{Appearance.rounding.full}}px",
      "qmlPath": "Appearance.rounding.full",
      "description": "Fully rounded (circles, pills)"
    }
  }
}
```

6. **Extract Shadows/Elevation**

Map elevation levels:
```json
{
  "shadows": {
    "1": {
      "value": "0 1px 2px rgba(0,0,0,0.08)",
      "description": "Subtle elevation"
    },
    "2": {
      "value": "0 2px 4px rgba(0,0,0,0.12)",
      "description": "Default elevation"
    },
    "3": {
      "value": "0 4px 12px rgba(0,0,0,0.16)",
      "description": "High elevation"
    },
    "4": {
      "value": "0 8px 24px rgba(0,0,0,0.20)",
      "description": "Floating elevation"
    }
  }
}
```

7. **Extract Animation Timings**

Map duration/easing:
```json
{
  "animation": {
    "short": {
      "value": "120ms ease",
      "description": "Quick transitions"
    },
    "medium": {
      "value": "180ms ease",
      "description": "Standard transitions"
    },
    "long": {
      "value": "280ms ease",
      "description": "Emphasized transitions"
    },
    "easing": {
      "standard": "cubic-bezier(0.4, 0.0, 0.2, 1)",
      "decelerate": "cubic-bezier(0.0, 0.0, 0.2, 1)",
      "accelerate": "cubic-bezier(0.4, 0.0, 1, 1)"
    }
  }
}
```

8. **Create Conversion Script**

**File**: `tools/extract-dms-theme.js`
```javascript
#!/usr/bin/env node

/**
 * Extract DMS theme values and convert to design tokens JSON
 */

const fs = require('fs');
const path = require('path');

// Parse QML file to extract theme values
function parseQMLTheme(qmlContent) {
  const tokens = {
    version: "1.0.0",
    colors: {},
    spacing: {},
    typography: {},
    radii: {},
    shadows: {},
    animation: {}
  };
  
  // Extract color properties
  const colorRegex = /readonly property color col(\w+): "(.+?)"/g;
  let match;
  while ((match = colorRegex.exec(qmlContent)) !== null) {
    const [_, name, value] = match;
    const tokenName = camelToKebab(name);
    tokens.colors[tokenName] = {
      value: value,
      qmlPath: `Appearance.colors.col${name}`
    };
  }
  
  // Extract spacing (if defined)
  const spacingRegex = /readonly property int space(\w+): (\d+)/g;
  while ((match = spacingRegex.exec(qmlContent)) !== null) {
    const [_, name, value] = match;
    tokens.spacing[name.toLowerCase()] = {
      value: `${value}px`,
      qmlPath: `Appearance.spacing.space${name}`
    };
  }
  
  // Extract font sizes
  const fontSizeRegex = /pixelSize\.([\w]+): (\d+)/g;
  while ((match = fontSizeRegex.exec(qmlContent)) !== null) {
    const [_, name, value] = match;
    if (!tokens.typography.sizes) tokens.typography.sizes = {};
    tokens.typography.sizes[name] = {
      value: `${value}px`,
      qmlPath: `Appearance.font.pixelSize.${name}`
    };
  }
  
  // Extract rounding
  const roundingRegex = /rounding\.([\w]+): (\d+)/g;
  while ((match = roundingRegex.exec(qmlContent)) !== null) {
    const [_, name, value] = match;
    tokens.radii[name] = {
      value: `${value}px`,
      qmlPath: `Appearance.rounding.${name}`
    };
  }
  
  return tokens;
}

function camelToKebab(str) {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
}

// Main execution
const dmsThemePath = process.argv[2] || '../DankMaterialShell/quickshell/Common/Theme.qml';
const outputPath = process.argv[3] || './design-tokens.json';

if (!fs.existsSync(dmsThemePath)) {
  console.error('DMS Theme.qml not found:', dmsThemePath);
  process.exit(1);
}

const qmlContent = fs.readFileSync(dmsThemePath, 'utf8');
const tokens = parseQMLTheme(qmlContent);

// Write output
fs.writeFileSync(outputPath, JSON.stringify(tokens, null, 2));
console.log('Tokens extracted to:', outputPath);
console.log('Colors:', Object.keys(tokens.colors).length);
console.log('Spacing:', Object.keys(tokens.spacing).length);
console.log('Typography:', Object.keys(tokens.typography.sizes || {}).length);
```

Run it:
```bash
chmod +x tools/extract-dms-theme.js
./tools/extract-dms-theme.js \
  ../DankMaterialShell/quickshell/Common/Theme.qml \
  design-tokens.json
```

9. **Validate Output**

Ensure generated tokens validate against schema:
```bash
# Using ajv-cli
ajv validate -s design-tokens.schema.json -d design-tokens.json
```

10. **Add Wallpaper Theme Note**

**File**: `docs/theme-extraction.md`
```markdown
# Theme Extraction

## Static Theme (This Task)

This task extracts the *current static theme* from DankMaterialShell into design tokens.

## Dynamic Theme (Task 2.4.1)

**Wallpaper-based theme generation** (using Matugen) is implemented separately in **task-2.4.1**.

That task will:
- Watch for wallpaper changes
- Extract colors using Matugen
- Generate new design tokens automatically
- Update both QML and WebView

This extraction provides the *baseline theme* that Matugen will enhance.
```

## Technical Notes

**Key DMS Properties to Extract**:
```qml
// Colors
Appearance.colors.colPrimary
Appearance.colors.colSurfaceContainer
Appearance.colors.colOnSurface
// ... ~30 Material 3 color roles

// Typography
Appearance.font.family
Appearance.font.pixelSize.small
Appearance.font.pixelSize.medium
// ... 5-7 size variants

// Rounding
Appearance.rounding.normal
Appearance.rounding.large
Appearance.rounding.full
```

**Mapping Strategy**:
- Semantic names take priority over concrete values
- Preserve Material 3 color role naming
- Document any DMS-specific extensions
- Note which values are static vs dynamic

**Matugen Integration** (Separate Task):
- This extraction creates the *structure*
- Task 2.4.1 adds *dynamic generation*
- Both use the same token schema
- Static theme is fallback when Matugen unavailable

**DMS Compatibility**:
Ensure tokens can map back to QML:
```qml
// Generated QML from tokens
readonly property color colPrimary: "#ef8354"  // from tokens.colors.primary.value
```

## Reference Material

Study these DMS files:
```bash
cd DankMaterialShell/quickshell
cat Common/Theme.qml
cat docs/CUSTOM_THEMES.md
grep -r "Appearance\." Modules/ | head -50
```

Material 3 color roles:
- https://m3.material.io/styles/color/roles

## Definition of Done

- Design token JSON file created with all DMS theme values
- Validation passes against schema
- QML→Token mapping documented
- Extraction script functional and reusable
- Documentation notes separation from wallpaper theming
- Git commit: "task-2.2: Extract DMS theme to static tokens"
```
