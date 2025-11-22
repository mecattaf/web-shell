# Permissions System Guide

 

Complete guide to understanding and implementing WebShell's permission system for secure applications.

 

## Table of Contents

 

1. [Overview](#overview)

2. [Permission Model](#permission-model)

3. [Declaration & Usage](#declaration--usage)

4. [Runtime Permission Checking](#runtime-permission-checking)

5. [Graceful Degradation](#graceful-degradation)

6. [User Communication](#user-communication)

7. [Security Best Practices](#security-best-practices)

8. [Complete Examples](#complete-examples)

 

---

 

## Overview

 

WebShell uses a capability-based security model where applications must explicitly declare required permissions in their manifest.

 

### Security Principles

 

- **Default Deny**: All permissions denied by default

- **Explicit Declaration**: Apps must list required permissions

- **Least Privilege**: Request minimum necessary permissions

- **User Awareness**: Users review permissions before installation

- **Runtime Enforcement**: Checked on every API call

 

### Permission Types

 

WebShell supports the following permission categories:

 

| Category | Purpose | Examples |

|----------|---------|----------|

| **calendar** | Access calendar events | Read/write events, reminders |

| **contacts** | Access contact information | Read/write contacts |

| **filesystem** | File system access | Read/write specific paths |

| **network** | Network requests | HTTP/WebSocket to specific hosts |

| **notifications** | Send notifications | System notifications |

| **clipboard** | Clipboard access | Read/write clipboard |

| **processes** | Spawn processes | Execute specific commands |

| **system** | System features | Power management, audio |

 

---

 

## Permission Model

 

### Permission Structure

 

```typescript

interface Permissions {

  calendar?: {

    read?: boolean;

    write?: boolean;

    delete?: boolean;

  };

  contacts?: {

    read?: boolean;

    write?: boolean;

    delete?: boolean;

  };

  filesystem?: {

    read?: string[];   // Array of paths

    write?: string[];

    watch?: string[];

  };

  network?: {

    allowed_hosts?: string[];

    websockets?: boolean;

  };

  notifications?: {

    send?: boolean;

  };

  clipboard?: {

    read?: boolean;

    write?: boolean;

  };

  processes?: {

    spawn?: boolean;

    allowed_commands?: string[];

  };

  system?: {

    power?: boolean;

    audio?: boolean;

  };

}

```

 

### Permission Granularity

 

Permissions are hierarchical:

 

```

calendar

  ├── read      (view events)

  ├── write     (create/modify events)

  └── delete    (remove events)

 

filesystem

  ├── read      (read files from specific paths)

  ├── write     (write to specific paths)

  └── watch     (monitor file changes)

```

 

---

 

## Declaration & Usage

 

### Basic Declaration

 

Declare permissions in `webshell.json`:

 

```json

{

  "name": "calendar-widget",

  "version": "1.0.0",

  "permissions": {

    "calendar": {

      "read": true

    },

    "notifications": {

      "send": true

    }

  }

}

```

 

### Filesystem Permissions

 

Specify exact paths or patterns:

 

```json

{

  "permissions": {

    "filesystem": {

      "read": ["~/Documents", "~/Downloads"],

      "write": ["~/Documents/MyApp", "~/.config/myapp"],

      "watch": ["~/Documents/MyApp"]

    }

  }

}

```

 

**Path Features:**

- `~` expands to user home directory

- Prefix matching: `/home/user/Documents` matches `/home/user/Documents/file.txt`

- Parent traversal (`..`) is blocked for security

 

### Network Permissions

 

Control network access by host:

 

```json

{

  "permissions": {

    "network": {

      "allowed_hosts": ["api.example.com", "cdn.example.com"],

      "websockets": true

    }

  }

}

```

 

**Important:**

- `localhost` must be explicitly listed

- Wildcard `*` grants access to all hosts (use with caution)

- Future: Domain wildcards like `*.github.com`

 

### Process Permissions

 

Whitelist allowed commands:

 

```json

{

  "permissions": {

    "processes": {

      "spawn": true,

      "allowed_commands": ["git", "npm", "ls", "cat"]

    }

  }

}

```

 

**Security Note:** Only commands in `allowed_commands` can be executed.

 

---

 

## Runtime Permission Checking

 

### Checking Before API Calls

 

```typescript

// Check single permission

if (webshell.permissions.has('calendar', 'read')) {

  const events = await webshell.calendar.eventsToday();

  displayEvents(events);

} else {

  showPermissionRequired('calendar.read');

}

 

// Check file access

if (webshell.permissions.canAccessFile('~/Documents/file.txt', 'read')) {

  const content = await readFile('~/Documents/file.txt');

} else {

  showError('Cannot read file: permission denied');

}

 

// Check network access

if (webshell.permissions.canAccessHost('api.example.com')) {

  const response = await fetch('https://api.example.com/data');

} else {

  showError('Cannot access api.example.com');

}

```

 

### Permission Helper Class

 

```typescript

class PermissionChecker {

  static canReadCalendar(): boolean {

    return webshell.permissions.has('calendar', 'read');

  }

 

  static canWriteCalendar(): boolean {

    return webshell.permissions.has('calendar', 'write');

  }

 

  static canSendNotifications(): boolean {

    return webshell.permissions.has('notifications', 'send');

  }

 

  static canAccessPath(path: string, mode: 'read' | 'write'): boolean {

    return webshell.permissions.canAccessFile(path, mode);

  }

 

  static canAccessHost(host: string): boolean {

    return webshell.permissions.canAccessHost(host);

  }

 

  static getGrantedPermissions(): string[] {

    const granted: string[] = [];

 

    if (this.canReadCalendar()) granted.push('calendar.read');

    if (this.canWriteCalendar()) granted.push('calendar.write');

    if (this.canSendNotifications()) granted.push('notifications.send');

 

    return granted;

  }

}

 

// Usage

if (PermissionChecker.canReadCalendar()) {

  loadCalendarEvents();

}

```

 

### Error Handling

 

```typescript

async function loadEvents() {

  try {

    const events = await webshell.calendar.eventsToday();

    displayEvents(events);

 

  } catch (error: any) {

    if (error.code === 'PERMISSION_DENIED') {

      showPermissionError('Calendar access is required to view events.');

    } else {

      console.error('Failed to load events:', error);

      showGenericError();

    }

  }

}

 

function showPermissionError(message: string) {

  const dialog = document.getElementById('permission-dialog')!;

  dialog.innerHTML = `

    <div class="error">

      <h3>Permission Required</h3>

      <p>${message}</p>

      <p>Please grant calendar permissions in settings.</p>

      <button onclick="closeDialog()">OK</button>

    </div>

  `;

  dialog.style.display = 'block';

}

```

 

---

 

## Graceful Degradation

 

### Feature Detection

 

```typescript

class FeatureManager {

  private enabledFeatures: Set<string> = new Set();

 

  initialize() {

    // Check which features are available

    if (webshell.permissions.has('calendar', 'read')) {

      this.enabledFeatures.add('calendar-view');

    }

 

    if (webshell.permissions.has('calendar', 'write')) {

      this.enabledFeatures.add('calendar-edit');

    }

 

    if (webshell.permissions.has('notifications', 'send')) {

      this.enabledFeatures.add('notifications');

    }

 

    // Enable/disable UI based on permissions

    this.updateUI();

  }

 

  private updateUI() {

    // Show/hide features based on permissions

    if (this.hasFeature('calendar-view')) {

      this.showCalendarView();

    } else {

      this.hideCalendarView();

      this.showCalendarPermissionPrompt();

    }

 

    if (this.hasFeature('calendar-edit')) {

      this.showEditButtons();

    } else {

      this.hideEditButtons();

    }

  }

 

  hasFeature(feature: string): boolean {

    return this.enabledFeatures.has(feature);

  }

 

  private showCalendarPermissionPrompt() {

    const prompt = document.createElement('div');

    prompt.className = 'permission-prompt';

    prompt.innerHTML = `

      <div class="prompt-content">

        <h3>Calendar Access Required</h3>

        <p>This app needs calendar access to display your events.</p>

        <p>Please grant calendar permissions in the app manifest.</p>

      </div>

    `;

    document.getElementById('calendar-container')?.appendChild(prompt);

  }

}

 

// Usage

const features = new FeatureManager();

 

webshell.ready(() => {

  features.initialize();

});

```

 

### Fallback UIs

 

```typescript

class CalendarWidget {

  render() {

    if (webshell.permissions.has('calendar', 'read')) {

      this.renderFullCalendar();

    } else {

      this.renderPermissionPrompt();

    }

  }

 

  private renderFullCalendar() {

    // Full calendar with events

    const events = await webshell.calendar.eventsToday();

 

    const html = `

      <div class="calendar">

        <h2>Today's Events</h2>

        <div class="events">

          ${events.map(e => `

            <div class="event">

              <span class="time">${e.start}</span>

              <span class="title">${e.title}</span>

            </div>

          `).join('')}

        </div>

      </div>

    `;

 

    this.container.innerHTML = html;

  }

 

  private renderPermissionPrompt() {

    // Limited view with permission request

    const html = `

      <div class="calendar-disabled">

        <div class="icon">📅</div>

        <h2>Calendar Widget</h2>

        <p>Calendar access is required to view your events.</p>

        <p class="help">

          To enable this feature:

          <ol>

            <li>Add calendar permissions to webshell.json</li>

            <li>Reload the app</li>

          </ol>

        </p>

      </div>

    `;

 

    this.container.innerHTML = html;

  }

}

```

 

### Progressive Enhancement

 

```typescript

class NoteEditor {

  private features = {

    clipboard: false,

    filesystem: false,

    cloudSync: false

  };

 

  async initialize() {

    // Check available features

    this.features.clipboard = webshell.permissions.has('clipboard', 'write');

    this.features.filesystem = webshell.permissions.canAccessFile('~/Documents', 'write');

    this.features.cloudSync = webshell.permissions.canAccessHost('api.notes.com');

 

    // Render with available features

    this.render();

  }

 

  render() {

    const html = `

      <div class="editor">

        <textarea id="note-content"></textarea>

 

        <div class="toolbar">

          <!-- Always available -->

          <button onclick="saveLocal()">Save (Local)</button>

 

          <!-- Enhanced features -->

          ${this.features.clipboard ? `

            <button onclick="copyToClipboard()">Copy</button>

          ` : ''}

 

          ${this.features.filesystem ? `

            <button onclick="exportFile()">Export File</button>

          ` : ''}

 

          ${this.features.cloudSync ? `

            <button onclick="syncCloud()">Sync to Cloud</button>

          ` : ''}

        </div>

      </div>

    `;

 

    this.container.innerHTML = html;

  }

 

  private async copyToClipboard() {

    if (!this.features.clipboard) {

      alert('Clipboard access not available');

      return;

    }

 

    const content = (document.getElementById('note-content') as HTMLTextAreaElement).value;

    await webshell.clipboard.write(content);

 

    webshell.notifications.send({

      title: 'Copied',

      message: 'Note copied to clipboard'

    });

  }

 

  private async exportFile() {

    if (!this.features.filesystem) {

      alert('File system access not available');

      return;

    }

 

    const content = (document.getElementById('note-content') as HTMLTextAreaElement).value;

    await webshell.fs.writeFile('~/Documents/note.txt', content);

 

    webshell.notifications.send({

      title: 'Exported',

      message: 'Note saved to Documents'

    });

  }

}

```

 

---

 

## User Communication

 

### Permission Request UI

 

```typescript

class PermissionRequestUI {

  show(permission: string, reason: string) {

    const dialog = document.createElement('div');

    dialog.className = 'permission-dialog';

    dialog.innerHTML = `

      <div class="dialog-content">

        <h2>Permission Required</h2>

        <div class="permission-name">${this.formatPermission(permission)}</div>

        <p class="reason">${reason}</p>

 

        <div class="instructions">

          <p>To grant this permission:</p>

          <ol>

            <li>Open <code>webshell.json</code> in your app directory</li>

            <li>Add the following to the <code>permissions</code> section:</li>

          </ol>

          <pre><code>${this.getPermissionSnippet(permission)}</code></pre>

          <ol start="3">

            <li>Reload the app</li>

          </ol>

        </div>

 

        <button onclick="this.closest('.permission-dialog').remove()">

          Close

        </button>

      </div>

    `;

 

    document.body.appendChild(dialog);

  }

 

  private formatPermission(permission: string): string {

    const parts = permission.split('.');

    const category = parts[0];

    const action = parts[1];

 

    return `${category.charAt(0).toUpperCase() + category.slice(1)} (${action})`;

  }

 

  private getPermissionSnippet(permission: string): string {

    const [category, action] = permission.split('.');

 

    const snippets: Record<string, string> = {

      'calendar.read': `"calendar": { "read": true }`,

      'calendar.write': `"calendar": { "write": true }`,

      'notifications.send': `"notifications": { "send": true }`,

      'clipboard.write': `"clipboard": { "write": true }`,

      'filesystem.write': `"filesystem": { "write": ["~/Documents/MyApp"] }`

    };

 

    return snippets[permission] || `"${category}": { "${action}": true }`;

  }

}

 

// Usage

const permissionUI = new PermissionRequestUI();

 

function requestCalendarAccess() {

  if (!webshell.permissions.has('calendar', 'read')) {

    permissionUI.show(

      'calendar.read',

      'This app needs calendar access to display your upcoming events.'

    );

  }

}

```

 

### Permission Status Display

 

```typescript

class PermissionStatus {

  render() {

    const container = document.getElementById('permissions-status')!;

 

    const permissions = [

      { name: 'Calendar (Read)', key: 'calendar.read', required: true },

      { name: 'Calendar (Write)', key: 'calendar.write', required: false },

      { name: 'Notifications', key: 'notifications.send', required: true },

      { name: 'Clipboard', key: 'clipboard.write', required: false }

    ];

 

    const html = `

      <div class="permissions-list">

        <h3>Permissions</h3>

        ${permissions.map(p => {

          const [category, action] = p.key.split('.');

          const granted = webshell.permissions.has(category, action);

 

          return `

            <div class="permission-item ${granted ? 'granted' : 'denied'}">

              <span class="icon">${granted ? '✓' : '✗'}</span>

              <span class="name">${p.name}</span>

              ${p.required ? '<span class="badge">Required</span>' : ''}

              ${!granted && p.required ? `

                <button onclick="showPermissionHelp('${p.key}')">

                  How to grant

                </button>

              ` : ''}

            </div>

          `;

        }).join('')}

      </div>

    `;

 

    container.innerHTML = html;

  }

}

 

// Usage

webshell.ready(() => {

  const status = new PermissionStatus();

  status.render();

});

```

 

### Inline Permission Hints

 

```typescript

class InlinePermissionHint {

  static add(element: HTMLElement, permission: string) {

    const [category, action] = permission.split('.');

    const hasPermission = webshell.permissions.has(category, action);

 

    if (!hasPermission) {

      const hint = document.createElement('div');

      hint.className = 'permission-hint';

      hint.innerHTML = `

        <span class="icon">🔒</span>

        <span>This feature requires ${category} permission</span>

        <button onclick="showPermissionHelp('${permission}')">Learn more</button>

      `;

 

      element.appendChild(hint);

      element.classList.add('permission-required');

    }

  }

}

 

// Usage

const calendarSection = document.getElementById('calendar-section')!;

InlinePermissionHint.add(calendarSection, 'calendar.read');

```

 

---

 

## Security Best Practices

 

### 1. Request Minimum Permissions

 

```json

// Good: Specific permissions

{

  "permissions": {

    "calendar": {

      "read": true

    }

  }

}

 

// Bad: Excessive permissions

{

  "permissions": {

    "calendar": {

      "read": true,

      "write": true,

      "delete": true

    },

    "filesystem": {

      "read": ["/"],

      "write": ["/"]

    }

  }

}

```

 

### 2. Validate User Input

 

```typescript

async function loadFile(userProvidedPath: string) {

  // Sanitize path

  const safePath = sanitizePath(userProvidedPath);

 

  // Check permission

  if (!webshell.permissions.canAccessFile(safePath, 'read')) {

    throw new Error('Permission denied');

  }

 

  // Verify path doesn't contain traversal

  if (safePath.includes('..')) {

    throw new Error('Invalid path');

  }

 

  return await webshell.fs.readFile(safePath);

}

 

function sanitizePath(path: string): string {

  // Remove dangerous characters

  return path.replace(/[^a-zA-Z0-9/_\-\.~]/g, '');

}

```

 

### 3. Scope Network Access

 

```json

// Good: Specific hosts

{

  "permissions": {

    "network": {

      "allowed_hosts": ["api.myapp.com", "cdn.myapp.com"]

    }

  }

}

 

// Acceptable for browsers

{

  "permissions": {

    "network": {

      "allowed_hosts": ["*"]

    }

  }

}

 

// Security note: Always specify localhost explicitly

{

  "permissions": {

    "network": {

      "allowed_hosts": ["localhost", "api.myapp.com"]

    }

  }

}

```

 

### 4. Audit Dependencies

 

```typescript

class DependencyAuditor {

  static checkPermissions(packageName: string) {

    // Check what permissions a dependency might need

    console.log(`Auditing ${packageName}...`);

 

    // Example checks:

    // - Does it make network requests?

    // - Does it access filesystem?

    // - Does it require process spawning?

 

    // Report findings

  }

 

  static validateManifest() {

    // Ensure manifest only requests needed permissions

    const manifest = require('./webshell.json');

    const used = this.detectUsedAPIs();

 

    Object.keys(manifest.permissions).forEach(permission => {

      if (!used.includes(permission)) {

        console.warn(`Unused permission: ${permission}`);

      }

    });

  }

 

  private static detectUsedAPIs(): string[] {

    // Static analysis to detect which APIs are actually used

    // This is a simplified example

    return ['calendar', 'notifications'];

  }

}

```

 

### 5. Handle Permission Errors

 

```typescript

class SafeAPI {

  static async calendar() {

    return {

      eventsToday: async () => {

        if (!webshell.permissions.has('calendar', 'read')) {

          throw new PermissionError('calendar.read');

        }

        return webshell.calendar.eventsToday();

      },

 

      createEvent: async (event: any) => {

        if (!webshell.permissions.has('calendar', 'write')) {

          throw new PermissionError('calendar.write');

        }

        return webshell.calendar.createEvent(event);

      }

    };

  }

}

 

class PermissionError extends Error {

  constructor(public permission: string) {

    super(`Permission denied: ${permission}`);

    this.name = 'PermissionError';

  }

}

 

// Usage

try {

  const events = await SafeAPI.calendar().eventsToday();

} catch (error) {

  if (error instanceof PermissionError) {

    showPermissionUI(error.permission);

  }

}

```

 

### 6. Rate Limiting

 

```typescript

class RateLimiter {

  private calls = new Map<string, number[]>();

 

  check(operation: string, limit = 10, window = 1000): boolean {

    const now = Date.now();

    const timestamps = this.calls.get(operation) || [];

 

    // Remove old timestamps

    const recent = timestamps.filter(t => now - t < window);

 

    if (recent.length >= limit) {

      console.warn(`Rate limit exceeded for ${operation}`);

      return false;

    }

 

    recent.push(now);

    this.calls.set(operation, recent);

    return true;

  }

}

 

const limiter = new RateLimiter();

 

async function sendNotification(message: string) {

  if (!limiter.check('notifications', 5, 60000)) {

    throw new Error('Too many notifications (max 5 per minute)');

  }

 

  await webshell.notifications.send({

    title: 'Notification',

    message

  });

}

```

 

---

 

## Complete Examples

 

### Example 1: Optional Feature with Permission Gate

 

```typescript

class OptionalCalendar {

  private hasCalendarAccess = false;

 

  async initialize() {

    // Check permissions

    this.hasCalendarAccess = webshell.permissions.has('calendar', 'read');

 

    // Render UI based on permissions

    this.render();

 

    // If has access, load data

    if (this.hasCalendarAccess) {

      await this.loadEvents();

    }

  }

 

  render() {

    const container = document.getElementById('calendar')!;

 

    if (this.hasCalendarAccess) {

      container.innerHTML = `

        <div class="calendar-widget">

          <h2>Upcoming Events</h2>

          <div id="events-list"></div>

        </div>

      `;

    } else {

      container.innerHTML = `

        <div class="calendar-unavailable">

          <div class="icon">📅</div>

          <h3>Calendar Integration Available</h3>

          <p>Enable calendar access to see your upcoming events.</p>

          <details>

            <summary>How to enable</summary>

            <ol>

              <li>Edit your webshell.json file</li>

              <li>Add: <code>"calendar": { "read": true }</code></li>

              <li>Reload the app</li>

            </ol>

          </details>

        </div>

      `;

    }

  }

 

  private async loadEvents() {

    try {

      const events = await webshell.calendar.eventsToday();

      this.displayEvents(events);

    } catch (error) {

      console.error('Failed to load events:', error);

    }

  }

 

  private displayEvents(events: any[]) {

    const list = document.getElementById('events-list')!;

 

    if (events.length === 0) {

      list.innerHTML = '<p class="empty">No events today</p>';

      return;

    }

 

    list.innerHTML = events.map(event => `

      <div class="event">

        <span class="time">${event.start}</span>

        <span class="title">${event.title}</span>

      </div>

    `).join('');

  }

}

 

webshell.ready(async () => {

  const calendar = new OptionalCalendar();

  await calendar.initialize();

});

```

 

### Example 2: Permission Fallback UI

 

```typescript

class FileExporter {

  async export(content: string, filename: string) {

    // Try filesystem first

    if (webshell.permissions.canAccessFile('~/Downloads', 'write')) {

      return this.exportToFilesystem(content, filename);

    }

 

    // Fallback to clipboard

    if (webshell.permissions.has('clipboard', 'write')) {

      return this.exportToClipboard(content);

    }

 

    // Last resort: download via browser

    return this.exportViaDownload(content, filename);

  }

 

  private async exportToFilesystem(content: string, filename: string) {

    const path = `~/Downloads/${filename}`;

    await webshell.fs.writeFile(path, content);

 

    webshell.notifications.send({

      title: 'File Exported',

      message: `Saved to ${path}`

    });

 

    return { method: 'filesystem', path };

  }

 

  private async exportToClipboard(content: string) {

    await webshell.clipboard.write(content);

 

    webshell.notifications.send({

      title: 'Copied to Clipboard',

      message: 'Content copied. Paste it into a file to save.'

    });

 

    return { method: 'clipboard' };

  }

 

  private exportViaDownload(content: string, filename: string) {

    const blob = new Blob([content], { type: 'text/plain' });

    const url = URL.createObjectURL(blob);

 

    const a = document.createElement('a');

    a.href = url;

    a.download = filename;

    a.click();

 

    URL.revokeObjectURL(url);

 

    return { method: 'download', filename };

  }

}

 

// Usage

const exporter = new FileExporter();

 

document.getElementById('export-btn')?.addEventListener('click', async () => {

  const content = document.getElementById('editor').value;

  const result = await exporter.export(content, 'note.txt');

 

  console.log('Exported via:', result.method);

});

```

 

### Example 3: Graceful Degradation

 

```typescript

class FeatureSet {

  readonly features: {

    viewEvents: boolean;

    createEvents: boolean;

    notifications: boolean;

    export: boolean;

  };

 

  constructor() {

    this.features = {

      viewEvents: webshell.permissions.has('calendar', 'read'),

      createEvents: webshell.permissions.has('calendar', 'write'),

      notifications: webshell.permissions.has('notifications', 'send'),

      export: webshell.permissions.canAccessFile('~/Documents', 'write')

    };

  }

 

  renderUI() {

    const features = this.features;

 

    return `

      <div class="app">

        ${features.viewEvents ? `

          <section class="calendar-view">

            <h2>Your Events</h2>

            <div id="events"></div>

          </section>

        ` : `

          <section class="feature-locked">

            <h3>Calendar View Unavailable</h3>

            <p>Grant calendar read permission to view events</p>

          </section>

        `}

 

        ${features.createEvents ? `

          <button id="new-event">Create Event</button>

        ` : `

          <button disabled title="Requires calendar write permission">

            Create Event (locked)

          </button>

        `}

 

        ${features.export ? `

          <button id="export">Export to File</button>

        ` : `

          <button id="copy">Copy to Clipboard</button>

        `}

      </div>

    `;

  }

 

  getAvailableFeatureCount(): number {

    return Object.values(this.features).filter(Boolean).length;

  }

 

  getFeatureReport(): string {

    const total = Object.keys(this.features).length;

    const available = this.getAvailableFeatureCount();

 

    return `${available}/${total} features available`;

  }

}

 

// Usage

webshell.ready(() => {

  const features = new FeatureSet();

 

  console.log(features.getFeatureReport());

 

  document.getElementById('app')!.innerHTML = features.renderUI();

});

```

 

---

 

## Testing

 

### Unit Tests

 

```typescript

// Mock webshell for testing

const mockWebShell = {

  permissions: {

    has: vi.fn(),

    canAccessFile: vi.fn(),

    canAccessHost: vi.fn()

  }

};

 

(global as any).webshell = mockWebShell;

 

describe('PermissionChecker', () => {

  it('detects calendar read permission', () => {

    mockWebShell.permissions.has.mockReturnValue(true);

 

    expect(PermissionChecker.canReadCalendar()).toBe(true);

    expect(mockWebShell.permissions.has).toHaveBeenCalledWith('calendar', 'read');

  });

 

  it('handles missing permissions', () => {

    mockWebShell.permissions.has.mockReturnValue(false);

 

    expect(PermissionChecker.canReadCalendar()).toBe(false);

  });

});

```

 

### Integration Tests

 

```typescript

describe('CalendarWidget', () => {

  it('shows permission prompt when access denied', async () => {

    mockWebShell.permissions.has.mockReturnValue(false);

 

    const widget = new CalendarWidget();

    await widget.initialize();

 

    const prompt = document.querySelector('.permission-prompt');

    expect(prompt).toBeTruthy();

    expect(prompt?.textContent).toContain('Calendar Access Required');

  });

 

  it('loads events when permission granted', async () => {

    mockWebShell.permissions.has.mockReturnValue(true);

    mockWebShell.calendar = {

      eventsToday: vi.fn().mockResolvedValue([

        { id: '1', title: 'Meeting', start: '10:00' }

      ])

    };

 

    const widget = new CalendarWidget();

    await widget.initialize();

 

    const events = document.querySelectorAll('.event');

    expect(events).toHaveLength(1);

  });

});

```

 

---

 

## Best Practices Summary

 

1. **Request minimum permissions** - Only what you actually need

2. **Explain permission usage** - Tell users why you need each permission

3. **Handle denials gracefully** - Provide fallback functionality

4. **Use specific paths** - Avoid broad filesystem access

5. **Avoid wildcards** - Don't use network wildcard `*` unless necessary

6. **Audit dependencies** - Review third-party code for permission usage

7. **Test without permissions** - Ensure graceful degradation works

8. **Document permissions** - Keep README up to date

9. **Check at runtime** - Always verify permissions before API calls

10. **Provide clear UI** - Show users which features require which permissions

 

---

 

## Related Documentation

 

- [Permissions Guide](../permissions-guide.md)

- [Permission System](../permission-system.md)

- [Manifest Reference](../manifest-reference.md)

- [SDK API Reference](../sdk-api-reference.md)

- [Security Best Practices](../best-practices.md)

 

push your work now.
