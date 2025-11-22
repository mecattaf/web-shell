/**
 * Client-side theme generation utility
 *
 * This module provides utilities for generating WebShell themes from images
 * using Material You (Material Design 3) color extraction.
 *
 * Note: This is an optional client-side implementation. The primary theme
 * generation happens on the QML side using Matugen.
 */

/**
 * Design token structure matching WebShell's design-tokens.json schema
 */
export interface DesignTokens {
  $schema?: string;
  version: string;
  colors: {
    [key: string]: {
      value: string;
      description: string;
    };
  };
  spacing?: {
    [key: string]: {
      value: string;
      description: string;
    };
  };
  typography?: {
    fontFamily?: {
      [key: string]: {
        value: string;
        description: string;
      };
    };
    fontSize?: {
      [key: string]: {
        value: string;
        description: string;
      };
    };
    fontWeight?: {
      [key: string]: {
        value: number;
        description: string;
      };
    };
    lineHeight?: {
      [key: string]: {
        value: number;
        description: string;
      };
    };
  };
  elevation?: {
    [key: string]: {
      value: string;
      description: string;
    };
  };
  border?: {
    radius?: {
      [key: string]: {
        value: string;
        description: string;
      };
    };
    width?: {
      [key: string]: {
        value: string;
        description: string;
      };
    };
  };
  animation?: {
    duration?: {
      [key: string]: {
        value: string;
        description: string;
      };
    };
    easing?: {
      [key: string]: {
        value: string;
        description: string;
      };
    };
  };
}

/**
 * Color extraction result
 */
export interface ExtractedColors {
  primary: string;
  secondary?: string;
  tertiary?: string;
}

/**
 * Theme generation options
 */
export interface ThemeGenerationOptions {
  mode?: 'light' | 'dark';
  includeNonColorTokens?: boolean;
}

/**
 * Extract dominant color from an image
 *
 * This is a simple implementation that samples the center pixel.
 * For production use, consider using a library like:
 * - color-thief
 * - node-vibrant
 * - @material/material-color-utilities
 *
 * @param imageUrl - URL or data URL of the image
 * @returns Promise resolving to hex color string
 */
export async function extractPrimaryColor(imageUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Sample the center of the image
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // Get center pixel
        const centerX = Math.floor(img.width / 2);
        const centerY = Math.floor(img.height / 2);
        const imageData = ctx.getImageData(centerX, centerY, 1, 1).data;

        const r = imageData[0];
        const g = imageData[1];
        const b = imageData[2];

        const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        resolve(hex);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = imageUrl;
  });
}

/**
 * Generate Material 3 color scheme from a source color
 *
 * This is a simplified implementation. For accurate Material 3 colors,
 * use @material/material-color-utilities library.
 *
 * @param sourceColor - Hex color string (e.g., "#ef8354")
 * @param mode - "light" or "dark"
 * @returns Color scheme object
 */
