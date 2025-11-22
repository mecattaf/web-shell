/**
 * WebShell SDK - Theme Module Implementation
 *
 * Provides access to theme tokens and handles theme change events
 */

import type { BridgeAdapter } from './bridge';
import type { ThemeModule } from '../theme';
import type {
  Theme,
  ColorTokens,
  SpacingTokens,
  TypographyTokens,
  RadiusTokens,
  EventHandler,
  UnsubscribeFn
} from '../types';

/**
 * Theme Module Implementation
 *
 * Manages theme state, provides access to design tokens, and handles theme changes
 */
export class ThemeModuleImpl implements ThemeModule {
  private bridge: BridgeAdapter;
  private currentTheme: Theme | null = null;
  private changeHandlers: Set<EventHandler<Theme>> = new Set();
  private initialized = false;

  constructor(bridge: BridgeAdapter) {
    this.bridge = bridge;
  }

  /**
   * Initialize the theme module
   * Sets up event handlers and fetches initial theme
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    // Set up theme change event handler
    this.bridge.on('theme-change', (themeData: string) => {
      try {
        const theme = JSON.parse(themeData);
        this.currentTheme = theme;

        // Auto-apply to DOM
        this.applyTheme();

        // Notify all registered handlers
        this.changeHandlers.forEach(handler => {
          try {
            handler(theme);
          } catch (err) {
            console.error('[ThemeModule] Change handler error:', err);
          }
        });
      } catch (err) {
        console.error('[ThemeModule] Failed to parse theme change event:', err);
      }
    });

    // Fetch initial theme
    try {
      await this.fetchTheme();
      // Auto-apply initial theme
      this.applyTheme();
    } catch (err) {
      console.warn('[ThemeModule] Failed to fetch initial theme:', err);
      // Initialize with default theme
      this.currentTheme = this.getDefaultTheme();
      this.applyTheme();
    }

    this.initialized = true;
  }

  /**
   * Fetch theme from backend
   */
  private async fetchTheme(): Promise<void> {
    try {
      const themeData = await this.bridge.call('theme.getTheme');
      this.currentTheme = JSON.parse(themeData);
    } catch (err) {
      throw new Error(`Failed to fetch theme: ${err}`);
    }
  }

  /**
   * Get current color tokens
   */
  getColors(): ColorTokens {
    const theme = this.getTheme();
    return theme.colors;
  }

  /**
   * Get current spacing tokens
   */
  getSpacing(): SpacingTokens {
    const theme = this.getTheme();
    return theme.spacing;
  }

  /**
   * Get current typography tokens
   */
  getTypography(): TypographyTokens {
    const theme = this.getTheme();
    return theme.typography;
  }

  /**
   * Get current border radius tokens
   */
  getRadii(): RadiusTokens {
    const theme = this.getTheme();
    return theme.radii;
  }

  /**
   * Get complete theme object
   */
  getTheme(): Theme {
    if (!this.currentTheme) {
      // Return default theme if not yet initialized
      return this.getDefaultTheme();
    }
    return this.currentTheme;
  }

  /**
   * Register handler for theme change events
   */
  onThemeChange(handler: EventHandler<Theme>): UnsubscribeFn {
    this.changeHandlers.add(handler);

    // Return unsubscribe function
    return () => {
      this.changeHandlers.delete(handler);
    };
  }

  /**
   * Apply theme to the current document (inject CSS variables)
   */
  applyTheme(): void {
    const theme = this.getTheme();
    this.injectCSSVariables(theme);
  }

  /**
   * Inject CSS variables into the document root
   */
  private injectCSSVariables(theme: Theme): void {
    const root = document.documentElement;

    // Colors
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${this.kebabCase(key)}`, value);
    });

    // Spacing
    Object.entries(theme.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--space-${key}`, value);
    });

    // Typography - Font family
    root.style.setProperty('--font-family', theme.typography.fontFamily);
    root.style.setProperty('--font-family-mono', theme.typography.fontFamilyMono);

    // Typography - Font sizes
    Object.entries(theme.typography.fontSize).forEach(([key, value]) => {
      root.style.setProperty(`--font-size-${key}`, value);
    });

    // Typography - Font weights
    Object.entries(theme.typography.fontWeight).forEach(([key, value]) => {
      root.style.setProperty(`--font-weight-${key}`, String(value));
    });

    // Typography - Line heights
    Object.entries(theme.typography.lineHeight).forEach(([key, value]) => {
      root.style.setProperty(`--line-height-${key}`, String(value));
    });

    // Radii
    Object.entries(theme.radii).forEach(([key, value]) => {
      root.style.setProperty(`--radius-${key}`, value);
    });
  }

  /**
   * Convert camelCase to kebab-case
   */
  private kebabCase(str: string): string {
    return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  }

  /**
   * Get default theme for fallback
   */
  private getDefaultTheme(): Theme {
    return {
      colors: {
        surface: '#ffffff',
        surfaceHigh: '#f5f5f5',
        surfaceLow: '#fafafa',
        primary: '#0066cc',
        onPrimary: '#ffffff',
        primaryContainer: '#e6f0ff',
        onPrimaryContainer: '#001f3d',
        secondary: '#5c5c66',
        onSecondary: '#ffffff',
        secondaryContainer: '#e0e0e9',
        onSecondaryContainer: '#191923',
        tertiary: '#7d5260',
        onTertiary: '#ffffff',
        tertiaryContainer: '#ffd9e3',
        onTertiaryContainer: '#31111d',
        error: '#ba1a1a',
        onError: '#ffffff',
        errorContainer: '#ffdad6',
        onErrorContainer: '#410002',
        background: '#fafafa',
        onBackground: '#1a1a1a',
        outline: '#767680',
        outlineVariant: '#c7c7d0'
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        xxl: '3rem'
      },
      typography: {
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontFamilyMono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
        fontSize: {
          xs: '0.75rem',
          sm: '0.875rem',
          base: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          xxl: '1.5rem'
        },
        fontWeight: {
          normal: 400,
          medium: 500,
          semibold: 600,
          bold: 700
        },
        lineHeight: {
          tight: 1.25,
          normal: 1.5,
          relaxed: 1.75
        }
      },
      radii: {
        none: '0',
        sm: '0.25rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        full: '9999px'
      }
    };
  }

  /**
   * Current color tokens (live-updated)
   */
  get colors(): ColorTokens {
    return this.getColors();
  }

  /**
   * Current spacing tokens (live-updated)
   */
  get spacing(): SpacingTokens {
    return this.getSpacing();
  }

  /**
   * Current typography tokens (live-updated)
   */
  get typography(): TypographyTokens {
    return this.getTypography();
  }

  /**
   * Current radius tokens (live-updated)
   */
  get radii(): RadiusTokens {
    return this.getRadii();
  }
}
