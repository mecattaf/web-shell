# Getting Started with WebShell Components

WebShell provides a minimal, unopinionated component library built on top of a comprehensive design token system. This guide will help you get started using WebShell components in your applications.

## Overview

WebShell components are designed to:
- Work seamlessly with QtWebEngine
- Provide consistent styling through design tokens
- Be accessible and follow best practices
- Support both vanilla HTML and modern frameworks

## Installation

### Including Styles

To use WebShell components, include the required stylesheets in your HTML:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <link rel="stylesheet" href="../src/style/tokens.css">
  <link rel="stylesheet" href="../src/ui/styles/components.css">
</head>
<body>
  <!-- Your content here -->
</body>
</html>
```

### Using with Vite

If you're using a build tool like Vite, import the styles in your main JavaScript/TypeScript file:

```javascript
import '../src/style/tokens.css';
import '../src/ui/styles/components.css';
```

## Basic Usage

### Using Components

Components are applied using CSS classes with the `ws-` prefix (WebShell):

```html
<!-- Button example -->
<button class="ws-button ws-button--primary">Click Me</button>

<!-- Input example -->
<div class="ws-input-wrapper">
  <label class="ws-input-label">Email</label>
  <input type="email" class="ws-input" placeholder="you@example.com">
</div>

<!-- Card example -->
<div class="ws-card">
  <h3 class="ws-heading ws-heading--h3">Card Title</h3>
  <p class="ws-text">Card content goes here.</p>
</div>
```

### Using Layout Containers

Layout containers help structure your application:

```html
<!-- Vertical stack -->
<div class="ws-stack">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>

<!-- Horizontal stack -->
<div class="ws-stack ws-stack--horizontal ws-stack--gap-m">
  <button class="ws-button">Button 1</button>
  <button class="ws-button">Button 2</button>
</div>

<!-- Grid layout -->
<div class="ws-grid ws-grid--cols-3">
  <div class="ws-card">Card 1</div>
  <div class="ws-card">Card 2</div>
  <div class="ws-card">Card 3</div>
</div>
```

## Design Tokens

WebShell uses CSS custom properties (CSS variables) for theming. All design tokens are prefixed with `--`:

```css
/* Colors */
var(--color-primary)
var(--color-surface)
var(--color-text)

/* Spacing */
var(--space-s)
var(--space-m)
var(--space-l)

/* Typography */
var(--font-size-m)
var(--font-weight-medium)

/* Border radius */
var(--radius-m)

/* Shadows */
var(--shadow-medium)
```

You can use these tokens in your custom styles:

```css
.my-custom-component {
  background: var(--color-surface);
  padding: var(--space-m);
  border-radius: var(--radius-m);
  color: var(--color-text);
}
```

## Component Showcase

To explore all available components interactively, open the component showcase:

```bash
npm run dev
```

Then navigate to `http://localhost:5173/showcase/` in your browser.

The showcase includes:
- **Design Tokens**: View all available design tokens with live previews
- **Components**: Interactive examples of all UI components
- **Containers**: Layout primitives and container components
- **Examples**: Complete UI examples combining multiple components

## Next Steps

- Explore the [Component Documentation](./components/) for detailed component APIs
- Learn about [Container Layouts](./containers/) for structuring your UI
- Read the [Theming Guide](./theming.md) to customize the design system
- Check out the [Examples](../showcase/pages/examples.html) for real-world use cases

## QuickShell Integration

To use WebShell components in QuickShell, load them in a WebShellView:

```qml
import Quickshell

WebShellView {
    source: "http://localhost:5173"
    // or
    source: "file:///path/to/your/app/index.html"
}
```

For development with live reload:

```qml
WebShellView {
    source: "http://localhost:5173/showcase"
    devMode: true
}
```

## Support

For issues, questions, or contributions, visit the [WebShell repository](https://github.com/yourusername/web-shell).