export function generateColorScheme(
  sourceColor: string,
  mode: 'light' | 'dark' = 'dark'
): Record<string, string> {
  // This is a placeholder implementation
  // In a real implementation, you would use Material Color Utilities
  // to generate proper Material 3 color palettes

  const isDark = mode === 'dark';

  return {
    // Primary colors
    primary: sourceColor,
    onPrimary: isDark ? '#000000' : '#ffffff',
    primaryContainer: isDark ? adjustColor(sourceColor, -30) : adjustColor(sourceColor, 30),
    onPrimaryContainer: isDark ? adjustColor(sourceColor, 60) : adjustColor(sourceColor, -60),

    // Secondary colors (slightly shifted hue)
    secondary: rotateHue(sourceColor, 30),
    onSecondary: isDark ? '#000000' : '#ffffff',
    secondaryContainer: isDark ? adjustColor(rotateHue(sourceColor, 30), -30) : adjustColor(rotateHue(sourceColor, 30), 30),
    onSecondaryContainer: isDark ? adjustColor(rotateHue(sourceColor, 30), 60) : adjustColor(rotateHue(sourceColor, 30), -60),

    // Tertiary colors (shifted hue more)
    tertiary: rotateHue(sourceColor, -30),
    onTertiary: isDark ? '#000000' : '#ffffff',
    tertiaryContainer: isDark ? adjustColor(rotateHue(sourceColor, -30), -30) : adjustColor(rotateHue(sourceColor, -30), 30),
    onTertiaryContainer: isDark ? adjustColor(rotateHue(sourceColor, -30), 60) : adjustColor(rotateHue(sourceColor, -30), -60),

    // Error colors (reddish)
    error: '#ff6b6b',
    onError: isDark ? '#3d1616' : '#ffffff',
    errorContainer: isDark ? '#5c2020' : '#ffd6d6',
    onErrorContainer: isDark ? '#ffd6d6' : '#3d1616',

    // Surface colors
    surface: isDark ? '#1a1a1a' : '#fefefe',
    onSurface: isDark ? '#e3e3e3' : '#1a1a1a',
    surfaceHigh: isDark ? '#2d2d2d' : '#f5f5f5',
    surfaceHighest: isDark ? '#383838' : '#eeeeee',
    surfaceLow: isDark ? '#1e1e1e' : '#ffffff',
    onSurfaceVariant: isDark ? '#c7c7c7' : '#4a4a4a',

    // Background
    background: isDark ? '#121212' : '#ffffff',
    onBackground: isDark ? '#e3e3e3' : '#1a1a1a',

    // Outline
    outline: isDark ? '#8e8e8e' : '#767676',
    outlineVariant: isDark ? '#4a4a4a' : '#c7c7c7',

    // Inverse colors
    inverseSurface: isDark ? '#e3e3e3' : '#2d2d2d',
    inverseOnSurface: isDark ? '#2d2d2d' : '#e3e3e3',
    inversePrimary: isDark ? adjustColor(sourceColor, 40) : adjustColor(sourceColor, -40),

    // Shadow and scrim
    shadow: '#000000',
    scrim: '#000000',
  };
}

/**
 * Adjust color brightness
 */
function adjustColor(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const adjusted = {
    r: Math.max(0, Math.min(255, rgb.r + amount)),
    g: Math.max(0, Math.min(255, rgb.g + amount)),
    b: Math.max(0, Math.min(255, rgb.b + amount)),
  };

  return rgbToHex(adjusted.r, adjusted.g, adjusted.b);
}

/**
 * Rotate color hue
 */
function rotateHue(hex: string, degrees: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  hsl.h = (hsl.h + degrees) % 360;
  if (hsl.h < 0) hsl.h += 360;

  const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
  return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
}

/**
 * Convert hex to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Convert RGB to hex
 */
function rgbToHex(r: number, g: number, b: number): string {
  return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
}

/**
 * Convert RGB to HSL
 */
function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
        break;
      case g:
        h = ((b - r) / d + 2) * 60;
        break;
      case b:
        h = ((r - g) / d + 4) * 60;
        break;
    }
  }

  return { h, s, l };
}

/**
 * Convert HSL to RGB
 */
function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360;

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return { r: r * 255, g: g * 255, b: b * 255 };
}

/**
 * Generate complete design tokens from an image
 *
 * @param imageUrl - URL or data URL of the image
 * @param options - Generation options
 * @returns Promise resolving to design tokens
 */
