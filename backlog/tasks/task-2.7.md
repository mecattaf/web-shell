---
id: task-2.7
title: Create component showcase and documentation
status: Done
created_date: 2025-01-18
milestone: milestone-2
assignees: []
labels: [documentation, demo]
dependencies: [task-2.5, task-2.6]
---

## Description

Build a Storybook-style showcase application that demonstrates all components, containers, and design tokens. This serves as both documentation and a testing environment.

## Acceptance Criteria

- [ ] Showcase app runs in WebShellView
- [ ] All components demonstrated
- [ ] Interactive examples for each component
- [ ] Theme switcher (light/dark/custom)
- [ ] Design token viewer
- [ ] Container layout examples
- [ ] Code snippets for each example
- [ ] Accessible via QuickShell dev mode

## Implementation Plan

1. **Create Showcase App Structure**
```
showcase/
├── index.html
├── main.js
├── styles.css
├── pages/
│   ├── tokens.html
│   ├── components.html
│   ├── containers.html
│   └── examples.html
└── assets/
```

2. **Component Gallery Page**
```html
<div class="showcase-page">
  <h1>Components</h1>
  
  <section class="component-demo">
    <h2>Buttons</h2>
    <div class="demo-container">
      <button class="ws-button ws-button--primary">Primary</button>
      <button class="ws-button ws-button--secondary">Secondary</button>
      <button class="ws-button ws-button--ghost">Ghost</button>
    </div>
    <pre><code>
&lt;button class="ws-button ws-button--primary"&gt;Primary&lt;/button&gt;
    </code></pre>
  </section>
  
  <!-- Repeat for all components -->
</div>
```

3. **Token Viewer**
```javascript
// Display all design tokens
function renderTokens() {
  const tokens = window.getComputedStyle(document.documentElement);
  const tokenDisplay = document.getElementById('tokens');
  
  // Colors
  const colors = ['surface', 'primary', 'secondary', /* ... */];
  colors.forEach(color => {
    const value = tokens.getPropertyValue(`--color-${color}`);
    tokenDisplay.innerHTML += `
      <div class="token-item">
        <div class="token-swatch" style="background: ${value}"></div>
        <code>--color-${color}</code>
        <span>${value}</span>
      </div>
    `;
  });
  
  // Repeat for spacing, typography, etc.
}
```

4. **Theme Switcher**
```javascript
function switchTheme(themeName) {
  // Load different token sets
  fetch(`/themes/${themeName}.css`)
    .then(res => res.text())
    .then(css => {
      const style = document.getElementById('theme-vars');
      style.textContent = css;
    });
}
```

5. **Container Examples**
```html
<div class="showcase-page">
  <h1>Container Layouts</h1>
  
  <div class="layout-demo">
    <h2>Panel Layout</h2>
    <div class="ws-panel">
      <div class="ws-button">Item 1</div>
      <div class="ws-button">Item 2</div>
    </div>
  </div>
  
  <div class="layout-demo">
    <h2>Widget Layout</h2>
    <div class="ws-widget">
      <h3>Widget Title</h3>
      <p>Widget content...</p>
    </div>
  </div>
</div>
```

6. **Integration Guide**
   - Write documentation on using the showcase
   - Explain component customization
   - Provide migration examples from QML

## Technical Notes

**Loading in QuickShell**:
```qml
// In your dev config
WebShellView {
    source: "http://localhost:5173/showcase"
    devMode: true
}
```

**Interactive Features**:
- Live theme editing
- Component prop controls
- Responsive preview
- Accessibility checker

**Documentation Structure**:
```
docs/
├── getting-started.md
├── components/
│   ├── button.md
│   ├── input.md
│   └── ...
├── containers/
│   ├── panel.md
│   ├── overlay.md
│   └── ...
└── theming.md
```

## Reference Material

Similar showcase systems:
- Storybook
- Fractal (pattern library tool)
- Styleguidist

## Definition of Done

- Showcase app functional
- All components documented
- Theme switcher working
- Code examples provided
- Integration guide written
- Accessible in dev mode
- Git commit: "task-2.7: Create component showcase and documentation"
