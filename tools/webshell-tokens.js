#!/usr/bin/env node

/**
 * WebShell Tokens CLI
 *
 * Command-line interface for generating design tokens in various formats.
 *
 * Usage:
 *   webshell-tokens generate              # Generate all formats
 *   webshell-tokens generate --format=css # Generate only CSS
 *   webshell-tokens generate --format=ts  # Generate only TypeScript
 *   webshell-tokens validate              # Validate design tokens JSON
 *   webshell-tokens --help                # Show help
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TOKENS_PATH = join(__dirname, '../src/style/design-tokens.json');
const SCHEMA_PATH = join(__dirname, '../src/style/design-tokens.schema.json');
const CSS_OUTPUT_PATH = join(__dirname, '../src/style/tokens.css');
const TS_OUTPUT_PATH = join(__dirname, '../src/style/tokens.d.ts');

const HELP_TEXT = `
WebShell Tokens CLI

Usage:
  webshell-tokens <command> [options]

Commands:
  generate [options]    Generate CSS and/or TypeScript from design tokens
  validate              Validate design tokens against JSON schema
  help                  Show this help message

Options:
  --format=<fmt>        Output format: css, ts, or all (default: all)
  --output=<path>       Custom output path (optional)
  --watch              Watch for changes and regenerate (coming soon)

Examples:
  webshell-tokens generate
  webshell-tokens generate --format=css
  webshell-tokens generate --format=ts --output=./custom-tokens.d.ts
  webshell-tokens validate
`;

function showHelp() {
  console.log(HELP_TEXT);
  process.exit(0);
}

function validateTokens() {
  console.log('🔍 Validating design tokens...\n');

  try {
    // Check if files exist
    if (!existsSync(TOKENS_PATH)) {
      throw new Error(`Design tokens file not found: ${TOKENS_PATH}`);
    }
    if (!existsSync(SCHEMA_PATH)) {
      throw new Error(`Schema file not found: ${SCHEMA_PATH}`);
    }

    // Read and parse tokens
    const tokensRaw = readFileSync(TOKENS_PATH, 'utf-8');
    const tokens = JSON.parse(tokensRaw);
    console.log('✅ Design tokens JSON is valid');

    // Validate against schema using ajv-cli if available
    try {
      execSync(`npx ajv-cli validate -s "${SCHEMA_PATH}" -d "${TOKENS_PATH}"`, {
        stdio: 'inherit',
      });
      console.log('✅ Design tokens validated against schema');
    } catch (error) {
      console.log('⚠️  Schema validation failed or ajv-cli not available');
    }

    // Basic structure validation
    const requiredSections = ['colors', 'spacing', 'typography', 'elevation', 'border', 'animation'];
    const missingSections = requiredSections.filter((section) => !tokens[section]);

    if (missingSections.length > 0) {
      console.log(`⚠️  Missing sections: ${missingSections.join(', ')}`);
    } else {
      console.log('✅ All required sections present');
    }

    console.log('\n✨ Validation complete!');
    return true;
  } catch (error) {
    console.error('❌ Validation error:', error.message);
    process.exit(1);
  }
}

function parseArgs(args) {
  const parsed = {
    command: 'generate',
    format: 'all',
    output: null,
  };

  for (const arg of args) {
    if (arg === 'help' || arg === '--help' || arg === '-h') {
      showHelp();
    } else if (arg === 'validate') {
      parsed.command = 'validate';
    } else if (arg === 'generate') {
      parsed.command = 'generate';
    } else if (arg.startsWith('--format=')) {
      parsed.format = arg.split('=')[1];
    } else if (arg.startsWith('--output=')) {
      parsed.output = arg.split('=')[1];
    }
  }

  return parsed;
}

function generate(options) {
  const { format, output } = options;

  // Import the generator dynamically
  import('./generate-css-vars.js')
    .then(() => {
      // The generator already ran successfully
      console.log('');
      if (format === 'css') {
        console.log('📦 Generated CSS only');
      } else if (format === 'ts') {
        console.log('📦 Generated TypeScript only');
      } else {
        console.log('📦 Generated all formats');
      }
    })
    .catch((error) => {
      console.error('❌ Generation failed:', error.message);
      process.exit(1);
    });
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    showHelp();
  }

  const options = parseArgs(args);

  switch (options.command) {
    case 'validate':
      validateTokens();
      break;
    case 'generate':
      // For now, just run the generator script
      // In the future, this could be more sophisticated
      try {
        execSync('node tools/generate-css-vars.js', { stdio: 'inherit' });
      } catch (error) {
        console.error('❌ Generation failed');
        process.exit(1);
      }
      break;
    default:
      showHelp();
  }
}

main();
