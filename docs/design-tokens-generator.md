# Design Tokens CSS Variable Generator

## Overview

The CSS Variable Generator is a tool that reads design tokens from JSON and generates CSS custom properties and TypeScript definitions. This enables web apps to use the same theme values as QML widgets, ensuring consistency across the entire WebShell design system.

## Features

- ✅ Reads design tokens from `design-tokens.json`
- ✅ Generates CSS custom properties (variables)
- ✅ Generates TypeScript type definitions
- ✅ Supports multiple output formats
- ✅ Handles semantic color roles correctly
- ✅ CLI tool for easy regeneration
- ✅ Auto-generated utility classes for WebShell panels

## Quick Start

### Generate Tokens

```bash
# Generate all formats (CSS + TypeScript)
npm run tokens:generate

# Validate tokens
npm run tokens:validate

# Use CLI directly
npm run tokens:cli generate
```

## Output Files

The generator creates two main files:

1. **`src/style/tokens.css`** - CSS custom properties
2. **`src/style/tokens.d.ts`** - TypeScript type definitions

## Usage in Your Code

### CSS

Import the generated tokens in your CSS/SCSS:

```css
@import 'src/style/tokens.css';

.my-component {
  background: var(--color-surface);
  color: var(--color-text);
  padding: var(--space-m);
  border-radius: var(--radius-l);
  box-shadow: var(--shadow-low);
}
```

### React/TypeScript

```typescript
import type { ColorToken, SpacingToken } from './style/tokens';

interface ButtonProps {
  color?: ColorToken;
  spacing?: SpacingToken;
}

const Button: React.FC<ButtonProps> = ({ color = 'primary', spacing = 'm' }) => {
  return (
    <button
      style={{
        backgroundColor: `var(--color-${color})`,
        padding: `var(--space-${spacing})`,
      }}
    >
      Click me
    </button>
  );
};
```

### Styled Components

```typescript
import styled from 'styled-components';

const Panel = styled.div`
  background: var(--color-surface);
  border-radius: var(--radius-l);
  padding: var(--space-m);
  box-shadow: var(--shadow-low);

  &:hover {
    background: var(--color-surface-high);
    transition: background var(--duration-fast) var(--easing-standard);
  }
`;
```

## Utility Classes

The generator also creates utility classes for common WebShell components:

```html
<!-- Basic panel -->
<div class="ws-panel">
  Content goes here
</div>

<!-- High elevation panel -->
<div class="ws-panel-high">
  Elevated content
</div>
```

## Token Categories

The generator supports the following token categories:

### Colors
- Surface colors (surface, surface-high, surface-highest, surface-low)
- Text colors (text, text-secondary)
- Primary, secondary, tertiary colors and their variants
- Semantic colors (error, warning, success, info)
- Border colors

### Spacing
- xs, s, m, l, xl, xxl

### Typography
- Font families (base, monospace, heading)
- Font sizes (xs, s, m, l, xl, xxl, xxxl)
- Font weights (normal, medium, semibold, bold)
- Line heights (tight, normal, relaxed)

### Elevation
- Shadow levels (none, low, medium, high)

### Border
- Border radius (none, s, m, l, xl, full)
- Border width (thin, medium, thick)

### Animation
- Duration (fast, normal, slow)
- Easing (standard, decelerate, accelerate)

## CSS Variable Naming Convention

The generator uses a consistent naming convention:

- Colors: `--color-{name}`
- Spacing: `--space-{size}`
- Typography: `--font-{property}-{value}`
- Elevation: `--shadow-{level}`
- Border: `--radius-{size}` or `--border-{property}`
- Animation: `--duration-{speed}` or `--easing-{type}`

## Modifying Design Tokens

1. Edit `src/style/design-tokens.json`
2. Run `npm run tokens:generate`
3. The CSS and TypeScript files will be updated automatically

**Important:** Never edit the generated `tokens.css` or `tokens.d.ts` files directly, as they will be overwritten.

## CLI Tool

The CLI tool provides additional functionality:

```bash
# Show help
npm run tokens:cli help

# Validate tokens
npm run tokens:cli validate

# Generate tokens
npm run tokens:cli generate

# Generate only CSS
npm run tokens:cli generate --format=css

# Generate only TypeScript
npm run tokens:cli generate --format=ts
```

## Architecture

### Generator Flow

```
design-tokens.json
       ↓
generate-css-vars.js
       ↓
    ┌──┴──┐
    ↓     ↓
tokens.css  tokens.d.ts
```

### File Structure

```
web-shell/
├── src/
│   └── style/
│       ├── design-tokens.json       # Source of truth
│       ├── design-tokens.schema.json
│       ├── tokens.css               # Generated CSS
│       └── tokens.d.ts              # Generated TypeScript
└── tools/
    ├── generate-css-vars.js         # Main generator
    └── webshell-tokens.js           # CLI tool
```

## Integration with Build Process

The generator is designed to be run manually or as part of your build process. To integrate with your build:

1. **Pre-build hook**: Run token generation before building

```json
{
  "scripts": {
    "prebuild": "npm run tokens:generate",
    "build": "vite build"
  }
}
```

2. **Watch mode**: Currently manual, watch mode planned for future

## Troubleshooting

### Tokens not updating in browser

1. Clear browser cache
2. Hard reload (Ctrl+Shift+R or Cmd+Shift+R)
3. Ensure `tokens.css` is imported in your main CSS/JS entry point

### Type errors with TypeScript

1. Ensure `tokens.d.ts` is in your TypeScript include path
2. Run `npm run tokens:generate` to regenerate types
3. Restart your TypeScript server

### Validation errors

```bash
npm run tokens:validate
```

This will check:
- JSON syntax validity
- Schema compliance
- Required sections presence

## Examples

### Creating a themed component

```typescript
import React from 'react';
import type { ColorToken } from './style/tokens';

interface CardProps {
  variant?: 'surface' | 'surface-high' | 'surface-highest';
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ variant = 'surface', children }) => {
  return (
    <div
      style={{
        background: `var(--color-${variant})`,
        borderRadius: 'var(--radius-l)',
        padding: 'var(--space-m)',
        boxShadow: 'var(--shadow-low)',
      }}
    >
      {children}
    </div>
  );
};
```

### Using animation tokens

```css
.fade-in {
  animation: fadeIn var(--duration-normal) var(--easing-decelerate);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
```

## Future Enhancements

- [ ] Watch mode for automatic regeneration
- [ ] Dark/light theme variants
- [ ] Additional output formats (SCSS variables, CSS modules)
- [ ] Token documentation generator
- [ ] Visual token preview page

## Related Documentation

- [Design Token Schema](../src/style/design-tokens.schema.json)
- [Design Tokens JSON](../src/style/design-tokens.json)
- [Task 2.1: Define JSON Schema](../../backlog/tasks/task-2.1.md)
- [Task 2.2: Extract DMS Theme](../../backlog/tasks/task-2.2.md)

## References

- [CSS Custom Properties (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [Design Tokens Community Group](https://www.w3.org/community/design-tokens/)
- [Style Dictionary](https://amzn.github.io/style-dictionary/)
