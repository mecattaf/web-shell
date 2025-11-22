# Hello World - WebShell Example

The absolute minimum WebShell app. Perfect starting point for learning.

## What it demonstrates

- **Basic SDK setup**: Using the global `webshell` object
- **Theme access**: Reading CSS custom properties from the theme
- **Notifications**: Sending system notifications

## Features

- Single HTML file with embedded styles
- Display app name from manifest
- Show current theme primary color
- Send notification button

## Structure

```
hello-world/
├── webshell.json    # App manifest
├── index.html       # Main UI
├── main.ts          # App logic
└── README.md        # This file
```

## Running

### Development mode

```bash
cd examples/hello-world
# Open in WebShell dev mode
webshell dev .
```

### Production mode

```bash
# Build and run
webshell run examples/hello-world
```

## Code walkthrough

### 1. Manifest (`webshell.json`)

Minimal configuration with notification permission:

```json
{
  "name": "hello-world",
  "displayName": "Hello World",
  "entrypoint": "index.html",
  "permissions": {
    "notifications": { "send": true }
  }
}
```

### 2. UI (`index.html`)

Simple centered layout using CSS custom properties from theme:

```css
background: var(--color-bg-primary);
color: var(--color-text-primary);
```

### 3. Logic (`main.ts`)

Wait for SDK, then access app info and send notifications:

```typescript
webshell.ready(() => {
  // Get app name from manifest
  const name = webshell.shell.app.getName();

  // Send notification
  webshell.notifications.send({
    title: 'Hello!',
    message: 'From WebShell',
  });
});
```

## Next steps

- Check out `system-monitor` for service usage
- Check out `note-taker` for data persistence
- Read the SDK docs for all available APIs

## Customization

Try modifying:

- The notification message
- The UI colors and layout
- Add more theme variables
- Add keyboard shortcuts
