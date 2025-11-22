#!/usr/bin/env node

/**
 * CSS Variable Generator
 *
 * Generates CSS custom properties and TypeScript definitions from design tokens.
 * This enables web apps to use the same theme values as QML widgets.
 *
 * Usage:
 *   node tools/generate-css-vars.js
 *   npm run generate-tokens
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Paths
const TOKENS_PATH = join(__dirname, '../src/style/design-tokens.json');
const CSS_OUTPUT_PATH = join(__dirname, '../src/style/tokens.css');
const TS_OUTPUT_PATH = join(__dirname, '../src/style/tokens.d.ts');

/**
 * Converts a kebab-case key to camelCase
 */
function kebabToCamel(str) {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

/**
 * Generates CSS custom properties from design tokens
 */
function generateCSS(tokens) {
  const lines = [
    '/**',
    ' * Design System Tokens - CSS Variables',
    ' * ',
    ' * Auto-generated from design-tokens.json',
    ' * DO NOT EDIT MANUALLY',
    ' * ',
    ' * To regenerate: npm run generate-tokens',
    ' */',
    '',
    ':root {',
  ];

  // Colors
  if (tokens.colors) {
    lines.push('  /* ========================================');
    lines.push('   * Colors');
    lines.push('   * ======================================== */');
    lines.push('');

    Object.entries(tokens.colors).forEach(([key, token]) => {
      const description = token.description ? `  /* ${token.description} */` : '';
      if (description) lines.push(description);
      lines.push(`  --color-${key}: ${token.value};`);
    });
    lines.push('');
  }

  // Spacing
  if (tokens.spacing) {
    lines.push('  /* ========================================');
    lines.push('   * Spacing');
    lines.push('   * ======================================== */');
    lines.push('');

    Object.entries(tokens.spacing).forEach(([key, token]) => {
      const description = token.description ? `  /* ${token.description} */` : '';
      if (description) lines.push(description);
      lines.push(`  --space-${key}: ${token.value};`);
    });
    lines.push('');
  }

  // Typography
  if (tokens.typography) {
    lines.push('  /* ========================================');
    lines.push('   * Typography');
    lines.push('   * ======================================== */');
    lines.push('');

    // Font families
    if (tokens.typography.fontFamily) {
      Object.entries(tokens.typography.fontFamily).forEach(([key, token]) => {
        const description = token.description ? `  /* ${token.description} */` : '';
        if (description) lines.push(description);
        lines.push(`  --font-${key}: ${token.value};`);
      });
      lines.push('');
    }

    // Font sizes
    if (tokens.typography.fontSize) {
      Object.entries(tokens.typography.fontSize).forEach(([key, token]) => {
        const description = token.description ? `  /* ${token.description} */` : '';
        if (description) lines.push(description);
        lines.push(`  --font-size-${key}: ${token.value};`);
      });
      lines.push('');
    }

    // Font weights
    if (tokens.typography.fontWeight) {
      Object.entries(tokens.typography.fontWeight).forEach(([key, token]) => {
        const description = token.description ? `  /* ${token.description} */` : '';
        if (description) lines.push(description);
        lines.push(`  --font-weight-${key}: ${token.value};`);
      });
      lines.push('');
    }

    // Line heights
    if (tokens.typography.lineHeight) {
      Object.entries(tokens.typography.lineHeight).forEach(([key, token]) => {
        const description = token.description ? `  /* ${token.description} */` : '';
        if (description) lines.push(description);
        lines.push(`  --line-height-${key}: ${token.value};`);
      });
      lines.push('');
    }
  }

  // Elevation (shadows)
  if (tokens.elevation) {
    lines.push('  /* ========================================');
    lines.push('   * Elevation (Shadows)');
    lines.push('   * ======================================== */');
    lines.push('');

    Object.entries(tokens.elevation).forEach(([key, token]) => {
      const description = token.description ? `  /* ${token.description} */` : '';
      if (description) lines.push(description);
      lines.push(`  --shadow-${key}: ${token.value};`);
    });
    lines.push('');
  }

  // Border
  if (tokens.border) {
    lines.push('  /* ========================================');
    lines.push('   * Border');
    lines.push('   * ======================================== */');
    lines.push('');

    // Border radius
    if (tokens.border.radius) {
      Object.entries(tokens.border.radius).forEach(([key, token]) => {
        const description = token.description ? `  /* ${token.description} */` : '';
        if (description) lines.push(description);
        lines.push(`  --radius-${key}: ${token.value};`);
      });
      lines.push('');
    }

    // Border width
    if (tokens.border.width) {
      Object.entries(tokens.border.width).forEach(([key, token]) => {
        const description = token.description ? `  /* ${token.description} */` : '';
        if (description) lines.push(description);
        lines.push(`  --border-${key}: ${token.value};`);
      });
      lines.push('');
    }
  }

  // Animation
  if (tokens.animation) {
    lines.push('  /* ========================================');
    lines.push('   * Animation');
    lines.push('   * ======================================== */');
    lines.push('');

    // Duration
    if (tokens.animation.duration) {
      Object.entries(tokens.animation.duration).forEach(([key, token]) => {
        const description = token.description ? `  /* ${token.description} */` : '';
        if (description) lines.push(description);
        lines.push(`  --duration-${key}: ${token.value};`);
      });
      lines.push('');
    }

    // Easing
    if (tokens.animation.easing) {
      Object.entries(tokens.animation.easing).forEach(([key, token]) => {
        const description = token.description ? `  /* ${token.description} */` : '';
        if (description) lines.push(description);
        lines.push(`  --easing-${key}: ${token.value};`);
      });
      lines.push('');
    }
  }

  lines.push('}');
  lines.push('');

  // Add utility classes for WebShell panels
  lines.push('/* ========================================');
  lines.push(' * WebShell Utility Classes');
  lines.push(' * ======================================== */');
  lines.push('');
  lines.push('.ws-panel {');
  lines.push('  background: var(--color-surface);');
  lines.push('  border-radius: var(--radius-l);');
  lines.push('  padding: var(--space-m);');
  lines.push('  box-shadow: var(--shadow-low);');
  lines.push('}');
  lines.push('');
  lines.push('.ws-panel-high {');
  lines.push('  background: var(--color-surface-high);');
  lines.push('  border-radius: var(--radius-m);');
  lines.push('  padding: var(--space-s);');
  lines.push('  box-shadow: var(--shadow-medium);');
  lines.push('}');
  lines.push('');

  return lines.join('\n');
}

/**
 * Generates TypeScript type definitions from design tokens
 */
function generateTypeScript(tokens) {
  const lines = [
    '/**',
    ' * Design System Tokens - TypeScript Definitions',
    ' * ',
    ' * Auto-generated from design-tokens.json',
    ' * DO NOT EDIT MANUALLY',
    ' * ',
    ' * To regenerate: npm run generate-tokens',
    ' */',
    '',
    '// Color tokens',
  ];

  // Generate color type
  if (tokens.colors) {
    const colorKeys = Object.keys(tokens.colors);
    lines.push('export type ColorToken =');
    colorKeys.forEach((key, index) => {
      const isLast = index === colorKeys.length - 1;
      lines.push(`  | '${key}'${isLast ? ';' : ''}`);
    });
    lines.push('');
  }

  // Generate spacing type
  if (tokens.spacing) {
    const spacingKeys = Object.keys(tokens.spacing);
    lines.push('// Spacing tokens');
    lines.push('export type SpacingToken =');
    spacingKeys.forEach((key, index) => {
      const isLast = index === spacingKeys.length - 1;
      lines.push(`  | '${key}'${isLast ? ';' : ''}`);
    });
    lines.push('');
  }

  // Generate font size type
  if (tokens.typography?.fontSize) {
    const fontSizeKeys = Object.keys(tokens.typography.fontSize);
    lines.push('// Font size tokens');
    lines.push('export type FontSizeToken =');
    fontSizeKeys.forEach((key, index) => {
      const isLast = index === fontSizeKeys.length - 1;
      lines.push(`  | '${key}'${isLast ? ';' : ''}`);
    });
    lines.push('');
  }

  // Generate radius type
  if (tokens.border?.radius) {
    const radiusKeys = Object.keys(tokens.border.radius);
    lines.push('// Border radius tokens');
    lines.push('export type RadiusToken =');
    radiusKeys.forEach((key, index) => {
      const isLast = index === radiusKeys.length - 1;
      lines.push(`  | '${key}'${isLast ? ';' : ''}`);
    });
    lines.push('');
  }

  // Generate complete token interface
  lines.push('// Complete design tokens interface');
  lines.push('export interface DesignTokens {');

  if (tokens.colors) {
    lines.push('  colors: {');
    Object.entries(tokens.colors).forEach(([key, token]) => {
      const camelKey = kebabToCamel(key);
      lines.push(`    ${camelKey}: string;`);
    });
    lines.push('  };');
  }

  if (tokens.spacing) {
    lines.push('  spacing: {');
    Object.keys(tokens.spacing).forEach((key) => {
      lines.push(`    ${key}: string;`);
    });
    lines.push('  };');
  }

  if (tokens.typography) {
    lines.push('  typography: {');
    if (tokens.typography.fontFamily) {
      lines.push('    fontFamily: {');
      Object.keys(tokens.typography.fontFamily).forEach((key) => {
        lines.push(`      ${key}: string;`);
      });
      lines.push('    };');
    }
    if (tokens.typography.fontSize) {
      lines.push('    fontSize: {');
      Object.keys(tokens.typography.fontSize).forEach((key) => {
        lines.push(`      ${key}: string;`);
      });
      lines.push('    };');
    }
    if (tokens.typography.fontWeight) {
      lines.push('    fontWeight: {');
      Object.keys(tokens.typography.fontWeight).forEach((key) => {
        lines.push(`      ${key}: number;`);
      });
      lines.push('    };');
    }
    if (tokens.typography.lineHeight) {
      lines.push('    lineHeight: {');
      Object.keys(tokens.typography.lineHeight).forEach((key) => {
        lines.push(`      ${key}: number;`);
      });
      lines.push('    };');
    }
    lines.push('  };');
  }

  if (tokens.elevation) {
    lines.push('  elevation: {');
    Object.keys(tokens.elevation).forEach((key) => {
      lines.push(`    ${key}: string;`);
    });
    lines.push('  };');
  }

  if (tokens.border) {
    lines.push('  border: {');
    if (tokens.border.radius) {
      lines.push('    radius: {');
      Object.keys(tokens.border.radius).forEach((key) => {
        lines.push(`      ${key}: string;`);
      });
      lines.push('    };');
    }
    if (tokens.border.width) {
      lines.push('    width: {');
      Object.keys(tokens.border.width).forEach((key) => {
        lines.push(`      ${key}: string;`);
      });
      lines.push('    };');
    }
    lines.push('  };');
  }

  if (tokens.animation) {
    lines.push('  animation: {');
    if (tokens.animation.duration) {
      lines.push('    duration: {');
      Object.keys(tokens.animation.duration).forEach((key) => {
        lines.push(`      ${key}: string;`);
      });
      lines.push('    };');
    }
    if (tokens.animation.easing) {
      lines.push('    easing: {');
      Object.keys(tokens.animation.easing).forEach((key) => {
        lines.push(`      ${key}: string;`);
      });
      lines.push('    };');
    }
    lines.push('  };');
  }

  lines.push('}');
  lines.push('');

  // Helper functions
  lines.push('// Helper function to get CSS variable name');
  lines.push('export function getCSSVar(category: string, token: string): string {');
  lines.push('  return `var(--${category}-${token})`;');
  lines.push('}');
  lines.push('');

  return lines.join('\n');
}

/**
 * Main execution
 */
function main() {
  try {
    console.log('🎨 Generating CSS variables and TypeScript definitions...\n');

    // Read design tokens
    console.log('📖 Reading design tokens from:', TOKENS_PATH);
    const tokensRaw = readFileSync(TOKENS_PATH, 'utf-8');
    const tokens = JSON.parse(tokensRaw);

    // Generate CSS
    console.log('🎯 Generating CSS custom properties...');
    const css = generateCSS(tokens);
    writeFileSync(CSS_OUTPUT_PATH, css, 'utf-8');
    console.log('✅ CSS written to:', CSS_OUTPUT_PATH);

    // Generate TypeScript definitions
    console.log('📝 Generating TypeScript definitions...');
    const ts = generateTypeScript(tokens);
    writeFileSync(TS_OUTPUT_PATH, ts, 'utf-8');
    console.log('✅ TypeScript definitions written to:', TS_OUTPUT_PATH);

    console.log('\n✨ Token generation complete!');
  } catch (error) {
    console.error('❌ Error generating tokens:', error.message);
    process.exit(1);
  }
}

main();
