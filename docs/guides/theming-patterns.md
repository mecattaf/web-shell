# Advanced Theming Patterns Guide

 

Complete guide to implementing dynamic themes and design systems in WebShell applications.

 

## Table of Contents

 

1. [Overview](#overview)

2. [Design Token Usage](#design-token-usage)

3. [Custom Theme Creation](#custom-theme-creation)

4. [Dynamic Theme Switching](#dynamic-theme-switching)

5. [Theme Persistence](#theme-persistence)

6. [Component Theming](#component-theming)

7. [CSS-in-JS Patterns](#css-in-js-patterns)

8. [Framework Integration](#framework-integration)

9. [Complete Examples](#complete-examples)

 

---

 

## Overview

 

WebShell provides a powerful theming system based on Material 3 design tokens that can be customized and extended for your applications.

 

### Key Features

 

- **Material 3 tokens** with light/dark mode support

- **Automatic theme generation** from wallpaper

- **CSS variables** for easy integration

- **Type-safe** theme access via SDK

- **Real-time updates** across all apps

- **Framework agnostic** - works with React, Vue, Svelte, etc.

 

### Theme Structure

 

```typescript

interface Theme {

  colors: {

    // Primary colors

    primary: string;

    onPrimary: string;

    primaryContainer: string;

    onPrimaryContainer: string;

 

    // Secondary colors

    secondary: string;

    onSecondary: string;

    secondaryContainer: string;

    onSecondaryContainer: string;

 

    // Tertiary colors

    tertiary: string;

    onTertiary: string;

    tertiaryContainer: string;

    onTertiaryContainer: string;

 

    // Error colors

    error: string;

    onError: string;

    errorContainer: string;

    onErrorContainer: string;

 

    // Surface colors

    surface: string;

    onSurface: string;

    surfaceVariant: string;

    onSurfaceVariant: string;

 

    // Background colors

    background: string;

    onBackground: string;

 

    // Outline colors

    outline: string;

    outlineVariant: string;

 

    // Other

    shadow: string;

    scrim: string;

    inverseSurface: string;

    inverseOnSurface: string;

    inversePrimary: string;

  };

 

  spacing: {

    xs: string;    // 4px

    sm: string;    // 8px

    md: string;    // 16px

    lg: string;    // 24px

    xl: string;    // 32px

    '2xl': string; // 48px

    '3xl': string; // 64px

  };

 

  radii: {

    none: string;   // 0px

    sm: string;     // 4px

    md: string;     // 8px

    lg: string;     // 12px

    xl: string;     // 16px

    '2xl': string;  // 24px

    full: string;   // 9999px

  };

 

  typography: {

    displayLarge: TypographyStyle;

    displayMedium: TypographyStyle;

    displaySmall: TypographyStyle;

    headlineLarge: TypographyStyle;

    headlineMedium: TypographyStyle;

    headlineSmall: TypographyStyle;

    titleLarge: TypographyStyle;

    titleMedium: TypographyStyle;

    titleSmall: TypographyStyle;

    bodyLarge: TypographyStyle;

    bodyMedium: TypographyStyle;

    bodySmall: TypographyStyle;

    labelLarge: TypographyStyle;

    labelMedium: TypographyStyle;

    labelSmall: TypographyStyle;

  };

}

```

 

---

 

## Design Token Usage

 

### Accessing Theme Tokens

 

```typescript

webshell.ready(() => {

  // Get complete theme

  const theme = webshell.theme.getTheme();

 

  // Get specific token categories

  const colors = webshell.theme.getColors();

  const spacing = webshell.theme.getSpacing();

  const radii = webshell.theme.getRadii();

  const typography = webshell.theme.getTypography();

 

  console.log('Primary color:', colors.primary);

  console.log('Medium spacing:', spacing.md);

});

```

 

### Using CSS Variables

 

Theme tokens are automatically injected as CSS variables:

 

```css

/* Use theme colors */

.button {

  background-color: var(--color-primary);

  color: var(--color-on-primary);

  padding: var(--spacing-md);

  border-radius: var(--radius-md);

}

 

/* Use typography tokens */

.heading {

  font-family: var(--font-headline-large-family);

  font-size: var(--font-headline-large-size);

  font-weight: var(--font-headline-large-weight);

  line-height: var(--font-headline-large-line-height);

}

 

/* Surface containers */

.card {

  background-color: var(--color-surface);

  color: var(--color-on-surface);

  border: 1px solid var(--color-outline);

}

```

 

### Apply Theme Automatically

 

```typescript

webshell.ready(() => {

  // Inject theme CSS variables into :root

  webshell.theme.applyTheme();

 

  // Listen for theme changes

  webshell.theme.onThemeChange((theme) => {

    console.log('Theme updated:', theme);

    // Theme variables automatically updated

  });

});

```

 

### Reading Current Theme Mode

 

```typescript

function getCurrentMode(): 'light' | 'dark' {

  const theme = webshell.theme.getTheme();

 

  // Check if background is dark

  const bg = theme.colors.background;

  const rgb = hexToRgb(bg);

  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;

 

  return brightness < 128 ? 'dark' : 'light';

}

 

function hexToRgb(hex: string): { r: number; g: number; b: number } {

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

  return result ? {

    r: parseInt(result[1], 16),

    g: parseInt(result[2], 16),

    b: parseInt(result[3], 16)

  } : { r: 0, g: 0, b: 0 };

}

```

 

---

 

## Custom Theme Creation

 

### Creating a Custom Theme

 

```typescript

interface CustomTheme extends Theme {

  custom: {

    success: string;

    warning: string;

    info: string;

    highlightColor: string;

    dimmedText: string;

  };

}

 

class ThemeBuilder {

  private baseTheme: Theme;

 

  constructor(baseTheme: Theme) {

    this.baseTheme = baseTheme;

  }

 

  build(): CustomTheme {

    return {

      ...this.baseTheme,

      custom: {

        success: '#4caf50',

        warning: '#ff9800',

        info: '#2196f3',

        highlightColor: this.lighten(this.baseTheme.colors.primary, 0.3),

        dimmedText: this.adjustOpacity(this.baseTheme.colors.onSurface, 0.6)

      }

    };

  }

 

  private lighten(color: string, amount: number): string {

    const rgb = this.hexToRgb(color);

    const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);

 

    hsl.l = Math.min(100, hsl.l + amount * 100);

 

    return this.hslToHex(hsl.h, hsl.s, hsl.l);

  }

 

  private adjustOpacity(color: string, opacity: number): string {

    return `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;

  }

 

  private hexToRgb(hex: string): { r: number; g: number; b: number } {

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    return result ? {

      r: parseInt(result[1], 16),

      g: parseInt(result[2], 16),

      b: parseInt(result[3], 16)

    } : { r: 0, g: 0, b: 0 };

  }

 

  private rgbToHsl(r: number, g: number, b: number) {

    r /= 255; g /= 255; b /= 255;

 

    const max = Math.max(r, g, b);

    const min = Math.min(r, g, b);

    let h = 0, s = 0, l = (max + min) / 2;

 

    if (max !== min) {

      const d = max - min;

      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

 

      switch (max) {

        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;

        case g: h = ((b - r) / d + 2) / 6; break;

        case b: h = ((r - g) / d + 4) / 6; break;

      }

    }

 

    return { h: h * 360, s: s * 100, l: l * 100 };

  }

 

  private hslToHex(h: number, s: number, l: number): string {

    s /= 100;

    l /= 100;

 

    const c = (1 - Math.abs(2 * l - 1)) * s;

    const x = c * (1 - Math.abs((h / 60) % 2 - 1));

    const m = l - c / 2;

 

    let r = 0, g = 0, b = 0;

 

    if (h < 60) { r = c; g = x; b = 0; }

    else if (h < 120) { r = x; g = c; b = 0; }

    else if (h < 180) { r = 0; g = c; b = x; }

    else if (h < 240) { r = 0; g = x; b = c; }

    else if (h < 300) { r = x; g = 0; b = c; }

    else { r = c; g = 0; b = x; }

 

    const toHex = (n: number) =>

      Math.round((n + m) * 255).toString(16).padStart(2, '0');

 

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;

  }

}

 

// Usage

webshell.ready(() => {

  const baseTheme = webshell.theme.getTheme();

  const builder = new ThemeBuilder(baseTheme);

  const customTheme = builder.build();

 

  // Apply custom theme

  applyCustomTheme(customTheme);

});

 

function applyCustomTheme(theme: CustomTheme) {

  const root = document.documentElement;

 

  // Apply custom colors

  root.style.setProperty('--color-success', theme.custom.success);

  root.style.setProperty('--color-warning', theme.custom.warning);

  root.style.setProperty('--color-info', theme.custom.info);

  root.style.setProperty('--color-highlight', theme.custom.highlightColor);

  root.style.setProperty('--color-dimmed-text', theme.custom.dimmedText);

}

```

 

### Semantic Color Tokens

 

```typescript

class SemanticTokens {

  static create(theme: Theme) {

    const mode = this.getMode(theme);

 

    return {

      // Text colors

      textPrimary: theme.colors.onSurface,

      textSecondary: this.adjustOpacity(theme.colors.onSurface, 0.7),

      textTertiary: this.adjustOpacity(theme.colors.onSurface, 0.5),

      textDisabled: this.adjustOpacity(theme.colors.onSurface, 0.38),

 

      // Link colors

      linkDefault: theme.colors.primary,

      linkHover: theme.colors.primaryContainer,

      linkVisited: theme.colors.tertiary,

 

      // Border colors

      borderDefault: theme.colors.outline,

      borderFocus: theme.colors.primary,

      borderError: theme.colors.error,

 

      // Status colors

      statusSuccess: '#4caf50',

      statusWarning: '#ff9800',

      statusError: theme.colors.error,

      statusInfo: theme.colors.primary,

 

      // Interactive states

      hoverOverlay: mode === 'dark'

        ? 'rgba(255, 255, 255, 0.08)'

        : 'rgba(0, 0, 0, 0.04)',

      pressedOverlay: mode === 'dark'

        ? 'rgba(255, 255, 255, 0.12)'

        : 'rgba(0, 0, 0, 0.08)',

      focusOverlay: mode === 'dark'

        ? 'rgba(255, 255, 255, 0.12)'

        : 'rgba(0, 0, 0, 0.12)',

    };

  }

 

  private static getMode(theme: Theme): 'light' | 'dark' {

    const rgb = this.hexToRgb(theme.colors.background);

    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;

    return brightness < 128 ? 'dark' : 'light';

  }

 

  private static adjustOpacity(color: string, opacity: number): string {

    return `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;

  }

 

  private static hexToRgb(hex: string): { r: number; g: number; b: number } {

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    return result ? {

      r: parseInt(result[1], 16),

      g: parseInt(result[2], 16),

      b: parseInt(result[3], 16)

    } : { r: 0, g: 0, b: 0 };

  }

}

 

// Usage

const theme = webshell.theme.getTheme();

const semantic = SemanticTokens.create(theme);

 

// Apply to CSS

const root = document.documentElement;

Object.entries(semantic).forEach(([key, value]) => {

  root.style.setProperty(`--semantic-${key}`, value);

});

```

 

---

 

## Dynamic Theme Switching

 

### Theme Switcher

 

```typescript

type ThemeMode = 'light' | 'dark' | 'auto';

 

class ThemeSwitcher {

  private currentMode: ThemeMode = 'auto';

  private mediaQuery: MediaQueryList;

 

  constructor() {

    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    this.loadSavedMode();

    this.applyMode();

    this.setupSystemThemeListener();

  }

 

  setMode(mode: ThemeMode): void {

    this.currentMode = mode;

    this.saveMode();

    this.applyMode();

  }

 

  getMode(): ThemeMode {

    return this.currentMode;

  }

 

  private loadSavedMode(): void {

    const saved = localStorage.getItem('theme-mode') as ThemeMode;

    if (saved) {

      this.currentMode = saved;

    }

  }

 

  private saveMode(): void {

    localStorage.setItem('theme-mode', this.currentMode);

  }

 

  private applyMode(): void {

    const effectiveMode = this.getEffectiveMode();

 

    document.documentElement.setAttribute('data-theme', effectiveMode);

 

    // Trigger custom event

    window.dispatchEvent(new CustomEvent('theme-mode-change', {

      detail: { mode: effectiveMode }

    }));

  }

 

  private getEffectiveMode(): 'light' | 'dark' {

    if (this.currentMode === 'auto') {

      return this.mediaQuery.matches ? 'dark' : 'light';

    }

    return this.currentMode;

  }

 

  private setupSystemThemeListener(): void {

    this.mediaQuery.addEventListener('change', () => {

      if (this.currentMode === 'auto') {

        this.applyMode();

      }

    });

  }

}

 

// Usage

const themeSwitcher = new ThemeSwitcher();

 

// UI Controls

document.getElementById('theme-light')?.addEventListener('click', () => {

  themeSwitcher.setMode('light');

});

 

document.getElementById('theme-dark')?.addEventListener('click', () => {

  themeSwitcher.setMode('dark');

});

 

document.getElementById('theme-auto')?.addEventListener('click', () => {

  themeSwitcher.setMode('auto');

});

```

 

### Animated Theme Transitions

 

```typescript

class ThemeTransition {

  async switch(newMode: 'light' | 'dark'): Promise<void> {

    // Capture current state

    const screenshot = await this.captureScreen();

 

    // Apply new theme

    document.documentElement.setAttribute('data-theme', newMode);

 

    // Animate transition

    await this.animateTransition(screenshot);

  }

 

  private async captureScreen(): Promise<HTMLCanvasElement> {

    // Create canvas with current screen

    const canvas = document.createElement('canvas');

    const ctx = canvas.getContext('2d')!;

 

    canvas.width = window.innerWidth;

    canvas.height = window.innerHeight;

 

    // In real implementation, use html2canvas or similar

    // This is a placeholder

    return canvas;

  }

 

  private async animateTransition(screenshot: HTMLCanvasElement): Promise<void> {

    // Create overlay

    const overlay = document.createElement('div');

    overlay.style.cssText = `

      position: fixed;

      top: 0;

      left: 0;

      width: 100%;

      height: 100%;

      pointer-events: none;

      z-index: 9999;

      opacity: 1;

      transition: opacity 300ms ease-out;

    `;

    overlay.appendChild(screenshot);

    document.body.appendChild(overlay);

 

    // Fade out

    await new Promise(resolve => setTimeout(resolve, 50));

    overlay.style.opacity = '0';

 

    await new Promise(resolve => setTimeout(resolve, 300));

    overlay.remove();

  }

}

 

// Usage with color fade

class ColorFadeTransition {

  async switch(newMode: 'light' | 'dark'): Promise<void> {

    // Add transition class

    document.documentElement.classList.add('theme-transitioning');

 

    // Wait for CSS transitions

    await new Promise(resolve => setTimeout(resolve, 300));

 

    // Apply new theme

    document.documentElement.setAttribute('data-theme', newMode);

 

    // Wait for theme to apply

    await new Promise(resolve => setTimeout(resolve, 300));

 

    // Remove transition class

    document.documentElement.classList.remove('theme-transitioning');

  }

}

 

// CSS

/*

.theme-transitioning * {

  transition: background-color 300ms ease, color 300ms ease !important;

}

*/

```

 

### Per-Component Theme Override

 

```typescript

class ComponentTheme {

  static override(

    element: HTMLElement,

    overrides: Partial<Record<keyof Theme['colors'], string>>

  ): void {

    Object.entries(overrides).forEach(([token, value]) => {

      element.style.setProperty(`--color-${token}`, value);

    });

  }

 

  static reset(element: HTMLElement): void {

    const theme = webshell.theme.getTheme();

 

    Object.keys(theme.colors).forEach(token => {

      element.style.removeProperty(`--color-${token}`);

    });

  }

}

 

// Usage

const card = document.getElementById('special-card')!;

 

ComponentTheme.override(card, {

  surface: '#1a1a2e',

  onSurface: '#eee',

  primary: '#0f3460'

});

 

// Later: reset to app theme

ComponentTheme.reset(card);

```

 

---

 

## Theme Persistence

 

### Local Storage Persistence

 

```typescript

class ThemePersistence {

  private storageKey = 'app-theme';

 

  save(customizations: any): void {

    localStorage.setItem(this.storageKey, JSON.stringify(customizations));

  }

 

  load(): any | null {

    const stored = localStorage.getItem(this.storageKey);

    return stored ? JSON.parse(stored) : null;

  }

 

  clear(): void {

    localStorage.removeItem(this.storageKey);

  }

}

 

// Usage

const persistence = new ThemePersistence();

 

// Save custom theme

persistence.save({

  mode: 'dark',

  primaryColor: '#ff6b6b',

  accentColor: '#4ecdc4',

  fontSize: 16

});

 

// Load on startup

webshell.ready(() => {

  const customizations = persistence.load();

 

  if (customizations) {

    applyCustomizations(customizations);

  }

});

```

 

### Sync Across Sessions

 

```typescript

class ThemeSync {

  private channel: BroadcastChannel;

 

  constructor() {

    this.channel = new BroadcastChannel('theme-sync');

    this.setupListener();

  }

 

  broadcastThemeChange(theme: any): void {

    this.channel.postMessage({ type: 'theme-change', theme });

  }

 

  private setupListener(): void {

    this.channel.addEventListener('message', (event) => {

      if (event.data.type === 'theme-change') {

        applyTheme(event.data.theme);

      }

    });

  }

 

  close(): void {

    this.channel.close();

  }

}

 

// Usage

const themeSync = new ThemeSync();

 

function changeTheme(newTheme: any) {

  applyTheme(newTheme);

  themeSync.broadcastThemeChange(newTheme);

}

```

 

---

 

## Component Theming

 

### Themed Components

 

```typescript

interface ThemedComponentProps {

  variant?: 'primary' | 'secondary' | 'tertiary';

  size?: 'sm' | 'md' | 'lg';

}

 

class ThemedButton {

  constructor(

    private element: HTMLButtonElement,

    private props: ThemedComponentProps = {}

  ) {

    this.applyTheme();

  }

 

  private applyTheme(): void {

    const theme = webshell.theme.getTheme();

    const variant = this.props.variant || 'primary';

    const size = this.props.size || 'md';

 

    // Apply variant colors

    switch (variant) {

      case 'primary':

        this.element.style.backgroundColor = theme.colors.primary;

        this.element.style.color = theme.colors.onPrimary;

        break;

      case 'secondary':

        this.element.style.backgroundColor = theme.colors.secondary;

        this.element.style.color = theme.colors.onSecondary;

        break;

      case 'tertiary':

        this.element.style.backgroundColor = theme.colors.tertiary;

        this.element.style.color = theme.colors.onTertiary;

        break;

    }

 

    // Apply size

    switch (size) {

      case 'sm':

        this.element.style.padding = `${theme.spacing.xs} ${theme.spacing.sm}`;

        this.element.style.fontSize = '14px';

        break;

      case 'md':

        this.element.style.padding = `${theme.spacing.sm} ${theme.spacing.md}`;

        this.element.style.fontSize = '16px';

        break;

      case 'lg':

        this.element.style.padding = `${theme.spacing.md} ${theme.spacing.lg}`;

        this.element.style.fontSize = '18px';

        break;

    }

 

    // Apply border radius

    this.element.style.borderRadius = theme.radii.md;

  }

 

  updateTheme(): void {

    this.applyTheme();

  }

}

 

// Usage

const button = document.getElementById('my-button') as HTMLButtonElement;

const themedButton = new ThemedButton(button, {

  variant: 'primary',

  size: 'lg'

});

 

// Update when theme changes

webshell.theme.onThemeChange(() => {

  themedButton.updateTheme();

});

```

 

### Theme Context

 

```typescript

class ThemeContext {

  private theme: Theme;

  private listeners: Set<(theme: Theme) => void> = new Set();

 

  constructor() {

    this.theme = webshell.theme.getTheme();

 

    webshell.theme.onThemeChange((newTheme) => {

      this.theme = newTheme;

      this.notifyListeners();

    });

  }

 

  getTheme(): Theme {

    return this.theme;

  }

 

  subscribe(listener: (theme: Theme) => void): () => void {

    this.listeners.add(listener);

 

    // Return unsubscribe function

    return () => {

      this.listeners.delete(listener);

    };

  }

 

  private notifyListeners(): void {

    this.listeners.forEach(listener => listener(this.theme));

  }

}

 

// Create singleton

const themeContext = new ThemeContext();

 

// Components subscribe to theme changes

class ThemedComponent {

  private unsubscribe: () => void;

 

  constructor(private element: HTMLElement) {

    this.unsubscribe = themeContext.subscribe((theme) => {

      this.updateTheme(theme);

    });

 

    this.updateTheme(themeContext.getTheme());

  }

 

  private updateTheme(theme: Theme): void {

    this.element.style.backgroundColor = theme.colors.surface;

    this.element.style.color = theme.colors.onSurface;

  }

 

  destroy(): void {

    this.unsubscribe();

  }

}

```

 

---

 

## CSS-in-JS Patterns

 

### Styled Components Integration

 

```typescript

import styled from 'styled-components';

 

interface ThemeProps {

  theme: Theme;

}

 

// Access theme in styled components

const Button = styled.button<ThemeProps>`

  background-color: ${props => props.theme.colors.primary};

  color: ${props => props.theme.colors.onPrimary};

  padding: ${props => props.theme.spacing.md};

  border-radius: ${props => props.theme.radii.md};

  font-size: ${props => props.theme.typography.labelLarge.fontSize};

  font-weight: ${props => props.theme.typography.labelLarge.fontWeight};

 

  &:hover {

    background-color: ${props => props.theme.colors.primaryContainer};

    color: ${props => props.theme.colors.onPrimaryContainer};

  }

`;

 

// Theme provider

import { ThemeProvider } from 'styled-components';

 

function App() {

  const [theme, setTheme] = useState<Theme | null>(null);

 

  useEffect(() => {

    webshell.ready(() => {

      setTheme(webshell.theme.getTheme());

 

      webshell.theme.onThemeChange((newTheme) => {

        setTheme(newTheme);

      });

    });

  }, []);

 

  if (!theme) return <div>Loading...</div>;

 

  return (

    <ThemeProvider theme={theme}>

      <Button>Click me</Button>

    </ThemeProvider>

  );

}

```

 

### Emotion Integration

 

```typescript

/** @jsxImportSource @emotion/react */

import { css } from '@emotion/react';

 

function ThemedCard() {

  const theme = useTheme();

 

  return (

    <div

      css={css`

        background-color: ${theme.colors.surface};

        color: ${theme.colors.onSurface};

        padding: ${theme.spacing.lg};

        border-radius: ${theme.radii.lg};

        box-shadow: 0 2px 8px ${theme.colors.shadow};

 

        h2 {

          font-size: ${theme.typography.headlineMedium.fontSize};

          font-weight: ${theme.typography.headlineMedium.fontWeight};

          margin-bottom: ${theme.spacing.md};

        }

      `}

    >

      <h2>Card Title</h2>

      <p>Card content</p>

    </div>

  );

}

 

// Custom hook for theme

function useTheme(): Theme {

  const [theme, setTheme] = useState<Theme | null>(null);

 

  useEffect(() => {

    const currentTheme = webshell.theme.getTheme();

    setTheme(currentTheme);

 

    const unsubscribe = webshell.theme.onThemeChange(setTheme);

    return unsubscribe;

  }, []);

 

  return theme || webshell.theme.getTheme();

}

```

 

---

 

## Framework Integration

 

### React Integration

 

```typescript

import { createContext, useContext, useEffect, useState } from 'react';

 

// Theme Context

const ThemeContext = createContext<Theme | null>(null);

 

export function ThemeProvider({ children }: { children: React.ReactNode }) {

  const [theme, setTheme] = useState<Theme | null>(null);

 

  useEffect(() => {

    webshell.ready(() => {

      // Get initial theme

      const initialTheme = webshell.theme.getTheme();

      setTheme(initialTheme);

 

      // Apply theme CSS variables

      webshell.theme.applyTheme();

 

      // Listen for changes

      const unsubscribe = webshell.theme.onThemeChange((newTheme) => {

        setTheme(newTheme);

      });

 

      return unsubscribe;

    });

  }, []);

 

  if (!theme) {

    return <div>Loading theme...</div>;

  }

 

  return (

    <ThemeContext.Provider value={theme}>

      {children}

    </ThemeContext.Provider>

  );

}

 

// Hook to use theme

export function useTheme(): Theme {

  const theme = useContext(ThemeContext);

 

  if (!theme) {

    throw new Error('useTheme must be used within ThemeProvider');

  }

 

  return theme;

}

 

// Component using theme

function Card() {

  const theme = useTheme();

 

  return (

    <div

      style={{

        backgroundColor: theme.colors.surface,

        color: theme.colors.onSurface,

        padding: theme.spacing.lg,

        borderRadius: theme.radii.lg

      }}

    >

      <h2 style={{

        fontSize: theme.typography.headlineMedium.fontSize,

        fontWeight: theme.typography.headlineMedium.fontWeight

      }}>

        Card Title

      </h2>

      <p>Card content</p>

    </div>

  );

}

 

// Usage

function App() {

  return (

    <ThemeProvider>

      <Card />

    </ThemeProvider>

  );

}

```

 

### Vue Integration

 

```vue

<script setup lang="ts">

import { ref, onMounted, provide } from 'vue';

 

const theme = ref<Theme | null>(null);

 

onMounted(() => {

  webshell.ready(() => {

    theme.value = webshell.theme.getTheme();

    webshell.theme.applyTheme();

 

    webshell.theme.onThemeChange((newTheme) => {

      theme.value = newTheme;

    });

  });

});

 

// Provide theme to child components

provide('theme', theme);

</script>

 

<template>

  <div v-if="theme" class="app">

    <slot />

  </div>

  <div v-else>Loading theme...</div>

</template>

 

<!-- Child component using theme -->

<script setup lang="ts">

import { inject } from 'vue';

import type { Ref } from 'vue';

 

const theme = inject<Ref<Theme>>('theme');

</script>

 

<template>

  <div

    :style="{

      backgroundColor: theme.colors.surface,

      color: theme.colors.onSurface,

      padding: theme.spacing.lg,

      borderRadius: theme.radii.lg

    }"

  >

    <h2 :style="{

      fontSize: theme.typography.headlineMedium.fontSize,

      fontWeight: theme.typography.headlineMedium.fontWeight

    }">

      Card Title

    </h2>

    <p>Card content</p>

  </div>

</template>

```

 

### Svelte Integration

 

```svelte

<!-- ThemeProvider.svelte -->

<script lang="ts">

  import { setContext, onMount } from 'svelte';

  import { writable } from 'svelte/store';

 

  const theme = writable<Theme | null>(null);

 

  onMount(() => {

    webshell.ready(() => {

      theme.set(webshell.theme.getTheme());

      webshell.theme.applyTheme();

 

      webshell.theme.onThemeChange((newTheme) => {

        theme.set(newTheme);

      });

    });

  });

 

  setContext('theme', theme);

</script>

 

{#if $theme}

  <div class="app">

    <slot />

  </div>

{:else}

  <div>Loading theme...</div>

{/if}

 

<!-- Card.svelte -->

<script lang="ts">

  import { getContext } from 'svelte';

  import type { Writable } from 'svelte/store';

 

  const theme = getContext<Writable<Theme>>('theme');

</script>

 

{#if $theme}

  <div

    style="

      background-color: {$theme.colors.surface};

      color: {$theme.colors.onSurface};

      padding: {$theme.spacing.lg};

      border-radius: {$theme.radii.lg};

    "

  >

    <h2 style="

      font-size: {$theme.typography.headlineMedium.fontSize};

      font-weight: {$theme.typography.headlineMedium.fontWeight};

    ">

      Card Title

    </h2>

    <p>Card content</p>

  </div>

{/if}

```

 

---

 

## Complete Examples

 

### Example 1: Theme Builder UI

 

```typescript

class ThemeBuilderUI {

  private customTheme: any = {};

 

  render() {

    const container = document.getElementById('theme-builder')!;

 

    container.innerHTML = `

      <div class="theme-builder">

        <h2>Theme Builder</h2>

 

        <div class="color-picker">

          <label>Primary Color</label>

          <input type="color" id="primary-color" value="#6200ee">

        </div>

 

        <div class="color-picker">

          <label>Secondary Color</label>

          <input type="color" id="secondary-color" value="#03dac6">

        </div>

 

        <div class="mode-selector">

          <label>Mode</label>

          <select id="mode-select">

            <option value="light">Light</option>

            <option value="dark">Dark</option>

          </select>

        </div>

 

        <button id="apply-theme">Apply Theme</button>

        <button id="reset-theme">Reset</button>

 

        <div class="preview">

          <h3>Preview</h3>

          <div class="preview-card">

            <h4>Sample Card</h4>

            <p>This is how your theme will look.</p>

            <button>Sample Button</button>

          </div>

        </div>

      </div>

    `;

 

    this.attachEventListeners();

  }

 

  private attachEventListeners() {

    document.getElementById('primary-color')?.addEventListener('input', (e) => {

      this.customTheme.primary = (e.target as HTMLInputElement).value;

      this.updatePreview();

    });

 

    document.getElementById('secondary-color')?.addEventListener('input', (e) => {

      this.customTheme.secondary = (e.target as HTMLInputElement).value;

      this.updatePreview();

    });

 

    document.getElementById('mode-select')?.addEventListener('change', (e) => {

      this.customTheme.mode = (e.target as HTMLSelectElement).value;

      this.updatePreview();

    });

 

    document.getElementById('apply-theme')?.addEventListener('click', () => {

      this.applyTheme();

    });

 

    document.getElementById('reset-theme')?.addEventListener('click', () => {

      this.resetTheme();

    });

  }

 

  private updatePreview() {

    const preview = document.querySelector('.preview-card') as HTMLElement;

    if (!preview) return;

 

    if (this.customTheme.primary) {

      preview.style.setProperty('--preview-primary', this.customTheme.primary);

    }

 

    if (this.customTheme.secondary) {

      preview.style.setProperty('--preview-secondary', this.customTheme.secondary);

    }

 

    if (this.customTheme.mode) {

      preview.setAttribute('data-mode', this.customTheme.mode);

    }

  }

 

  private applyTheme() {

    const root = document.documentElement;

 

    Object.entries(this.customTheme).forEach(([key, value]) => {

      root.style.setProperty(`--custom-${key}`, value as string);

    });

 

    // Save to localStorage

    localStorage.setItem('custom-theme', JSON.stringify(this.customTheme));

 

    webshell.notifications.send({

      title: 'Theme Applied',

      message: 'Your custom theme has been applied'

    });

  }

 

  private resetTheme() {

    this.customTheme = {};

    localStorage.removeItem('custom-theme');

    webshell.theme.applyTheme(); // Reapply base theme

 

    webshell.notifications.send({

      title: 'Theme Reset',

      message: 'Theme has been reset to default'

    });

  }

}

```

 

### Example 2: Dark Mode Toggle

 

```typescript

class DarkModeToggle {

  private isDark = false;

 

  constructor(private toggleButton: HTMLButtonElement) {

    this.loadPreference();

    this.setupToggle();

    this.updateUI();

  }

 

  private loadPreference() {

    const saved = localStorage.getItem('dark-mode');

    if (saved !== null) {

      this.isDark = saved === 'true';

    } else {

      // Use system preference

      this.isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    }

  }

 

  private setupToggle() {

    this.toggleButton.addEventListener('click', () => {

      this.toggle();

    });

 

    // Listen for system theme changes

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {

      if (localStorage.getItem('dark-mode') === null) {

        this.isDark = e.matches;

        this.updateUI();

      }

    });

  }

 

  private toggle() {

    this.isDark = !this.isDark;

    this.savePreference();

    this.updateUI();

  }

 

  private savePreference() {

    localStorage.setItem('dark-mode', String(this.isDark));

  }

 

  private updateUI() {

    document.documentElement.setAttribute('data-theme', this.isDark ? 'dark' : 'light');

 

    this.toggleButton.textContent = this.isDark ? '☀️ Light' : '🌙 Dark';

    this.toggleButton.setAttribute('aria-label', `Switch to ${this.isDark ? 'light' : 'dark'} mode`);

  }

}

 

// Usage

webshell.ready(() => {

  const toggleBtn = document.getElementById('theme-toggle') as HTMLButtonElement;

  new DarkModeToggle(toggleBtn);

});

```

 

### Example 3: Branded Theming

 

```typescript

interface BrandTheme {

  name: string;

  primaryColor: string;

  secondaryColor: string;

  logo: string;

  fontFamily: string;

}

 

class BrandedTheming {

  private brands: Map<string, BrandTheme> = new Map([

    ['acme', {

      name: 'Acme Corp',

      primaryColor: '#e74c3c',

      secondaryColor: '#3498db',

      logo: '/logos/acme.svg',

      fontFamily: 'Roboto, sans-serif'

    }],

    ['techco', {

      name: 'TechCo',

      primaryColor: '#2ecc71',

      secondaryColor: '#f39c12',

      logo: '/logos/techco.svg',

      fontFamily: 'Inter, sans-serif'

    }]

  ]);

 

  applyBrand(brandId: string) {

    const brand = this.brands.get(brandId);

    if (!brand) {

      console.error('Brand not found:', brandId);

      return;

    }

 

    const root = document.documentElement;

 

    // Apply brand colors

    root.style.setProperty('--brand-primary', brand.primaryColor);

    root.style.setProperty('--brand-secondary', brand.secondaryColor);

    root.style.setProperty('--brand-font', brand.fontFamily);

 

    // Update logo

    const logo = document.getElementById('app-logo') as HTMLImageElement;

    if (logo) {

      logo.src = brand.logo;

      logo.alt = brand.name;

    }

 

    // Update page title

    document.title = `${brand.name} - App`;

 

    // Save preference

    localStorage.setItem('selected-brand', brandId);

 

    console.log('Brand applied:', brand.name);

  }

 

  loadSavedBrand() {

    const savedBrand = localStorage.getItem('selected-brand');

    if (savedBrand) {

      this.applyBrand(savedBrand);

    }

  }

 

  getBrands(): BrandTheme[] {

    return Array.from(this.brands.values());

  }

}

 

// Usage

const branding = new BrandedTheming();

 

webshell.ready(() => {

  branding.loadSavedBrand();

 

  // Brand selector

  document.getElementById('brand-selector')?.addEventListener('change', (e) => {

    const brandId = (e.target as HTMLSelectElement).value;

    branding.applyBrand(brandId);

  });

});

```

 

---

 

## Best Practices

 

1. **Use CSS Variables**: Prefer CSS variables for maximum flexibility

2. **React to Theme Changes**: Always listen for theme updates

3. **Semantic Tokens**: Create semantic color tokens for consistency

4. **Accessibility**: Ensure sufficient contrast ratios

5. **Performance**: Debounce theme updates if needed

6. **Fallbacks**: Provide fallback colors for unsupported tokens

7. **Type Safety**: Use TypeScript for theme types

8. **Documentation**: Document custom theme tokens

9. **Testing**: Test with both light and dark themes

10. **Transitions**: Add smooth transitions for theme changes

 

---

 

## Related Documentation

 

- [Theme System](../theming.md)

- [Design Tokens Generator](../design-tokens-generator.md)

- [SDK API Reference](../sdk-api-reference.md)

- [Best Practices](../best-practices.md)

 