export async function generateThemeFromImage(
  imageUrl: string,
  options: ThemeGenerationOptions = {}
): Promise<DesignTokens> {
  const { mode = 'dark', includeNonColorTokens = true } = options;

  // Extract primary color from image
  const primaryColor = await extractPrimaryColor(imageUrl);

  // Generate color scheme
  const colorScheme = generateColorScheme(primaryColor, mode);

  // Build design tokens
  const tokens: DesignTokens = {
    $schema: './src/style/design-tokens.schema.json',
    version: '1.0.0',
    colors: {},
  };

  // Add colors
  Object.entries(colorScheme).forEach(([key, value]) => {
    // Convert camelCase to kebab-case
    const kebabKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    tokens.colors[kebabKey] = {
      value: value,
      description: `Generated from image - ${kebabKey}`,
    };
  });

  // Add additional semantic colors if not present
  if (!tokens.colors['warning']) {
    tokens.colors['warning'] = { value: '#f9c74f', description: 'Warning color' };
    tokens.colors['on-warning'] = { value: mode === 'dark' ? '#3d3318' : '#ffffff', description: 'Text on warning' };
    tokens.colors['warning-container'] = { value: mode === 'dark' ? '#5c4d24' : '#fff0c8', description: 'Warning container' };
    tokens.colors['on-warning-container'] = { value: mode === 'dark' ? '#fff0c8' : '#3d3318', description: 'Text on warning container' };
  }

  if (!tokens.colors['success']) {
    tokens.colors['success'] = { value: '#90be6d', description: 'Success color' };
    tokens.colors['on-success'] = { value: mode === 'dark' ? '#243d1e' : '#ffffff', description: 'Text on success' };
    tokens.colors['success-container'] = { value: mode === 'dark' ? '#375c2d' : '#daf2ce', description: 'Success container' };
    tokens.colors['on-success-container'] = { value: mode === 'dark' ? '#daf2ce' : '#243d1e', description: 'Text on success container' };
  }

  if (!tokens.colors['info']) {
    tokens.colors['info'] = { value: '#577590', description: 'Info color' };
    tokens.colors['on-info'] = { value: mode === 'dark' ? '#1a242e' : '#ffffff', description: 'Text on info' };
    tokens.colors['info-container'] = { value: mode === 'dark' ? '#2d3d4f' : '#d0dce8', description: 'Info container' };
    tokens.colors['on-info-container'] = { value: mode === 'dark' ? '#d0dce8' : '#1a242e', description: 'Text on info container' };
  }

  // Add text colors if not present
  if (!tokens.colors['text']) {
    tokens.colors['text'] = {
      value: colorScheme.onSurface,
      description: 'Primary text color',
    };
  }
  if (!tokens.colors['text-secondary']) {
    tokens.colors['text-secondary'] = {
      value: colorScheme.onSurfaceVariant,
      description: 'Secondary text color',
    };
  }

  // Add border colors if not present
  if (!tokens.colors['border']) {
    tokens.colors['border'] = {
      value: colorScheme.outline,
      description: 'Border color',
    };
  }
  if (!tokens.colors['border-focus']) {
    tokens.colors['border-focus'] = {
      value: colorScheme.outlineVariant,
      description: 'Focus border color',
    };
  }

  // Add non-color tokens if requested
  if (includeNonColorTokens) {
    tokens.spacing = {
      xs: { value: '4px', description: 'Extra small spacing' },
      s: { value: '8px', description: 'Small spacing' },
      m: { value: '16px', description: 'Medium spacing' },
      l: { value: '24px', description: 'Large spacing' },
      xl: { value: '32px', description: 'Extra large spacing' },
      xxl: { value: '48px', description: 'Extra extra large spacing' },
    };

    tokens.typography = {
      fontFamily: {
        base: { value: 'Inter, system-ui, -apple-system, sans-serif', description: 'Base font family' },
        monospace: { value: 'JetBrains Mono, Consolas, monospace', description: 'Monospace font family' },
        heading: { value: 'Inter, system-ui, -apple-system, sans-serif', description: 'Heading font family' },
      },
      fontSize: {
        xs: { value: '12px', description: 'Extra small font size' },
        s: { value: '14px', description: 'Small font size' },
        m: { value: '16px', description: 'Medium font size' },
        l: { value: '18px', description: 'Large font size' },
        xl: { value: '20px', description: 'Extra large font size' },
        xxl: { value: '24px', description: 'Extra extra large font size' },
        xxxl: { value: '32px', description: 'Extra extra extra large font size' },
      },
      fontWeight: {
        normal: { value: 400, description: 'Normal font weight' },
        medium: { value: 500, description: 'Medium font weight' },
        semibold: { value: 600, description: 'Semibold font weight' },
        bold: { value: 700, description: 'Bold font weight' },
      },
      lineHeight: {
        tight: { value: 1.2, description: 'Tight line height' },
        normal: { value: 1.5, description: 'Normal line height' },
        relaxed: { value: 1.75, description: 'Relaxed line height' },
      },
    };

    tokens.elevation = {
      none: { value: 'none', description: 'No elevation' },
      low: { value: '0 2px 4px rgba(0,0,0,0.12)', description: 'Low elevation' },
      medium: { value: '0 4px 8px rgba(0,0,0,0.16)', description: 'Medium elevation' },
      high: { value: '0 8px 16px rgba(0,0,0,0.20)', description: 'High elevation' },
    };

    tokens.border = {
      radius: {
        none: { value: '0px', description: 'No border radius' },
        s: { value: '4px', description: 'Small border radius' },
        m: { value: '8px', description: 'Medium border radius' },
        l: { value: '12px', description: 'Large border radius' },
        xl: { value: '16px', description: 'Extra large border radius' },
        full: { value: '9999px', description: 'Full border radius (circular)' },
      },
      width: {
        thin: { value: '1px', description: 'Thin border' },
        medium: { value: '2px', description: 'Medium border' },
        thick: { value: '4px', description: 'Thick border' },
      },
    };

    tokens.animation = {
      duration: {
        fast: { value: '150ms', description: 'Fast animation' },
        normal: { value: '250ms', description: 'Normal animation' },
        slow: { value: '400ms', description: 'Slow animation' },
      },
      easing: {
        standard: { value: 'cubic-bezier(0.4, 0.0, 0.2, 1)', description: 'Standard easing' },
        decelerate: { value: 'cubic-bezier(0.0, 0.0, 0.2, 1)', description: 'Decelerate easing' },
        accelerate: { value: 'cubic-bezier(0.4, 0.0, 1, 1)', description: 'Accelerate easing' },
      },
    };
  }

  return tokens;
}

