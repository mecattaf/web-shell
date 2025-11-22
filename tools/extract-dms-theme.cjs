#!/usr/bin/env node

/**
 * Extract DMS theme values and convert to design tokens JSON
 *
 * This script parses DankMaterialShell's Theme.qml file and extracts
 * all theme values (colors, spacing, typography, etc.) into the
 * WebShell design tokens format.
 *
 * Usage:
 *   node extract-dms-theme.js <path-to-Theme.qml> <output-path>
 *   node extract-dms-theme.js ../DankMaterialShell/quickshell/Common/Theme.qml design-tokens.json
 */

const fs = require('fs');
const path = require('path');

/**
 * Parse QML file to extract theme values
 */
function parseQMLTheme(qmlContent) {
  const tokens = {
    "$schema": "./src/style/design-tokens.schema.json",
    "version": "1.0.0",
    "colors": {},
    "spacing": {},
    "typography": {
      "fontFamily": {},
      "fontSize": {},
      "fontWeight": {},
      "lineHeight": {}
    },
    "elevation": {},
    "border": {
      "radius": {},
      "width": {}
    },
    "animation": {
      "duration": {},
      "easing": {}
    }
  };

  // Extract color properties
  // Pattern: readonly property color colName: "#hexvalue"
  const colorRegex = /readonly\s+property\s+color\s+col(\w+):\s+"(#[A-Fa-f0-9]{6,8})"/g;
  let match;
  const colorMappings = {
    // Surface colors
    'Surface': 'surface',
    'SurfaceContainer': 'surface-high',
    'SurfaceContainerHigh': 'surface-high',
    'SurfaceContainerHighest': 'surface-highest',
    'SurfaceContainerLow': 'surface-low',
    'OnSurface': 'text',
    'OnSurfaceVariant': 'text-secondary',

    // Primary colors
    'Primary': 'primary',
    'OnPrimary': 'on-primary',
    'PrimaryContainer': 'primary-container',

    // Secondary colors
    'Secondary': 'secondary',
    'OnSecondary': 'on-secondary',
    'SecondaryContainer': 'secondary-container',

    // Error colors
    'Error': 'error',
    'OnError': 'on-error',
    'ErrorContainer': 'error-container',

    // Warning colors
    'Warning': 'warning',
    'OnWarning': 'on-warning',

    // Success colors
    'Success': 'success',
    'OnSuccess': 'on-success',

    // Info colors
    'Info': 'info',
    'OnInfo': 'on-info',

    // Outline/Border colors
    'Outline': 'border',
    'OutlineVariant': 'border-focus',

    // Background colors
    'Background': 'background',
    'OnBackground': 'on-background',

    // Inverse colors
    'InverseSurface': 'inverse-surface',
    'InverseOnSurface': 'inverse-on-surface',
    'InversePrimary': 'inverse-primary'
  };

  while ((match = colorRegex.exec(qmlContent)) !== null) {
    const [_, name, value] = match;
    const tokenName = colorMappings[name] || camelToKebab(name);

    tokens.colors[tokenName] = {
      value: value,
      description: `Extracted from Appearance.colors.col${name}`
    };
  }

  // Extract spacing properties
  // Pattern: readonly property int name: value
  const spacingRegex = /spacing:\s*QtObject\s*{([^}]+)}/s;
  const spacingMatch = qmlContent.match(spacingRegex);
  if (spacingMatch) {
    const spacingBlock = spacingMatch[1];
    const spacingPropRegex = /readonly\s+property\s+int\s+(\w+):\s*(\d+)/g;
    while ((match = spacingPropRegex.exec(spacingBlock)) !== null) {
      const [_, name, value] = match;
      tokens.spacing[name] = {
        value: `${value}px`,
        description: `Extracted from Appearance.spacing.${name}`
      };
    }
  }

  // Extract font family
  const fontFamilyRegex = /font:.*?family:\s*"([^"]+)"/s;
  const fontFamilyMatch = qmlContent.match(fontFamilyRegex);
  if (fontFamilyMatch) {
    tokens.typography.fontFamily.base = {
      value: `${fontFamilyMatch[1]}, system-ui, -apple-system, sans-serif`,
      description: "Extracted from Appearance.font.family"
    };
  }

  // Extract monospace font
  const monoFontRegex = /monospace:\s*"([^"]+)"/;
  const monoFontMatch = qmlContent.match(monoFontRegex);
  if (monoFontMatch) {
    tokens.typography.fontFamily.monospace = {
      value: monoFontMatch[1],
      description: "Extracted from Appearance.font.monospace"
    };
  }

  // Set heading to match base for now
  tokens.typography.fontFamily.heading = {
    value: tokens.typography.fontFamily.base?.value || "system-ui, sans-serif",
    description: "Same as base font family"
  };

  // Extract font sizes
  // Pattern: readonly property int size: value
  const fontSizeMapping = {
    'small': 'xs',
    'medium': 's',
    'normal': 'm',
    'large': 'l',
    'larger': 'xl',
    'xl': 'xxl',
    'xxl': 'xxxl'
  };

  const fontSizeRegex = /pixelSize:.*?{([^}]+)}/s;
  const fontSizeMatch = qmlContent.match(fontSizeRegex);
  if (fontSizeMatch) {
    const sizeBlock = fontSizeMatch[1];
    const sizePropRegex = /readonly\s+property\s+int\s+(\w+):\s*(\d+)/g;
    while ((match = sizePropRegex.exec(sizeBlock)) !== null) {
      const [_, name, value] = match;
      const tokenName = fontSizeMapping[name] || name;
      tokens.typography.fontSize[tokenName] = {
        value: `${value}px`,
        description: `Extracted from Appearance.font.pixelSize.${name}`
      };
    }
  }

  // Extract font weights
  const fontWeightRegex = /weight:.*?{([^}]+)}/s;
  const fontWeightMatch = qmlContent.match(fontWeightRegex);
  if (fontWeightMatch) {
    const weightBlock = fontWeightMatch[1];
    const weightPropRegex = /readonly\s+property\s+int\s+(\w+):\s*(\d+)/g;
    while ((match = weightPropRegex.exec(weightBlock)) !== null) {
      const [_, name, value] = match;
      tokens.typography.fontWeight[name] = {
        value: parseInt(value),
        description: `Extracted from Appearance.font.weight.${name}`
      };
    }
  }

  // Set default line heights
  tokens.typography.lineHeight = {
    tight: {
      value: 1.2,
      description: "Tight line height for headings"
    },
    normal: {
      value: 1.5,
      description: "Normal line height for body text"
    },
    relaxed: {
      value: 1.75,
      description: "Relaxed line height for large text"
    }
  };

  // Extract border radii (rounding)
  const radiusMapping = {
    'none': 'none',
    'small': 's',
    'normal': 'm',
    'large': 'l',
    'xl': 'xl',
    'full': 'full'
  };

  const roundingRegex = /rounding:.*?{([^}]+)}/s;
  const roundingMatch = qmlContent.match(roundingRegex);
  if (roundingMatch) {
    const roundingBlock = roundingMatch[1];
    const roundingPropRegex = /readonly\s+property\s+int\s+(\w+):\s*(\d+)/g;
    while ((match = roundingPropRegex.exec(roundingBlock)) !== null) {
      const [_, name, value] = match;
      const tokenName = radiusMapping[name] || name;
      const pixelValue = parseInt(value) > 100 ? '9999px' : `${value}px`;
      tokens.border.radius[tokenName] = {
        value: pixelValue,
        description: `Extracted from Appearance.rounding.${name}`
      };
    }
  }

  // Extract border widths
  const borderWidthRegex = /borderWidth:.*?{([^}]+)}/s;
  const borderWidthMatch = qmlContent.match(borderWidthRegex);
  if (borderWidthMatch) {
    const widthBlock = borderWidthMatch[1];
    const widthPropRegex = /readonly\s+property\s+int\s+(\w+):\s*(\d+)/g;
    while ((match = widthPropRegex.exec(widthBlock)) !== null) {
      const [_, name, value] = match;
      tokens.border.width[name] = {
        value: `${value}px`,
        description: `Extracted from Appearance.borderWidth.${name}`
      };
    }
  }

  // Extract elevation/shadows
  const elevationMapping = {
    'none': 'none',
    'level1': 'low',
    'level2': 'low',
    'level3': 'medium',
    'level4': 'high',
    'level5': 'high'
  };

  const elevationRegex = /elevation:.*?{([^}]+)}/s;
  const elevationMatch = qmlContent.match(elevationRegex);
  if (elevationMatch) {
    const elevationBlock = elevationMatch[1];
    const elevationPropRegex = /readonly\s+property\s+string\s+(\w+):\s*"([^"]+)"/g;
    while ((match = elevationPropRegex.exec(elevationBlock)) !== null) {
      const [_, name, value] = match;
      const tokenName = elevationMapping[name] || name;
      // Only add unique elevation levels
      if (!tokens.elevation[tokenName] || name === 'level2' || name === 'level3' || name === 'level4') {
        tokens.elevation[tokenName] = {
          value: value,
          description: `Extracted from Appearance.elevation.${name}`
        };
      }
    }
  }

  // Extract animation durations
  const durationMapping = {
    'durationFast': 'fast',
    'durationNormal': 'normal',
    'durationSlow': 'slow'
  };

  const animationRegex = /animation:.*?{([^}]+)}/s;
  const animationMatch = qmlContent.match(animationRegex);
  if (animationMatch) {
    const animationBlock = animationMatch[1];
    const durationPropRegex = /readonly\s+property\s+int\s+(duration\w+):\s*(\d+)/g;
    while ((match = durationPropRegex.exec(animationBlock)) !== null) {
      const [_, name, value] = match;
      const tokenName = durationMapping[name] || name;
      tokens.animation.duration[tokenName] = {
        value: `${value}ms`,
        description: `Extracted from Appearance.animation.${name}`
      };
    }

    // Extract easing functions
    const easingPropRegex = /readonly\s+property\s+string\s+easing(\w+):\s*"([^"]+)"/g;
    while ((match = easingPropRegex.exec(animationBlock)) !== null) {
      const [_, name, value] = match;
      const tokenName = name.toLowerCase();
      tokens.animation.easing[tokenName] = {
        value: value,
        description: `Extracted from Appearance.animation.easing${name}`
      };
    }
  }

  return tokens;
}

