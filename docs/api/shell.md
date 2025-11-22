# Shell Module API

 

The Shell Module provides app lifecycle management and inter-app communication capabilities.

 

## Overview

 

The Shell Module (`webshell.shell`) is the core module for managing WebShell applications. It provides:

 

- Application lifecycle control (launch, close, reload)

- Inter-app messaging and broadcasting

- App registry access

- Current app information

 

## Namespace

 

Access via: `webshell.shell`

 

## Sub-modules

 

### `app` - Current App Control

 

Manages the currently running application.

 

#### `app.getName(): string`

 

Returns the name of the current application.

 

**Returns:** `string` - The application name from the manifest

 

**Example:**

```typescript

const appName = webshell.shell.app.getName();

console.log(`Running: ${appName}`); // "Running: my-app"

```

 

---

 

#### `app.getManifest(): Manifest`

 

Returns the complete manifest for the current application.

 

**Returns:** [`Manifest`](../sdk-api-reference.md#manifest) - The application manifest object

 

**Example:**

```typescript

const manifest = webshell.shell.app.getManifest();

console.log(manifest.version); // "1.0.0"

console.log(manifest.permissions); // ["calendar", "notifications"]

```

 

---

 

#### `app.close(): void`

 

Closes the current application.

 

**Example:**

```typescript

// Close the current app

webshell.shell.app.close();

```

 

**Notes:**

- This will trigger app cleanup and window closure

- Any unsaved data will be lost

- Consider prompting the user before closing

 

---

 

#### `app.reload(): void`

 

Reloads the current application.

 

**Example:**

```typescript

// Reload the current app (useful for development)

webshell.shell.app.reload();

```

 

**Notes:**

- This is equivalent to a full page reload

- All app state will be reset

- Useful during development for applying changes

 

---

 

## App Registry Methods

 

### `listApps(): Promise<AppInfo[]>`

 

Lists all registered applications in the WebShell environment.

 

**Returns:** `Promise<AppInfo[]>` - Array of registered apps

 

**Example:**

```typescript

const apps = await webshell.shell.listApps();

apps.forEach(app => {

  console.log(`${app.name}: ${app.running ? 'running' : 'stopped'}`);

});

```

 

**Related Types:**

- [`AppInfo`](../sdk-api-reference.md#appinfo)

 

---

 

### `launchApp(appName: string): Promise<void>`

 

Launches a registered application by name.

 

**Parameters:**

- `appName` (string): The name of the app to launch

 

**Returns:** `Promise<void>` - Resolves when app is launched

 

**Throws:**

- `WebShellError` with code `APP_NOT_FOUND` if app doesn't exist

- `WebShellError` with code `APP_ALREADY_RUNNING` if app is already running

 

**Example:**

```typescript

try {

  await webshell.shell.launchApp('calendar');

  console.log('Calendar app launched');

} catch (err) {

  if (err.code === 'APP_NOT_FOUND') {

    console.error('Calendar app not installed');

  }

}

```

 

---

 

### `closeApp(appName: string): Promise<void>`

 

Closes a running application by name.

 

**Parameters:**

- `appName` (string): The name of the app to close

 

**Returns:** `Promise<void>` - Resolves when app is closed

 

**Throws:**

- `WebShellError` with code `APP_NOT_FOUND` if app doesn't exist

- `WebShellError` with code `APP_NOT_RUNNING` if app is not running

 

**Example:**

```typescript

try {

  await webshell.shell.closeApp('music');

  console.log('Music app closed');

} catch (err) {

  console.error('Failed to close music app:', err.message);

}

```

 

---

 

## Inter-App Communication

 

### `sendMessage(targetApp: string, type: string, data: any): Promise<void>`

 

Sends a message to a specific application.

 

**Parameters:**

- `targetApp` (string): The name of the target app

- `type` (string): Message type identifier

- `data` (any): Message payload

 

**Returns:** `Promise<void>` - Resolves when message is sent

 

**Throws:**

- `WebShellError` with code `APP_NOT_FOUND` if target app doesn't exist

- `WebShellError` with code `APP_NOT_RUNNING` if target app is not running

 

**Example:**

```typescript

// Send a task creation message to todo app

await webshell.shell.sendMessage('todo-app', 'task.created', {

  title: 'Review pull request',

  priority: 'high',

  dueDate: new Date('2025-01-25')

});

```

 

**Notes:**

- Messages are delivered asynchronously

- Target app must be running to receive messages

- Message structure is defined by [`AppMessage`](../sdk-api-reference.md#appmessage)

 

---

 

### `broadcast(type: string, data: any): Promise<void>`

 

Broadcasts a message to all running applications.

 

**Parameters:**

- `type` (string): Message type identifier

- `data` (any): Message payload

 

**Returns:** `Promise<void>` - Resolves when broadcast is sent

 

**Example:**

```typescript

// Notify all apps of theme change

await webshell.shell.broadcast('theme.changed', {

  theme: 'dark',

  timestamp: Date.now()

});

```

 

**Notes:**

- All running apps will receive the message

- The sending app will also receive its own broadcast

- Consider using specific message types to avoid conflicts

 

---

 

### `onMessage(handler: MessageHandler): UnsubscribeFn`

 

Subscribes to incoming inter-app messages.

 

**Parameters:**

- `handler` (MessageHandler): Function to call when messages arrive

 

**Returns:** [`UnsubscribeFn`](../sdk-api-reference.md#unsubscribefn) - Function to unsubscribe

 

**Example:**

```typescript

const unsubscribe = webshell.shell.onMessage((message) => {

  console.log('Received message:', message);

  console.log('From:', message.from);

  console.log('Type:', message.type);

  console.log('Data:', message.data);

 

  // Handle specific message types

  if (message.type === 'task.created') {

    handleNewTask(message.data);

  }

});

 

// Later, to stop listening:

unsubscribe();

```

 

**Related Types:**

- [`AppMessage`](../sdk-api-reference.md#appmessage)

- [`MessageHandler`](../sdk-api-reference.md#messagehandler)

 

---

 

## Common Patterns

 

### Request-Response Pattern

 

Implement request-response messaging between apps:

 

```typescript

// Requesting app

const requestId = crypto.randomUUID();

const responsePromise = new Promise((resolve) => {

  const unsubscribe = webshell.shell.onMessage((message) => {

    if (message.type === 'response' && message.data.requestId === requestId) {

      unsubscribe();

      resolve(message.data.result);

    }

  });

});

 

await webshell.shell.sendMessage('data-service', 'query', {

  requestId,

  query: 'SELECT * FROM users'

});

 

const result = await responsePromise;

```

 

### Event Broadcasting

 

Notify all apps of system-wide events:

 

```typescript

// In a system-level app

webshell.shell.broadcast('system.locked', {

  timestamp: Date.now(),

  reason: 'user-action'

});

 

// In other apps

webshell.shell.onMessage((message) => {

  if (message.type === 'system.locked') {

    // Pause activities, save state, etc.

    pauseApp();

  }

});

```

 

### App Discovery

 

Find and launch related apps:

 

```typescript

async function findAndLaunchApp(appName: string) {

  const apps = await webshell.shell.listApps();

  const app = apps.find(a => a.name === appName);

 

  if (!app) {

    console.error(`App ${appName} not found`);

    return;

  }

 

  if (app.running) {

    console.log(`App ${appName} is already running`);

    return;

  }

 

  await webshell.shell.launchApp(appName);

}

```

 

## Error Handling

 

All Shell Module methods may throw `WebShellError`. Common error codes:

 

- `APP_NOT_FOUND`: Specified app doesn't exist in registry

- `APP_ALREADY_RUNNING`: Attempted to launch an already running app

- `APP_NOT_RUNNING`: Attempted to interact with a stopped app

- `BRIDGE_NOT_INITIALIZED`: SDK not ready (use `webshell.ready()`)

- `PERMISSION_DENIED`: App lacks required permissions

 

**Example:**

```typescript

import { WebShellError } from 'webshell-sdk';

 

try {

  await webshell.shell.launchApp('nonexistent-app');

} catch (err) {

  if (err instanceof WebShellError) {

    switch (err.code) {

      case 'APP_NOT_FOUND':

        console.error('App not installed');

        break;

      case 'APP_ALREADY_RUNNING':

        console.log('App is already open');

        break;

      default:

        console.error('Error:', err.message);

    }

  }

}

```

 

## Related Documentation

 

- [Window Module](./window.md) - Window management

- [IPC Module](./ipc.md) - Low-level backend communication

- [Inter-App Messaging Guide](../guides/inter-app-messaging.md)

- [App Lifecycle Guide](../guides/app-lifecycle.md)
