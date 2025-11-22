# Theme Module API

 

The Theme Module provides access to WebShell's design token system and theme management.

 

## Overview

 

The Theme Module (`webshell.theme`) allows WebShell applications to access and respond to theme tokens including:

 

- Color palettes and semantic colors

- Spacing and sizing scales

- Typography tokens (fonts, sizes, weights)

- Border radius values

- Real-time theme change notifications

- Automatic CSS variable injection

 

## Namespace

 

Access via: `webshell.theme`

 

## Color Tokens

 

### `getColors(): ColorTokens`

 

Returns the current theme color tokens.

 

**Returns:** [`ColorTokens`](../sdk-api-reference.md#colortokens) - Object containing all theme colors

 

**Example:**

```typescript

const colors = webshell.theme.getColors();

console.log(`Primary color: ${colors.primary}`);

console.log(`Surface color: ${colors.surface}`);

console.log(`Error color: ${colors.error}`);

```

 

**Available Colors:**

- **Surface**: `surface`, `surfaceHigh`, `surfaceLow`

- **Primary**: `primary`, `onPrimary`, `primaryContainer`, `onPrimaryContainer`

- **Secondary**: `secondary`, `onSecondary`, `secondaryContainer`, `onSecondaryContainer`

- **Tertiary**: `tertiary`, `onTertiary`, `tertiaryContainer`, `onTertiaryContainer`

- **Error**: `error`, `onError`, `errorContainer`, `onErrorContainer`

- **Background**: `background`, `onBackground`, `outline`, `outlineVariant`

 

---

 

### `colors: ColorTokens` (readonly)

 

Live-updated color tokens that automatically reflect theme changes.

 

**Example:**

```typescript

// Access colors directly

const primaryColor = webshell.theme.colors.primary;

const bgColor = webshell.theme.colors.background;

 

// Use in your UI

element.style.backgroundColor = webshell.theme.colors.surface;

element.style.color = webshell.theme.colors.onSurface;

```

 

**Notes:**

- This property updates automatically when the theme changes

- No need to manually refresh color values

- Use with `onThemeChange()` to trigger UI updates

 

---

 

## Spacing Tokens

 

### `getSpacing(): SpacingTokens`

 

Returns the current theme spacing scale.

 

**Returns:** [`SpacingTokens`](../sdk-api-reference.md#spacingtokens) - Object with spacing values

 

**Example:**

```typescript

const spacing = webshell.theme.getSpacing();

console.log(`XS: ${spacing.xs}`);     // "4px"

console.log(`SM: ${spacing.sm}`);     // "8px"

console.log(`MD: ${spacing.md}`);     // "16px"

console.log(`LG: ${spacing.lg}`);     // "24px"

console.log(`XL: ${spacing.xl}`);     // "32px"

console.log(`XXL: ${spacing.xxl}`);   // "48px"

```

 

**Notes:**

- Values are returned as CSS-compatible strings (e.g., "16px")

- Consistent spacing creates visual harmony

- Use for margins, padding, gaps, etc.

 

---

 

### `spacing: SpacingTokens` (readonly)

 

Live-updated spacing tokens.

 

**Example:**

```typescript

// Apply spacing to elements

element.style.padding = webshell.theme.spacing.md;

element.style.gap = webshell.theme.spacing.sm;

```

 

---

 

## Typography Tokens

 

### `getTypography(): TypographyTokens`

 

Returns the current theme typography tokens.

 

**Returns:** [`TypographyTokens`](../sdk-api-reference.md#typographytokens) - Typography configuration

 

**Example:**

```typescript

const typo = webshell.theme.getTypography();

console.log(`Font family: ${typo.fontFamily}`);

console.log(`Mono font: ${typo.fontFamilyMono}`);

console.log(`Base size: ${typo.fontSize.base}`);

console.log(`Bold weight: ${typo.fontWeight.bold}`);

console.log(`Normal line height: ${typo.lineHeight.normal}`);

```

 

**Typography Structure:**

- `fontFamily`: Main font family

- `fontFamilyMono`: Monospace font family

- `fontSize`: Size scale (xs, sm, base, lg, xl, xxl)

- `fontWeight`: Weight values (normal, medium, semibold, bold)

- `lineHeight`: Line height ratios (tight, normal, relaxed)

 

---

 

### `typography: TypographyTokens` (readonly)

 

Live-updated typography tokens.

 

**Example:**

```typescript

// Apply typography to elements

element.style.fontFamily = webshell.theme.typography.fontFamily;

element.style.fontSize = webshell.theme.typography.fontSize.lg;

element.style.fontWeight = webshell.theme.typography.fontWeight.semibold;

element.style.lineHeight = webshell.theme.typography.lineHeight.relaxed;

```

 

---

 

## Radius Tokens

 

### `getRadii(): RadiusTokens`

 

Returns the current theme border radius tokens.

 

**Returns:** [`RadiusTokens`](../sdk-api-reference.md#radiustokens) - Border radius values

 

**Example:**

```typescript

const radii = webshell.theme.getRadii();

console.log(`None: ${radii.none}`);   // "0"

console.log(`SM: ${radii.sm}`);       // "4px"

console.log(`MD: ${radii.md}`);       // "8px"

console.log(`LG: ${radii.lg}`);       // "12px"

console.log(`XL: ${radii.xl}`);       // "16px"

console.log(`Full: ${radii.full}`);   // "9999px"

```

 

---

 

### `radii: RadiusTokens` (readonly)

 

Live-updated radius tokens.

 

**Example:**

```typescript

// Apply radius to elements

element.style.borderRadius = webshell.theme.radii.md;

button.style.borderRadius = webshell.theme.radii.lg;

avatar.style.borderRadius = webshell.theme.radii.full;

```

 

---

 

## Complete Theme

 

### `getTheme(): Theme`

 

Returns the complete theme object with all token categories.

 

**Returns:** [`Theme`](../sdk-api-reference.md#theme) - Complete theme object

 

**Example:**

```typescript

const theme = webshell.theme.getTheme();

console.log('Colors:', theme.colors);

console.log('Spacing:', theme.spacing);

console.log('Typography:', theme.typography);

console.log('Radii:', theme.radii);

```

 

**Notes:**

- Convenient way to access all theme tokens at once

- Useful for passing theme to component libraries

- Contains all color, spacing, typography, and radius tokens

 

---

 

## Theme Change Events

 

### `onThemeChange(handler: EventHandler<Theme>): UnsubscribeFn`

 

Subscribes to theme change notifications.

 

**Parameters:**

- `handler` (EventHandler<Theme>): Function called when theme changes

 

**Returns:** [`UnsubscribeFn`](../sdk-api-reference.md#unsubscribefn) - Function to unsubscribe

 

**Example:**

```typescript

const unsubscribe = webshell.theme.onThemeChange((theme) => {

  console.log('Theme changed!');

  console.log('New primary color:', theme.colors.primary);

 

  // Update UI with new theme

  updateAppColors(theme.colors);

  updateAppSpacing(theme.spacing);

});

 

// Later: stop listening

unsubscribe();

```

 

**Notes:**

- Called whenever system theme changes (light/dark mode)

- Called when custom theme is applied

- Use to refresh UI elements that don't use CSS variables

 

---

 

## CSS Variable Integration

 

### `applyTheme(): void`

 

Applies the current theme as CSS custom properties to the document.

 

**Example:**

```typescript

// Apply theme on startup

webshell.ready(() => {

  webshell.theme.applyTheme();

 

  // Now use CSS variables

  document.body.style.backgroundColor = 'var(--color-background)';

  document.body.style.color = 'var(--color-on-background)';

});

```

 

**Generated CSS Variables:**

```css

/* Colors */

--color-primary: #...;

--color-on-primary: #...;

--color-surface: #...;

/* ... all color tokens */

 

/* Spacing */

--spacing-xs: 4px;

--spacing-sm: 8px;

--spacing-md: 16px;

/* ... all spacing tokens */

 

/* Typography */

--font-family: ...;

--font-size-base: 16px;

--font-weight-bold: 700;

/* ... all typography tokens */

 

/* Radius */

--radius-sm: 4px;

--radius-md: 8px;

/* ... all radius tokens */

```

 

**Notes:**

- Automatically called on theme changes

- Variables are injected into `:root` pseudo-class

- Enables theme usage in CSS files

- Variables update automatically on theme change

 

---

 

## Common Patterns

 

### Reactive UI with Theme Changes

 

Update UI elements when theme changes:

 

```typescript

webshell.ready(() => {

  // Initial theme application

  applyThemeToUI(webshell.theme.getTheme());

 

  // React to theme changes

  webshell.theme.onThemeChange((theme) => {

    applyThemeToUI(theme);

  });

});

 

function applyThemeToUI(theme: Theme) {

  // Update custom elements

  document.querySelectorAll('.card').forEach(card => {

    card.style.backgroundColor = theme.colors.surface;

    card.style.borderRadius = theme.radii.lg;

    card.style.padding = theme.spacing.md;

  });

 

  // Update text styles

  document.querySelectorAll('.heading').forEach(heading => {

    heading.style.fontFamily = theme.typography.fontFamily;

    heading.style.fontSize = theme.typography.fontSize.xl;

    heading.style.fontWeight = theme.typography.fontWeight.bold;

  });

}

```

 

### CSS-in-JS Theming

 

Use theme tokens with CSS-in-JS libraries:

 

```typescript

import { webshell } from 'webshell-sdk';

 

const theme = webshell.theme.getTheme();

 

const styles = {

  container: {

    backgroundColor: theme.colors.surface,

    padding: theme.spacing.lg,

    borderRadius: theme.radii.md,

    fontFamily: theme.typography.fontFamily

  },

 

  button: {

    backgroundColor: theme.colors.primary,

    color: theme.colors.onPrimary,

    padding: `${theme.spacing.sm} ${theme.spacing.md}`,

    borderRadius: theme.radii.md,

    fontSize: theme.typography.fontSize.base,

    fontWeight: theme.typography.fontWeight.medium

  }

};

 

// Apply styles

Object.assign(container.style, styles.container);

Object.assign(button.style, styles.button);

```

 

### CSS Variables Approach

 

Use theme via CSS custom properties:

 

```typescript

// Apply theme once on startup

webshell.ready(() => {

  webshell.theme.applyTheme();

});

```

 

```css

/* Use in CSS files */

.card {

  background-color: var(--color-surface);

  border: 1px solid var(--color-outline);

  border-radius: var(--radius-lg);

  padding: var(--spacing-md);

  font-family: var(--font-family);

}

 

.button-primary {

  background-color: var(--color-primary);

  color: var(--color-on-primary);

  padding: var(--spacing-sm) var(--spacing-md);

  border-radius: var(--radius-md);

  font-size: var(--font-size-base);

  font-weight: var(--font-weight-medium);

}

 

.text-error {

  color: var(--color-error);

}

```

 

### Component Library Integration

 

Create themed components:

 

```typescript

class ThemedButton extends HTMLElement {

  constructor() {

    super();

    this.attachShadow({ mode: 'open' });

    this.render();

 

    // Update on theme change

    webshell.theme.onThemeChange(() => this.render());

  }

 

  render() {

    const theme = webshell.theme.getTheme();

 

    this.shadowRoot.innerHTML = `

      <style>

        button {

          background-color: ${theme.colors.primary};

          color: ${theme.colors.onPrimary};

          padding: ${theme.spacing.sm} ${theme.spacing.md};

          border: none;

          border-radius: ${theme.radii.md};

          font-family: ${theme.typography.fontFamily};

          font-size: ${theme.typography.fontSize.base};

          font-weight: ${theme.typography.fontWeight.medium};

          cursor: pointer;

          transition: opacity 0.2s;

        }

 

        button:hover {

          opacity: 0.9;

        }

      </style>

      <button><slot></slot></button>

    `;

  }

}

 

customElements.define('themed-button', ThemedButton);

```

 

### Dark Mode Detection

 

Check and respond to dark mode:

 

```typescript

function isDarkMode(): boolean {

  const colors = webshell.theme.getColors();

  // Dark mode typically has dark background colors

  // This is a simple heuristic

  const bg = colors.background;

  // Parse and check luminance (simplified)

  return bg.startsWith('#') && parseInt(bg.slice(1, 3), 16) < 128;

}

 

webshell.theme.onThemeChange(() => {

  if (isDarkMode()) {

    console.log('Dark mode enabled');

    enableDarkModeFeatures();

  } else {

    console.log('Light mode enabled');

    enableLightModeFeatures();

  }

});

```

 

## Semantic Color Usage

 

### Surface Colors

 

Use surface colors for containers and backgrounds:

 

```typescript

const colors = webshell.theme.getColors();

 

// Base surface

card.style.backgroundColor = colors.surface;

 

// Elevated surfaces (e.g., modals, dropdowns)

modal.style.backgroundColor = colors.surfaceHigh;

 

// Sunken surfaces (e.g., input fields)

input.style.backgroundColor = colors.surfaceLow;

```

 

### Action Colors

 

Use semantic colors for actions and states:

 

```typescript

const colors = webshell.theme.getColors();

 

// Primary actions (main CTA buttons)

saveButton.style.backgroundColor = colors.primary;

saveButton.style.color = colors.onPrimary;

 

// Secondary actions (cancel, alternative options)

cancelButton.style.backgroundColor = colors.secondary;

cancelButton.style.color = colors.onSecondary;

 

// Destructive actions (delete, remove)

deleteButton.style.backgroundColor = colors.error;

deleteButton.style.color = colors.onError;

```

 

### Text and Outlines

 

Use appropriate colors for text and borders:

 

```typescript

const colors = webshell.theme.getColors();

 

// Text colors

body.style.color = colors.onBackground;

heading.style.color = colors.onSurface;

 

// Borders and dividers

divider.style.borderColor = colors.outline;

subtleBorder.style.borderColor = colors.outlineVariant;

```

 

## Design System Best Practices

 

### Consistent Spacing

 

Use the spacing scale consistently:

 

```typescript

const spacing = webshell.theme.spacing;

 

// Compact spacing (inside components)

button.style.padding = `${spacing.xs} ${spacing.sm}`;

 

// Standard spacing (between elements)

section.style.gap = spacing.md;

section.style.marginBottom = spacing.lg;

 

// Generous spacing (between sections)

layout.style.padding = spacing.xl;

```

 

### Typography Hierarchy

 

Create clear typography hierarchy:

 

```typescript

const typo = webshell.theme.typography;

 

// Headings

h1.style.fontSize = typo.fontSize.xxl;

h1.style.fontWeight = typo.fontWeight.bold;

 

h2.style.fontSize = typo.fontSize.xl;

h2.style.fontWeight = typo.fontWeight.semibold;

 

// Body text

p.style.fontSize = typo.fontSize.base;

p.style.fontWeight = typo.fontWeight.normal;

p.style.lineHeight = typo.lineHeight.relaxed;

 

// Small text

caption.style.fontSize = typo.fontSize.sm;

caption.style.lineHeight = typo.lineHeight.tight;

```

 

### Border Radius Consistency

 

Apply consistent border radius:

 

```typescript

const radii = webshell.theme.radii;

 

// Small elements (chips, tags)

chip.style.borderRadius = radii.sm;

 

// Standard elements (buttons, inputs)

button.style.borderRadius = radii.md;

input.style.borderRadius = radii.md;

 

// Large elements (cards, modals)

card.style.borderRadius = radii.lg;

 

// Circular elements (avatars)

avatar.style.borderRadius = radii.full;

```

 

## Error Handling

 

The Theme Module methods generally don't throw errors as they return the current theme state. However, they may throw `WebShellError` in exceptional cases:

 

```typescript

import { WebShellError } from 'webshell-sdk';

 

try {

  const theme = webshell.theme.getTheme();

  webshell.theme.applyTheme();

} catch (err) {

  if (err instanceof WebShellError) {

    if (err.code === 'BRIDGE_NOT_INITIALIZED') {

      console.error('SDK not ready. Use webshell.ready() first.');

    }

  }

}

```

 

**Note:** Always ensure the SDK is ready before accessing theme tokens:

 

```typescript

webshell.ready(() => {

  // Safe to access theme now

  const colors = webshell.theme.getColors();

});

```

 

## Related Documentation

 

- [Design Token System](../theming.md) - Complete theme specification

- [Styling Guide](../guides/styling.md) - Best practices for styling WebShell apps

- [Window Module](./window.md) - Window appearance and transparency

- [Component Library](../components.md) - Pre-built themed components

 
