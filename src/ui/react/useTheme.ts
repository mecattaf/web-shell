/**
 * WebShell React Hooks - Theme
 *
 * React hooks for accessing and reacting to theme changes
 */

import { useState, useEffect } from 'react';
import { getWebShellSDK } from '../../sdk/impl/webshell-sdk';
import type { Theme, ColorTokens } from '../../sdk/types';

/**
 * Hook to access the current theme
 *
 * @returns Current theme object, or null if not yet loaded
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const theme = useTheme();
 *
 *   if (!theme) return <div>Loading...</div>;
 *
 *   return (
 *     <div style={{ color: theme.colors.primary }}>
 *       Primary color: {theme.colors.primary}
 *     </div>
 *   );
 * }
 * ```
 */
export function useTheme(): Theme | null {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const sdk = getWebShellSDK();

    // Get initial theme
    try {
      const currentTheme = sdk.theme.getTheme();
      setTheme(currentTheme);
    } catch (err) {
      console.error('[useTheme] Failed to get initial theme:', err);
    }

    // Subscribe to theme changes
    const unsubscribe = sdk.theme.onThemeChange((newTheme) => {
      setTheme(newTheme);
    });

    return unsubscribe;
  }, []);

  return theme;
}

/**
 * Hook to access a specific theme color
 *
 * @param colorKey - Key of the color token (e.g., 'primary', 'surface')
 * @returns Color value as a string, or empty string if not yet loaded
 *
 * @example
 * ```tsx
 * function MyButton() {
 *   const primaryColor = useThemeColor('primary');
 *
 *   return (
 *     <button style={{ backgroundColor: primaryColor }}>
 *       Click me
 *     </button>
 *   );
 * }
 * ```
 */
export function useThemeColor(colorKey: keyof ColorTokens): string {
  const theme = useTheme();
  return theme?.colors[colorKey] || '';
}

/**
 * Hook to access theme colors
 *
 * @returns Color tokens object, or empty object if not yet loaded
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const colors = useThemeColors();
 *
 *   return (
 *     <div style={{
 *       backgroundColor: colors.surface,
 *       color: colors.onSurface,
 *       borderColor: colors.outline
 *     }}>
 *       Themed content
 *     </div>
 *   );
 * }
 * ```
 */
export function useThemeColors(): Partial<ColorTokens> {
  const theme = useTheme();
  return theme?.colors || {};
}

/**
 * Hook to access theme spacing tokens
 *
 * @returns Spacing tokens object
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const spacing = useThemeSpacing();
 *
 *   return (
 *     <div style={{
 *       padding: spacing.md,
 *       marginBottom: spacing.lg
 *     }}>
 *       Content with theme spacing
 *     </div>
 *   );
 * }
 * ```
 */
export function useThemeSpacing() {
  const theme = useTheme();
  return theme?.spacing || {};
}

/**
 * Hook to access theme typography tokens
 *
 * @returns Typography tokens object
 *
 * @example
 * ```tsx
 * function MyText() {
 *   const typography = useThemeTypography();
 *
 *   return (
 *     <p style={{
 *       fontFamily: typography.fontFamily,
 *       fontSize: typography.fontSize.base,
 *       lineHeight: typography.lineHeight.normal
 *     }}>
 *       Themed text
 *     </p>
 *   );
 * }
 * ```
 */
export function useThemeTypography() {
  const theme = useTheme();
  return theme?.typography;
}

/**
 * Hook to access theme radius tokens
 *
 * @returns Radius tokens object
 *
 * @example
 * ```tsx
 * function MyCard() {
 *   const radii = useThemeRadii();
 *
 *   return (
 *     <div style={{
 *       borderRadius: radii.lg,
 *       padding: '1rem'
 *     }}>
 *       Rounded card
 *     </div>
 *   );
 * }
 * ```
 */
export function useThemeRadii() {
  const theme = useTheme();
  return theme?.radii || {};
}
