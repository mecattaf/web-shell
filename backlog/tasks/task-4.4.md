---
id: task-4.4
title: Implement theme API
status: Done
created_date: 2025-01-18
milestone: milestone-4
assignees: []
labels: [sdk, implementation]
dependencies: [task-4.2, task-2.3, task-2.4]
---

## Description

Implement the theme module that provides WebShell apps access to design tokens and theme changes. This ensures visual consistency between QML and web components.

## Acceptance Criteria

- [ ] Theme module implemented
- [ ] All token categories accessible
- [ ] Theme change events working
- [ ] CSS variable injection functional
- [ ] Hot reload support
- [ ] Tests passing

## Implementation Plan

1. **Create Theme Module**
```typescript
// src/modules/theme.ts

import { Bridge } from '../bridge';
import { Theme, ColorTokens, SpacingTokens, TypographyTokens } from '../types';

export class ThemeModule {
  private bridge: Bridge;
  private currentTheme: Theme | null = null;
  private changeHandlers: Set<(theme: Theme) => void> = new Set();
  
  constructor(bridge: Bridge) {
    this.bridge = bridge;
    this.setupThemeHandling();
  }
  
  // Get current theme
  async getTheme(): Promise<Theme> {
    if (!this.currentTheme) {
      const themeData = await this.bridge.call('theme.getTheme');
      this.currentTheme = JSON.parse(themeData);
    }
    return this.currentTheme;
  }
  
  // Token accessors
  async getColors(): Promise<ColorTokens> {
    const theme = await this.getTheme();
    return theme.colors;
  }
  
  async getSpacing(): Promise<SpacingTokens> {
    const theme = await this.getTheme();
    return theme.spacing;
  }
  
  async getTypography(): Promise<TypographyTokens> {
    const theme = await this.getTheme();
    return theme.typography;
  }
  
  async getRadii(): Promise<RadiusTokens> {
    const theme = await this.getTheme();
    return theme.radii;
  }
  
  // Apply theme to DOM
  async applyTheme(): Promise<void> {
    const theme = await this.getTheme();
    this.injectCSSVariables(theme);
  }
  
  // Watch for changes
  onChange(handler: (theme: Theme) => void): () => void {
    this.changeHandlers.add(handler);
    return () => this.changeHandlers.delete(handler);
  }
  
  private setupThemeHandling(): void {
    this.bridge.on('theme-change', (themeData: string) => {
      const theme = JSON.parse(themeData);
      this.currentTheme = theme;
      
      // Auto-apply to DOM
      this.injectCSSVariables(theme);
      
      // Notify handlers
      this.changeHandlers.forEach(handler => {
        try {
          handler(theme);
        } catch (err) {
          console.error('[Theme] Change handler error:', err);
        }
      });
    });
  }
  
  private injectCSSVariables(theme: Theme): void {
    const root = document.documentElement;
    
    // Colors
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
    
    // Spacing
    Object.entries(theme.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--space-${key}`, value);
    });
    
    // Typography
    root.style.setProperty('--font-sans', theme.typography.fontFamily);
    Object.entries(theme.typography.sizes).forEach(([key, value]) => {
      root.style.setProperty(`--font-size-${key}`, value);
    });
    
    // Radii
    Object.entries(theme.radii).forEach(([key, value]) => {
      root.style.setProperty(`--radius-${key}`, value);
    });
    
    // Shadows
    Object.entries(theme.shadows).forEach(([key, value]) => {
      root.style.setProperty(`--shadow-${key}`, value);
    });
    
    // Animation timings
    Object.entries(theme.animation).forEach(([key, value]) => {
      root.style.setProperty(`--timing-${key}`, value);
    });
  }
  
  // Convenience getters
  get colors(): Promise<ColorTokens> {
    return this.getColors();
  }
  
  get spacing(): Promise<SpacingTokens> {
    return this.getSpacing();
  }
  
  get typography(): Promise<TypographyTokens> {
    return this.getTypography();
  }
}
```

2. **Add QML Theme Interface**
```qml
// In WebShellApi.qml
QtObject {
    id: api
    
    // Signals
    signal themeChanged(string theme)
    
    // Get theme
    function getTheme() {
        const theme = {
            colors: {
                surface: WebShellTheme.colSurface.toString(),
                surfaceHigh: WebShellTheme.colSurfaceHigh.toString(),
                primary: WebShellTheme.colPrimary.toString(),
                onPrimary: WebShellTheme.colOnPrimary.toString(),
                // ... all color tokens
            },
            spacing: {
                xs: WebShellTheme.spaceXs,
                s: WebShellTheme.spaceS,
                m: WebShellTheme.spaceM,
                l: WebShellTheme.spaceL,
                xl: WebShellTheme.spaceXl
            },
            typography: {
                fontFamily: WebShellTheme.fontSans,
                sizes: {
                    xs: WebShellTheme.fontSizeXs + "px",
                    sm: WebShellTheme.fontSizeSm + "px",
                    md: WebShellTheme.fontSizeMd + "px",
                    lg: WebShellTheme.fontSizeLg + "px"
                }
            },
            radii: {
                sm: WebShellTheme.radiusSm + "px",
                md: WebShellTheme.radiusMd + "px",
                lg: WebShellTheme.radiusLg + "px",
                full: WebShellTheme.radiusFull + "px"
            },
            shadows: {
                "1": WebShellTheme.shadow1,
                "2": WebShellTheme.shadow2,
                "3": WebShellTheme.shadow3
            },
            animation: {
                short: WebShellTheme.timingShort,
                medium: WebShellTheme.timingMedium,
                long: WebShellTheme.timingLong
            }
        };
        
        return JSON.stringify(theme);
    }
    
    // Watch for theme changes
    Connections {
        target: WebShellTheme
        function onThemeChanged() {
            api.themeChanged(api.getTheme());
        }
    }
}
```

3. **Create Theme Types**
```typescript
// src/types/theme.ts

