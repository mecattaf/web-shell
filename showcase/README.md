# WebShell Component Showcase

An interactive showcase application for exploring WebShell components, design tokens, and layout primitives.

## Overview

The Component Showcase is a Storybook-style documentation and testing environment that provides:

- **Design Tokens**: Interactive viewer for all design tokens (colors, spacing, typography, etc.)
- **Components**: Live examples of all UI components with code snippets
- **Containers**: Layout primitives and container demonstrations
- **Examples**: Real-world examples combining multiple components

## Running the Showcase

### Development Server

Start the Vite development server:

```bash
npm run dev
```

Then navigate to: `http://localhost:5173/showcase/`

### In QuickShell

Load the showcase in a WebShellView for development:

```qml
import Quickshell

WebShellView {
    source: "http://localhost:5173/showcase"
    devMode: true
}
```

### Production Build

Build the showcase for production:

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Features

### Navigation

The sidebar navigation allows you to switch between different sections:

- **🎨 Design Tokens**: View all design tokens with live values
- **🧩 Components**: Interactive component gallery with examples
- **📦 Containers**: Layout and container demonstrations
- **✨ Examples**: Complete UI examples

### Theme Switcher

The theme switcher at the bottom of the sidebar allows you to preview components in different themes:

- **Dark**: Dark theme (default)
- **Light**: Light theme (planned)
- **Custom**: Custom theme support (planned)

### Code Snippets

Each component and example includes a code snippet that you can copy and use in your own projects. Click the "Copy" button to copy the code to your clipboard.

## Structure

```
showcase/
├── index.html          # Main entry point
├── main.js             # Application logic
├── styles.css          # Showcase-specific styles
├── pages/              # Content pages
│   ├── tokens.html     # Design tokens page
│   ├── components.html # Components page
│   ├── containers.html # Containers page
│   └── examples.html   # Examples page
└── assets/             # Assets (images, etc.)
```

## Extending the Showcase

### Adding a New Component

1. Add the component example to `pages/components.html`
2. Include code snippets with the `demo-code` class
3. Add copy button functionality (handled automatically by `main.js`)

### Adding a New Page

1. Create a new HTML file in `pages/`
2. Add navigation item in `index.html`:
   ```html
   <a href="#mypage" class="showcase-nav-item" data-page="mypage">
     <span class="nav-icon">🎯</span>
     My Page
   </a>
   ```
3. The page will be loaded automatically when clicked

### Customizing Styles

Showcase-specific styles are in `styles.css`. These styles do not affect the component library itself.

## Development Notes

- The showcase uses the same design tokens as the main component library
- All components are live and interactive
- JavaScript is used for:
  - Navigation between pages
  - Theme switching
  - Dynamic token rendering
  - Copy-to-clipboard functionality

## Browser Compatibility

The showcase works in all modern browsers and QtWebEngine. Tested on:

- QtWebEngine 6.x
- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+

## Related Documentation

- [Getting Started Guide](../docs/getting-started.md)
- [Theming Guide](../docs/theming.md)
- [Component Documentation](../docs/components/)
- [Container Documentation](../docs/containers/)
