# Panel Container

Panels are elevated surface containers with background, padding, and shadow. They're used to group related content and create visual hierarchy.

## Usage

```html
<div class="ws-panel">
  <h3 class="ws-heading ws-heading--h3">Panel Title</h3>
  <p class="ws-text">Panel content goes here.</p>
</div>
```

## Variants

### Default Panel

```html
<div class="ws-panel">
  <h3 class="ws-heading ws-heading--h4">Default Panel</h3>
  <p class="ws-text ws-text--size-s">
    Medium elevation with default surface color.
  </p>
</div>
```

### Elevation Variants

Control the shadow depth of panels:

```html
<!-- No elevation -->
<div class="ws-panel ws-panel--elevation-none">
  <p class="ws-text">Panel with no shadow</p>
</div>

<!-- Low elevation -->
<div class="ws-panel ws-panel--elevation-low">
  <p class="ws-text">Panel with subtle shadow</p>
</div>

<!-- Medium elevation (default) -->
<div class="ws-panel ws-panel--elevation-medium">
  <p class="ws-text">Panel with medium shadow</p>
</div>

<!-- High elevation -->
<div class="ws-panel ws-panel--elevation-high">
  <p class="ws-text">Panel with prominent shadow</p>
</div>
```

## CSS Classes

| Class | Description |
|-------|-------------|
| `ws-panel` | Base panel class (required) |
| `ws-panel--elevation-none` | No shadow |
| `ws-panel--elevation-low` | Subtle shadow |
| `ws-panel--elevation-medium` | Medium shadow (default) |
| `ws-panel--elevation-high` | Prominent shadow |

## Design Tokens

Panels use the following design tokens:

```css
/* Colors */
--color-surface         /* Background color */

/* Spacing */
--space-m              /* Default padding */

/* Border */
--radius-l             /* Border radius */

/* Shadows */
--shadow-none
--shadow-low
--shadow-medium
--shadow-high
```

## Custom Styling

### Custom Padding

```html
<div class="ws-panel" style="padding: var(--space-l);">
  Large padding
</div>

<div class="ws-panel" style="padding: var(--space-s);">
  Small padding
</div>
```

### Custom Width

```html
<div class="ws-panel" style="max-width: 600px;">
  Constrained width panel
</div>
```

### Custom Background

```html
<div class="ws-panel" style="background: var(--color-surface-high);">
  Elevated surface color
</div>
```

## Use Cases

### Content Card

```html
<div class="ws-panel">
  <h2 class="ws-heading ws-heading--h3" style="margin-bottom: 12px;">
    Article Title
  </h2>
  <p class="ws-text ws-text--secondary" style="margin-bottom: 16px;">
    Published on January 1, 2025
  </p>
  <p class="ws-text">
    Article content and description goes here...
  </p>
  <div style="margin-top: 16px;">
    <button class="ws-button ws-button--primary">Read More</button>
  </div>
</div>
```

### Form Container

```html
<div class="ws-panel" style="max-width: 500px;">
  <h2 class="ws-heading ws-heading--h2" style="margin-bottom: 24px;">
    Contact Us
  </h2>

  <div class="ws-stack ws-stack--gap-m">
    <div class="ws-input-wrapper">
      <label class="ws-input-label">Name</label>
      <input type="text" class="ws-input">
    </div>

    <div class="ws-input-wrapper">
      <label class="ws-input-label">Email</label>
      <input type="email" class="ws-input">
    </div>

    <div class="ws-input-wrapper">
      <label class="ws-input-label">Message</label>
      <textarea class="ws-input" rows="4"></textarea>
    </div>

    <button class="ws-button ws-button--primary">Send Message</button>
  </div>
</div>
```

### Settings Panel

```html
<div class="ws-panel">
  <h3 class="ws-heading ws-heading--h3" style="margin-bottom: 16px;">
    Preferences
  </h3>

  <div class="ws-stack ws-stack--gap-m">
    <label class="ws-checkbox-wrapper">
      <input type="checkbox" class="ws-checkbox" checked>
      <span class="ws-checkbox-label">Enable notifications</span>
    </label>

    <label class="ws-checkbox-wrapper">
      <input type="checkbox" class="ws-checkbox">
      <span class="ws-checkbox-label">Dark mode</span>
    </label>

    <hr class="ws-divider">

    <div class="ws-stack ws-stack--horizontal ws-stack--gap-s ws-stack--justify-end">
      <button class="ws-button ws-button--ghost">Cancel</button>
      <button class="ws-button ws-button--primary">Save</button>
    </div>
  </div>
</div>
```

### Dashboard Widget

```html
<div class="ws-panel ws-panel--elevation-low">
  <h4 class="ws-heading ws-heading--h5" style="margin-bottom: 12px;">
    System Status
  </h4>

  <div class="ws-stack ws-stack--gap-s">
    <div class="ws-stack ws-stack--horizontal ws-stack--justify-between">
      <span class="ws-text ws-text--size-s">CPU</span>
      <span class="ws-text ws-text--size-s ws-text--weight-semibold">45%</span>
    </div>

    <div class="ws-stack ws-stack--horizontal ws-stack--justify-between">
      <span class="ws-text ws-text--size-s">Memory</span>
      <span class="ws-text ws-text--size-s ws-text--weight-semibold">8.2 GB</span>
    </div>

    <div class="ws-stack ws-stack--horizontal ws-stack--justify-between">
      <span class="ws-text ws-text--size-s">Disk</span>
      <span class="ws-text ws-text--size-s ws-text--weight-semibold">234 GB</span>
    </div>
  </div>
</div>
```

## Best Practices

1. **Use appropriate elevation**
   - Low: Subtle separation from background
   - Medium: Standard elevation for content cards
   - High: Important elevated content (modals, popovers)

2. **Don't nest panels deeply**
   - Avoid panels within panels within panels
   - Use surface variants instead for subtle elevation changes

3. **Maintain consistent spacing**
   - Use the default `--space-m` padding
   - Adjust only when necessary for specific use cases

4. **Group related content**
   - Use panels to visually group related information
   - Separate different content sections with multiple panels

## Related Components

- **Surface**: Basic surface container without shadow
- **Card**: Similar to panel but with border
- **Widget**: Shell-specific widget container

## Accessibility

- Panels are purely presentational containers
- Ensure content within panels follows accessibility guidelines
- Use semantic HTML within panels (`<h2>`, `<section>`, etc.)
- Don't rely on shadow alone to convey meaning
