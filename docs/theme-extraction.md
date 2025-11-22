# Theme Extraction

This document describes the process of extracting theme values from DankMaterialShell (DMS) and converting them to WebShell's design token format.

## Overview

WebShell uses a design token system to maintain consistent theming across both QML and web components. The design tokens are extracted from DankMaterialShell's Material 3-based theme system and stored in a structured JSON format that can be used by both the native shell and web applications.

## Static Theme vs Dynamic Theme

### Static Theme (This Implementation - Task 2.2)

This task extracts the **current static theme** from DankMaterialShell into design tokens. The extraction creates a baseline theme that follows Material 3 design principles with predefined color palettes, spacing scales, typography, and other design primitives.

**What's included:**
- Material 3 color roles (surface, primary, secondary, error, etc.)
- Typography scale (font families, sizes, weights, line heights)
- Spacing system (xs, s, m, l, xl, xxl)
- Border radii (rounding values)
- Elevation system (shadow definitions)
- Animation timings and easing functions

### Dynamic Theme (Task 2.4.1)

**Wallpaper-based theme generation** (using Matugen) is implemented separately in **task-2.4.1**.

That task will:
- Watch for wallpaper changes
- Extract colors using Matugen
- Generate new design tokens automatically
- Update both QML and WebView themes dynamically

This static extraction provides the **baseline theme structure** that Matugen will enhance with dynamically generated colors.

## Design Token Schema

The design tokens follow a JSON schema defined in `src/style/design-tokens.schema.json`. The schema enforces:

- **Version control**: Semantic versioning for token evolution
- **Type safety**: Strict validation for colors (hex), spacing (px), fonts, etc.
- **Required properties**: Core tokens that must be present
- **Documentation**: Each token includes a description

## QML to Token Mappings

The following table shows how DMS QML properties map to design token names:

### Colors

| DMS QML Property | Design Token | Description |
|-----------------|--------------|-------------|
| `Appearance.colors.colSurface` | `colors.surface` | Default surface background color |
| `Appearance.colors.colSurfaceContainerHigh` | `colors.surface-high` | Elevated surface color |
| `Appearance.colors.colSurfaceContainerHighest` | `colors.surface-highest` | Highest elevation surface |
| `Appearance.colors.colSurfaceContainerLow` | `colors.surface-low` | Lower surface color |
| `Appearance.colors.colPrimary` | `colors.primary` | Primary brand color |
| `Appearance.colors.colOnPrimary` | `colors.on-primary` | Text on primary background |
| `Appearance.colors.colPrimaryContainer` | `colors.primary-container` | Primary container color |
| `Appearance.colors.colOnPrimaryContainer` | `colors.on-primary-container` | Text on primary container |
| `Appearance.colors.colSecondary` | `colors.secondary` | Secondary accent color |
| `Appearance.colors.colOnSecondary` | `colors.on-secondary` | Text on secondary background |
| `Appearance.colors.colTertiary` | `colors.tertiary` | Tertiary accent color |
| `Appearance.colors.colError` | `colors.error` | Error state color |
| `Appearance.colors.colWarning` | `colors.warning` | Warning state color |
| `Appearance.colors.colSuccess` | `colors.success` | Success state color |
| `Appearance.colors.colInfo` | `colors.info` | Info state color |
| `Appearance.colors.colOnSurface` | `colors.text` | Default text color |
| `Appearance.colors.colOnSurfaceVariant` | `colors.text-secondary` | Secondary text color |
| `Appearance.colors.colOutline` | `colors.border` | Default border color |
| `Appearance.colors.colOutlineVariant` | `colors.border-focus` | Focus border color |
| `Appearance.colors.colBackground` | `colors.background` | Application background |
| `Appearance.colors.colInverseSurface` | `colors.inverse-surface` | Inverse surface (tooltips) |
| `Appearance.colors.colScrim` | `colors.scrim` | Overlay scrim color |
| `Appearance.colors.colShadow` | `colors.shadow` | Shadow color |

### Typography

| DMS QML Property | Design Token | Description |
|-----------------|--------------|-------------|
| `Appearance.font.family` | `typography.fontFamily.base` | Base font family |
| `Appearance.font.monospace` | `typography.fontFamily.monospace` | Monospace font |
| `Appearance.font.pixelSize.small` | `typography.fontSize.xs` | 12px |
| `Appearance.font.pixelSize.medium` | `typography.fontSize.s` | 14px |
| `Appearance.font.pixelSize.normal` | `typography.fontSize.m` | 16px |
| `Appearance.font.pixelSize.large` | `typography.fontSize.l` | 18px |
| `Appearance.font.pixelSize.larger` | `typography.fontSize.xl` | 20px |
| `Appearance.font.pixelSize.xl` | `typography.fontSize.xxl` | 24px |
| `Appearance.font.pixelSize.xxl` | `typography.fontSize.xxxl` | 32px |
| `Appearance.font.weight.normal` | `typography.fontWeight.normal` | 400 |
| `Appearance.font.weight.medium` | `typography.fontWeight.medium` | 500 |
| `Appearance.font.weight.semibold` | `typography.fontWeight.semibold` | 600 |
| `Appearance.font.weight.bold` | `typography.fontWeight.bold` | 700 |

### Spacing

