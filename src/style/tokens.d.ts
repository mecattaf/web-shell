/**
 * Design System Tokens - TypeScript Definitions
 * 
 * Auto-generated from design-tokens.json
 * DO NOT EDIT MANUALLY
 * 
 * To regenerate: npm run generate-tokens
 */

// Color tokens
export type ColorToken =
  | 'surface'
  | 'surface-high'
  | 'surface-highest'
  | 'surface-low'
  | 'text'
  | 'text-secondary'
  | 'primary'
  | 'on-primary'
  | 'primary-container'
  | 'on-primary-container'
  | 'secondary'
  | 'on-secondary'
  | 'secondary-container'
  | 'on-secondary-container'
  | 'tertiary'
  | 'on-tertiary'
  | 'tertiary-container'
  | 'on-tertiary-container'
  | 'error'
  | 'on-error'
  | 'error-container'
  | 'on-error-container'
  | 'warning'
  | 'on-warning'
  | 'warning-container'
  | 'on-warning-container'
  | 'success'
  | 'on-success'
  | 'success-container'
  | 'on-success-container'
  | 'info'
  | 'on-info'
  | 'info-container'
  | 'on-info-container'
  | 'border'
  | 'border-focus'
  | 'background'
  | 'on-background'
  | 'inverse-surface'
  | 'inverse-on-surface'
  | 'inverse-primary'
  | 'shadow'
  | 'scrim';

// Spacing tokens
export type SpacingToken =
  | 'xs'
  | 's'
  | 'm'
  | 'l'
  | 'xl'
  | 'xxl';

// Font size tokens
export type FontSizeToken =
  | 'xs'
  | 's'
  | 'm'
  | 'l'
  | 'xl'
  | 'xxl'
  | 'xxxl';

// Border radius tokens
export type RadiusToken =
  | 'none'
  | 's'
  | 'm'
  | 'l'
  | 'xl'
  | 'full';

// Complete design tokens interface
export interface DesignTokens {
  colors: {
    surface: string;
    surfaceHigh: string;
    surfaceHighest: string;
    surfaceLow: string;
    text: string;
    textSecondary: string;
    primary: string;
    onPrimary: string;
    primaryContainer: string;
    onPrimaryContainer: string;
    secondary: string;
    onSecondary: string;
    secondaryContainer: string;
    onSecondaryContainer: string;
    tertiary: string;
    onTertiary: string;
    tertiaryContainer: string;
    onTertiaryContainer: string;
    error: string;
    onError: string;
    errorContainer: string;
    onErrorContainer: string;
    warning: string;
    onWarning: string;
    warningContainer: string;
    onWarningContainer: string;
    success: string;
    onSuccess: string;
    successContainer: string;
    onSuccessContainer: string;
    info: string;
    onInfo: string;
    infoContainer: string;
    onInfoContainer: string;
    border: string;
    borderFocus: string;
    background: string;
    onBackground: string;
    inverseSurface: string;
    inverseOnSurface: string;
    inversePrimary: string;
    shadow: string;
    scrim: string;
  };
  spacing: {
    xs: string;
    s: string;
    m: string;
    l: string;
    xl: string;
    xxl: string;
  };
  typography: {
    fontFamily: {
      base: string;
      monospace: string;
      heading: string;
    };
    fontSize: {
      xs: string;
      s: string;
      m: string;
      l: string;
      xl: string;
      xxl: string;
      xxxl: string;
    };
    fontWeight: {
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
    lineHeight: {
      tight: number;
      normal: number;
      relaxed: number;
    };
  };
  elevation: {
    none: string;
    low: string;
    medium: string;
    high: string;
  };
  border: {
    radius: {
      none: string;
      s: string;
      m: string;
      l: string;
      xl: string;
      full: string;
    };
    width: {
      thin: string;
      medium: string;
      thick: string;
    };
  };
  animation: {
    duration: {
      fast: string;
      normal: string;
      slow: string;
    };
    easing: {
      standard: string;
      decelerate: string;
      accelerate: string;
    };
  };
}

// Helper function to get CSS variable name
export function getCSSVar(category: string, token: string): string {
  return `var(--${category}-${token})`;
}
