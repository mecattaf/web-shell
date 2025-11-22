---
id: task-2.3
title: Build CSS variable generator
status: Completed
created_date: 2025-01-18
milestone: milestone-2
assignees: []
labels: [design-system, tooling]
dependencies: [task-2.2]
---

## Description

Create a tool that reads design token JSON and generates CSS custom properties (variables). This enables web apps to use the same theme values as QML widgets.

## Acceptance Criteria

- [x] Generator script reads token JSON
- [x] Outputs valid CSS with custom properties
- [x] Supports multiple output formats (root vars, layer vars)
- [x] Handles semantic color roles correctly
- [x] Generates TypeScript definitions
- [x] CLI tool for regeneration
- [x] Documentation for usage

## Implementation Plan

1. **Create Generator Script**
```javascript
// tools/generate-css-vars.js
import tokens from '../design-tokens.json';

function generateCSS(tokens) {
  let css = ':root {\n';
  
  // Colors
  for (const [key, value] of Object.entries(tokens.colors)) {
    css += `  --color-${key}: ${value.value};\n`;
  }
  
  // Spacing
  for (const [key, value] of Object.entries(tokens.spacing)) {
    css += `  --space-${key}: ${value.value};\n`;
  }
  
  // ... etc
  
  css += '}\n';
  return css;
}
```

2. **Support Multiple Themes**
   - Light mode variations
   - Dark mode variations
   - System theme detection

3. **Generate TypeScript Definitions**
```typescript
export interface DesignTokens {
  colors: {
    surface: string;
    primary: string;
    // ...
  };
  spacing: {
    xs: string;
    s: string;
    // ...
  };
}
```

4. **Create CLI Tool**
```bash
webshell-tokens generate --format=css --output=tokens.css
webshell-tokens generate --format=ts --output=tokens.d.ts
```

## Technical Notes

**Output Format (CSS)**:
```css
:root {
  /* Colors - Surfaces */
  --color-surface: #1a1a1a;
  --color-surface-high: #2a2a2a;
  --color-on-surface: rgba(255, 255, 255, 0.98);
  
  /* Colors - Primary */
  --color-primary: #ef8354;
  --color-on-primary: #000000;
  
  /* Spacing */
  --space-xs: 4px;
  --space-s: 8px;
  --space-m: 16px;
  --space-l: 24px;
  --space-xl: 32px;
  
  /* Typography */
  --font-sans: "Inter", system-ui, sans-serif;
  --font-size-xs: 12px;
  --font-size-sm: 14px;
  
  /* Radii */
  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 20px;
  --radius-full: 999px;
  
  /* Elevation */
  --shadow-1: 0 1px 2px rgba(0,0,0,.08);
  --shadow-2: 0 2px 4px rgba(0,0,0,.12);
  
  /* Animation */
  --timing-short: 120ms ease;
  --timing-medium: 180ms ease;
}
```

**Layer Support** (for WebShell containers):
```css
.ws-panel {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: var(--space-m);
}
```

## Reference Material

Similar tools to study:
- Style Dictionary (design token transformer)
- Tailwind CSS config
- Material Design token generation

## Definition of Done

- CSS generator script working
- Outputs match DMS theme values
- TypeScript definitions generated
- CLI tool functional
- Documentation written
- Git commit: "task-2.3: Build CSS variable generator"
