#h Window Module API

 

The Window Module provides control over window size, position, appearance, and state.

 

## Overview

 

The Window Module (`webshell.window`) allows WebShell applications to control their window properties including:

 

- Size and position management

- Visual effects (blur, opacity, transparency)

- Window state (minimized, maximized, focused)

- Event notifications for window changes

 

## Namespace

 

Access via: `webshell.window`

 

## Size Management

 

### `getSize(): WindowSize`

 

Returns the current window size.

 

**Returns:** [`WindowSize`](../sdk-api-reference.md#windowsize) - Object with `width` and `height` in pixels

 

**Example:**

```typescript

const size = webshell.window.getSize();

console.log(`Window is ${size.width}x${size.height}`);

```

 

---

 

### `setSize(width: number, height: number): void`

 

Sets the window size.

 

**Parameters:**

- `width` (number): Window width in pixels

- `height` (number): Window height in pixels

 

**Example:**

```typescript

// Set window to 1024x768

webshell.window.setSize(1024, 768);

```

 

**Notes:**

- Size includes window decorations (title bar, borders)

- Minimum size may be enforced by the window manager

- Maximum size is limited by screen resolution

 

---

 

### `onResize(handler: EventHandler<WindowSize>): UnsubscribeFn`

 

Subscribes to window resize events.

 

**Parameters:**

- `handler` (EventHandler<WindowSize>): Function called on resize

 

**Returns:** [`UnsubscribeFn`](../sdk-api-reference.md#unsubscribefn) - Function to unsubscribe

 

**Example:**

```typescript

const unsubscribe = webshell.window.onResize((size) => {

  console.log(`Window resized to ${size.width}x${size.height}`);

 

  // Adjust UI for new size

  if (size.width < 600) {

    enableMobileLayout();

  }

});

 

// Later: unsubscribe()

```

 

**Notes:**

- Called whenever window size changes (user resize, maximize, etc.)

- May be called frequently during user resizing

- Consider debouncing expensive operations

 

---

 

## Position Management

 

### `getPosition(): WindowPosition`

 

Returns the current window position.

 

**Returns:** [`WindowPosition`](../sdk-api-reference.md#windowposition) - Object with `x` and `y` coordinates

 

**Example:**

```typescript

const pos = webshell.window.getPosition();

console.log(`Window at (${pos.x}, ${pos.y})`);

```

 

**Notes:**

- Coordinates are relative to the top-left corner of the screen

- Multi-monitor setups may have negative coordinates

 

---

 

### `setPosition(x: number, y: number): void`

 

Sets the window position.

 

**Parameters:**

- `x` (number): X coordinate in pixels

- `y` (number): Y coordinate in pixels

 

**Example:**

```typescript

// Move window to top-left corner

webshell.window.setPosition(0, 0);

 

// Move window 100px from left and top

webshell.window.setPosition(100, 100);

```

 

---

 

### `center(): void`

 

Centers the window on the current screen.

 

**Example:**

```typescript

// Center the window

webshell.window.center();

```

 

**Notes:**

- Automatically calculates screen center

- Useful after changing window size

- Works correctly on multi-monitor setups

 

---

 

## Visual Effects

 

### `setBlur(enabled: boolean): void`

 

Enables or disables background blur effect.

 

**Parameters:**

- `enabled` (boolean): Whether to enable blur

 

**Example:**

```typescript

// Enable blur for translucent windows

webshell.window.setBlur(true);

```

 

**Notes:**

- Requires compositor support (X11: Picom, KWin; Wayland: native)

- Works best with semi-transparent windows

- May impact performance on some systems

 

---

 

### `setOpacity(opacity: number): void`

 

Sets the window opacity.

 

**Parameters:**

- `opacity` (number): Opacity value from 0.0 (transparent) to 1.0 (opaque)

 

**Example:**

```typescript

// Make window 90% opaque

webshell.window.setOpacity(0.9);

 

// Make window completely opaque

webshell.window.setOpacity(1.0);

```

 

**Notes:**

- Values outside 0.0-1.0 are clamped

- Requires compositor support

- Content visibility may be affected at low values

 

---

 

### `setTransparency(enabled: boolean): void`

 

Enables or disables window transparency.

 

**Parameters:**

- `enabled` (boolean): Whether to enable transparency

 

**Example:**

```typescript

// Enable transparency

webshell.window.setTransparency(true);

 

// Set background to transparent

document.body.style.backgroundColor = 'transparent';

```

 

**Notes:**

- Must be enabled before setting transparent colors

- Requires compositor support

- Performance impact varies by system

 

---

 

## Window State

 

### `minimize(): void`

 

Minimizes the window.

 

**Example:**

```typescript

webshell.window.minimize();

```

 

---

 

### `maximize(): void`

 

Maximizes the window to fill the screen.

 

**Example:**

```typescript

webshell.window.maximize();

```

 

**Notes:**

- Respects desktop panels and taskbars

- Can be restored with `restore()`

 

---

 

### `restore(): void`

 

Restores the window from minimized or maximized state.

 

**Example:**

```typescript

// Restore to normal size

webshell.window.restore();

```

 

---

 

### `focus(): void`

 

Brings the window to front and gives it keyboard focus.

 

**Example:**

```typescript

// Bring window to front

webshell.window.focus();

```

 

**Notes:**

- May be restricted by window manager policies

- Some systems require user interaction first

 

---

 

## Common Patterns

 

### Responsive Window Sizing

 

Adjust content based on window size:

 

```typescript

function updateLayout(size: WindowSize) {

  const app = document.querySelector('.app');

 

  if (size.width < 600) {

    app.classList.add('mobile');

  } else if (size.width < 1024) {

    app.classList.add('tablet');

  } else {

    app.classList.add('desktop');

  }

}

 

// Initial layout

updateLayout(webshell.window.getSize());

 

// Update on resize with debounce

let resizeTimeout: number;

webshell.window.onResize((size) => {

  clearTimeout(resizeTimeout);

  resizeTimeout = setTimeout(() => updateLayout(size), 100);

});

```

 

### Persist Window Position

 

Save and restore window position:

 

```typescript

// Save position on change

webshell.window.onResize((size) => {

  localStorage.setItem('windowSize', JSON.stringify(size));

});

 

// Restore on startup

webshell.ready(() => {

  const saved = localStorage.getItem('windowSize');

  if (saved) {

    const { width, height } = JSON.parse(saved);

    webshell.window.setSize(width, height);

  }

});

```

 

### Translucent Overlay Window

 

Create a semi-transparent overlay:

 

```typescript

webshell.ready(() => {

  // Enable transparency

  webshell.window.setTransparency(true);

 

  // Enable blur

  webshell.window.setBlur(true);

 

  // Set opacity

  webshell.window.setOpacity(0.95);

 

  // Make body transparent

  document.body.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';

});

```

 

## Permissions

 

The Window Module requires the `window` permission in your manifest:

 

```json

{

  "name": "my-app",

  "permissions": ["window"],

  "entry": "index.html"

}

```

 

Without this permission, window control methods will throw `PERMISSION_DENIED` errors.

 

## Platform Considerations

 

### Linux (X11)

- Full support for all features

- Blur requires compositor (Picom, KWin, etc.)

- Transparency requires ARGB visual support

 

### Linux (Wayland)

- Native blur and transparency support

- Some compositors may restrict positioning

- Security policies may limit window control

 

### Window Managers

- Tiling WMs may override size/position settings

- Some WMs don't support blur or transparency

- Test on target platforms for best results

 

## Error Handling

 

Window Module methods may throw `WebShellError`:

 

```typescript

import { WebShellError } from 'webshell-sdk';

 

try {

  webshell.window.setSize(800, 600);

} catch (err) {

  if (err instanceof WebShellError) {

    if (err.code === 'PERMISSION_DENIED') {

      console.error('Window permission not granted');

    }

  }

}

```

 

## Related Documentation

 

- [Shell Module](./shell.md) - App lifecycle management

- [Window Management Guide](../guides/window-management.md)

- [Theming Guide](../theming.md) - Visual customization

 
