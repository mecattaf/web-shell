# ManifestParser Service

The ManifestParser service provides functionality to read, validate, and parse webshell.json manifests for WebShell applications.

## Components

### ManifestParser

A QML component that loads and parses manifest files.

#### Properties

- `manifestPath: url` - Path to the manifest file
- `isValid: bool` - Whether the manifest is valid
- `errorMessage: string` - Error message if validation fails
- `manifest: var` - The full parsed manifest object
- `appName: string` - Application name from manifest
- `displayName: string` - Display name (or appName if not specified)
- `entrypoint: string` - Entry point file path
- `permissions: object` - Application permissions
- `windowConfig: object` - Window configuration

#### Signals

- `manifestLoaded()` - Emitted when manifest is successfully loaded
- `manifestError(string error)` - Emitted when an error occurs

#### Methods

- `load(path: url)` - Load a manifest from the given path
- `parseManifest(jsonString: string)` - Parse a manifest from JSON string
- `hasPermission(category: string, action: string): bool` - Check if app has specific permission
- `getAllowedHosts(): array` - Get list of allowed network hosts

### ManifestValidator (Singleton)

A singleton service for validating manifest structures.

#### Methods

- `validateManifest(manifest: object): object` - Returns `{valid: bool, errors: array}`
- `validatePermissions(perms: object): array` - Validates permission structure
- `validateWindowConfig(config: object): array` - Validates window configuration

## Usage Examples

### Basic Loading

```qml
import QtQuick
import WebShell.Services

Item {
    ManifestParser {
        id: parser

        onManifestLoaded: {
            console.log("Loaded app:", appName)
            console.log("Entry point:", entrypoint)
        }

        onManifestError: (error) => {
            console.error("Manifest error:", error)
        }

        Component.onCompleted: {
            load("file:///path/to/app/webshell.json")
        }
    }
}
```

### Using with WebShellLoader

```qml
import QtQuick
import WebShell.Services

Item {
    property string appDirectory: "/path/to/app"

    ManifestParser {
        id: manifestParser

        onManifestLoaded: {
            // Create WebShellView with manifest config
            createWebShellView(manifest);
        }

        Component.onCompleted: {
            const manifestPath = `file://${appDirectory}/webshell.json`;
            load(manifestPath);
        }
    }

    function createWebShellView(manifest) {
        // Use manifest data to configure WebShell
        console.log("Creating view for:", manifest.name)
        console.log("Window type:", manifest.window?.type || "default")
    }
}
```

### Permission Checking

```qml
ManifestParser {
    id: parser

    onManifestLoaded: {
        if (hasPermission("calendar", "read")) {
            console.log("App can read calendar")
        }

        const allowedHosts = getAllowedHosts()
        console.log("Network access allowed for:", allowedHosts)
    }
}
```

### Using the Validator

```qml
import QtQuick
import WebShell.Services

Item {
    Component.onCompleted: {
        const manifest = {
            version: "1.0.0",
            name: "my-app",
            entrypoint: "index.html",
            permissions: {
                calendar: { read: true }
            }
        }

        const result = ManifestValidator.validateManifest(manifest)
        if (result.valid) {
            console.log("Manifest is valid")
        } else {
            console.error("Validation errors:", result.errors)
        }
    }
}
```

### Error Handling

```qml
import QtQuick
import WebShell.Services

Item {
    Connections {
        target: parser

        function onManifestError(error) {
            console.error("Manifest error:", error)
            // Show error dialog to user
            errorDialog.text = error
            errorDialog.open()
        }
    }

    ManifestParser {
        id: parser
    }
}
```

## Manifest Schema

The ManifestParser validates manifests according to the webshell.json schema:

### Required Fields

- `version` - Semantic version (e.g., "1.0.0")
- `name` - App name (lowercase alphanumeric + hyphens)
- `entrypoint` - Entry point file path

### Optional Fields

- `displayName` - Human-readable app name
- `permissions` - Permission configuration object
  - `calendar.read` - Boolean
  - `calendar.write` - Boolean
  - `network.allowed_hosts` - Array of host strings
- `window` - Window configuration object
  - `type` - One of: "widget", "panel", "overlay", "dialog"
  - `width` - Number
  - `height` - Number
  - Other window properties

## Validation Rules

1. **Version**: Must be in semantic version format (X.Y.Z)
2. **Name**: Must be lowercase alphanumeric with hyphens only
3. **Entrypoint**: Required, must be a valid path
4. **Permissions**: Must use boolean values for permission flags
5. **Window.type**: Must be one of the valid window types
6. **Window dimensions**: Must be numbers if specified

## Error Messages

- "Missing required field: version" - Version is required
- "Missing required field: name" - Name is required
- "Missing required field: entrypoint" - Entrypoint is required
- "Invalid version format" - Version must be X.Y.Z format
- "Invalid app name format" - Name must be lowercase alphanumeric + hyphens
- "JSON parse error: ..." - Malformed JSON
- "Failed to load manifest" - File loading failed
