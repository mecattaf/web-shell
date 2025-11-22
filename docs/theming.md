# Theming Guide

WebShell uses a comprehensive design token system built on CSS custom properties. This guide explains how to customize and theme your WebShell applications.

## Design Token Architecture

Design tokens are the foundational values that define your application's visual design. They are organized into categories:

### Token Categories

1. **Colors** - Surface colors, semantic colors, state colors
2. **Spacing** - Consistent spacing scale
3. **Typography** - Font families, sizes, weights, line heights
4. **Borders** - Border radius and width values
5. **Elevation** - Shadow values for depth
6. **Animation** - Duration and easing functions

## Understanding the Token System

### Color Tokens

WebShell uses a Material Design-inspired color system:

```css
/* Surface Colors - Background layers */
--color-surface          /* Base surface color */
--color-surface-high     /* Elevated surface (1 level up) */
--color-surface-highest  /* Most elevated surface (2 levels up) */
--color-surface-low      /* Recessed surface (1 level down) */
--color-background       /* Root background color */

/* Text Colors */
--color-text             /* Primary text color */
--color-text-secondary   /* Secondary/muted text color */

/* Brand Colors */
--color-primary          /* Primary brand color */
--color-on-primary       /* Text/icons on primary color */
--color-primary-container     /* Primary color container background */
--color-on-primary-container  /* Text/icons on primary container */

/* Semantic Colors */
--color-error            /* Error state color */
--color-warning          /* Warning state color */
--color-success          /* Success state color */
--color-info             /* Info state color */

/* Border Colors */
--color-border           /* Default border color */
--color-border-focus     /* Border color on focus */
```

### Spacing Tokens

Consistent spacing creates visual rhythm:

```css
--space-xs   /* 4px  - Tight spacing */
--space-s    /* 8px  - Small spacing */
--space-m    /* 16px - Medium spacing (base) */
--space-l    /* 24px - Large spacing */
--space-xl   /* 32px - Extra large spacing */
--space-xxl  /* 48px - 2x extra large spacing */
```

### Typography Tokens

```css
/* Font Families */
--font-base       /* Base sans-serif font */
--font-monospace  /* Monospace font for code */
--font-heading    /* Heading font */

/* Font Sizes */
--font-size-xs    /* 12px */
--font-size-s     /* 14px */
--font-size-m     /* 16px - Base size */
--font-size-l     /* 18px */
--font-size-xl    /* 20px */
--font-size-xxl   /* 24px */
--font-size-xxxl  /* 32px */

/* Font Weights */
--font-weight-normal    /* 400 */
--font-weight-medium    /* 500 */
--font-weight-semibold  /* 600 */
--font-weight-bold      /* 700 */

/* Line Heights */
--line-height-tight    /* 1.2 - For headings */
--line-height-normal   /* 1.5 - For body text */
--line-height-relaxed  /* 1.75 - For large text */
```

## Creating Custom Themes

### Method 1: Override CSS Variables

Create a custom CSS file that overrides the default tokens:

```css
/* custom-theme.css */
:root {
  /* Override primary color */
  --color-primary: #3b82f6;
  --color-on-primary: #ffffff;

  /* Override surface colors for a lighter theme */
  --color-surface: #f5f5f5;
  --color-surface-high: #ffffff;
  --color-text: #1a1a1a;

  /* Adjust spacing scale */
  --space-m: 20px;
  --space-l: 30px;
}
```

Include it after the default tokens:

```html
<link rel="stylesheet" href="../src/style/tokens.css">
<link rel="stylesheet" href="./custom-theme.css">
<link rel="stylesheet" href="../src/ui/styles/components.css">
```

### Method 2: Dynamic Theme Switching

Use JavaScript to switch between themes:

```javascript
function loadTheme(themeName) {
  // Remove existing theme
  const existingTheme = document.getElementById('theme-override');
  if (existingTheme) {
    existingTheme.remove();
  }

  // Load new theme
  const link = document.createElement('link');
  link.id = 'theme-override';
  link.rel = 'stylesheet';
  link.href = `/themes/${themeName}.css`;
  document.head.appendChild(link);
}

// Usage
loadTheme('dark');  // Load dark theme
loadTheme('light'); // Load light theme
```

