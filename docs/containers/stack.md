# Stack Layout

Stack is a flexbox-based layout container for arranging elements vertically or horizontally with consistent spacing.

## Usage

### Vertical Stack (Default)

```html
<div class="ws-stack">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

### Horizontal Stack

```html
<div class="ws-stack ws-stack--horizontal">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

## Spacing

Control the gap between items using spacing modifiers:

```html
<!-- Extra small gap (4px) -->
<div class="ws-stack ws-stack--gap-xs">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

<!-- Small gap (8px) -->
<div class="ws-stack ws-stack--gap-s">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

<!-- Medium gap (16px) - Default -->
<div class="ws-stack ws-stack--gap-m">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

<!-- Large gap (24px) -->
<div class="ws-stack ws-stack--gap-l">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

<!-- Extra large gap (32px) -->
<div class="ws-stack ws-stack--gap-xl">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

## Alignment

### Cross-Axis Alignment

Control how items align perpendicular to the stack direction:

```html
<!-- Align to start -->
<div class="ws-stack ws-stack--align-start">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

<!-- Align to center -->
<div class="ws-stack ws-stack--align-center">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

<!-- Align to end -->
<div class="ws-stack ws-stack--align-end">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

<!-- Stretch to fill -->
<div class="ws-stack ws-stack--align-stretch">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

### Main-Axis Justification

Control how items are distributed along the stack direction:

```html
<!-- Justify to start -->
<div class="ws-stack ws-stack--justify-start">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

<!-- Justify to center -->
<div class="ws-stack ws-stack--justify-center">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

<!-- Justify to end -->
<div class="ws-stack ws-stack--justify-end">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

<!-- Space between items -->
<div class="ws-stack ws-stack--justify-between">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

<!-- Space around items -->
<div class="ws-stack ws-stack--justify-around">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

## CSS Classes

| Class | Description |
|-------|-------------|
| `ws-stack` | Base stack class (required) |
| `ws-stack--horizontal` | Horizontal direction |
| `ws-stack--gap-xs` | 4px gap |
| `ws-stack--gap-s` | 8px gap |
| `ws-stack--gap-m` | 16px gap (default) |
| `ws-stack--gap-l` | 24px gap |
| `ws-stack--gap-xl` | 32px gap |
| `ws-stack--align-start` | Align items to start |
| `ws-stack--align-center` | Align items to center |
| `ws-stack--align-end` | Align items to end |
| `ws-stack--align-stretch` | Stretch items |
| `ws-stack--justify-start` | Justify to start |
| `ws-stack--justify-center` | Justify to center |
| `ws-stack--justify-end` | Justify to end |
| `ws-stack--justify-between` | Space between |
| `ws-stack--justify-around` | Space around |

## Design Tokens

Stack uses spacing tokens for gaps:

```css
--space-xs   /* 4px */
--space-s    /* 8px */
--space-m    /* 16px - Default */
--space-l    /* 24px */
--space-xl   /* 32px */
```

## Examples

### Button Group

```html
<div class="ws-stack ws-stack--horizontal ws-stack--gap-s">
  <button class="ws-button ws-button--ghost">Cancel</button>
  <button class="ws-button ws-button--primary">Save</button>
</div>
```

### Form Layout

```html
<div class="ws-stack ws-stack--gap-m">
  <div class="ws-input-wrapper">
    <label class="ws-input-label">First Name</label>
    <input type="text" class="ws-input">
  </div>

  <div class="ws-input-wrapper">
    <label class="ws-input-label">Last Name</label>
    <input type="text" class="ws-input">
  </div>

  <div class="ws-input-wrapper">
    <label class="ws-input-label">Email</label>
    <input type="email" class="ws-input">
  </div>

  <button class="ws-button ws-button--primary">Submit</button>
