/**
 * WebShell SDK - Theme Module
 *
 * Access and react to theme changes
 */

import type {
  Theme,
  ColorTokens,
  SpacingTokens,
  TypographyTokens,
  RadiusTokens,
  EventHandler,
  UnsubscribeFn
} from './types';

/**
 * Theme Module Interface
 *
 * Access current theme tokens and listen to theme changes
 */
export interface ThemeModule {
  /**
   * Get current color tokens
   * @returns Color tokens object with all theme colors
   * @example
   * ```typescript
   * const colors = webshell.theme.getColors();
   * console.log(`Primary color: ${colors.primary}`);
   * ```
   */
  getColors(): ColorTokens;

  /**
   * Get current spacing tokens
   * @returns Spacing tokens object with size values
   * @example
   * ```typescript
   * const spacing = webshell.theme.getSpacing();
   * console.log(`Medium spacing: ${spacing.md}`);
   * ```
   */
  getSpacing(): SpacingTokens;

  /**
   * Get current typography tokens
   * @returns Typography tokens including font families, sizes, and weights
   * @example
   * ```typescript
   * const typo = webshell.theme.getTypography();
   * console.log(`Font family: ${typo.fontFamily}`);
   * ```
   */
  getTypography(): TypographyTokens;

  /**
   * Get current border radius tokens
   * @returns Radius tokens for rounded corners
   * @example
   * ```typescript
   * const radii = webshell.theme.getRadii();
   * console.log(`Medium radius: ${radii.md}`);
   * ```
   */
  getRadii(): RadiusTokens;

  /**
   * Get complete theme object
   * @returns Complete theme with all token categories
   * @example
   * ```typescript
   * const theme = webshell.theme.getTheme();
   * console.log('Theme:', theme.colors, theme.spacing);
   * ```
   */
  getTheme(): Theme;

  /**
   * Register handler for theme change events
   * @param handler - Theme change handler called when theme updates
   * @returns Unsubscribe function to remove the handler
   * @example
   * ```typescript
   * const unsubscribe = webshell.theme.onThemeChange((theme) => {
   *   console.log('Theme changed to:', theme);
   *   // Update UI with new theme
   * });
   * // Later: clean up
   * unsubscribe();
   * ```
   */
  onThemeChange(handler: EventHandler<Theme>): UnsubscribeFn;

  /**
   * Apply theme to the current document (inject CSS variables)
   * @example
   * ```typescript
   * // Apply current theme as CSS custom properties
   * webshell.theme.applyTheme();
   * // Now use var(--color-primary) in CSS
   * ```
   */
  applyTheme(): void;

  /**
   * Current color tokens (live-updated)
   */
  readonly colors: ColorTokens;

  /**
   * Current spacing tokens (live-updated)
   */
  readonly spacing: SpacingTokens;

  /**
   * Current typography tokens (live-updated)
   */
  readonly typography: TypographyTokens;

  /**
   * Current radius tokens (live-updated)
   */
  readonly radii: RadiusTokens;
}
