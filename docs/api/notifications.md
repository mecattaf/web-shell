# Notifications Module API

 

The Notifications Module provides system notification management with support for actions, urgency levels, and interaction events.

 

## Overview

 

The Notifications Module (`webshell.notifications`) enables WebShell applications to:

 

- Send system notifications with rich content

- Set urgency levels (low, normal, critical)

- Add action buttons to notifications

- Update existing notifications

- Respond to user interactions (clicks, closes, actions)

- Control notification timeouts and persistence

 

## Namespace

 

Access via: `webshell.notifications`

 

## Sending Notifications

 

### `send(notification: NotificationOptions): Promise<string>`

 

Sends a system notification.

 

**Parameters:**

- `notification` ([`NotificationOptions`](../sdk-api-reference.md#notificationoptions)): Notification configuration

 

**Returns:** `Promise<string>` - Unique notification ID

 

**Throws:**

- `WebShellError` with code `NOTIFICATION_SEND_FAILED` if notification cannot be sent

- `WebShellError` with code `PERMISSION_DENIED` if `notifications` permission not granted

 

**Example:**

```typescript

const id = await webshell.notifications.send({

  title: 'Build Complete',

  message: 'Your project built successfully in 2.3 seconds',

  urgency: 'normal',

  icon: 'success',

  timeout: 5000

});

 

console.log(`Notification sent with ID: ${id}`);

```

 

**NotificationOptions Fields:**

- `title` (string, required): Notification title/heading

- `message` (string, required): Notification body text

- `icon` (string, optional): Icon identifier or path

- `urgency` ('low' | 'normal' | 'critical', optional): Notification urgency level

- `timeout` (number, optional): Auto-dismiss timeout in milliseconds (-1 for persistent)

- `actions` (NotificationAction[], optional): Action buttons

 

**Urgency Levels:**

- `'low'`: Low priority, minimal interruption

- `'normal'`: Standard priority (default)

- `'critical'`: High priority, may bypass Do Not Disturb

 

**Notes:**

- Returns immediately with notification ID

- Notification may be queued by the system

- Icon availability depends on system notification daemon

- Timeout of -1 creates persistent notification

 

---

 

## Managing Notifications

 

### `update(id: string, updates: NotificationOptions): Promise<void>`

 

Updates an existing notification.

 

**Parameters:**

- `id` (string): Notification ID to update

- `updates` (NotificationOptions): Updated notification content

 

**Returns:** `Promise<void>` - Resolves when notification is updated

 

**Throws:**

- `WebShellError` with code `NOTIFICATION_NOT_FOUND` if notification doesn't exist or was dismissed

- `WebShellError` with code `PERMISSION_DENIED` if `notifications` permission not granted

 

**Example:**

```typescript

const notifId = await webshell.notifications.send({

  title: 'Upload Progress',

  message: 'Uploading file... 0%',

  urgency: 'low',

  timeout: -1 // Persistent

});

 

// Update progress

for (let i = 0; i <= 100; i += 10) {

  await new Promise(resolve => setTimeout(resolve, 500));

  await webshell.notifications.update(notifId, {

    title: 'Upload Progress',

    message: `Uploading file... ${i}%`

  });

}

 

// Final update

await webshell.notifications.update(notifId, {

  title: 'Upload Complete',

  message: 'File uploaded successfully',

  urgency: 'normal',

  timeout: 3000

});

```

 

**Notes:**

- Can only update notifications that haven't been dismissed

- All fields are optional, only include what you want to change

- Useful for progress indicators and status updates

- Updated notification may reset timeout

 

---

 

### `close(id: string): Promise<void>`

 

Closes and dismisses a notification.

 

**Parameters:**

- `id` (string): Notification ID to close

 

**Returns:** `Promise<void>` - Resolves when notification is closed

 

**Throws:**

- `WebShellError` with code `NOTIFICATION_NOT_FOUND` if notification doesn't exist or already dismissed

 

**Example:**

```typescript

const notifId = await webshell.notifications.send({

  title: 'Processing...',

  message: 'Please wait',

  timeout: -1

});

 

// Do some work

await processData();

 

// Close notification when done

await webshell.notifications.close(notifId);

console.log('Notification closed');

```

 

**Notes:**

- Notification is immediately removed from notification area

- Cannot reopen a closed notification

- Triggers `onClosed` event handlers

- Silent if notification was already dismissed

 

---

 

## Notification Events

 

### `onClicked(handler: EventHandler<string>): UnsubscribeFn`

 

Subscribes to notification click events.

 

**Parameters:**

- `handler` (EventHandler<string>): Function called when notification is clicked (receives notification ID)

 

**Returns:** [`UnsubscribeFn`](../sdk-api-reference.md#unsubscribefn) - Function to unsubscribe

 

**Example:**

```typescript

const notificationData = new Map();

 

const unsubscribe = webshell.notifications.onClicked((notifId) => {

  console.log(`Notification ${notifId} clicked`);

 

  const data = notificationData.get(notifId);

  if (data) {

    // Handle click - e.g., open related window

    webshell.window.focus();

    navigateTo(data.url);

  }

});

 

// Send notification with associated data

const id = await webshell.notifications.send({

  title: 'New Message',

  message: 'You have a new message from Alice'

});

notificationData.set(id, { url: '/messages/123' });

 

// Later: unsubscribe()

```

 

**Notes:**

- Called when user clicks on notification body

- Not called for action button clicks (use `onActionClicked`)

- May bring application window to front automatically

- Notification may auto-dismiss after click

 

---

 

### `onClosed(handler: EventHandler<string>): UnsubscribeFn`

 

Subscribes to notification closed/dismissed events.

 

**Parameters:**

- `handler` (EventHandler<string>): Function called when notification is closed (receives notification ID)

 

**Returns:** [`UnsubscribeFn`](../sdk-api-reference.md#unsubscribefn) - Function to unsubscribe

 

**Example:**

```typescript

const activeNotifications = new Set();

 

webshell.notifications.onClosed((notifId) => {

  console.log(`Notification ${notifId} closed`);

  activeNotifications.delete(notifId);

 

  // Clean up associated data

  cleanupNotificationData(notifId);

});

 

// Track sent notifications

const id = await webshell.notifications.send({ ... });

activeNotifications.add(id);

```

 

**Notes:**

- Called when notification is dismissed by any means:

  - User dismisses it

  - Timeout expires

  - Application calls `close()`

  - System clears it

- Use to clean up notification-related data

- Not called if notification was never shown

 

---

 

### `onActionClicked(handler: EventHandler<{notificationId: string, actionId: string}>): UnsubscribeFn`

 

Subscribes to notification action button click events.

 

**Parameters:**

- `handler` (EventHandler<{notificationId, actionId}>): Function called when action is clicked

 

**Returns:** [`UnsubscribeFn`](../sdk-api-reference.md#unsubscribefn) - Function to unsubscribe

 

**Example:**

```typescript

webshell.notifications.onActionClicked(({ notificationId, actionId }) => {

  console.log(`Action ${actionId} clicked on notification ${notificationId}`);

 

  switch (actionId) {

    case 'view':

      openItem(notificationId);

      break;

    case 'dismiss':

      // Action handled, just close

      webshell.notifications.close(notificationId);

      break;

    case 'snooze':

      snoozeReminder(notificationId);

      break;

  }

});

 

// Send notification with actions

await webshell.notifications.send({

  title: 'Meeting Reminder',

  message: 'Team standup in 5 minutes',

  urgency: 'normal',

  actions: [

    { id: 'view', label: 'View Details' },

    { id: 'snooze', label: 'Snooze' },

    { id: 'dismiss', label: 'Dismiss' }

  ]

});

```

 

**Notes:**

- Action buttons provide quick responses to notifications

- Not all notification systems support actions

- Actions are shown as buttons below notification

- Clicking action typically closes notification

 

---

 

## Common Patterns

 

### Simple Notification

 

Send a basic notification:

 

```typescript

async function notifySuccess(message: string) {

  await webshell.notifications.send({

    title: 'Success',

    message: message,

    urgency: 'low',

    icon: 'success',

    timeout: 3000

  });

}

 

async function notifyError(message: string) {

  await webshell.notifications.send({

    title: 'Error',

    message: message,

    urgency: 'critical',

    icon: 'error',

    timeout: 5000

  });

}

 

// Usage

await notifySuccess('File saved successfully');

await notifyError('Failed to connect to server');

```

 

### Progress Notifications

 

Show progress updates:

 

```typescript

async function notifyProgress(

  title: string,

  total: number,

  workFn: (progress: (current: number) => void) => Promise<void>

) {

  const notifId = await webshell.notifications.send({

    title,

    message: 'Starting...',

    urgency: 'low',

    timeout: -1

  });

 

  try {

    await workFn(async (current) => {

      const percent = Math.round((current / total) * 100);

      await webshell.notifications.update(notifId, {

        title,

        message: `Progress: ${percent}% (${current}/${total})`

      });

    });

 

    // Success

    await webshell.notifications.update(notifId, {

      title: 'Complete',

      message: `Finished processing ${total} items`,

      urgency: 'normal',

      timeout: 3000

    });

  } catch (err) {

    // Error

    await webshell.notifications.update(notifId, {

      title: 'Failed',

      message: err.message,

      urgency: 'critical',

      timeout: 5000

    });

  }

}

 

// Usage

await notifyProgress('Processing Files', 100, async (progress) => {

  for (let i = 0; i < 100; i++) {

    await processFile(i);

    await progress(i + 1);

  }

});

```

 

### Interactive Notifications

 

Create notifications with action buttons:

 

```typescript

async function notifyNewMessage(from: string, messageId: string) {

  const id = await webshell.notifications.send({

    title: `New message from ${from}`,

    message: 'Click to view',

    urgency: 'normal',

    actions: [

      { id: 'read', label: 'Read' },

      { id: 'reply', label: 'Reply' },

      { id: 'dismiss', label: 'Dismiss' }

    ]

  });

 

  // Store message data for action handler

  pendingMessages.set(id, { from, messageId });

}

 

// Handle actions

webshell.notifications.onActionClicked(({ notificationId, actionId }) => {

  const message = pendingMessages.get(notificationId);

  if (!message) return;

 

  switch (actionId) {

    case 'read':

      openMessage(message.messageId);

      break;

    case 'reply':

      openReplyDialog(message.messageId);

      break;

    case 'dismiss':

      // Just close

      break;

  }

 

  pendingMessages.delete(notificationId);

  webshell.notifications.close(notificationId);

});

```

 

### Notification Queue

 

Avoid notification spam with queuing:

 

```typescript

class NotificationQueue {

  private queue: Array<{ title: string; message: string }> = [];

  private processing = false;

  private delay = 2000; // 2 seconds between notifications

 

  async add(title: string, message: string) {

    this.queue.push({ title, message });

    if (!this.processing) {

      this.process();

    }

  }

 

  private async process() {

    this.processing = true;

 

    while (this.queue.length > 0) {

      const notif = this.queue.shift();

      if (notif) {

        await webshell.notifications.send({

          title: notif.title,

          message: notif.message,

          urgency: 'low',

          timeout: this.delay - 500

        });

 

        // Wait before next notification

        await new Promise(resolve => setTimeout(resolve, this.delay));

      }

    }

 

    this.processing = false;

  }

}

 

// Usage

const notifQueue = new NotificationQueue();

 

// These will be sent sequentially, not all at once

for (let i = 0; i < 10; i++) {

  notifQueue.add('Processing', `Item ${i + 1} complete`);

}

```

 

### Smart Notifications

 

Avoid duplicate notifications:

 

```typescript

class SmartNotifier {

  private active = new Map<string, string>(); // key -> notification ID

 

  async notify(key: string, title: string, message: string) {

    const existing = this.active.get(key);

 

    if (existing) {

      // Update existing notification

      try {

        await webshell.notifications.update(existing, { title, message });

        return existing;

      } catch (err) {

        // Notification was closed, send new one

        this.active.delete(key);

      }

    }

 

    // Send new notification

    const id = await webshell.notifications.send({

      title,

      message,

      urgency: 'normal',

      timeout: 5000

    });

 

    this.active.set(key, id);

    return id;

  }

}

 

// Usage

const notifier = new SmartNotifier();

 

// Sends notification

await notifier.notify('build', 'Building', 'Starting build...');

 

// Updates same notification instead of sending new one

await notifier.notify('build', 'Building', 'Compiling sources...');

await notifier.notify('build', 'Building', 'Build complete');

```

 

### Status Notifications

 

Show persistent status with auto-cleanup:

 

```typescript

class StatusNotification {

  private id: string | null = null;

 

  async show(title: string, message: string) {

    if (this.id) {

      await webshell.notifications.update(this.id, { title, message });

    } else {

      this.id = await webshell.notifications.send({

        title,

        message,

        urgency: 'low',

        timeout: -1

      });

    }

  }

 

  async hide() {

    if (this.id) {

      await webshell.notifications.close(this.id);

      this.id = null;

    }

  }

 

  async success(message: string) {

    await this.show('Success', message);

    // Auto-hide after 3 seconds

    setTimeout(() => this.hide(), 3000);

  }

 

  async error(message: string) {

    await this.show('Error', message);

    // Keep error visible until dismissed

  }

}

 

// Usage

const status = new StatusNotification();

 

await status.show('Connecting', 'Connecting to server...');

await status.show('Loading', 'Loading data...');

await status.success('Connected successfully');

```

 

### Calendar Reminders

 

Integrate with calendar for reminders:

 

```typescript

async function setupCalendarReminders() {

  // Get today's events

  const events = await webshell.calendar.eventsToday();

 

  events.forEach(event => {

    if (!event.reminders) return;

 

    event.reminders.forEach(minutesBefore => {

      const reminderTime = new Date(event.start);

      reminderTime.setMinutes(reminderTime.getMinutes() - minutesBefore);

 

      const delay = reminderTime.getTime() - Date.now();

      if (delay > 0) {

        setTimeout(async () => {

          await webshell.notifications.send({

            title: `Upcoming: ${event.title}`,

            message: `Starts ${minutesBefore === 0 ? 'now' : `in ${minutesBefore} minutes`}`,

            urgency: minutesBefore <= 5 ? 'critical' : 'normal',

            actions: [

              { id: 'view', label: 'View Event' },

              { id: 'snooze', label: 'Snooze 5 min' }

            ]

          });

        }, delay);

      }

    });

  });

}

 

// Run on app startup

webshell.ready(() => {

  setupCalendarReminders();

});

```

 

### Download Complete Notification

 

Notify when downloads finish:

 

```typescript

async function downloadWithNotification(url: string, filename: string) {

  const notifId = await webshell.notifications.send({

    title: 'Download Started',

    message: `Downloading ${filename}...`,

    urgency: 'low',

    timeout: -1

  });

 

  try {

    await downloadFile(url, filename);

 

    await webshell.notifications.update(notifId, {

      title: 'Download Complete',

      message: `${filename} downloaded successfully`,

      urgency: 'normal',

      timeout: 3000,

      actions: [

        { id: 'open', label: 'Open File' },

        { id: 'show', label: 'Show in Folder' }

      ]

    });

  } catch (err) {

    await webshell.notifications.update(notifId, {

      title: 'Download Failed',

      message: `Failed to download ${filename}: ${err.message}`,

      urgency: 'critical',

      timeout: 5000

    });

  }

}

```

 

## Notification Best Practices

 

### When to Use Notifications

 

**Good use cases:**

- Completed background tasks

- Important events requiring attention

- Time-sensitive information

- Status updates for long operations

 

**Avoid notifications for:**

- Every minor action

- Rapid, frequent events

- Information already visible in UI

- Low-value updates

 

### Urgency Guidelines

 

```typescript

// Low urgency: informational, non-critical

await webshell.notifications.send({

  title: 'Backup Complete',

  message: 'Daily backup finished successfully',

  urgency: 'low',

  timeout: 3000

});

 

// Normal urgency: standard user actions (default)

await webshell.notifications.send({

  title: 'File Uploaded',

  message: 'document.pdf uploaded to cloud',

  urgency: 'normal',

  timeout: 4000

});

 

// Critical urgency: important, time-sensitive

await webshell.notifications.send({

  title: 'Meeting Starting',

  message: 'Team standup starts in 1 minute',

  urgency: 'critical',

  timeout: 10000

});

```

 

### Timeout Guidelines

 

```typescript

// Quick confirmations: 2-3 seconds

timeout: 3000

 

// Standard notifications: 4-5 seconds

timeout: 4000

 

// Important information: 7-10 seconds

timeout: 8000

 

// Progress/status: persistent (user or app dismisses)

timeout: -1

```

 

## Permissions

 

The Notifications Module requires the `notifications` permission:

 

```json

{

  "name": "my-app",

  "permissions": ["notifications"],

  "entry": "index.html"

}

```

 

Without this permission, notification methods will throw `PERMISSION_DENIED` errors.

 

## Platform Considerations

 

### Linux

- Uses D-Bus notification daemon (notify-send)

- Action support depends on notification daemon

- Icon support varies by desktop environment

- Urgency levels map to notification daemon hints

 

### Notification Daemon Support

 

Different notification daemons have varying feature support:

- **dunst**: Full action support, custom icons

- **notify-osd**: Limited action support

- **mako** (Wayland): Full feature support

- **GNOME Shell**: Rich notifications with actions

 

Test on target platforms to ensure expected behavior.

 

## Error Handling

 

Handle notification errors gracefully:

 

```typescript

import { WebShellError } from 'webshell-sdk';

 

async function safeNotify(title: string, message: string) {

  try {

    return await webshell.notifications.send({ title, message });

  } catch (err) {

    if (err instanceof WebShellError) {

      switch (err.code) {

        case 'PERMISSION_DENIED':

          console.error('Notification permission not granted');

          // Fallback: show in-app notification

          showInAppNotification(title, message);

          break;

        case 'NOTIFICATION_SEND_FAILED':

          console.error('Failed to send notification');

          // Fallback to console or in-app UI

          console.log(`[NOTIFICATION] ${title}: ${message}`);

          break;

        default:

          console.error('Notification error:', err.message);

      }

    }

    return null;

  }

}

```

 

## Related Documentation

 

- [Calendar Module](./calendar.md) - Calendar event reminders

- [Power Module](./power.md) - Battery notifications

- [System Module](./system.md) - System status notifications

- [Notification Daemon Setup](../guides/notification-setup.md)

 
