# Getting Started with WebShell SDK

 

This guide will walk you through creating your first WebShell application using the JavaScript SDK.

 

## Prerequisites

 

Before you begin, ensure you have:

 

- **WebShell installed** - The WebShell desktop environment

- **Node.js and npm** - For building web applications (recommended: Node.js 18+)

- **A text editor or IDE** - VS Code, WebStorm, or your preferred editor

- **Basic web development knowledge** - HTML, CSS, and JavaScript/TypeScript

 

## Creating Your First App

 

### Step 1: Set Up Your Project

 

Create a new directory for your app:

 

```bash

mkdir my-webshell-app

cd my-webshell-app

```

 

Initialize a new npm project:

 

```bash

npm init -y

```

 

Install development dependencies (optional but recommended):

 

```bash

npm install -D vite typescript

```

 

### Step 2: Create the App Manifest

 

Create a `webshell.json` file in your project root:

 

```json

{

  "version": "1.0.0",

  "name": "my-app",

  "displayName": "My First WebShell App",

  "description": "A simple WebShell application",

  "entrypoint": "index.html",

  "icon": "icon.svg",

 

  "permissions": {

    "notifications": {

      "send": true

    },

    "calendar": {

      "read": true

    }

  },

 

  "window": {

    "type": "widget",

    "width": 600,

    "height": 400,

    "blur": false,

    "transparency": false,

    "position": "center"

  }

}

```

 

**Key fields explained:**

- `name`: Unique app identifier (lowercase, no spaces)

- `displayName`: Human-readable app name

- `entrypoint`: Main HTML file

- `permissions`: Required capabilities (see [Permissions Guide](./permissions-guide.md))

- `window`: Window configuration

 

### Step 3: Create the HTML Structure

 

Create `index.html`:

 

```html

<!DOCTYPE html>

<html lang="en">

<head>

  <meta charset="UTF-8">

  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <title>My WebShell App</title>

  <link rel="stylesheet" href="styles.css">

</head>

<body>

  <div id="app">

    <header>

      <h1>My WebShell App</h1>

    </header>

 

    <main>

      <section class="info">

        <h2>App Information</h2>

        <p id="app-name">Loading...</p>

      </section>

 

      <section class="events">

        <h2>Today's Events</h2>

        <div id="events-list">Loading events...</div>

      </section>

 

      <section class="actions">

        <button id="notify-btn">Send Notification</button>

        <button id="theme-btn">Toggle Theme Info</button>

      </section>

    </main>

  </div>

 

  <script type="module" src="main.js"></script>

</body>

</html>

```

 

### Step 4: Add Styles

 

Create `styles.css`:

 

```css

* {

  margin: 0;

  padding: 0;

  box-sizing: border-box;

}

 

body {

  font-family: var(--font-base, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif);

  background-color: var(--color-background, #1a1a1a);

  color: var(--color-text, #e3e3e3);

  padding: var(--space-m, 16px);

}

 

#app {

  max-width: 100%;

  height: 100%;

}

 

header {

  margin-bottom: var(--space-l, 24px);

  padding-bottom: var(--space-m, 16px);

  border-bottom: 1px solid var(--color-border, #333);

}

 

h1 {

  font-size: var(--font-size-xl, 20px);

  font-weight: var(--font-weight-bold, 700);

  color: var(--color-primary, #3b82f6);

}

 

h2 {

  font-size: var(--font-size-l, 18px);

  margin-bottom: var(--space-m, 16px);

  color: var(--color-text, #e3e3e3);

}

 

section {

  margin-bottom: var(--space-l, 24px);

  padding: var(--space-m, 16px);

  background-color: var(--color-surface, #2a2a2a);

  border-radius: var(--radius-m, 8px);

}

 

button {

  background-color: var(--color-primary, #3b82f6);

  color: var(--color-on-primary, #ffffff);

  border: none;

  padding: var(--space-s, 8px) var(--space-m, 16px);

  border-radius: var(--radius-m, 8px);

  font-size: var(--font-size-m, 16px);

  cursor: pointer;

  margin-right: var(--space-s, 8px);

  margin-bottom: var(--space-s, 8px);

  transition: opacity 0.2s;

}

 

button:hover {

  opacity: 0.9;

}

 

button:active {

  opacity: 0.8;

}

 

.event-item {

  padding: var(--space-s, 8px);

  margin-bottom: var(--space-s, 8px);

  background-color: var(--color-surface-high, #333);

  border-radius: var(--radius-s, 4px);

  border-left: 3px solid var(--color-primary, #3b82f6);

}

 

.event-title {

  font-weight: var(--font-weight-medium, 500);

  margin-bottom: var(--space-xs, 4px);

}

 

.event-time {

  font-size: var(--font-size-s, 14px);

  color: var(--color-text-secondary, #999);

}

```

 

