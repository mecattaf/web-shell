---
id: task-2.5
title: Implement neutral component library
status: To Do
created_date: 2025-01-18
milestone: milestone-2
assignees: []
labels: [components, ui-kit]
dependencies: [task-2.3, task-2.4]
---

## Description

Create a minimal, unopinionated component library for building WebShell apps. These are wireframe-quality primitives that use design tokens but avoid prescribing specific design language.

**Goal**: Enable rapid UI development without framework lock-in.

## Acceptance Criteria

- [ ] 10+ base components implemented
- [ ] All components use design tokens (CSS vars)
- [ ] Vanilla JS + React versions
- [ ] TypeScript definitions
- [ ] Accessibility built-in (ARIA, keyboard nav)
- [ ] Works in QtWebEngine
- [ ] Documentation with examples

## Implementation Plan

1. **Core Components to Build**

**Layout**:
- `Stack` - flex container with gap control
- `Grid` - CSS grid wrapper
- `Panel` - surface with elevation
- `Surface` - basic container with theme background

**Typography**:
- `Text` - styled text with size variants
- `Heading` - semantic headings

**Controls**:
- `Button` - primary/secondary/ghost variants
- `Input` - text input with label
- `Checkbox` - styled checkbox
- `Select` - dropdown select

**Feedback**:
- `Card` - content container
- `List` - vertical list with items
- `Divider` - separator line

2. **Component Structure**

Example - Button component:

**Vanilla**:
```javascript
// components/Button.js
export function Button({ 
  variant = 'primary', 
  children, 
  onClick 
}) {
  const button = document.createElement('button');
  button.className = `ws-button ws-button--${variant}`;
  button.textContent = children;
  button.onclick = onClick;
  return button;
}
```

**CSS**:
```css
.ws-button {
  padding: var(--space-s) var(--space-m);
  border-radius: var(--radius-md);
  font-family: var(--font-sans);
  font-size: var(--font-size-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--timing-short);
  border: none;
}

.ws-button--primary {
  background: var(--color-primary);
  color: var(--color-on-primary);
}

.ws-button--primary:hover {
  opacity: 0.9;
}

.ws-button--secondary {
  background: var(--color-surface-high);
  color: var(--color-on-surface);
}
```

**React**:
```tsx
// components/Button.tsx
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  children: React.ReactNode;
  onClick?: () => void;
}

export function Button({ 
  variant = 'primary', 
  children, 
  onClick 
}: ButtonProps) {
  return (
    <button 
      className={`ws-button ws-button--${variant}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
```

3. **Create Component Index**
```typescript
// index.ts
export { Stack } from './Stack';
export { Button } from './Button';
export { Input } from './Input';
export { Card } from './Card';
// ... etc
```

4. **Add Accessibility**
   - Proper ARIA labels
   - Keyboard navigation
   - Focus indicators
   - Screen reader support

## Technical Notes

**Design Principles**:
- Minimal styling (wireframe aesthetic)
- Composable (components work together)
- Themable via CSS vars only
- No opinions on state management
- Framework-agnostic core

**Container Primitives** (for shell integration):
```css
.ws-panel {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: var(--space-m);
}

.ws-overlay {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
}

.ws-widget {
  background: var(--color-surface-high);
  box-shadow: var(--shadow-2);
}
```

**QtWebEngine Compatibility**:
- Avoid bleeding-edge CSS
- Test transparent backgrounds
- Verify blur effects
- Check font rendering

## Reference Material

Similar minimal component systems:
- Radix Primitives (headless UI)
- Shoelace (web components)
- DaisyUI structure (but simpler)

Study DMS widgets for patterns:
```bash
cd DankMaterialShell/quickshell/Widgets
ls *.qml
```

## Definition of Done

- Component library package created
- All 10+ components implemented
- Vanilla + React versions working
- TypeScript definitions complete
- Accessibility tested
- Works in QtWebEngine
- Documentation with examples
- Git commit: "task-2.5: Implement neutral component library"
