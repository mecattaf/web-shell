# WebShell Documentation

Welcome to the WebShell documentation! This directory contains comprehensive guides for building and deploying WebShell applications.

## Quick Start

New to WebShell? Start here:

1. **[Getting Started](./getting-started.md)** - Set up your first WebShell app
2. **[Manifest Reference](./manifest-reference.md)** - Quick lookup for manifest fields
3. **[Manifest Examples](./manifest-examples.md)** - Real-world example manifests

## Documentation Index

### Core Concepts

#### Manifest System
- **[Manifest Reference](./manifest-reference.md)** - Quick reference for all manifest fields
- **[Manifest Schema](./manifest-schema.md)** - Complete specification with validation rules and TypeScript types
- **[Manifest Examples](./manifest-examples.md)** - Real-world examples for common app types
- **[Manifest Best Practices](./manifest-best-practices.md)** - Recommended patterns and guidelines
- **[Manifest Troubleshooting](./manifest-troubleshooting.md)** - Common issues and solutions
- **[Manifest Migration Guide](./manifest-migration.md)** - Migrate from Electron, Chrome Extensions, PWAs, and more

#### Permissions
- **[Permissions Guide](./permissions-guide.md)** - User-friendly guide to the permission system
- **[Permission System](./permission-system.md)** - Technical implementation details

#### Window Management
- **[Window Configuration](./window-configuration.md)** - Configure app windows, panels, and overlays

#### Theming
- **[Theming System](./theming.md)** - Create and apply themes
- **[Design Tokens Generator](./design-tokens-generator.md)** - Generate design tokens
- **[Theme Extraction](./theme-extraction.md)** - Extract themes from images
- **[Wallpaper Theme Generation](./wallpaper-theme-generation.md)** - Generate themes from wallpapers

### Development

#### Development Mode
- **[Development Mode Guide](./dev-mode.md)** - Hot reload and development workflow

#### Multi-App Orchestration
- **[Orchestration](./orchestration.md)** - Launch and manage multiple apps

#### Testing
- **[Test Guide](./TEST_GUIDE.md)** - Testing your WebShell apps

## Documentation by Use Case

### I want to...

#### Create a New App
1. Read [Getting Started](./getting-started.md)
2. Review [Manifest Examples](./manifest-examples.md)
3. Check [Best Practices](./manifest-best-practices.md)

#### Understand Permissions
1. Read [Permissions Guide](./permissions-guide.md)
2. Check [Permission System](./permission-system.md) for technical details
3. Review permission examples in [Manifest Examples](./manifest-examples.md)

#### Configure Windows
1. Read [Window Configuration](./window-configuration.md)
2. Check window examples in [Manifest Examples](./manifest-examples.md)
3. Review [Best Practices](./manifest-best-practices.md)

#### Customize Theming
1. Read [Theming System](./theming.md)
2. Use [Design Tokens Generator](./design-tokens-generator.md)
3. Try [Wallpaper Theme Generation](./wallpaper-theme-generation.md)

#### Migrate from Another Platform
1. Read [Migration Guide](./manifest-migration.md)
2. Follow platform-specific instructions
3. Check [Troubleshooting](./manifest-troubleshooting.md) if needed

#### Fix an Issue
1. Check [Troubleshooting](./manifest-troubleshooting.md)
2. Validate with [Manifest Schema](./manifest-schema.md)
3. Review [Best Practices](./manifest-best-practices.md)

#### Set Up Development
1. Read [Development Mode Guide](./dev-mode.md)
2. Configure hot reload
3. Review [Test Guide](./TEST_GUIDE.md)

## Manifest Documentation Structure

The manifest documentation is organized as follows:

```
Manifest Documentation
│
├── Quick Reference
│   └── manifest-reference.md (Fast field lookup)
│
├── Complete Specification
│   └── manifest-schema.md (Full schema with validation)
│
├── Learning Resources
│   ├── manifest-examples.md (Real-world examples)
│   ├── manifest-best-practices.md (Recommended patterns)
│   └── permissions-guide.md (Permission usage guide)
│
└── Problem Solving
    ├── manifest-troubleshooting.md (Common issues)
    └── manifest-migration.md (Platform migration)
```

## Component Documentation

Component-specific documentation is in subdirectories:

- **[components/](./components/)** - UI component documentation
- **[containers/](./containers/)** - Container component documentation

## Quick Reference Tables

