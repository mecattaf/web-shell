# QuickShell QML Structure

This directory contains the QuickShell QML implementation for the Web Shell project.

## Structure

```
quickshell/
├── shell.qml              # Entry point - defines ShellRoot
├── WebShell.qml          # Main shell orchestration component
├── THEME.md              # Theme system documentation
├── Services/
│   ├── qmldir            # Module definition for services
│   ├── WebShellService.qml  # Singleton service for state management
│   ├── BridgeService.qml    # Bridge for QML<->JS communication
│   ├── DevModeManager.qml   # Development mode manager
│   └── WebShellTheme.qml    # Theme singleton (design tokens)
└── Components/
    ├── qmldir                  # Module definition for components
    ├── WebShellProfile.qml     # Shared WebEngine profile
    ├── WebShellView.qml        # WebEngine wrapper
    ├── WebShellContainer.qml   # Container for web content
    ├── DevServerChecker.qml    # Dev server availability checker
    ├── ThemeLoader.qml         # Theme loader with DMS compatibility
    └── ThemedWebShellView.qml  # WebView with automatic theme injection
```

## Components

### shell.qml
The entry point for the QuickShell application. Defines the `ShellRoot` and instantiates the main `WebShell` component.

### WebShell.qml
Main shell orchestration component that:
- Creates and manages the shell window
- Sets up the initial window configuration (1280x720)
- Contains the WebShellContainer

### Services/WebShellService.qml
Singleton service that manages:
- Server connection configuration
- Connection status
- Shell initialization state
- Signals for lifecycle events

### Components/WebShellContainer.qml
Container component that will host the WebEngineView (to be added in future tasks).
Currently displays a placeholder message.

### Services/WebShellTheme.qml
Singleton that mirrors design tokens from `src/style/design-tokens.json` into QML properties.
Provides:
- All design token values as QML properties (colors, spacing, typography, etc.)
- Methods to update theme from JSON
- Signal emission on theme changes
- DMS compatibility layer

See [THEME.md](./THEME.md) for complete documentation.

### Components/ThemeLoader.qml
Component that loads design tokens and provides DMS compatibility.
Features:
- Loads theme from design tokens file
- Maps DMS Appearance.* values to WebShellTheme
- Watches for theme changes (placeholder for future C++ integration)

### Components/ThemedWebShellView.qml
WebShellView wrapper that automatically injects theme into web applications.
Provides:
- Automatic theme injection on page load
- Live theme updates via JavaScript events
- CSS custom properties injection (e.g., `var(--color-primary)`)
- `window.webShellTheme` JavaScript object for web apps

## Running

To launch the shell:

```bash
quickshell -p quickshell/
```

## Architecture Patterns

This implementation follows DMS (DankMaterialShell) architectural patterns:

1. **pragma ComponentBehavior: Bound** - Used in all components for strict scoping
2. **Singleton Pattern** - Services are singletons registered via qmldir
3. **Component Separation** - Clear separation between services and UI components
4. **Scope Usage** - WebShell uses Scope for proper component organization

## Dependencies

- Qt 6.6+
- QtQuick
- QtWebEngine (for future integration)
- QuickShell

## Future Integration

The next steps will involve:
1. Integrating QtWebEngine.WebEngineView into WebShellContainer
2. Connecting to the Flask backend server
3. Adding window management features
4. Implementing IPC communication

## References

Based on patterns from:
- [QuickShell](https://github.com/quickshell-mirror/quickshell)
- [DankMaterialShell](https://github.com/AvengeMedia/DankMaterialShell)
