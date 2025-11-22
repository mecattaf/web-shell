# Input Component

Text input fields allow users to enter text data.

## Usage

```html
<div class="ws-input-wrapper">
  <label class="ws-input-label">Email</label>
  <input type="email" class="ws-input" placeholder="you@example.com">
</div>
```

## Basic Input

### Without Label

```html
<input type="text" class="ws-input" placeholder="Enter text...">
```

### With Label

Always use labels for accessibility:

```html
<div class="ws-input-wrapper">
  <label class="ws-input-label">Username</label>
  <input type="text" class="ws-input" placeholder="Enter your username">
</div>
```

### With ID Link

For proper accessibility, link labels to inputs using `for` and `id`:

```html
<div class="ws-input-wrapper">
  <label class="ws-input-label" for="email-input">Email</label>
  <input
    id="email-input"
    type="email"
    class="ws-input"
    placeholder="you@example.com">
</div>
```

## Input Types

WebShell inputs support all standard HTML5 input types:

### Text Input

```html
<input type="text" class="ws-input" placeholder="Enter text">
```

### Email Input

```html
<input type="email" class="ws-input" placeholder="you@example.com">
```

### Password Input

```html
<input type="password" class="ws-input" placeholder="Enter password">
```

### Number Input

```html
<input type="number" class="ws-input" placeholder="Enter number">
```

### Search Input

```html
<input type="search" class="ws-input" placeholder="Search...">
```

### URL Input

```html
<input type="url" class="ws-input" placeholder="https://example.com">
```

## States

### Disabled

```html
<input type="text" class="ws-input" placeholder="Disabled input" disabled>
```

### Read-Only

```html
<input type="text" class="ws-input" value="Read-only value" readonly>
```

### Required

```html
<div class="ws-input-wrapper">
  <label class="ws-input-label">Email *</label>
  <input type="email" class="ws-input" required>
</div>
```

## Textarea

For multi-line text input, use textarea with the same class:

```html
<div class="ws-input-wrapper">
  <label class="ws-input-label">Message</label>
  <textarea
    class="ws-input"
    rows="4"
    placeholder="Enter your message..."></textarea>
</div>
```

## Accessibility

1. **Always use labels**
   ```html
   <!-- Good -->
   <label class="ws-input-label" for="name">Name</label>
   <input id="name" type="text" class="ws-input">

   <!-- Avoid -->
   <input type="text" class="ws-input" placeholder="Name">
   ```

2. **Use appropriate input types**
   - Helps mobile devices show the correct keyboard
   - Enables browser validation

3. **Mark required fields**
   ```html
   <label class="ws-input-label">Email *</label>
   <input type="email" class="ws-input" required aria-required="true">
   ```

4. **Provide helpful error messages**
   ```html
   <div class="ws-input-wrapper">
     <label class="ws-input-label">Email</label>
     <input
       type="email"
       class="ws-input"
       aria-describedby="email-error"
       aria-invalid="true">
     <span id="email-error" class="ws-text ws-text--size-s" style="color: var(--color-error);">
       Please enter a valid email address
     </span>
   </div>
   ```

## CSS Classes

| Class | Description |
|-------|-------------|
| `ws-input-wrapper` | Container for label and input |
| `ws-input-label` | Label styling |
| `ws-input` | Input field styling |

## Design Tokens

Inputs use the following design tokens:

```css
/* Colors */
--color-surface-high       /* Background */
--color-text               /* Text color */
--color-text-secondary     /* Placeholder color */
--color-border-focus       /* Border color */
--color-primary            /* Focus border */

/* Spacing */
--space-s
--space-m
--space-xs

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

### Error State

```css
.ws-input.error {
  border-color: var(--color-error);
}

.ws-input.error:focus {
  box-shadow: 0 0 0 2px rgba(255, 107, 107, 0.2);
}
```

```html
<input type="email" class="ws-input error" aria-invalid="true">
```

### Success State

```css
.ws-input.success {
  border-color: var(--color-success);
}
```

## Best Practices

1. **Use clear, concise labels**
   - Label should describe what goes in the field
   - Place labels above inputs

2. **Provide helpful placeholders**
   - Show format examples: "name@example.com"
   - Don't use placeholders as labels

3. **Group related inputs**
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
   </div>
   ```

4. **Validate appropriately**
   - Use HTML5 validation attributes
   - Provide clear error messages
   - Show errors after user interaction, not immediately

## Examples

### Login Form

```html
<div class="ws-stack ws-stack--gap-m">
  <div class="ws-input-wrapper">
    <label class="ws-input-label" for="login-email">Email</label>
    <input
      id="login-email"
      type="email"
      class="ws-input"
      placeholder="you@example.com"
      required>
  </div>

  <div class="ws-input-wrapper">
    <label class="ws-input-label" for="login-password">Password</label>
    <input
      id="login-password"
      type="password"
      class="ws-input"
      placeholder="Enter your password"
      required>
  </div>

  <button class="ws-button ws-button--primary" type="submit">
    Sign In
  </button>
</div>
```

### Search Input with Icon

```html
<div class="ws-input-wrapper">
  <label class="ws-input-label" for="search">Search</label>
  <div style="position: relative;">
    <span style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%);">
      🔍
    </span>
    <input
      id="search"
      type="search"
      class="ws-input"
      placeholder="Search..."
      style="padding-left: 40px;">
  </div>
</div>
```