### Manifest Fields

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| `version` | Yes | string | App version (semantic versioning) |
| `name` | Yes | string | Unique app identifier (lowercase, hyphens) |
| `entrypoint` | Yes | string | Path to main HTML file |
| `displayName` | No | string | User-facing app name |
| `description` | No | string | App description |
| `permissions` | No | object | Required permissions |
| `window` | No | object | Window configuration |
| `theme` | No | object | Theme configuration |
| `shortcuts` | No | array | Keyboard shortcuts |
| `hooks` | No | object | Lifecycle hooks |

See [Manifest Reference](./manifest-reference.md) for complete field documentation.

### Permission Categories

| Permission | Description | Example Use Case |
|------------|-------------|------------------|
| `calendar` | Calendar access | Event management apps |
| `contacts` | Contact information | Communication apps |
| `filesystem` | File system access | Document editors |
| `network` | Network access | Email clients, browsers |
| `notifications` | System notifications | Reminder apps |
| `clipboard` | Clipboard access | Code editors |
| `processes` | Process spawning | IDEs, terminals |
| `system` | System features | Music players, power management |

See [Permissions Guide](./permissions-guide.md) for detailed permission documentation.

### Window Types

| Type | Description | Use Case |
|------|-------------|----------|
| `widget` | Standalone window | Apps, tools |
| `panel` | Docked panel | System bars, docks |
| `overlay` | Full-screen overlay | Modal interfaces |
| `dialog` | Modal dialog | Alerts, prompts |

See [Window Configuration](./window-configuration.md) for details.

## Validation and Tools

### JSON Schema Validation

Add schema reference to your manifest for IDE support:

```json
{
  "$schema": "https://webshell.dev/schemas/manifest/v1.json"
}
```

### CLI Validation

```bash
# Install validator
npm install -g ajv-cli

# Validate manifest
ajv validate -s schemas/webshell-manifest.schema.json -d webshell.json
```

### Format Manifest

```bash
# Pretty-print with jq
jq . webshell.json > webshell-formatted.json
```

## Common Workflows

### Creating a New App

1. Create project directory
2. Add `index.html` (your app UI)
3. Create `webshell.json`:
   ```json
   {
     "$schema": "https://webshell.dev/schemas/manifest/v1.json",
     "version": "1.0.0",
     "name": "my-app",
     "entrypoint": "index.html"
   }
   ```
4. Add permissions as needed
5. Test with `webshell launch ./webshell.json`

### Setting Up Development Mode

1. Start your dev server (e.g., Vite, webpack-dev-server)
2. Add to manifest:
   ```json
   {
     "devServer": "http://localhost:5173",
     "devMode": {
       "hotReload": true,
       "watchPaths": ["src/**/*"]
     }
   }
   ```
3. Launch with `--dev` flag

### Adding Permissions

1. Identify required capabilities
2. Add to manifest:
   ```json
   {
     "permissions": {
       "calendar": {
         "read": true,
         "write": true
       }
     }
   }
   ```
3. Use WebShell API in your app
4. Test permission enforcement

## Troubleshooting

Common issues and solutions:

- **Permission denied errors**: Check [Permissions Guide](./permissions-guide.md)
- **Manifest validation errors**: See [Troubleshooting](./manifest-troubleshooting.md)
- **Window configuration issues**: Review [Window Configuration](./window-configuration.md)
- **Theme not applying**: Check [Theming System](./theming.md)
- **Hot reload not working**: See [Development Mode Guide](./dev-mode.md)

## Examples

Find complete examples in:

- **[Manifest Examples](./manifest-examples.md)** - Example manifests for common app types
- **`examples/` directory** - Full example apps with source code

## Contributing to Documentation

To improve these docs:

1. Identify missing or unclear content
2. Submit an issue or PR
3. Follow the existing documentation style
4. Include examples where helpful

## Version History

Documentation for different WebShell versions:

- **v1.0.0** (Current) - Initial release

## Additional Resources

### External Links

- [WebShell Repository](https://github.com/webshell/webshell)
- [WebShell Website](https://webshell.dev)
- [Community Forum](https://webshell.dev/community)

### Standards Referenced

- [Semantic Versioning](https://semver.org/)
- [JSON Schema](https://json-schema.org/)
- [SPDX Licenses](https://spdx.org/licenses/)

## Getting Help

- **Documentation Issues**: Check [Troubleshooting](./manifest-troubleshooting.md)
- **Bug Reports**: GitHub Issues
- **Questions**: Community Forum
- **Feature Requests**: GitHub Discussions

---

**Quick Links**:
[Getting Started](./getting-started.md) |
[Manifest Reference](./manifest-reference.md) |
[Permissions Guide](./permissions-guide.md) |
[Examples](./manifest-examples.md) |
[Troubleshooting](./manifest-troubleshooting.md)