</div>
```

### Card Content

```html
<div class="ws-card">
  <div class="ws-stack ws-stack--gap-s">
    <h3 class="ws-heading ws-heading--h4">Card Title</h3>
    <p class="ws-text ws-text--size-s ws-text--secondary">
      Card subtitle or description
    </p>
    <p class="ws-text">
      Main content of the card goes here.
    </p>
    <div class="ws-stack ws-stack--horizontal ws-stack--gap-s ws-stack--justify-end">
      <button class="ws-button ws-button--ghost">Cancel</button>
      <button class="ws-button ws-button--primary">Confirm</button>
    </div>
  </div>
</div>
```

### Navigation Bar

```html
<div class="ws-stack ws-stack--horizontal ws-stack--gap-l ws-stack--justify-between ws-stack--align-center" style="padding: var(--space-m); background: var(--color-surface);">
  <div class="ws-stack ws-stack--horizontal ws-stack--gap-m ws-stack--align-center">
    <h1 class="ws-heading ws-heading--h4">Logo</h1>
    <nav class="ws-stack ws-stack--horizontal ws-stack--gap-s">
      <a href="#" class="ws-button ws-button--ghost">Home</a>
      <a href="#" class="ws-button ws-button--ghost">About</a>
      <a href="#" class="ws-button ws-button--ghost">Contact</a>
    </nav>
  </div>
  <button class="ws-button ws-button--primary">Sign In</button>
</div>
```

### Centered Content

```html
<div class="ws-stack ws-stack--justify-center ws-stack--align-center" style="min-height: 100vh;">
  <div class="ws-panel" style="max-width: 400px;">
    <h2 class="ws-heading ws-heading--h2">Welcome</h2>
    <p class="ws-text">Centered content</p>
  </div>
</div>
```

### List with Dividers

```html
<div class="ws-stack ws-stack--gap-s">
  <div class="ws-stack ws-stack--horizontal ws-stack--justify-between">
    <span class="ws-text">Item 1</span>
    <span class="ws-text ws-text--weight-semibold">$10</span>
  </div>

  <hr class="ws-divider">

  <div class="ws-stack ws-stack--horizontal ws-stack--justify-between">
    <span class="ws-text">Item 2</span>
    <span class="ws-text ws-text--weight-semibold">$20</span>
  </div>

  <hr class="ws-divider">

  <div class="ws-stack ws-stack--horizontal ws-stack--justify-between">
    <span class="ws-text">Item 3</span>
    <span class="ws-text ws-text--weight-semibold">$30</span>
  </div>
</div>
```

## Best Practices

1. **Use appropriate spacing**
   - Form fields: `--gap-m` or `--gap-l`
   - Button groups: `--gap-s`
   - Content sections: `--gap-xl`

2. **Combine with other modifiers**
   ```html
   <div class="ws-stack ws-stack--horizontal ws-stack--gap-s ws-stack--align-center ws-stack--justify-end">
     <!-- Horizontally stacked, small gap, center aligned, right justified -->
   </div>
   ```

3. **Avoid deep nesting**
   - While stacks can be nested, avoid going too deep
   - Consider using Grid for complex layouts

4. **Responsive considerations**
   - Consider switching from horizontal to vertical on small screens
   - Use custom CSS media queries when needed:
   ```css
   @media (max-width: 768px) {
     .ws-stack--horizontal {
       flex-direction: column;
     }
   }
   ```

## Migration from Flexbox

If you're used to writing flexbox manually:

| Flexbox CSS | Stack Class |
|-------------|-------------|
| `display: flex; flex-direction: column;` | `ws-stack` |
| `display: flex; flex-direction: row;` | `ws-stack ws-stack--horizontal` |
| `gap: 16px;` | `ws-stack--gap-m` |
| `align-items: center;` | `ws-stack--align-center` |
| `justify-content: space-between;` | `ws-stack--justify-between` |

## Related Components

- **Grid**: For multi-column layouts
- **Panel**: Container with elevation
- **Surface**: Simple background container