export interface Theme {
  colors: ColorTokens;
  spacing: SpacingTokens;
  typography: TypographyTokens;
  radii: RadiusTokens;
  shadows: ShadowTokens;
  animation: AnimationTokens;
}

export interface ColorTokens {
  // Surfaces
  surface: string;
  surfaceHigh: string;
  surfaceHighest: string;
  onSurface: string;
  onSurfaceVariant: string;
  
  // Primary
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  
  // Secondary
  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  
  // Tertiary
  tertiary: string;
  onTertiary: string;
  
  // Error
  error: string;
  onError: string;
  
  // Outline
  outline: string;
  outlineVariant: string;
  
  // Background
  background: string;
  onBackground: string;
}

export interface SpacingTokens {
  xs: string;  // 4px
  s: string;   // 8px
  m: string;   // 16px
  l: string;   // 24px
  xl: string;  // 32px
}

export interface TypographyTokens {
  fontFamily: string;
  sizes: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

export interface RadiusTokens {
  sm: string;
  md: string;
  lg: string;
  full: string;
}

export interface ShadowTokens {
  "1": string;
  "2": string;
  "3": string;
}

export interface AnimationTokens {
  short: string;
  medium: string;
  long: string;
}
```

4. **Create Theme Utilities**
```typescript
// src/utils/theme.ts

import { Theme } from '../types';

export class ThemeUtils {
  static getCSSVariableName(category: string, key: string): string {
    return `--${category}-${key}`;
  }
  
  static getColorWithOpacity(color: string, opacity: number): string {
    // Parse color and apply opacity
    const rgb = this.parseColor(color);
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
  }
  
  static parseColor(color: string): { r: number; g: number; b: number } {
    // Simple color parsing
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16)
      };
    }
    
    // Parse rgb/rgba
    const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (match) {
      return {
        r: parseInt(match[1]),
        g: parseInt(match[2]),
        b: parseInt(match[3])
      };
    }
    
    throw new Error(`Cannot parse color: ${color}`);
  }
  
  static createThemeCSS(theme: Theme): string {
    let css = ':root {\n';
    
    // Colors
    Object.entries(theme.colors).forEach(([key, value]) => {
      css += `  --color-${key}: ${value};\n`;
    });
    
    // Spacing
    Object.entries(theme.spacing).forEach(([key, value]) => {
      css += `  --space-${key}: ${value};\n`;
    });
    
    // Typography
    css += `  --font-sans: ${theme.typography.fontFamily};\n`;
    Object.entries(theme.typography.sizes).forEach(([key, value]) => {
      css += `  --font-size-${key}: ${value};\n`;
    });
    
    // Radii
    Object.entries(theme.radii).forEach(([key, value]) => {
      css += `  --radius-${key}: ${value};\n`;
    });
    
    css += '}\n';
    return css;
  }
}
```

5. **Add Auto-Theme Initialization**
```typescript
// src/index.ts

class WebShellSDK {
  // ... existing code
  
  async initialize(): Promise<void> {
    await this.bridge.initialize();
    
    // Auto-apply theme
    await this.theme.applyTheme();
    
    // Watch for changes
    this.theme.onChange(theme => {
      console.log('[WebShell] Theme updated');
    });
    
    this.lifecycle.ready(() => {
      console.log('[WebShell SDK] Ready');
    });
  }
}
```

6. **Create React Hook**
```typescript
// src/react/useTheme.ts

import { useState, useEffect } from 'react';
import { webshell } from '../index';
import { Theme } from '../types';

export function useTheme(): Theme | null {
  const [theme, setTheme] = useState<Theme | null>(null);
  
  useEffect(() => {
    webshell.theme.getTheme().then(setTheme);
    
    return webshell.theme.onChange(setTheme);
  }, []);
  
  return theme;
}

export function useThemeColor(key: keyof ColorTokens): string {
  const theme = useTheme();
  return theme?.colors[key] || '';
}
```

## Technical Notes

**Usage Example**:
```typescript
import { webshell } from 'webshell-sdk';

// Get theme
const theme = await webshell.theme.getTheme();
console.log('Primary color:', theme.colors.primary);

// Watch for changes
webshell.theme.onChange(theme => {
  console.log('Theme changed!', theme);
});

// Theme is auto-applied to CSS variables
// Use in your CSS:
.button {
  background: var(--color-primary);
  color: var(--color-on-primary);
  padding: var(--space-m);
  border-radius: var(--radius-md);
}
```

**React Example**:
```tsx
import { useTheme, useThemeColor } from 'webshell-sdk/react';

function MyComponent() {
  const theme = useTheme();
  const primary = useThemeColor('primary');
  
  return (
    <div style={{ color: primary }}>
      Theme: {theme?.colors.primary}
    </div>
  );
}
```

**Tailwind Integration**:
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        surface: 'var(--color-surface)',
      },
      spacing: {
        xs: 'var(--space-xs)',
        s: 'var(--space-s)',
        m: 'var(--space-m)',
      }
    }
  }
};
```

## Reference Material

Study design token systems:
- Style Dictionary
- Tailwind CSS config
- Material Design tokens

## Definition of Done

- Theme module implemented
- All tokens accessible
- CSS injection working
- Theme changes propagate
- React hooks available
- Git commit: "task-4.4: Implement theme API"