/**
 * Convert camelCase to kebab-case
 */
function camelToKebab(str) {
  return str
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .replace(/^-/, '');
}

/**
 * Main execution
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
Extract DMS Theme to Design Tokens

Usage:
  node extract-dms-theme.js <theme-qml-path> [output-path]

Arguments:
  theme-qml-path    Path to DMS Theme.qml file
  output-path       Output path for design tokens JSON (default: design-tokens.json)

Examples:
  node extract-dms-theme.js ../DankMaterialShell/quickshell/Common/Theme.qml
  node extract-dms-theme.js reference/Theme.qml src/style/design-tokens.json
    `);
    process.exit(0);
  }

  const dmsThemePath = args[0];
  const outputPath = args[1] || 'design-tokens.json';

  if (!fs.existsSync(dmsThemePath)) {
    console.error('❌ Error: DMS Theme.qml not found:', dmsThemePath);
    console.error('\nPlease provide a valid path to the Theme.qml file.');
    process.exit(1);
  }

  console.log('🔍 Reading DMS theme from:', dmsThemePath);
  const qmlContent = fs.readFileSync(dmsThemePath, 'utf8');

  console.log('⚙️  Parsing QML and extracting tokens...');
  const tokens = parseQMLTheme(qmlContent);

  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write output
  console.log('💾 Writing tokens to:', outputPath);
  fs.writeFileSync(outputPath, JSON.stringify(tokens, null, 2) + '\n');

  // Print summary
  console.log('\n✅ Token extraction complete!');
  console.log('\nSummary:');
  console.log('  Colors:     ', Object.keys(tokens.colors).length);
  console.log('  Spacing:    ', Object.keys(tokens.spacing).length);
  console.log('  Font Sizes: ', Object.keys(tokens.typography.fontSize).length);
  console.log('  Font Weights:', Object.keys(tokens.typography.fontWeight).length);
  console.log('  Radii:      ', Object.keys(tokens.border.radius).length);
  console.log('  Elevations: ', Object.keys(tokens.elevation).length);
  console.log('  Durations:  ', Object.keys(tokens.animation.duration).length);
  console.log('  Easings:    ', Object.keys(tokens.animation.easing).length);
  console.log('\n📝 Next steps:');
  console.log('  1. Validate: npx ajv-cli validate -s src/style/design-tokens.schema.json -d', outputPath);
  console.log('  2. Review the generated tokens');
  console.log('  3. Integrate with your build system');
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { parseQMLTheme, camelToKebab };