### Step 5: Add JavaScript Logic

 

Create `main.js`:

 

```javascript

// Wait for WebShell SDK to be ready

webshell.ready(async () => {

  console.log('WebShell SDK is ready!');

 

  // Apply theme CSS variables

  webshell.theme.applyTheme();

 

  // Initialize the app

  await initializeApp();

});

 

async function initializeApp() {

  try {

    // Get and display app information

    const appName = webshell.shell.app.getName();

    const manifest = webshell.shell.app.getManifest();

 

    document.getElementById('app-name').textContent =

      `App: ${manifest.displayName || appName} (v${manifest.version})`;

 

    // Load today's calendar events

    await loadCalendarEvents();

 

    // Set up event listeners

    setupEventListeners();

 

    // Listen for theme changes

    webshell.theme.onThemeChange((theme) => {

      console.log('Theme changed:', theme);

      // CSS variables are automatically updated

    });

 

    // Listen for window resize

    webshell.window.onResize((size) => {

      console.log('Window resized:', size.width, 'x', size.height);

    });

 

    // Show startup notification

    await webshell.notifications.send({

      title: 'App Started',

      message: `${manifest.displayName} is ready!`,

      urgency: 'low'

    });

 

  } catch (error) {

    console.error('Initialization error:', error);

    showError('Failed to initialize app');

  }

}

 

async function loadCalendarEvents() {

  try {

    const events = await webshell.calendar.eventsToday();

    const eventsList = document.getElementById('events-list');

 

    if (events.length === 0) {

      eventsList.innerHTML = '<p>No events today</p>';

      return;

    }

 

    eventsList.innerHTML = events.map(event => `

      <div class="event-item">

        <div class="event-title">${event.title}</div>

        <div class="event-time">

          ${event.allDay ? 'All day' : formatTime(event.start)}

          ${event.location ? ` • ${event.location}` : ''}

        </div>

      </div>

    `).join('');

 

  } catch (error) {

    console.error('Failed to load events:', error);

    document.getElementById('events-list').innerHTML =

      '<p>Failed to load events</p>';

  }

}

 

function setupEventListeners() {

  // Notification button

  document.getElementById('notify-btn').addEventListener('click', async () => {

    try {

      await webshell.notifications.send({

        title: 'Hello from WebShell!',

        message: 'This is a test notification',

        urgency: 'normal'

      });

    } catch (error) {

      console.error('Failed to send notification:', error);

    }

  });

 

  // Theme info button

  document.getElementById('theme-btn').addEventListener('click', () => {

    const theme = webshell.theme.getTheme();

    console.log('Current theme:', theme);

    alert(`Primary color: ${theme.colors.primary}\nSurface color: ${theme.colors.surface}`);

  });

}

 

function formatTime(date) {

  return new Date(date).toLocaleTimeString('en-US', {

    hour: 'numeric',

    minute: '2-digit',

    hour12: true

  });

}

 

function showError(message) {

  const errorDiv = document.createElement('div');

  errorDiv.style.cssText = `

    position: fixed;

    top: 20px;

    right: 20px;

    background-color: var(--color-error, #ef4444);

    color: white;

    padding: var(--space-m, 16px);

    border-radius: var(--radius-m, 8px);

    box-shadow: 0 4px 8px rgba(0,0,0,0.2);

  `;

  errorDiv.textContent = message;

  document.body.appendChild(errorDiv);

 

  setTimeout(() => errorDiv.remove(), 3000);

}

```

 

### Step 6: Add an Icon (Optional)

 

Create or add an `icon.svg` file:

 

```svg

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">

  <circle cx="50" cy="50" r="45" fill="#3b82f6"/>

  <text x="50" y="50" text-anchor="middle" dominant-baseline="middle"

        font-size="50" fill="white" font-family="sans-serif">A</text>

</svg>

```

 

## Project Structure

 

Your project should now look like this:

 

```

my-webshell-app/

├── webshell.json       # App manifest

├── index.html          # Main HTML file

├── styles.css          # Styles

├── main.js             # JavaScript logic

├── icon.svg            # App icon

├── package.json        # npm configuration

└── README.md           # App documentation (optional)

```

 

## Using the SDK

 

### Importing the SDK

 

WebShell SDK is available globally via the `webshell` object:

 

```javascript

// No import needed - use global object

webshell.ready(() => {

  // SDK is ready

});

```

 

For TypeScript projects, you can import types:

 

```typescript

import type { CalendarEvent, Theme } from 'webshell-sdk';

 

// Use types for better autocomplete and type checking

const events: CalendarEvent[] = await webshell.calendar.eventsToday();

const theme: Theme = webshell.theme.getTheme();

```

 

### SDK Modules

 

The SDK is organized into modules:

 

```javascript

webshell.shell         // App lifecycle and messaging

webshell.window        // Window management

webshell.theme         // Theme and design tokens

webshell.calendar      // Calendar events

webshell.notifications // System notifications

webshell.power         // Battery and power

webshell.system        // System information

webshell.ipc           // Low-level backend communication

```

 

### Waiting for SDK Ready

 

Always wait for the SDK to initialize:

 

```javascript

webshell.ready(() => {

  // SDK is ready - safe to use all APIs

  console.log('WebShell SDK initialized');

});

 

// Or with async/await

webshell.ready(async () => {

  const events = await webshell.calendar.eventsToday();

  console.log('Events:', events);

});

```

 

## Running Your App

 

### Development Mode

 

For development with live reload, add a dev server configuration to your manifest:

 

```json

{

  "name": "my-app",

  "devServer": "http://localhost:5173"

}

```

 

Set up Vite for development. Create `vite.config.js`:

 

```javascript

import { defineConfig } from 'vite';

 

export default defineConfig({

  server: {

    port: 5173,

    host: true

  }

});

```

 

Add scripts to `package.json`:

 

```json

{

  "scripts": {

    "dev": "vite",

    "build": "vite build",

    "preview": "vite preview"

  }

}

```

 

Start the development server:

 

```bash

npm run dev

```

 

### Loading in WebShell

 

1. **Copy app to WebShell apps directory:**

   ```bash

   cp -r my-webshell-app ~/.config/webshell/apps/

   ```

 

2. **Launch WebShell** and your app should appear in the app launcher

 

3. **Or use dev mode** by setting `devServer` in the manifest

 

### Live Development Workflow

 

With the dev server running:

 

1. Make changes to your code

2. Vite automatically reloads the app

3. Changes appear immediately in WebShell

 

**Hot Module Replacement (HMR):**

```javascript

// Enable HMR in development

if (import.meta.hot) {

  import.meta.hot.accept();

}

```

 

## Building for Production

 

### Build with Vite

 

```bash

npm run build

```

 

This creates a `dist/` folder with optimized assets.

 

### Update Manifest for Production

 

Ensure your manifest points to the built files:

 

```json

{

  "name": "my-app",

  "entrypoint": "dist/index.html"

}

```

 

Or copy built files to root:

 

```bash

cp -r dist/* .

```

 

### Optimize Build

 

Add optimization to `vite.config.js`:

 

```javascript

import { defineConfig } from 'vite';

 

export default defineConfig({

  build: {

    minify: 'terser',

    target: 'esnext',

    cssCodeSplit: true,

    rollupOptions: {

      output: {

        manualChunks: {

          'vendor': ['any-large-dependencies']

        }

      }

    }

  }

});

```

 

## Publishing Your App

 

### Package Your App

 

Create a distributable package:

 

```bash

# Create a zip file

zip -r my-app.zip . -x "node_modules/*" -x ".git/*" -x "*.log"

```

 

### Share Your App

 

Options for distributing your app:

 

1. **GitHub Repository**: Host on GitHub with installation instructions

2. **WebShell App Store**: Submit to the official app store (if available)

3. **Direct Distribution**: Share the zip file directly

 

### Installation Instructions

 

Provide clear instructions for users:

 

```markdown

# Installation

 

1. Download `my-app.zip`

2. Extract to `~/.config/webshell/apps/my-app`

3. Restart WebShell or reload apps

4. Launch "My App" from the app launcher

```

 

## Next Steps

 

### Learn More

 

- **[API Documentation](./api/README.md)** - Complete API reference

- **[Concepts Guide](./concepts.md)** - Understand WebShell architecture

- **[Permissions Guide](./permissions-guide.md)** - Security and permissions

- **[Theming Guide](./theming.md)** - Customize your app's appearance

 

### Explore Examples

 

Check out example apps in the `examples/` directory:

 

- **hello-world** - Minimal app example

- **system-monitor** - System resource monitoring

- **note-taker** - Simple note-taking app

- **calendar-widget** - Calendar display widget

 

### Common Patterns

 

#### Responsive Layout

 

```javascript

webshell.window.onResize((size) => {

  // Adjust layout based on window size

  if (size.width < 600) {

    document.body.classList.add('compact');

  } else {

    document.body.classList.remove('compact');

  }

});

```

 

#### Persist Settings

 

```javascript

// Save settings to localStorage

function saveSettings(settings) {

  localStorage.setItem('app-settings', JSON.stringify(settings));

}

 

// Load settings on startup

webshell.ready(() => {

  const settings = JSON.parse(

    localStorage.getItem('app-settings') || '{}'

  );

  applySettings(settings);

});

```

 

#### Error Handling

 

```javascript

import { WebShellError } from 'webshell-sdk';

 

async function safeCall() {

  try {

    const result = await webshell.calendar.eventsToday();

    return result;

  } catch (error) {

    if (error instanceof WebShellError) {

      switch (error.code) {

        case 'PERMISSION_DENIED':

          showPermissionDialog();

          break;

        case 'CALENDAR_EVENT_NOT_FOUND':

          showNotFoundMessage();

          break;

        default:

          console.error('WebShell error:', error.code, error.message);

      }

    } else {

      console.error('Unexpected error:', error);

    }

    return null;

  }

}

```

 

#### Inter-App Communication

 

```javascript

// Send message to another app

await webshell.shell.sendMessage('todo-app', 'create-task', {

  title: 'New Task',

  dueDate: new Date()

});

 

// Listen for messages from other apps

webshell.shell.onMessage((message) => {

  if (message.type === 'refresh') {

    loadData();

  }

});

```

 

#### Theme-Aware Components

 

```javascript

// React component example

function ThemedButton({ children, onClick }) {

  const theme = webshell.theme.getTheme();

 

  return (

    <button

      onClick={onClick}

      style={{

        backgroundColor: theme.colors.primary,

        color: theme.colors.onPrimary,

        padding: theme.spacing.sm,

        borderRadius: theme.radii.md,

        border: 'none',

        cursor: 'pointer'

      }}

    >

      {children}

    </button>

  );

}

```

 

## TypeScript Setup

 

### Install TypeScript

 

```bash

npm install -D typescript @types/node

```

 

### Create tsconfig.json

 

```json

{

  "compilerOptions": {

    "target": "ESNext",

    "module": "ESNext",

    "moduleResolution": "bundler",

    "lib": ["ESNext", "DOM"],

    "strict": true,

    "esModuleInterop": true,

    "skipLibCheck": true,

    "resolveJsonModule": true,

    "isolatedModules": true,

    "types": ["vite/client"]

  },

  "include": ["src/**/*"],

  "exclude": ["node_modules"]

}

```

 

### Rename Files

 

Rename `main.js` to `main.ts` and update imports in HTML:

 

```html

<script type="module" src="main.ts"></script>

```

 

### Use Types

 

```typescript

import type { CalendarEvent, Theme } from 'webshell-sdk';

 

webshell.ready(async () => {

  const events: CalendarEvent[] = await webshell.calendar.eventsToday();

  const theme: Theme = webshell.theme.getTheme();

 

  // TypeScript provides autocomplete and type checking

  console.log(theme.colors.primary);

});

```

 

## Troubleshooting

 

### App Not Appearing

 

- Check `webshell.json` is valid JSON

- Verify `name` field doesn't conflict with existing apps

- Check file permissions

- Look for errors in WebShell logs

 

### Permission Errors

 

```

Error: PERMISSION_DENIED: calendar.read

```

 

**Solution**: Add required permission to `webshell.json`:

```json

{

  "permissions": {

    "calendar": {

      "read": true

    }

  }

}

```

 

### SDK Not Ready

 

```

Error: Cannot read property 'calendar' of undefined

```

 

**Solution**: Always wrap SDK calls in `webshell.ready()`:

```javascript

webshell.ready(() => {

  // Safe to use SDK here

});

```

 

### Theme Variables Not Working

 

**Solution**: Call `webshell.theme.applyTheme()` on startup:

```javascript

webshell.ready(() => {

  webshell.theme.applyTheme();

});

```

 

### Dev Server Not Connecting

 

- Verify `devServer` URL in manifest matches Vite server

- Check firewall settings

- Ensure Vite server is running: `npm run dev`

- Try using IP instead of localhost: `http://127.0.0.1:5173`

 

## Best Practices

 

### 1. Always Handle Errors

 

```javascript

try {

  await webshell.calendar.createEvent(eventData);

} catch (error) {

  console.error('Failed to create event:', error);

  showUserFriendlyError();

}

```

 

### 2. Clean Up Event Listeners

 

```javascript

let unsubscribe;

 

webshell.ready(() => {

  unsubscribe = webshell.theme.onThemeChange(handleThemeChange);

});

 

window.addEventListener('beforeunload', () => {

  if (unsubscribe) unsubscribe();

});

```

 

### 3. Request Minimal Permissions

 

Only request permissions you actually need:

 

```json

// Good - only what's needed

{

  "permissions": {

    "calendar": { "read": true }

  }

}

 

// Bad - excessive permissions

{

  "permissions": {

    "calendar": { "read": true, "write": true, "delete": true },

    "filesystem": { "read": ["/"], "write": ["/"] }

  }

}

```

 

### 4. Use Design Tokens

 

```css

/* Good - uses theme tokens */

.my-component {

  background: var(--color-surface);

  padding: var(--space-m);

  border-radius: var(--radius-m);

}

 

/* Bad - hardcoded values */

.my-component {

  background: #2a2a2a;

  padding: 16px;

  border-radius: 8px;

}

```

 

### 5. Test Different Window Sizes

 

```javascript

// Handle different window sizes

webshell.window.onResize((size) => {

  updateLayout(size);

});

```

 

## Resources

 

- **[API Documentation](./api/README.md)** - Complete SDK reference

- **[Examples](../examples/)** - Sample applications

- **[Permissions Guide](./permissions-guide.md)** - Security model

- **[Theming Guide](./theming.md)** - Design tokens

- **[Manifest Reference](./manifest-reference.md)** - Manifest fields

 

## Need Help?

 

- Check the [Troubleshooting Guide](./manifest-troubleshooting.md)

- Review [Example Apps](../examples/)

- Read the [Concepts Guide](./concepts.md)

- Check GitHub issues and discussions

 

---

 

**Congratulations!** You've created your first WebShell application. Start building amazing apps!

 