/**
 * Convert design tokens to CSS custom properties
 *
 * @param tokens - Design tokens object
 * @returns CSS string with custom properties
 */
export function tokensToCss(tokens: DesignTokens): string {
  let css = ':root {\n';

  // Colors
  if (tokens.colors) {
    Object.entries(tokens.colors).forEach(([key, token]) => {
      css += `  --color-${key}: ${token.value};\n`;
    });
  }

  // Spacing
  if (tokens.spacing) {
    Object.entries(tokens.spacing).forEach(([key, token]) => {
      css += `  --space-${key}: ${token.value};\n`;
    });
  }

  // Typography
  if (tokens.typography?.fontFamily) {
    Object.entries(tokens.typography.fontFamily).forEach(([key, token]) => {
      css += `  --font-family-${key}: ${token.value};\n`;
    });
  }
  if (tokens.typography?.fontSize) {
    Object.entries(tokens.typography.fontSize).forEach(([key, token]) => {
      css += `  --font-size-${key}: ${token.value};\n`;
    });
  }
  if (tokens.typography?.fontWeight) {
    Object.entries(tokens.typography.fontWeight).forEach(([key, token]) => {
      css += `  --font-weight-${key}: ${token.value};\n`;
    });
  }
  if (tokens.typography?.lineHeight) {
    Object.entries(tokens.typography.lineHeight).forEach(([key, token]) => {
      css += `  --line-height-${key}: ${token.value};\n`;
    });
  }

  // Elevation
  if (tokens.elevation) {
    Object.entries(tokens.elevation).forEach(([key, token]) => {
      css += `  --shadow-${key}: ${token.value};\n`;
    });
  }

  // Border
  if (tokens.border?.radius) {
    Object.entries(tokens.border.radius).forEach(([key, token]) => {
      css += `  --radius-${key}: ${token.value};\n`;
    });
  }
  if (tokens.border?.width) {
    Object.entries(tokens.border.width).forEach(([key, token]) => {
      css += `  --border-width-${key}: ${token.value};\n`;
    });
  }

  // Animation
  if (tokens.animation?.duration) {
    Object.entries(tokens.animation.duration).forEach(([key, token]) => {
      css += `  --duration-${key}: ${token.value};\n`;
    });
  }
  if (tokens.animation?.easing) {
    Object.entries(tokens.animation.easing).forEach(([key, token]) => {
      css += `  --easing-${key}: ${token.value};\n`;
    });
  }

  css += '}\n';
  return css;
}

/**
 * Apply design tokens to the document
 *
 * @param tokens - Design tokens object
 */
export function applyTokensToDocument(tokens: DesignTokens): void {
  const css = tokensToCss(tokens);

  // Create or update style element
  let styleElement = document.getElementById('webshell-generated-theme');
  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = 'webshell-generated-theme';
    document.head.appendChild(styleElement);
  }

  styleElement.textContent = css;
}
