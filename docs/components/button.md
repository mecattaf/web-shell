# Button Component

Buttons allow users to take actions and make choices with a single tap.

## Usage

```html
<button class="ws-button ws-button--primary">Click Me</button>
```

## Variants

### Primary Button

The primary button is used for the main call-to-action.

```html
<button class="ws-button ws-button--primary">Primary</button>
```

### Secondary Button

Secondary buttons are used for less prominent actions.

```html
<button class="ws-button ws-button--secondary">Secondary</button>
```

### Ghost Button

Ghost buttons are used for tertiary actions or to reduce visual weight.

```html
<button class="ws-button ws-button--ghost">Ghost</button>
```

## Sizes

### Small

```html
<button class="ws-button ws-button--primary ws-button--small">Small</button>
```

### Default

```html
<button class="ws-button ws-button--primary">Default</button>
```

### Large

```html
<button class="ws-button ws-button--primary ws-button--large">Large</button>
```

## States

### Disabled

```html
<button class="ws-button ws-button--primary" disabled>Disabled</button>
```

### Focus

Buttons automatically show focus indicators when navigated via keyboard.

## Accessibility

- Buttons have proper focus states for keyboard navigation
- Use semantic `<button>` elements
- Provide descriptive text content
- For icon-only buttons, include `aria-label`:

```html
<button class="ws-button ws-button--ghost" aria-label="Close">
  ✕
</button>
```

## CSS Classes

| Class | Description |
|-------|-------------|
| `ws-button` | Base button class (required) |
| `ws-button--primary` | Primary variant (filled) |
| `ws-button--secondary` | Secondary variant (surface) |
| `ws-button--ghost` | Ghost variant (transparent) |
| `ws-button--small` | Small size |
| `ws-button--large` | Large size |

## Design Tokens

Buttons use the following design tokens:

```css
/* Colors */
--color-primary
--color-on-primary
--color-surface-high
--color-surface-highest

/* Spacing */
--space-s
--space-m
--space-l

/* Typography */
--font-size-s
--font-weight-medium

/* Border */
--radius-m

/* Animation */
--duration-fast
--easing-standard
```

## Custom Styling

You can customize buttons using CSS:

```css
.my-custom-button {
  /* Override button styles */
  background: var(--color-tertiary);
  color: var(--color-on-tertiary);
  border-radius: var(--radius-full);
}
```

Or use inline styles with design tokens:

```html
<button
  class="ws-button ws-button--primary"
  style="border-radius: var(--radius-full);">
  Rounded Button
</button>
```

## Best Practices

1. **Use appropriate variants**
   - Primary: Main action (one per screen)
   - Secondary: Secondary actions
   - Ghost: Tertiary actions or to reduce visual weight

2. **Keep text concise**
   - Use 1-3 words when possible
   - Use action verbs (e.g., "Save", "Delete", "Continue")

3. **Maintain button hierarchy**
   - Don't use multiple primary buttons in the same context
   - Place primary buttons on the right in horizontal layouts

4. **Ensure adequate spacing**
   - Use at least `--space-s` between buttons
   - Use `--space-m` for more comfortable spacing

## Examples

### Button Group

```html
<div class="ws-stack ws-stack--horizontal ws-stack--gap-s">
  <button class="ws-button ws-button--ghost">Cancel</button>
  <button class="ws-button ws-button--primary">Save</button>
</div>
```

### Full-Width Button

```html
<button class="ws-button ws-button--primary" style="width: 100%;">
  Continue
</button>
```

### Button with Icon

```html
<button class="ws-button ws-button--primary">
  <span>📥</span>
  <span>Download</span>
</button>
```

The button automatically handles spacing between child elements using `gap: var(--space-s)`.