### Method 3: Inline Style Override

For component-specific theming:

```html
<div class="ws-panel" style="--color-surface: #2a2a2a;">
  <!-- This panel will use a custom surface color -->
  <h3 class="ws-heading ws-heading--h3">Custom Themed Panel</h3>
</div>
```

## Example: Creating a Light Theme

Create `themes/light.css`:

```css
:root {
  /* Surface Colors */
  --color-surface: #ffffff;
  --color-surface-high: #f5f5f5;
  --color-surface-highest: #eeeeee;
  --color-surface-low: #fafafa;
  --color-background: #f5f5f5;

  /* Text Colors */
  --color-text: #1a1a1a;
  --color-text-secondary: #666666;

  /* Primary Colors */
  --color-primary: #3b82f6;
  --color-on-primary: #ffffff;
  --color-primary-container: #dbeafe;
  --color-on-primary-container: #1e40af;

  /* Border Colors */
  --color-border: #d1d5db;
  --color-border-focus: #9ca3af;

  /* Shadows - lighter for light theme */
  --shadow-low: 0 2px 4px rgba(0,0,0,0.05);
  --shadow-medium: 0 4px 8px rgba(0,0,0,0.08);
  --shadow-high: 0 8px 16px rgba(0,0,0,0.12);
}
```

## Wallpaper-Based Theming with Matugen

WebShell supports automatic theme generation from wallpapers using Matugen:

```bash
# Generate theme from wallpaper
matugen image /path/to/wallpaper.png --mode dark --type scheme-content
```

This generates color tokens that can be imported into WebShell.

## Best Practices

### 1. Use Semantic Tokens

Instead of hardcoding colors, always use semantic tokens:

```css
/* Good */
.my-component {
  background: var(--color-surface);
  color: var(--color-text);
}

/* Avoid */
.my-component {
  background: #1a1a1a;
  color: #e3e3e3;
}
```

### 2. Respect the Spacing Scale

Use the predefined spacing tokens for consistency:

```css
/* Good */
.my-component {
  padding: var(--space-m);
  margin-bottom: var(--space-l);
}

/* Avoid */
.my-component {
  padding: 17px;
  margin-bottom: 25px;
}
```

### 3. Maintain Contrast Ratios

Ensure text meets WCAG accessibility standards:
- Normal text: 4.5:1 contrast ratio
- Large text (18px+): 3:1 contrast ratio

### 4. Test Both Themes

Always test your components in both light and dark themes to ensure proper contrast and readability.

## Accessing Design Tokens in JavaScript

```javascript
// Get computed token value
const styles = getComputedStyle(document.documentElement);
const primaryColor = styles.getPropertyValue('--color-primary').trim();

// Set token value dynamically
document.documentElement.style.setProperty('--color-primary', '#3b82f6');

// Create theme object from all tokens
function getThemeTokens() {
  const styles = getComputedStyle(document.documentElement);
  return {
    colors: {
      primary: styles.getPropertyValue('--color-primary').trim(),
      surface: styles.getPropertyValue('--color-surface').trim(),
      // ... more colors
    },
    spacing: {
      m: styles.getPropertyValue('--space-m').trim(),
      l: styles.getPropertyValue('--space-l').trim(),
      // ... more spacing
    }
  };
}
```

## Token Reference

For a complete reference of all available design tokens, view the **Design Tokens** page in the [Component Showcase](../showcase/index.html).

## Migration from QML Theming

If you're migrating from QML-based QuickShell themes:

| QML Property | WebShell Token |
|--------------|----------------|
| `Appearance.colors.colSurface` | `--color-surface` |
| `Appearance.colors.colPrimary` | `--color-primary` |
| `Appearance.spacing.m` | `--space-m` |
| `Appearance.font.pixelSize.normal` | `--font-size-m` |
| `Appearance.rounding.normal` | `--radius-m` |

WebShell tokens are directly generated from the QML design system for consistency across QML and web components.
