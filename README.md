# WebShell

A modern, web-based shell interface built with React, TypeScript, and Vite.

## Overview

WebShell is a web-based interface designed to work with QuickShell runtime. It provides a clean, modern UI for system monitoring, media player controls, workspace management, and notifications.

## Features

- **System Monitoring**: CPU and RAM usage display
- **Media Player Controls**: Integration for playback control and metadata display
- **Workspace Management**: Hyprland workspace visualization and switching
- **Notifications**: Visual notification system
- **Volume Control**: Audio volume monitoring and adjustment
- **Date/Time Display**: Real-time clock with AM/PM indicator
- **Keyboard Layout**: Current keyboard layout indicator
- **Wallpaper-Based Theming**: Automatic Material You theme generation from wallpaper using Matugen
- **Component Showcase**: Interactive Storybook-style documentation for all UI components

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type-safe development
- **Vite** - Build tool and dev server
- **Tailwind CSS 4** - Utility-first styling
- **styled-components** - CSS-in-JS styling
- **GSAP** - Animation library
- **Lucide React** - Icon library

## Development

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- QuickShell runtime

### Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Launch QuickShell in dev mode (for hot reload):
```bash
quickshell -p . --dev
```

4. Build for production:
```bash
npm run build
```

5. Preview production build:
```bash
npm run preview
```

### Available Scripts

- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run prettify` - Format code with Prettier

### Hot Reload Development Mode

WebShell includes a powerful hot reload system that automatically reloads your app when source files change:

**Features:**
- 🔄 Automatic reload on file changes
- 🚀 Fast iteration with Vite dev server
- 🛠️ Chrome DevTools integration (F12)
- 📊 Real-time error overlay
- ⚡ 300ms debounced reloads

**Quick Start:**
1. Start Vite dev server: `npm run dev`
2. Launch QuickShell: `quickshell -p . --dev`
3. Edit files in `src/` - changes reload automatically!

**Keyboard Shortcuts:**
- `F5` - Manual reload
- `F12` - Open DevTools inspector

For detailed dev mode documentation, see [docs/dev-mode.md](docs/dev-mode.md)

## Component Showcase

WebShell includes an interactive component showcase for exploring and testing all UI components, design tokens, and layouts:

**Features:**
- 🎨 Design token viewer with live values
- 🧩 Interactive component gallery
- 📦 Layout and container examples
- ✨ Real-world UI examples
- 📋 Copy-to-clipboard code snippets
- 🌓 Theme switcher

**Quick Start:**

1. Start the dev server: `npm run dev`
2. Open the showcase: `http://localhost:5173/showcase/`
3. Or load in QuickShell:
   ```qml
   WebShellView {
       source: "http://localhost:5173/showcase"
       devMode: true
   }
   ```

For detailed documentation, see:
- [Component Showcase](showcase/README.md)
- [Getting Started Guide](docs/getting-started.md)
- [Component Documentation](docs/components/)
- [Container Documentation](docs/containers/)

## Theming

WebShell includes a powerful theme system that can automatically generate Material You themes from your wallpaper:

**Features:**
- 🎨 Automatic color extraction from wallpaper
- 🌈 Material 3 (Material You) color schemes
- 🌓 Light and dark mode support
- 🔄 Real-time theme updates across QML and web apps
- 🎯 Fallback theme when generation fails

**Quick Start:**

1. Install Matugen:
```bash
cargo install matugen
```

2. Enable auto-theming in your QML shell:
```qml
import WebShell.Services

Component.onCompleted: {
    WebShellTheme.autoGenerateFromWallpaper = true
}
```

3. Set your wallpaper with hyprpaper, swww, feh, or nitrogen - theme updates automatically!

For detailed theming documentation, see:
- [Wallpaper Theme Generation](docs/wallpaper-theme-generation.md)
- [Theme System](quickshell/THEME.md)
- [Design Tokens](docs/design-tokens-generator.md)

## QuickShell Integration

This project is designed to integrate with QuickShell runtime. The codebase includes TODO markers where QuickShell bridge calls need to be implemented:

```typescript
// TODO: Replace with QuickShell bridge call
```

These markers indicate where Fabric-specific bridge calls were removed and need to be replaced with QuickShell equivalents.

## Project Structure

```
web-shell/
├── src/
│   ├── components/     # React components
│   ├── @types/         # TypeScript type definitions
│   ├── App.tsx         # Main application component
│   └── main.tsx        # Application entry point
├── public/             # Static assets
├── index.html          # HTML entry point
└── package.json        # Project dependencies
```

## License

[Add your license here]

## Contributing

[Add contribution guidelines here]
