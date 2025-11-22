 Converting a Web App to WebShell

 

This guide shows you how to convert an existing web application into a WebShell desktop app, adding native desktop features while maintaining web compatibility.

 

## Table of Contents

 

1. [Overview](#overview)

2. [Quick Start](#quick-start)

3. [Why Convert to WebShell?](#why-convert-to-webshell)

4. [When to Convert vs Stay Web](#when-to-convert-vs-stay-web)

5. [Adding Desktop Features](#adding-desktop-features)

6. [Adapting to Desktop](#adapting-to-desktop)

7. [Common Patterns](#common-patterns)

8. [Best Practices](#best-practices)

9. [Migration Checklist](#migration-checklist)

10. [Example: Todo App Migration](#example-todo-app-migration)

 

---

 

## Overview

 

Converting a web app to WebShell gives you:

- Native desktop integration (notifications, system tray, etc.)

- Offline capability

- Better performance

- System-level features

- Standalone distribution

 

**The best part:** Your web app can continue to run in browsers while also working as a desktop app!

 

---

 

## Quick Start

 

### 3-Step Conversion

 

**1. Add Manifest**

```json

// webshell.json

{

  "version": "1.0.0",

  "name": "my-web-app",

  "displayName": "My Web App",

  "entrypoint": "index.html",

  "window": {

    "width": 1024,

    "height": 768

  }

}

```

 

**2. Add SDK Integration**

```javascript

// Check if running in WebShell

if (typeof webshell !== 'undefined') {

  webshell.ready(() => {

    // Enable desktop features

    webshell.theme.applyTheme();

    console.log('Running in WebShell!');

  });

} else {

  // Running in browser

  console.log('Running in browser');

}

```

 

**3. Test**

```bash

# Copy to WebShell apps directory

cp -r my-web-app ~/.config/webshell/apps/

 

# Launch WebShell and run your app

```

 

That's it! Your web app now works as a desktop app.

 

---

 

## Why Convert to WebShell?

 

### Benefits Over Web Apps

 

**Native Desktop Integration**

```javascript

// Send notifications without browser permission prompts

await webshell.notifications.send({

  title: 'Task Complete',

  message: 'Your export is ready!'

});

 

// Access system theme

const theme = webshell.theme.getTheme();

applyColors(theme.colors);

```

 

**Better User Experience**

- No browser chrome (address bar, tabs, etc.)

- Custom window decorations

- System tray integration

- Keyboard shortcuts without conflicts

- Persistent window state

 

**Offline-First**

- Works without internet

- LocalStorage persists reliably

- No browser cache limits

- Better performance

 

**System Integration**

- Calendar events

- System clipboard

- Power management

- Resource monitoring

- Desktop theming

 

**Distribution**

- Standalone app installation

- No browser required

- Easier updates

- Professional appearance

 

### Capabilities You Gain

 

| Feature | Web Browser | WebShell Desktop |

|---------|-------------|------------------|

| **Notifications** | Requires permission prompt | Always available |

| **Window Control** | Browser controls only | Full control |

| **System Theme** | CSS media queries | Full theme tokens |

| **Clipboard** | Limited access | Full access |

| **Calendar** | Not available | Full access |

| **System Info** | Very limited | CPU, memory, battery, etc. |

| **Offline** | Service worker | Built-in |

| **Installation** | PWA (limited) | Native app |

 

---

 

## When to Convert vs Stay Web

 

### Convert to WebShell When:

 

✅ **User spends significant time in your app**

- Productivity tools (editors, IDEs, project managers)

- Communication apps (chat, email)

- Media apps (music, video players)

- System utilities

 

✅ **Need desktop integration**

- System notifications

- Calendar integration

- File system access

- Clipboard operations

- Power management

 

✅ **Want offline-first experience**

- Note-taking apps

- Document editors

- Task managers

- Media libraries

 

✅ **Target power users**

- Developer tools

- Design applications

- System monitors

- Workflow automation

 

### Stay as Web App When:

 

❌ **Primarily public-facing**

- Marketing websites

- E-commerce stores

- Blogs and content sites

- Public documentation

 

❌ **Require broad accessibility**

- Need to work on any device

- Users won't install apps

- Sharing links is important

- SEO is critical

 

❌ **Simple, occasional use**

- Single-purpose calculators

- Simple converters

- Infrequent use tools

 

❌ **Server-dependent features**

- Real-time collaboration

- Heavy server processing

- Large databases

- Multi-user features

 

### Hybrid Approach: Best of Both

 

**You can do both!** Deploy as web app AND desktop app:

 

```javascript

// Detect environment and enable features accordingly

const isWebShell = typeof webshell !== 'undefined';

 

if (isWebShell) {

  // Use native notifications

  webshell.notifications.send({ title, message });

} else {

  // Use web notifications

  new Notification(title, { body: message });

}

```

 

---

 

## Adding Desktop Features

 

### 1. Native Notifications

 

**Web App (before):**

```javascript

// Requires permission

Notification.requestPermission().then(permission => {

  if (permission === 'granted') {

    new Notification('Hello', {

      body: 'This is a notification'

    });

  }

});

```

 

**WebShell App (after):**

```javascript

function showNotification(title, message) {

  if (typeof webshell !== 'undefined') {

    // Native notifications (no permission needed)

    webshell.notifications.send({

      title,

      message,

      urgency: 'normal',

      timeout: 5000

    });

  } else {

    // Fallback to web notifications

    if (Notification.permission === 'granted') {

      new Notification(title, { body: message });

    }

  }

}

```

 

**With action buttons:**

```javascript

if (typeof webshell !== 'undefined') {

  const id = await webshell.notifications.send({

    title: 'New Comment',

    message: 'Alice commented on your post',

    actions: [

      { id: 'view', label: 'View' },

      { id: 'reply', label: 'Reply' }

    ]

  });

 

  webshell.notifications.onActionClicked(({ actionId }) => {

    if (actionId === 'view') {

      showComment();

    } else if (actionId === 'reply') {

      openReplyDialog();

    }

  });

}

```

 

### 2. Window Control

 

**Add window controls to your UI:**

 

```html

<!-- Custom title bar -->

<div class="title-bar">

  <h1>My App</h1>

  <div class="window-controls">

    <button id="minimize">−</button>

    <button id="maximize">□</button>

    <button id="close">×</button>

  </div>

</div>

```

 

```javascript

if (typeof webshell !== 'undefined') {

  document.getElementById('minimize').onclick = () => {

    webshell.window.minimize();

  };

 

  document.getElementById('maximize').onclick = () => {

    const isMaximized = /* track state */;

    if (isMaximized) {

      webshell.window.restore();

    } else {

      webshell.window.maximize();

    }

  };

 

  document.getElementById('close').onclick = () => {

    webshell.shell.app.close();

  };

}

```

 

### 3. System Theme Integration

 

**Web App (before):**

```css

/* Limited theme support */

@media (prefers-color-scheme: dark) {

  body {

    background: #1a1a1a;

    color: #e3e3e3;

  }

}

```

 

**WebShell App (after):**

```javascript

if (typeof webshell !== 'undefined') {

  webshell.ready(() => {

    // Apply full Material You theme

    webshell.theme.applyTheme();

 

    // React to theme changes

    webshell.theme.onThemeChange((theme) => {

      console.log('Theme changed:', theme);

      updateCustomComponents(theme);

    });

  });

}

```

 

```css

/* Use theme tokens */

.card {

  background: var(--color-surface);

  color: var(--color-on-surface);

  border-radius: var(--radius-m);

  padding: var(--space-m);

}

 

.button-primary {

  background: var(--color-primary);

  color: var(--color-on-primary);

  padding: var(--space-s) var(--space-m);

}

```

 

### 4. Calendar Integration

 

**Add calendar features:**

```javascript

if (typeof webshell !== 'undefined') {

  // Show today's events in your app

  async function loadTodayEvents() {

    const events = await webshell.calendar.eventsToday();

 

    document.getElementById('events').innerHTML = events.map(e => `

      <div class="event">

        <strong>${e.title}</strong>

        <span>${formatTime(e.start)}</span>

      </div>

    `).join('');

  }

 

  // Create events from your app

  async function createEventFromTask(task) {

    await webshell.calendar.createEvent({

      title: task.name,

      start: task.dueDate,

      end: new Date(task.dueDate.getTime() + 3600000), // +1 hour

      description: task.notes

    });

  }

 

  // Listen for new events

  webshell.calendar.onEventCreated((event) => {

    showNotification('New Event', event.title);

  });

}

```

 

**Add to manifest:**

```json

{

  "permissions": {

    "calendar": {

      "read": true,

      "write": true

    }

  }

}

```

 

### 5. System Information

 

**Display system stats:**

```javascript

if (typeof webshell !== 'undefined') {

  async function updateSystemInfo() {

    const cpu = await webshell.system.getCPUUsage();

    const memory = await webshell.system.getMemoryUsage();

    const battery = await webshell.power.getBatteryStatus();

 

    document.getElementById('cpu').textContent = `${cpu}%`;

    document.getElementById('memory').textContent = `${memory.usedPercent}%`;

 

    if (battery) {

      document.getElementById('battery').textContent = `${battery.level}%`;

    }

  }

 

  setInterval(updateSystemInfo, 5000);

}

```

 

### 6. Enhanced Clipboard

 

**Web App (before):**

```javascript

// Limited clipboard access

navigator.clipboard.writeText('Hello');

```

 

**WebShell App (after):**

```javascript

async function copyToClipboard(text) {

  if (typeof webshell !== 'undefined') {

    // Full clipboard access

    await webshell.system.clipboard.writeText(text);

 

    await webshell.notifications.send({

      title: 'Copied',

      message: 'Text copied to clipboard',

      urgency: 'low',

      timeout: 2000

    });

  } else {

    // Fallback

    await navigator.clipboard.writeText(text);

  }

}

 

async function pasteFromClipboard() {

  if (typeof webshell !== 'undefined') {

    return await webshell.system.clipboard.readText();

  } else {

    return await navigator.clipboard.readText();

  }

}

```

 

---

 

## Adapting to Desktop

 

### 1. Remove Browser-Specific Code

 

**Remove unnecessary polyfills:**

```javascript

// Before: Browser compatibility code

if (!window.Promise) {

  // Promise polyfill

}

 

// After: WebShell has modern APIs

// Remove polyfills for modern features

```

 

**Remove service worker (if using):**

```javascript

// Before: PWA service worker

if ('serviceWorker' in navigator) {

  navigator.serviceWorker.register('/sw.js');

}

 

// After: Not needed in WebShell

// Remove service worker code

```

 

### 2. Adjust Responsive Design

 

**Desktop-first approach:**

```css

/* Before: Mobile-first responsive */

.container {

  width: 100%;

  padding: 10px;

}

 

@media (min-width: 768px) {

  .container {

    width: 750px;

    margin: 0 auto;

  }

}

 

/* After: Desktop-optimized */

.container {

  width: 100%;

  max-width: 1200px;

  padding: var(--space-m);

  margin: 0 auto;

}

 

/* Still support window resize */

@media (max-width: 600px) {

  .container {

    padding: var(--space-s);

  }

}

```

 

### 3. Optimize for Offline

 

**Cache essential assets:**

```javascript

// Store app data locally

const cache = {

  save(key, data) {

    localStorage.setItem(key, JSON.stringify(data));

  },

 

  load(key) {

    const json = localStorage.getItem(key);

    return json ? JSON.parse(json) : null;

  }

};

 

// Sync when online

window.addEventListener('online', () => {

  syncWithServer();

});

 

// Work offline

if (!navigator.onLine) {

  loadFromCache();

}

```

 

### 4. Update Authentication Flow

 

**Handle desktop auth:**

```javascript

// Web: OAuth redirect flow

// Desktop: Deep links or local auth

 

async function login() {

  if (typeof webshell !== 'undefined') {

    // Option 1: Local credentials

    const credentials = cache.load('credentials');

 

    if (credentials) {

      return await authenticateWithToken(credentials.token);

    }

 

    // Option 2: OAuth with callback

    const authUrl = 'https://auth.example.com/oauth';

    window.open(authUrl);

  } else {

    // Standard web OAuth

    window.location.href = getOAuthUrl();

  }

}

```

 

### 5. Handle External Links

 

**Open external links in browser:**

```javascript

// Intercept external links

document.addEventListener('click', (e) => {

  const link = e.target.closest('a');

 

  if (link && link.href.startsWith('http')) {

    if (typeof webshell !== 'undefined') {

      e.preventDefault();

 

      // Open in default browser

      window.open(link.href);

    }

  }

});

```

 

---

 

## Common Patterns

 

### Progressive Enhancement

 

**Start with web, enhance with desktop features:**

 

```javascript

class NotificationManager {

  async send(title, message, options = {}) {

    // Try WebShell first

    if (typeof webshell !== 'undefined') {

      return await webshell.notifications.send({

        title,

        message,

        ...options

      });

    }

 

    // Fallback to web notifications

    if ('Notification' in window) {

      if (Notification.permission === 'granted') {

        return new Notification(title, { body: message });

      }

 

      // Request permission

      const permission = await Notification.requestPermission();

      if (permission === 'granted') {

        return new Notification(title, { body: message });

      }

    }

 

    // Final fallback: in-app notification

    this.showInAppNotification(title, message);

  }

 

  showInAppNotification(title, message) {

    const toast = document.createElement('div');

    toast.className = 'toast-notification';

    toast.innerHTML = `<strong>${title}</strong><p>${message}</p>`;

    document.body.appendChild(toast);

 

    setTimeout(() => toast.remove(), 5000);

  }

}

```

 

### Feature Detection

 

**Check capabilities before using:**

 

```javascript

const capabilities = {

  notifications: typeof webshell !== 'undefined' &&

                 webshell.notifications,

 

  calendar: typeof webshell !== 'undefined' &&

            webshell.calendar,

 

  systemInfo: typeof webshell !== 'undefined' &&

              webshell.system,

 

  windowControl: typeof webshell !== 'undefined' &&

                 webshell.window

};

 

// Use features conditionally

if (capabilities.calendar) {

  loadCalendarEvents();

} else {

  hideCalendarSection();

}

```

 

### Hybrid Deployment

 

**Single codebase, multiple targets:**

 

```javascript

// config.js

export const config = {

  isDesktop: typeof webshell !== 'undefined',

  isWeb: typeof webshell === 'undefined',

 

  features: {

    notifications: typeof webshell !== 'undefined',

    calendar: typeof webshell !== 'undefined',

    systemTray: typeof webshell !== 'undefined'

  },

 

  apiUrl: typeof webshell !== 'undefined'

    ? 'http://localhost:3000/api'  // Desktop: local API

    : 'https://api.example.com'     // Web: remote API

};

 

// Use config throughout app

import { config } from './config';

 

if (config.features.calendar) {

  // Desktop feature

}

```

 

### Settings Persistence

 

**Sync settings across environments:**

 

```javascript

class SettingsManager {

  constructor() {

    this.storageKey = 'app-settings';

  }

 

  async load() {

    // Try WebShell first (if available)

    if (typeof webshell !== 'undefined') {

      // Could use custom backend storage in future

      return this.loadFromLocalStorage();

    }

 

    // Web: Try to sync from server

    if (navigator.onLine) {

      try {

        return await this.loadFromServer();

      } catch (err) {

        return this.loadFromLocalStorage();

      }

    }

 

    return this.loadFromLocalStorage();

  }

 

  loadFromLocalStorage() {

    const json = localStorage.getItem(this.storageKey);

    return json ? JSON.parse(json) : this.getDefaults();

  }

 

  async save(settings) {

    // Save locally

    localStorage.setItem(this.storageKey, JSON.stringify(settings));

 

    // Sync to server if web app

    if (typeof webshell === 'undefined' && navigator.onLine) {

      await this.saveToServer(settings);

    }

  }

}

```

 

---

 

## Best Practices

 

### 1. Keep Web Compatibility

 

**Always provide fallbacks:**

```javascript

// Good: Works everywhere

const notify = (title, msg) => {

  if (typeof webshell !== 'undefined') {

    webshell.notifications.send({ title, message: msg });

  } else {

    new Notification(title, { body: msg });

  }

};

 

// Bad: Only works in WebShell

const notify = (title, msg) => {

  webshell.notifications.send({ title, message: msg });

};

```

 

### 2. Use Progressive Enhancement

 

**Add features, don't require them:**

```javascript

// Initialize app

function init() {

  // Core functionality (works everywhere)

  loadData();

  renderUI();

 

  // Enhanced features (if available)

  if (typeof webshell !== 'undefined') {

    webshell.ready(() => {

      webshell.theme.applyTheme();

      enableDesktopFeatures();

    });

  }

}

```

 

### 3. Request Minimal Permissions

 

**Only request what you need:**

```json

// Good

{

  "permissions": {

    "notifications": { "send": true }

  }

}

 

// Bad: Excessive

{

  "permissions": {

    "notifications": { "send": true },

    "calendar": { "read": true, "write": true },

    "filesystem": { "read": ["/"], "write": ["/"] }

  }

}

```

 

### 4. Optimize Bundle Size

 

**Keep it lightweight:**

```javascript

// Use code splitting

const HeavyComponent = lazy(() => import('./HeavyComponent'));

 

// Remove development dependencies from production

// vite.config.js

export default {

  build: {

    minify: 'terser',

    rollupOptions: {

      output: {

        manualChunks: {

          vendor: ['react', 'react-dom']

        }

      }

    }

  }

};

```

 

### 5. Test Both Environments

 

**Test as web app AND desktop app:**

```bash

# Test as web app

npm run dev

# Open http://localhost:5173 in browser

 

# Test as desktop app

cp -r . ~/.config/webshell/apps/my-app

# Launch WebShell

```

 

---

 

## Migration Checklist

 

### Planning

- [ ] Identify features that benefit from desktop integration

- [ ] List required permissions

- [ ] Plan fallbacks for web version

- [ ] Document new features

 

### Implementation

- [ ] Create `webshell.json` manifest

- [ ] Add SDK integration with feature detection

- [ ] Implement desktop features (notifications, etc.)

- [ ] Add progressive enhancement

- [ ] Update UI for desktop (window controls, etc.)

- [ ] Configure build process

 

### Testing

- [ ] Test in browser (web version)

- [ ] Test in WebShell (desktop version)

- [ ] Verify all features work in both environments

- [ ] Test with/without permissions

- [ ] Test offline functionality

- [ ] Verify theme integration

 

### Deployment

- [ ] Build optimized bundle

- [ ] Test production build

- [ ] Update documentation

- [ ] Create distribution package

- [ ] Deploy web version

- [ ] Publish desktop version

 

---

 

## Example: Todo App Migration

 

### Original Web App

 

**index.html:**

```html

<!DOCTYPE html>

<html lang="en">

<head>

  <meta charset="UTF-8">

  <title>Todo App</title>

  <link rel="stylesheet" href="style.css">

</head>

<body>

  <div class="app">

    <h1>My Todos</h1>

    <input type="text" id="new-todo" placeholder="Add todo...">

    <button id="add-btn">Add</button>

    <ul id="todo-list"></ul>

  </div>

  <script src="app.js"></script>

</body>

</html>

```

 

**app.js:**

```javascript

const todos = JSON.parse(localStorage.getItem('todos') || '[]');

 

function addTodo(text) {

  todos.push({ id: Date.now(), text, done: false });

  saveTodos();

  render();

}

 

function saveTodos() {

  localStorage.setItem('todos', JSON.stringify(todos));

}

 

function render() {

  const list = document.getElementById('todo-list');

  list.innerHTML = todos.map(todo => `

    <li>

      <input type="checkbox" ${todo.done ? 'checked' : ''}>

      <span>${todo.text}</span>

    </li>

  `).join('');

}

 

document.getElementById('add-btn').onclick = () => {

  const input = document.getElementById('new-todo');

  if (input.value) {

    addTodo(input.value);

    input.value = '';

  }

};

 

render();

```

 

### Converted WebShell App

 

**Add webshell.json:**

```json

{

  "version": "1.0.0",

  "name": "todo-app",

  "displayName": "Todo App",

  "description": "Simple todo list with desktop features",

  "entrypoint": "index.html",

  "icon": "icon.svg",

 

  "window": {

    "type": "widget",

    "width": 400,

    "height": 600,

    "blur": true,

    "transparency": true,

    "position": "center"

  },

 

  "permissions": {

    "notifications": {

      "send": true

    },

    "calendar": {

      "write": true

    }

  }

}

```

 

**Enhanced app.js:**

```javascript

const todos = JSON.parse(localStorage.getItem('todos') || '[]');

const isDesktop = typeof webshell !== 'undefined';

 

// Desktop-specific initialization

if (isDesktop) {

  webshell.ready(() => {

    // Apply system theme

    webshell.theme.applyTheme();

 

    // Listen for theme changes

    webshell.theme.onThemeChange(() => {

      console.log('Theme updated');

    });

 

    console.log('Running as desktop app');

  });

}

 

function addTodo(text) {

  const todo = { id: Date.now(), text, done: false };

  todos.push(todo);

  saveTodos();

  render();

 

  // Desktop: Send notification

  if (isDesktop) {

    webshell.notifications.send({

      title: 'Todo Added',

      message: text,

      urgency: 'low',

      timeout: 2000

    });

  }

}

 

function completeTodo(id) {

  const todo = todos.find(t => t.id === id);

  if (todo) {

    todo.done = true;

    saveTodos();

    render();

 

    // Desktop: Send notification

    if (isDesktop) {

      webshell.notifications.send({

        title: 'Todo Complete',

        message: todo.text,

        urgency: 'low'

      });

    }

  }

}

 

async function addToCalendar(todo) {

  if (!isDesktop) return;

 

  try {

    const tomorrow = new Date();

    tomorrow.setDate(tomorrow.getDate() + 1);

    tomorrow.setHours(9, 0, 0, 0);

 

    await webshell.calendar.createEvent({

      title: todo.text,

      start: tomorrow,

      end: new Date(tomorrow.getTime() + 3600000),

      description: 'Todo from Todo App'

    });

 

    await webshell.notifications.send({

      title: 'Added to Calendar',

      message: `"${todo.text}" scheduled for tomorrow`,

      urgency: 'normal'

    });

  } catch (err) {

    console.error('Failed to add to calendar:', err);

  }

}

 

function saveTodos() {

  localStorage.setItem('todos', JSON.stringify(todos));

}

 

function render() {

  const list = document.getElementById('todo-list');

  list.innerHTML = todos.map(todo => `

    <li data-id="${todo.id}">

      <input type="checkbox" ${todo.done ? 'checked' : ''}>

      <span class="${todo.done ? 'done' : ''}">${todo.text}</span>

      ${isDesktop ? '<button class="calendar-btn">📅</button>' : ''}

    </li>

  `).join('');

 

  // Event listeners

  list.querySelectorAll('input[type="checkbox"]').forEach(cb => {

    cb.onchange = (e) => {

      const id = parseInt(e.target.closest('li').dataset.id);

      completeTodo(id);

    };

  });

 

  if (isDesktop) {

    list.querySelectorAll('.calendar-btn').forEach(btn => {

      btn.onclick = (e) => {

        const id = parseInt(e.target.closest('li').dataset.id);

        const todo = todos.find(t => t.id === id);

        addToCalendar(todo);

      };

    });

  }

}

 

document.getElementById('add-btn').onclick = () => {

  const input = document.getElementById('new-todo');

  if (input.value) {

    addTodo(input.value);

    input.value = '';

  }

};

 

render();

```

 

**Enhanced style.css:**

```css

/* Use theme tokens when available */

body {

  background: var(--color-background, #f5f5f5);

  color: var(--color-on-background, #1a1a1a);

  font-family: var(--font-base, -apple-system, system-ui, sans-serif);

  margin: 0;

  padding: var(--space-m, 16px);

}

 

.app {

  max-width: 100%;

}

 

h1 {

  color: var(--color-primary, #2563eb);

  margin-bottom: var(--space-m, 16px);

}

 

input[type="text"] {

  width: 100%;

  padding: var(--space-s, 8px);

  border: 1px solid var(--color-outline, #ccc);

  border-radius: var(--radius-s, 4px);

  background: var(--color-surface, #fff);

  color: var(--color-on-surface, #1a1a1a);

}

 

button {

  background: var(--color-primary, #2563eb);

  color: var(--color-on-primary, #fff);

  border: none;

  padding: var(--space-s, 8px) var(--space-m, 16px);

  border-radius: var(--radius-s, 4px);

  cursor: pointer;

  margin-top: var(--space-s, 8px);

}

 

button:hover {

  opacity: 0.9;

}

 

ul {

  list-style: none;

  padding: 0;

}

 

li {

  padding: var(--space-s, 8px);

  margin: var(--space-xs, 4px) 0;

  background: var(--color-surface, #fff);

  border-radius: var(--radius-s, 4px);

  display: flex;

  align-items: center;

  gap: var(--space-s, 8px);

}

 

.done {

  text-decoration: line-through;

  opacity: 0.6;

}

 

.calendar-btn {

  margin-left: auto;

  padding: var(--space-xs, 4px);

  font-size: 16px;

}

```

 

**Result:**

- ✅ Works as web app in browser

- ✅ Works as desktop app in WebShell

- ✅ Native notifications when tasks added/completed

- ✅ Calendar integration (desktop only)

- ✅ System theme integration (desktop only)

- ✅ Same codebase for both!

 

---

 

## Additional Resources

 

- [WebShell SDK API Reference](../sdk-api-reference.md)

- [Getting Started Guide](../getting-started-sdk.md)

- [Permissions Guide](../permissions-guide.md)

- [Best Practices](../best-practices.md)

- [Troubleshooting](../troubleshooting-sdk.md)

- [Electron Migration Guide](./from-electron.md)

 

---

 

**Start converting your web apps today!** With WebShell, you get desktop superpowers while keeping your web app running everywhere.
