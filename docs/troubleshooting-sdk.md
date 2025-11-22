
# WebShell SDK Troubleshooting Guide

 

Comprehensive troubleshooting guide for common WebShell SDK issues with practical solutions and debugging techniques.

 

## Table of Contents

 

1. [SDK Initialization Issues](#sdk-initialization-issues)

2. [Permission Errors](#permission-errors)

3. [Window Management Issues](#window-management-issues)

4. [Theme Issues](#theme-issues)

5. [Calendar Issues](#calendar-issues)

6. [Notification Issues](#notification-issues)

7. [Build and Development Issues](#build-and-development-issues)

8. [Runtime Errors](#runtime-errors)

9. [Performance Issues](#performance-issues)

10. [Quick Reference](#quick-reference)

 

---

 

## SDK Initialization Issues

 

### Problem: "webshell is not defined"

 

**Symptoms:**

```

Uncaught ReferenceError: webshell is not defined

```

 

**Causes:**

- Running outside WebShell environment

- Script loading before SDK initialization

- Incorrect import/reference

 

**Solutions:**

 

**1. Check if running in WebShell:**

```javascript

// ✅ Always check if WebShell is available

if (typeof webshell !== 'undefined') {

  webshell.ready(() => {

    console.log('Running in WebShell');

  });

} else {

  console.log('Not running in WebShell - use fallback');

}

```

 

**2. Wait for SDK to be ready:**

```javascript

// ✅ Use ready callback

webshell.ready(() => {

  // SDK is ready, safe to use all APIs

  const appName = webshell.shell.app.getName();

});

 

// ❌ Don't use SDK immediately

const appName = webshell.shell.app.getName(); // May fail!

```

 

**3. Check script loading order:**

```html

<!-- ✅ SDK is automatically available -->

<script type="module">

  webshell.ready(() => {

    import('./app.js').then(module => module.init());

  });

</script>

```

 

### Problem: ready() Callback Never Fires

 

**Symptoms:**

- App appears to hang

- No console errors

- SDK ready callback never executes

 

**Causes:**

- JavaScript error before ready()

- Syntax error in code

- Missing script tag

- Browser compatibility issue

 

**Solutions:**

 

**1. Check browser console:**

```javascript

// Add debug logging

console.log('Script loaded');

 

webshell.ready(() => {

  console.log('SDK ready'); // Should see this

});

 

console.log('Waiting for SDK...');

```

 

**2. Check for syntax errors:**

```bash

# Validate JavaScript syntax

npm run lint

 

# Or use browser developer tools

# Open DevTools (F12) → Console

```

 

**3. Ensure script is loaded:**

```html

<!-- Check script tag is present and correct -->

<script type="module" src="./app.js"></script>

 

<!-- Or inline -->

<script type="module">

  webshell.ready(() => {

    console.log('Ready!');

  });

</script>

```

 

**4. Add timeout for debugging:**

```javascript

// Debug: Check if callback fires within timeout

let readyFired = false;

 

webshell.ready(() => {

  readyFired = true;

  console.log('SDK ready!');

});

 

setTimeout(() => {

  if (!readyFired) {

    console.error('SDK ready callback did not fire!');

    // Check for errors in console

  }

}, 5000);

```

 

---

 

## Permission Errors

 

### Problem: PERMISSION_DENIED Error

 

**Symptoms:**

```

Error: PERMISSION_DENIED: calendar.read

WebShellError: Insufficient permissions for calendar.read

```

 

**Causes:**

- Permission not declared in manifest

- Incorrect permission syntax

- Typo in permission name

- Manifest not loaded correctly

 

**Solutions:**

 

**1. Add permission to manifest:**

```json

// webshell.json

{

  "permissions": {

    "calendar": {

      "read": true,

      "write": true

    },

    "notifications": {

      "send": true

    }

  }

}

```

 

**2. Verify manifest syntax:**

```bash

# Validate JSON syntax

cat webshell.json | jq .

 

# Or use online JSON validator

```

 

**3. Check exact permission name:**

```javascript

// ✅ Correct permission names

"calendar": { "read": true, "write": true, "delete": false }

"notifications": { "send": true }

"clipboard": { "read": true, "write": true }

"filesystem": { "read": ["~/Documents"], "write": ["~/Documents/MyApp"] }

"network": { "allowed_hosts": ["api.example.com"] }

 

// ❌ Common mistakes

"calendar": { "view": true } // Should be "read"

"notification": { "send": true } // Should be "notifications"

```

 

**4. Restart app after manifest changes:**

```bash

# After editing webshell.json, reload app

# In WebShell, close and reopen the app

```

 

**5. Handle permission errors gracefully:**

```javascript

try {

  const events = await webshell.calendar.eventsToday();

} catch (error) {

  if (error.code === 'PERMISSION_DENIED') {

    console.error('Calendar permission denied');

 

    // Show user-friendly message

    showDialog(

      'Permission Required',

      'This app needs calendar access. Please grant permission in settings.'

    );

  }

}

```

 

### Problem: Permission Added but Still Denied

 

**Symptoms:**

- Permission in manifest

- Still getting PERMISSION_DENIED

- JSON syntax is valid

 

**Solutions:**

 

**1. Check manifest file location:**

```bash

# Manifest must be named webshell.json in app root

ls -la webshell.json

 

# Not webshell.config.json or manifest.json

```

 

**2. Verify JSON is valid:**

```bash

# Check for trailing commas, quotes, etc.

cat webshell.json | jq .

 

# Common issues:

# - Trailing comma: { "permissions": { "calendar": { "read": true, } } }

# - Missing quotes: { permissions: { calendar: { read: true } } }

# - Wrong quotes: { "permissions": { 'calendar': { 'read': true } } }

```

 

**3. Clear app cache and reload:**

```bash

# Remove app cache

rm -rf ~/.cache/webshell/apps/my-app

 

# Restart WebShell

```

 

**4. Check file permissions:**

```bash

# Ensure manifest is readable

chmod 644 webshell.json

 

# Check ownership

ls -la webshell.json

```

 

---

 

## Window Management Issues

 

### Problem: Window Size Not Changing

 

**Symptoms:**

```javascript

webshell.window.setSize(1024, 768);

// Window size doesn't change

```

 

**Causes:**

- Window constraints in manifest

- Window maximized

- Invalid size values

- WM (window manager) restrictions

 

**Solutions:**

 

**1. Check current window state:**

```javascript

// Check if window is maximized

const size = webshell.window.getSize();

console.log('Current size:', size);

 

// Restore before resizing

webshell.window.restore();

webshell.window.setSize(1024, 768);

```

 

**2. Verify size constraints in manifest:**

```json

{

  "window": {

    "width": 800,

    "height": 600,

    "minWidth": 400,    // Check minimum constraints

    "minHeight": 300,

    "maxWidth": 1920,   // Check maximum constraints

    "maxHeight": 1080

  }

}

```

 

**3. Validate size values:**

```javascript

function setWindowSize(width, height) {

  // Validate inputs

  if (width < 200 || height < 200) {

    console.error('Size too small');

    return;

  }

 

  if (width > 4000 || height > 4000) {

    console.error('Size too large');

    return;

  }

 

  webshell.window.setSize(width, height);

}

```

 

**4. Add delay if setting size on startup:**

```javascript

webshell.ready(() => {

  // Wait for window to be fully initialized

  setTimeout(() => {

    webshell.window.setSize(1024, 768);

  }, 100);

});

```

 

### Problem: Window Position Incorrect

 

**Symptoms:**

- Window appears in wrong location

- `setPosition()` doesn't work

- Window off-screen

 

**Solutions:**

 

**1. Check screen bounds:**

```javascript

async function centerWindow() {

  // Get system info for screen size

  const info = await webshell.system.getInfo();

 

  const windowSize = webshell.window.getSize();

 

  // Calculate center position

  const x = Math.floor((info.screenWidth - windowSize.width) / 2);

  const y = Math.floor((info.screenHeight - windowSize.height) / 2);

 

  webshell.window.setPosition(x, y);

}

 

// Or use built-in center

webshell.window.center();

```

 

**2. Validate position values:**

```javascript

function setWindowPosition(x, y) {

  // Ensure position is on-screen

  if (x < 0) x = 0;

  if (y < 0) y = 0;

 

  webshell.window.setPosition(x, y);

}

```

 

**3. Use position in manifest:**

```json

{

  "window": {

    "position": "center"  // or "top-left", "top-right", etc.

  }

}

```

 

### Problem: Blur/Transparency Not Working

 

**Symptoms:**

- `setBlur(true)` has no effect

- Window background not transparent

- Blur effect not visible

 

**Causes:**

- Compositor not running

- WM doesn't support blur

- Incorrect window configuration

- Conflicting CSS

 

**Solutions:**

 

**1. Enable in manifest:**

```json

{

  "window": {

    "blur": true,

    "transparency": true

  }

}

```

 

**2. Set via SDK:**

```javascript

webshell.ready(() => {

  webshell.window.setBlur(true);

  webshell.window.setTransparency(true);

  webshell.window.setOpacity(0.95);

});

```

 

**3. Check compositor:**

```bash

# For Hyprland

hyprctl version

 

# Check if compositor is running

ps aux | grep compositor

```

 

**4. Verify CSS doesn't override:**

```css

/* Don't set opaque background if using transparency */

body {

  background: rgba(0, 0, 0, 0.8); /* ✅ Semi-transparent */

  /* background: #000; */ /* ❌ Opaque */

}

```

 

---

 

## Theme Issues

 

### Problem: Theme Not Applying

 

**Symptoms:**

- CSS variables not defined

- Colors don't match system theme

- `var(--color-primary)` shows raw value

 

**Causes:**

- Forgot to call `applyTheme()`

- Theme applied before DOM ready

- CSS variables not used correctly

 

**Solutions:**

 

**1. Call applyTheme() on startup:**

```javascript

webshell.ready(() => {

  // Apply theme CSS variables

  webshell.theme.applyTheme();

 

  console.log('Theme applied');

});

```

 

**2. Verify CSS variable usage:**

```css

/* ✅ Correct usage */

.button {

  background: var(--color-primary);

  color: var(--color-on-primary);

}

 

/* ❌ Incorrect - missing var() */

.button {

  background: --color-primary; /* Wrong! */

}

 

/* ❌ Fallback not provided */

.button {

  background: var(--color-primary); /* What if not defined? */

}

 

/* ✅ Best - with fallback */

.button {

  background: var(--color-primary, #2563eb);

}

```

 

**3. Debug theme values:**

```javascript

webshell.ready(() => {

  const theme = webshell.theme.getTheme();

  console.log('Theme colors:', theme.colors);

  console.log('Theme spacing:', theme.spacing);

 

  // Check if CSS variables are set

  const primary = getComputedStyle(document.documentElement)

    .getPropertyValue('--color-primary');

  console.log('CSS variable value:', primary);

});

```

 

**4. Force theme refresh:**

```javascript

// Manually inject theme if needed

function forceApplyTheme() {

  const theme = webshell.theme.getTheme();

 

  Object.entries(theme.colors).forEach(([key, value]) => {

    document.documentElement.style.setProperty(`--color-${key}`, value);

  });

 

  Object.entries(theme.spacing).forEach(([key, value]) => {

    document.documentElement.style.setProperty(`--space-${key}`, value);

  });

}

```

 

---

 

## Calendar Issues

 

### Problem: Events Not Appearing

 

**Symptoms:**

- `eventsToday()` returns empty array

- Events exist but don't show

- No errors thrown

 

**Causes:**

- Permission not granted

- Wrong date range

- Events filtered out

- Calendar backend not configured

 

**Solutions:**

 

**1. Verify permission:**

```json

{

  "permissions": {

    "calendar": {

      "read": true

    }

  }

}

```

 

**2. Check date range:**

```javascript

async function debugCalendar() {

  // Check today

  const today = await webshell.calendar.eventsToday();

  console.log('Today:', today);

 

  // Check this week

  const week = await webshell.calendar.eventsThisWeek();

  console.log('This week:', week);

 

  // Check broad range

  const start = new Date('2025-01-01');

  const end = new Date('2025-12-31');

  const all = await webshell.calendar.listEvents(start, end);

  console.log('All 2025:', all);

}

```

 

**3. Verify event structure:**

```javascript

const events = await webshell.calendar.eventsToday();

 

events.forEach(event => {

  console.log('Event:', {

    id: event.id,

    title: event.title,

    start: event.start,

    end: event.end,

    allDay: event.allDay

  });

});

```

 

**4. Test with created event:**

```javascript

// Create test event

const testEvent = await webshell.calendar.createEvent({

  title: 'Test Event',

  start: new Date(),

  end: new Date(Date.now() + 3600000)

});

 

console.log('Created:', testEvent);

 

// Try to retrieve it

const events = await webshell.calendar.eventsToday();

console.log('Retrieved:', events);

```

 

### Problem: INVALID_INPUT When Creating Event

 

**Symptoms:**

```

Error: INVALID_INPUT: Invalid event data

```

 

**Causes:**

- Missing required fields

- Invalid date format

- End before start

- Invalid field types

 

**Solutions:**

 

**1. Validate event data:**

```javascript

function validateEventData(data) {

  // Check required fields

  if (!data.title || typeof data.title !== 'string') {

    throw new Error('Title is required and must be a string');

  }

 

  // Validate dates

  const start = new Date(data.start);

  const end = new Date(data.end);

 

  if (isNaN(start.getTime())) {

    throw new Error('Invalid start date');

  }

 

  if (isNaN(end.getTime())) {

    throw new Error('Invalid end date');

  }

 

  if (end <= start) {

    throw new Error('End date must be after start date');

  }

 

  return true;

}

 

async function createEvent(title, start, end) {

  const data = { title, start, end };

 

  try {

    validateEventData(data);

    return await webshell.calendar.createEvent(data);

  } catch (error) {

    console.error('Invalid event data:', error);

    throw error;

  }

}

```

 

**2. Use correct date format:**

```javascript

// ✅ Correct - Date objects or ISO strings

const event = await webshell.calendar.createEvent({

  title: 'Meeting',

  start: new Date('2025-01-20T10:00:00'),

  end: new Date('2025-01-20T11:00:00')

});

 

// ✅ Also works

const event = await webshell.calendar.createEvent({

  title: 'Meeting',

  start: '2025-01-20T10:00:00Z',

  end: '2025-01-20T11:00:00Z'

});

 

// ❌ Wrong - invalid format

const event = await webshell.calendar.createEvent({

  title: 'Meeting',

  start: '01/20/2025 10:00 AM', // Wrong format!

  end: 'tomorrow'                // Wrong format!

});

```

 

**3. Example with full validation:**

```javascript

async function createValidatedEvent(eventData) {

  // Ensure all required fields

  const data = {

    title: eventData.title || 'Untitled Event',

    start: new Date(eventData.start),

    end: new Date(eventData.end),

    description: eventData.description || '',

    location: eventData.location || '',

    allDay: eventData.allDay || false,

    color: eventData.color || '#2563eb'

  };

 

  // Validate

  validateEventData(data);

 

  // Create

  try {

    return await webshell.calendar.createEvent(data);

  } catch (error) {

    console.error('Failed to create event:', error);

    throw new Error(`Could not create event: ${error.message}`);

  }

}

```

 

---

 

## Notification Issues

 

### Problem: Notifications Not Appearing

 

**Symptoms:**

- `send()` completes but no notification shows

- No errors thrown

- Notification ID returned but nothing visible

 

**Causes:**

- Permission not granted

- Notification daemon not running

- Invalid notification data

- Urgency level filtered

 

**Solutions:**

 

**1. Check permission:**

```json

{

  "permissions": {

    "notifications": {

      "send": true

    }

  }

}

```

 

**2. Verify notification daemon:**

```bash

# Check if notification daemon is running

ps aux | grep notification

 

# For most Linux systems

systemctl --user status notification-daemon

```

 

**3. Test with simple notification:**

```javascript

async function testNotifications() {

  try {

    const id = await webshell.notifications.send({

      title: 'Test',

      message: 'Testing notifications',

      urgency: 'normal'

    });

 

    console.log('Notification sent, ID:', id);

  } catch (error) {

    console.error('Failed to send notification:', error);

  }

}

```

 

**4. Check notification settings:**

```javascript

// Try different urgency levels

const urgencies = ['low', 'normal', 'critical'];

 

for (const urgency of urgencies) {

  await webshell.notifications.send({

    title: `Test ${urgency}`,

    message: `Testing ${urgency} urgency`,

    urgency

  });

 

  await new Promise(resolve => setTimeout(resolve, 2000));

}

```

 

### Problem: Action Buttons Not Working

 

**Symptoms:**

- Notification shows but actions don't appear

- Actions appear but clicks don't trigger callback

- `onActionClicked` never fires

 

**Solutions:**

 

**1. Verify action structure:**

```javascript

// ✅ Correct action format

const id = await webshell.notifications.send({

  title: 'New Message',

  message: 'You have a new message',

  actions: [

    { id: 'view', label: 'View' },

    { id: 'dismiss', label: 'Dismiss' }

  ]

});

 

// ❌ Wrong format

const id = await webshell.notifications.send({

  title: 'New Message',

  message: 'You have a new message',

  actions: ['View', 'Dismiss'] // Wrong! Must be objects

});

```

 

**2. Set up action handler:**

```javascript

// Listen for action clicks

webshell.notifications.onActionClicked(({ notificationId, actionId }) => {

  console.log('Action clicked:', actionId, 'on notification:', notificationId);

 

  if (actionId === 'view') {

    showMessage();

  } else if (actionId === 'dismiss') {

    closeNotification();

  }

});

```

 

**3. Debug action clicks:**

```javascript

// Add logging to debug

webshell.notifications.onActionClicked((data) => {

  console.log('Raw action data:', data);

  console.log('Notification ID:', data.notificationId);

  console.log('Action ID:', data.actionId);

});

```

 

---

 

## Build and Development Issues

 

### Problem: Vite Build Errors

 

**Symptoms:**

```

Error: Failed to resolve import

Error: Could not resolve entry module

```

 

**Solutions:**

 

**1. Check vite.config.js:**

```javascript

import { defineConfig } from 'vite';

 

export default defineConfig({

  root: '.', // Project root

  build: {

    outDir: 'dist',

    emptyOutDir: true

  },

  server: {

    port: 5173,

    host: true

  }

});

```

 

**2. Verify entry point:**

```bash

# index.html should be in project root

ls -la index.html

 

# Check paths in index.html

cat index.html | grep script

```

 

**3. Clear cache and rebuild:**

```bash

# Clear Vite cache

rm -rf node_modules/.vite

 

# Reinstall dependencies

rm -rf node_modules package-lock.json

npm install

 

# Rebuild

npm run build

```

 

### Problem: TypeScript Errors

 

**Symptoms:**

```

Cannot find module 'webshell-sdk'

Property 'calendar' does not exist on type 'WebShell'

```

 

**Solutions:**

 

**1. Add type declarations:**

```typescript

// src/@types/webshell.d.ts

declare global {

  const webshell: {

    ready(callback: () => void): void;

    calendar: {

      eventsToday(): Promise<CalendarEvent[]>;

      createEvent(data: EventData): Promise<CalendarEvent>;

    };

    notifications: {

      send(options: NotificationOptions): Promise<string>;

    };

    // ... other modules

  };

}

 

export {};

```

 

**2. Configure tsconfig.json:**

```json

{

  "compilerOptions": {

    "target": "ESNext",

    "module": "ESNext",

    "moduleResolution": "bundler",

    "lib": ["ESNext", "DOM"],

    "types": ["vite/client"],

    "strict": true,

    "skipLibCheck": true

  },

  "include": ["src/**/*"],

  "exclude": ["node_modules"]

}

```

 

**3. Import types:**

```typescript

import type { CalendarEvent, Theme } from 'webshell-sdk';

 

// Use types

const events: CalendarEvent[] = await webshell.calendar.eventsToday();

```

 

### Problem: Hot Reload Not Working

 

**Symptoms:**

- Changes don't reflect in app

- Need to manually reload

- HMR connection failed

 

**Solutions:**

 

**1. Check dev server is running:**

```bash

# Start Vite dev server

npm run dev

 

# Should see: Local: http://localhost:5173

```

 

**2. Configure devServer in manifest:**

```json

{

  "name": "my-app",

  "devServer": "http://localhost:5173"

}

```

 

**3. Check HMR configuration:**

```javascript

// In your main entry file

if (import.meta.hot) {

  import.meta.hot.accept(() => {

    console.log('HMR update');

  });

}

```

 

**4. Verify firewall/network:**

```bash

# Check if port is accessible

curl http://localhost:5173

 

# If using WSL or VM, use IP address

# devServer: "http://192.168.1.100:5173"

```

 

---

 

## Runtime Errors

 

### Problem: Bridge Not Initialized

 

**Symptoms:**

```

Error: Bridge not initialized

Error: Cannot call SDK method before bridge ready

```

 

**Solutions:**

 

**1. Always use ready callback:**

```javascript

// ✅ Correct

webshell.ready(() => {

  // Bridge is ready

  webshell.calendar.eventsToday();

});

 

// ❌ Wrong

webshell.calendar.eventsToday(); // Bridge may not be ready!

```

 

**2. Check for race conditions:**

```javascript

// If importing modules

// app.js

let isReady = false;

 

webshell.ready(() => {

  isReady = true;

  init();

});

 

async function loadCalendar() {

  if (!isReady) {

    console.warn('SDK not ready yet');

    return;

  }

 

  const events = await webshell.calendar.eventsToday();

  renderEvents(events);

}

```

 

### Problem: Unhandled Promise Rejections

 

**Symptoms:**

```

UnhandledPromiseRejectionWarning: Error: PERMISSION_DENIED

```

 

**Solutions:**

 

**1. Add global error handler:**

```javascript

window.addEventListener('unhandledrejection', (event) => {

  console.error('Unhandled promise rejection:', event.reason);

 

  // Handle specific errors

  if (event.reason?.code === 'PERMISSION_DENIED') {

    showPermissionError();

  } else {

    showGenericError();

  }

 

  // Prevent default browser behavior

  event.preventDefault();

});

```

 

**2. Wrap async calls in try-catch:**

```javascript

async function loadData() {

  try {

    const events = await webshell.calendar.eventsToday();

    renderEvents(events);

  } catch (error) {

    console.error('Failed to load events:', error);

    showError('Could not load calendar events');

  }

}

```

 

**3. Use .catch() for promises:**

```javascript

webshell.calendar.eventsToday()

  .then(renderEvents)

  .catch(error => {

    console.error('Error:', error);

    showError(error.message);

  });

```

 

### Problem: App Crashes or Freezes

 

**Symptoms:**

- App becomes unresponsive

- UI freezes

- Must force close

 

**Causes:**

- Infinite loop

- Memory leak

- Blocking operation

- Recursive function without base case

 

**Solutions:**

 

**1. Check for infinite loops:**

```javascript

// ❌ Infinite loop

while (true) {

  // Never exits!

}

 

// ✅ Proper loop with exit condition

let attempts = 0;

while (condition && attempts < 100) {

  // Do work

  attempts++;

}

```

 

**2. Avoid blocking operations:**

```javascript

// ❌ Blocking

for (let i = 0; i < 1000000; i++) {

  processItem(i);

}

 

// ✅ Non-blocking with batching

async function processBatch(items, batchSize = 100) {

  for (let i = 0; i < items.length; i += batchSize) {

    const batch = items.slice(i, i + batchSize);

    batch.forEach(processItem);

 

    // Yield to event loop

    await new Promise(resolve => setTimeout(resolve, 0));

  }

}

```

 

**3. Monitor memory usage:**

```javascript

// Check memory periodically

setInterval(() => {

  if (performance.memory) {

    const used = performance.memory.usedJSHeapSize / 1048576;

    console.log('Memory used:', used.toFixed(2), 'MB');

 

    if (used > 100) {

      console.warn('High memory usage detected');

    }

  }

}, 10000);

```

 

**4. Clean up resources:**

```javascript

// Track subscriptions

const subscriptions = [];

 

function subscribe() {

  const unsub = webshell.theme.onThemeChange(handleTheme);

  subscriptions.push(unsub);

}

 

function cleanup() {

  // Unsubscribe all

  subscriptions.forEach(unsub => unsub());

  subscriptions.length = 0;

}

 

window.addEventListener('beforeunload', cleanup);

```

 

---

 

## Performance Issues

 

### Problem: Slow or Laggy App

 

**Symptoms:**

- UI feels sluggish

- Delayed response to clicks

- Animations stuttering

- Long loading times

 

**Solutions:**

 

**1. Profile performance:**

```javascript

// Use Performance API

const start = performance.now();

 

await expensiveOperation();

 

const end = performance.now();

console.log('Operation took:', end - start, 'ms');

```

 

**2. Optimize rendering:**

```javascript

// ❌ Multiple reflows

function updateUI(data) {

  data.forEach(item => {

    const div = document.createElement('div');

    div.textContent = item.text;

    container.appendChild(div); // Reflow for each item

  });

}

 

// ✅ Single reflow

function updateUI(data) {

  const fragment = document.createDocumentFragment();

 

  data.forEach(item => {

    const div = document.createElement('div');

    div.textContent = item.text;

    fragment.appendChild(div);

  });

 

  container.appendChild(fragment); // Single reflow

}

```

 

**3. Debounce expensive operations:**

```javascript

const debouncedUpdate = debounce(() => {

  updateExpensiveChart();

}, 300);

 

webshell.window.onResize(() => {

  debouncedUpdate();

});

```

 

**4. Use virtual scrolling for long lists:**

```javascript

// For very long lists, only render visible items

class VirtualList {

  constructor(items, itemHeight) {

    this.items = items;

    this.itemHeight = itemHeight;

    this.scrollTop = 0;

  }

 

  getVisibleItems() {

    const start = Math.floor(this.scrollTop / this.itemHeight);

    const visibleCount = Math.ceil(window.innerHeight / this.itemHeight);

    const end = start + visibleCount;

 

    return this.items.slice(start, end);

  }

}

```

 

### Problem: High CPU Usage

 

**Symptoms:**

- Fan spinning up

- System slow

- Battery draining quickly

- High CPU in task manager

 

**Solutions:**

 

**1. Check for runaway intervals:**

```javascript

// ❌ Too frequent

setInterval(updateUI, 10); // Every 10ms!

 

// ✅ Reasonable interval

setInterval(updateUI, 1000); // Every second

 

// ✅ Or use requestAnimationFrame for animations

function animate() {

  updateAnimation();

  requestAnimationFrame(animate);

}

```

 

**2. Throttle event handlers:**

```javascript

const throttledHandler = throttle(() => {

  expensiveCalculation();

}, 100);

 

window.addEventListener('scroll', throttledHandler);

window.addEventListener('mousemove', throttledHandler);

```

 

**3. Optimize loops:**

```javascript

// ❌ Slow

const items = document.querySelectorAll('.item');

for (let i = 0; i < items.length; i++) {

  items[i].style.color = 'red'; // Style change in loop

}

 

// ✅ Fast

const items = document.querySelectorAll('.item');

items.forEach(item => item.classList.add('highlighted')); // Class change

 

// CSS

.highlighted { color: red; }

```

 

**4. Use web workers for heavy computation:**

```javascript

// worker.js

self.onmessage = (e) => {

  const result = heavyComputation(e.data);

  self.postMessage(result);

};

 

// main.js

const worker = new Worker('worker.js');

 

worker.postMessage(data);

 

worker.onmessage = (e) => {

  console.log('Result:', e.data);

};

```

 

---

 

## Quick Reference

 

### Common Error Codes

 

| Error Code | Meaning | Solution |

|------------|---------|----------|

| `BRIDGE_NOT_INITIALIZED` | SDK not ready | Use `webshell.ready()` |

| `PERMISSION_DENIED` | Missing permission | Add to manifest |

| `CALENDAR_EVENT_NOT_FOUND` | Event doesn't exist | Check event ID |

| `INVALID_INPUT` | Invalid data format | Validate input |

| `NETWORK_ERROR` | Network failure | Check connection |

| `APP_NOT_FOUND` | App doesn't exist | Verify app name |

| `FILESYSTEM_ERROR` | File operation failed | Check path/permissions |

 

### Debug Checklist

 

When something doesn't work:

 

- [ ] Check browser console for errors

- [ ] Verify `webshell.ready()` is used

- [ ] Check manifest permissions

- [ ] Validate JSON syntax

- [ ] Confirm SDK version compatibility

- [ ] Check network tab for failed requests

- [ ] Verify all required fields provided

- [ ] Test in isolation (minimal example)

- [ ] Check WebShell logs

- [ ] Restart app/WebShell

 

### Debugging Commands

 

```javascript

// Check SDK availability

console.log('WebShell available:', typeof webshell !== 'undefined');

 

// Get app manifest

const manifest = webshell.shell.app.getManifest();

console.log('Manifest:', manifest);

 

// Check permissions

console.log('Permissions:', manifest.permissions);

 

// Get theme

const theme = webshell.theme.getTheme();

console.log('Theme:', theme);

 

// Test calendar

webshell.calendar.eventsToday()

  .then(events => console.log('Events:', events))

  .catch(err => console.error('Error:', err));

 

// Test notifications

webshell.notifications.send({

  title: 'Test',

  message: 'Debug test'

}).then(id => console.log('Notification ID:', id));

 

// Get system info

webshell.system.getInfo()

  .then(info => console.log('System:', info));

 

// Window info

console.log('Window size:', webshell.window.getSize());

console.log('Window position:', webshell.window.getPosition());

```

 

### Getting Help

 

**Before asking for help:**

 

1. Check this troubleshooting guide

2. Search existing GitHub issues

3. Enable debug logging

4. Create minimal reproduction

5. Note WebShell version

6. Collect error messages

 

**When reporting issues:**

 

```markdown

**Environment:**

- WebShell version: X.X.X

- OS: Linux (distro name)

- Browser/WebView version: X.X.X

 

**Description:**

Clear description of the problem

 

**Steps to Reproduce:**

1. Step 1

2. Step 2

3. Step 3

 

**Expected Behavior:**

What should happen

 

**Actual Behavior:**

What actually happens

 

**Code:**

```javascript

// Minimal reproduction code

```

 

**Console Output:**

```

Error messages from console

```

 

**Manifest:**

```json

{

  "relevant": "manifest fields"

}

```

```

 

---

 

## Additional Resources

 

- [SDK API Reference](./sdk-api-reference.md)

- [Getting Started Guide](./getting-started-sdk.md)

- [Permissions Guide](./permissions-guide.md)

- [Best Practices](./best-practices.md)

- [Electron Migration](./migration/from-electron.md)

- [Web App Migration](./migration/from-web-app.md)

 

---

 

**Still stuck?** Check the [GitHub Issues](https://github.com/yourusername/webshell/issues) or join our community Discord for help!