| DMS QML Property | Design Token | Description |
|-----------------|--------------|-------------|
| `Appearance.spacing.xs` | `spacing.xs` | 4px |
| `Appearance.spacing.s` | `spacing.s` | 8px |
| `Appearance.spacing.m` | `spacing.m` | 16px |
| `Appearance.spacing.l` | `spacing.l` | 24px |
| `Appearance.spacing.xl` | `spacing.xl` | 32px |
| `Appearance.spacing.xxl` | `spacing.xxl` | 48px |

### Border Radii

| DMS QML Property | Design Token | Description |
|-----------------|--------------|-------------|
| `Appearance.rounding.none` | `border.radius.none` | 0px |
| `Appearance.rounding.small` | `border.radius.s` | 4px |
| `Appearance.rounding.normal` | `border.radius.m` | 8px |
| `Appearance.rounding.large` | `border.radius.l` | 12px |
| `Appearance.rounding.xl` | `border.radius.xl` | 16px |
| `Appearance.rounding.full` | `border.radius.full` | 9999px (circular) |

### Elevation (Shadows)

| DMS QML Property | Design Token | Description |
|-----------------|--------------|-------------|
| `Appearance.elevation.none` | `elevation.none` | No shadow |
| `Appearance.elevation.level1` | `elevation.low` | Subtle shadow |
| `Appearance.elevation.level2` | `elevation.low` | Low elevation |
| `Appearance.elevation.level3` | `elevation.medium` | Medium elevation |
| `Appearance.elevation.level4` | `elevation.high` | High elevation |

### Animation

| DMS QML Property | Design Token | Description |
|-----------------|--------------|-------------|
| `Appearance.animation.durationFast` | `animation.duration.fast` | 150ms |
| `Appearance.animation.durationNormal` | `animation.duration.normal` | 250ms |
| `Appearance.animation.durationSlow` | `animation.duration.slow` | 400ms |
| `Appearance.animation.easingStandard` | `animation.easing.standard` | cubic-bezier(0.4, 0.0, 0.2, 1) |
| `Appearance.animation.easingDecelerate` | `animation.easing.decelerate` | cubic-bezier(0.0, 0.0, 0.2, 1) |
| `Appearance.animation.easingAccelerate` | `animation.easing.accelerate` | cubic-bezier(0.4, 0.0, 1, 1) |

## Extraction Tool

### Usage

The extraction script is located at `tools/extract-dms-theme.cjs`. It parses a DMS Theme.qml file and generates design tokens in the correct format.

```bash
# Extract from DMS theme file
node tools/extract-dms-theme.cjs \
  /path/to/DankMaterialShell/quickshell/Common/Theme.qml \
  src/style/design-tokens.json

# Extract from reference theme (for testing)
node tools/extract-dms-theme.cjs \
  reference/Theme.qml \
  src/style/design-tokens.json
```

### Output

The script generates a `design-tokens.json` file with the following structure:

```json
{
  "$schema": "./src/style/design-tokens.schema.json",
  "version": "1.0.0",
  "colors": {
    "primary": {
      "value": "#ef8354",
      "description": "Extracted from Appearance.colors.colPrimary"
    }
    // ... more colors
  },
  "spacing": { /* ... */ },
  "typography": { /* ... */ },
  "elevation": { /* ... */ },
  "border": { /* ... */ },
  "animation": { /* ... */ }
}
```

### Validation

After extraction, validate the tokens against the schema:

```bash
npx ajv-cli validate \
  -s src/style/design-tokens.schema.json \
  -d src/style/design-tokens.json
```

## Using Design Tokens

### In CSS/Web Components

The design tokens can be converted to CSS custom properties:

```css
:root {
  --color-primary: #ef8354;
  --color-surface: #1a1a1a;
  --spacing-m: 16px;
  --font-size-m: 16px;
  --border-radius-m: 8px;
}
```

### In QML

The tokens can be used to generate QML theme properties:

```qml
QtObject {
  readonly property color colPrimary: "#ef8354"  // from tokens.colors.primary.value
  readonly property int spaceM: 16                // from tokens.spacing.m.value
  readonly property int roundingNormal: 8         // from tokens.border.radius.m.value
}
```

## Material 3 Color System

The extracted colors follow Material 3's semantic color system:

- **Surface colors**: Background surfaces at different elevations
- **Primary/Secondary/Tertiary**: Brand and accent colors
- **On-* colors**: Text/icon colors for use on colored backgrounds
- **Container colors**: Filled component backgrounds
- **State colors**: Error, warning, success, info
- **Outline colors**: Borders and dividers
- **Inverse colors**: Reversed contrast for tooltips/snackbars

## Reference Material

- [Material 3 Color Roles](https://m3.material.io/styles/color/roles)
- [Material 3 Typography](https://m3.material.io/styles/typography/overview)
- [Material 3 Elevation](https://m3.material.io/styles/elevation/overview)

## Future Enhancements

As noted above, **task-2.4.1** will implement dynamic theme generation using Matugen to extract colors from wallpapers. This will:

1. Maintain the same token structure
2. Generate new color values based on wallpaper
3. Preserve the semantic color roles
4. Update both QML and web themes in real-time

The static theme serves as a fallback when Matugen is unavailable or before a wallpaper is set.
