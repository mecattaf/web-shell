# Test App - WebShell Example

This is a simple test application for demonstrating the WebShellLoader functionality.

## Purpose

- Demonstrates the structure of a WebShell application
- Shows how the manifest (`webshell.json`) is configured
- Tests that the WebShellLoader can discover and load apps
- Verifies that the shared WebEngineProfile works correctly

## Structure

```
test-app/
├── webshell.json       # App manifest
├── index.html          # Entry point
└── README.md          # This file
```

## Testing

To test this app with WebShellLoader:

1. Copy this directory to `~/.config/webshell/apps/test-app/`
2. Run WebShellLoader.initialize()
3. Check that the app is discovered and loaded
4. Launch the app with WebShellLoader.launchApp("test-app")

## Features Demonstrated

- **Manifest parsing**: Shows required fields (version, name, entrypoint)
- **Window configuration**: Demonstrates window size and type settings
- **Permissions**: Shows how to declare permissions in the manifest
- **Shared profile**: Uses the shared WebEngineProfile for memory efficiency
- **Console logging**: JavaScript console messages forwarded to terminal

## Expected Behavior

When loaded:
- WebShellLoader discovers the app from filesystem
- ManifestParser validates the manifest
- PermissionManager registers the calendar.read permission
- App can be launched via WebShellLoader.launchApp()
- WebShellView loads index.html with shared profile
- UI displays confirmation that app loaded successfully
