# Inter-App Messaging Guide

 

Complete guide to building communication patterns between WebShell applications.

 

## Table of Contents

 

1. [Overview](#overview)

2. [Messaging System](#messaging-system)

3. [Basic Patterns](#basic-patterns)

4. [Advanced Patterns](#advanced-patterns)

5. [Message Types & Conventions](#message-types--conventions)

6. [Error Handling](#error-handling)

7. [Testing](#testing)

8. [Security Considerations](#security-considerations)

9. [Complete Examples](#complete-examples)

 

---

 

## Overview

 

WebShell's inter-app messaging system enables applications to communicate seamlessly, enabling powerful workflows like:

 

- **Coordinated Actions**: Calendar app notifies task manager of new deadlines

- **Data Sharing**: Notes app sends content to email client

- **Event Broadcasting**: Theme changes propagate to all apps

- **Request-Response**: Apps query each other for data

 

### Key Features

 

- **Type-safe messaging** with TypeScript support

- **Multiple patterns**: Send, broadcast, subscribe

- **Async/await** API for clean code

- **Error handling** built-in

- **No polling** required - event-driven

 

---

 

## Messaging System

 

### Architecture

 

```

┌─────────────┐      ┌─────────────────┐      ┌─────────────┐

│   App A     │─────▶│  Message Router │─────▶│   App B     │

│  (Sender)   │      │  (WebShell Core)│      │ (Receiver)  │

└─────────────┘      └─────────────────┘      └─────────────┘

                              │

                              ▼

                     ┌─────────────────┐

                     │   All Other Apps│

                     │   (Broadcast)   │

                     └─────────────────┘

```

 

### Message Flow

 

1. **Sender** calls `webshell.shell.sendMessage()` or `broadcast()`

2. **Router** validates permissions and routes message

3. **Receiver** handles message via `webshell.shell.onMessage()` listener

4. **Response** (optional) sent back to sender

 

---

 

## Basic Patterns

 

### Pattern 1: Send to Specific App

 

Send a message to a specific application by name.

 

```typescript

// Sender: todo-app

async function notifyCalendar(task: Task) {

  try {

    await webshell.shell.sendMessage('calendar', 'task.created', {

      title: task.title,

      dueDate: task.dueDate,

      priority: task.priority

    });

    console.log('Calendar notified');

  } catch (error) {

    console.error('Failed to notify calendar:', error);

  }

}

```

 

```typescript

// Receiver: calendar

webshell.ready(() => {

  webshell.shell.onMessage((message) => {

    if (message.type === 'task.created') {

      const event = createEventFromTask(message.data);

      addToCalendar(event);

 

      // Show notification

      webshell.notifications.send({

        title: 'Task Added to Calendar',

        message: `Event created: ${message.data.title}`

      });

    }

  });

});

```

 

### Pattern 2: Broadcast to All Apps

 

Send a message to all running applications.

 

```typescript

// Sender: theme-switcher

async function changeTheme(themeName: string) {

  try {

    await webshell.shell.broadcast('theme.changed', {

      theme: themeName,

      timestamp: Date.now()

    });

    console.log('Theme change broadcast to all apps');

  } catch (error) {

    console.error('Failed to broadcast theme change:', error);

  }

}

```

 

```typescript

// Receiver: any-app

webshell.ready(() => {

  webshell.shell.onMessage((message) => {

    if (message.type === 'theme.changed') {

      console.log('Theme changed to:', message.data.theme);

      applyTheme(message.data.theme);

    }

  });

});

```

 

### Pattern 3: Subscribe to Specific Events

 

Filter messages by type for cleaner code.

 

```typescript

// Type-safe message handler

type MessageHandler<T = any> = (data: T, sender: string) => void;

 

function subscribeToEvent<T>(

  eventType: string,

  handler: MessageHandler<T>

): () => void {

  const unsubscribe = webshell.shell.onMessage((message) => {

    if (message.type === eventType) {

      handler(message.data, message.sender);

    }

  });

 

  return unsubscribe;

}

 

// Usage

const unsubscribe = subscribeToEvent<TaskData>(

  'task.created',

  (data, sender) => {

    console.log(`Task from ${sender}:`, data.title);

  }

);

 

// Later: clean up

unsubscribe();

```

 

---

 

## Advanced Patterns

 

### Pattern 4: Request-Response

 

Implement request-response communication using correlation IDs.

 

```typescript

// Request-Response utility

class MessageRPC {

  private pendingRequests = new Map<string, {

    resolve: (value: any) => void;

    reject: (error: any) => void;

    timeout: number;

  }>();

 

  constructor() {

    webshell.shell.onMessage((message) => {

      if (message.type.endsWith('.response')) {

        const requestId = message.data.requestId;

        const pending = this.pendingRequests.get(requestId);

 

        if (pending) {

          clearTimeout(pending.timeout);

          this.pendingRequests.delete(requestId);

 

          if (message.data.error) {

            pending.reject(new Error(message.data.error));

          } else {

            pending.resolve(message.data.result);

          }

        }

      }

    });

  }

 

  async request<T>(

    target: string,

    method: string,

    params: any,

    timeoutMs = 5000

  ): Promise<T> {

    const requestId = `${Date.now()}-${Math.random()}`;

 

    return new Promise((resolve, reject) => {

      const timeout = setTimeout(() => {

        this.pendingRequests.delete(requestId);

        reject(new Error(`Request timeout: ${method}`));

      }, timeoutMs);

 

      this.pendingRequests.set(requestId, { resolve, reject, timeout });

 

      webshell.shell.sendMessage(target, method, {

        requestId,

        params

      }).catch(reject);

    });

  }

 

  handleRequest(

    method: string,

    handler: (params: any) => Promise<any>

  ): () => void {

    return webshell.shell.onMessage(async (message) => {

      if (message.type === method) {

        const { requestId, params } = message.data;

 

        try {

          const result = await handler(params);

          await webshell.shell.sendMessage(message.sender, `${method}.response`, {

            requestId,

            result

          });

        } catch (error: any) {

          await webshell.shell.sendMessage(message.sender, `${method}.response`, {

            requestId,

            error: error.message

          });

        }

      }

    });

  }

}

 

// Usage - Client

const rpc = new MessageRPC();

 

async function getTaskCount() {

  const count = await rpc.request<number>(

    'todo-app',

    'tasks.count',

    { filter: 'active' }

  );

  console.log('Active tasks:', count);

}

 

// Usage - Server

const rpc = new MessageRPC();

 

rpc.handleRequest('tasks.count', async (params) => {

  const tasks = await getTasks(params.filter);

  return tasks.length;

});

```

 

### Pattern 5: Pub-Sub Event Bus

 

Implement a publish-subscribe pattern for event-driven architecture.

 

```typescript

// Event Bus

class EventBus {

  private subscribers = new Map<string, Set<Function>>();

 

  constructor() {

    webshell.shell.onMessage((message) => {

      const handlers = this.subscribers.get(message.type);

      if (handlers) {

        handlers.forEach(handler => {

          try {

            handler(message.data, message.sender);

          } catch (error) {

            console.error(`Error in ${message.type} handler:`, error);

          }

        });

      }

    });

  }

 

  subscribe(eventType: string, handler: Function): () => void {

    if (!this.subscribers.has(eventType)) {

      this.subscribers.set(eventType, new Set());

    }

 

    this.subscribers.get(eventType)!.add(handler);

 

    // Return unsubscribe function

    return () => {

      const handlers = this.subscribers.get(eventType);

      if (handlers) {

        handlers.delete(handler);

        if (handlers.size === 0) {

          this.subscribers.delete(eventType);

        }

      }

    };

  }

 

  async publish(eventType: string, data: any): Promise<void> {

    await webshell.shell.broadcast(eventType, data);

  }

}

 

// Usage

const eventBus = new EventBus();

 

// Publisher

async function saveNote(note: Note) {

  await saveToDatabase(note);

  await eventBus.publish('note.saved', note);

}

 

// Subscriber

const unsubscribe = eventBus.subscribe('note.saved', (note) => {

  console.log('Note saved:', note.title);

  updateUI(note);

});

```

 

### Pattern 6: Message Queue with Retry

 

Handle unreliable message delivery with retry logic.

 

```typescript

// Message Queue with retry

class MessageQueue {

  private queue: Array<{

    target: string;

    type: string;

    data: any;

    attempts: number;

    maxAttempts: number;

  }> = [];

 

  private processing = false;

 

  async send(

    target: string,

    type: string,

    data: any,

    options = { maxAttempts: 3, retryDelay: 1000 }

  ): Promise<void> {

    this.queue.push({

      target,

      type,

      data,

      attempts: 0,

      maxAttempts: options.maxAttempts

    });

 

    this.processQueue(options.retryDelay);

  }

 

  private async processQueue(retryDelay: number): Promise<void> {

    if (this.processing || this.queue.length === 0) return;

 

    this.processing = true;

 

    while (this.queue.length > 0) {

      const message = this.queue[0];

 

      try {

        await webshell.shell.sendMessage(

          message.target,

          message.type,

          message.data

        );

 

        // Success - remove from queue

        this.queue.shift();

      } catch (error) {

        message.attempts++;

 

        if (message.attempts >= message.maxAttempts) {

          console.error('Message failed after max attempts:', error);

          this.queue.shift(); // Give up

        } else {

          console.warn(`Retry ${message.attempts}/${message.maxAttempts}`);

          await new Promise(resolve => setTimeout(resolve, retryDelay));

        }

      }

    }

 

    this.processing = false;

  }

}

 

// Usage

const queue = new MessageQueue();

 

await queue.send('calendar', 'event.created', {

  title: 'Meeting',

  start: new Date()

}, { maxAttempts: 5, retryDelay: 2000 });

```

 

---

 

## Message Types & Conventions

 

### Naming Conventions

 

Use dot notation for hierarchical event names:

 

```typescript

// Good: Descriptive, hierarchical

'task.created'

'task.updated'

'task.deleted'

'user.settings.changed'

'calendar.event.reminder'

 

// Bad: Unclear, flat

'newTask'

'update'

'changed'

```

 

### Standard Message Structure

 

```typescript

interface Message {

  type: string;           // Event type (e.g., 'task.created')

  data: any;              // Event payload

  sender: string;         // Sender app name

  timestamp?: number;     // When sent (optional)

  version?: string;       // Message schema version (optional)

}

```

 

### Example Message Types

 

```typescript

// CRUD Operations

'resource.created'      // New resource created

'resource.updated'      // Existing resource modified

'resource.deleted'      // Resource removed

'resource.read'         // Resource accessed

 

// State Changes

'app.started'           // App initialization complete

'app.closing'           // App about to close

'user.login'            // User authenticated

'user.logout'           // User logged out

 

// UI Events

'theme.changed'         // Theme switched

'window.focused'        // Window gained focus

'window.resized'        // Window size changed

 

// System Events

'network.online'        // Network connected

'network.offline'       // Network disconnected

'power.low'             // Battery low

'power.charging'        // Started charging

```

 

### Data Schemas

 

Define TypeScript interfaces for message data:

 

```typescript

// Task events

interface TaskCreatedData {

  id: string;

  title: string;

  description?: string;

  dueDate?: Date;

  priority: 'low' | 'medium' | 'high';

}

 

interface TaskUpdatedData {

  id: string;

  changes: Partial<TaskCreatedData>;

}

 

interface TaskDeletedData {

  id: string;

  deletedAt: Date;

}

 

// Usage with type safety

webshell.shell.onMessage((message) => {

  if (message.type === 'task.created') {

    const data = message.data as TaskCreatedData;

    console.log('New task:', data.title);

  }

});

```

 

---

 

## Error Handling

 

### Handling Send Errors

 

```typescript

async function sendMessageSafely(

  target: string,

  type: string,

  data: any

): Promise<boolean> {

  try {

    await webshell.shell.sendMessage(target, type, data);

    return true;

  } catch (error: any) {

    if (error.code === 'APP_NOT_FOUND') {

      console.warn(`App ${target} not running`);

      // Maybe queue for later delivery

    } else if (error.code === 'PERMISSION_DENIED') {

      console.error(`No permission to send to ${target}`);

    } else {

      console.error('Message send failed:', error);

    }

    return false;

  }

}

```

 

### Validating Received Messages

 

```typescript

function isValidMessage(message: any): boolean {

  return (

    message &&

    typeof message.type === 'string' &&

    message.data !== undefined &&

    typeof message.sender === 'string'

  );

}

 

webshell.shell.onMessage((message) => {

  if (!isValidMessage(message)) {

    console.warn('Invalid message received:', message);

    return;

  }

 

  // Process valid message

  handleMessage(message);

});

```

 

### Message Validation Schema

 

```typescript

import { z } from 'zod';

 

// Define schemas for message data

const TaskCreatedSchema = z.object({

  id: z.string(),

  title: z.string().min(1).max(200),

  description: z.string().optional(),

  dueDate: z.date().optional(),

  priority: z.enum(['low', 'medium', 'high'])

});

 

webshell.shell.onMessage((message) => {

  if (message.type === 'task.created') {

    try {

      const data = TaskCreatedSchema.parse(message.data);

      createTask(data);

    } catch (error) {

      console.error('Invalid task data:', error);

    }

  }

});

```

 

### Timeout Handling

 

```typescript

async function sendWithTimeout(

  target: string,

  type: string,

  data: any,

  timeoutMs = 5000

): Promise<void> {

  const timeoutPromise = new Promise((_, reject) => {

    setTimeout(() => reject(new Error('Send timeout')), timeoutMs);

  });

 

  const sendPromise = webshell.shell.sendMessage(target, type, data);

 

  await Promise.race([sendPromise, timeoutPromise]);

}

```

 

---

 

## Testing

 

### Unit Testing Message Handlers

 

```typescript

// message-handler.test.ts

import { describe, it, expect, vi } from 'vitest';

 

describe('Task Message Handler', () => {

  it('creates task from message', () => {

    const handler = new TaskMessageHandler();

    const message = {

      type: 'task.created',

      sender: 'test-app',

      data: {

        id: '123',

        title: 'Test Task',

        priority: 'high'

      }

    };

 

    const spy = vi.spyOn(handler, 'createTask');

    handler.handleMessage(message);

 

    expect(spy).toHaveBeenCalledWith(message.data);

  });

 

  it('ignores invalid messages', () => {

    const handler = new TaskMessageHandler();

    const message = {

      type: 'task.created',

      sender: 'test-app',

      data: { invalid: true }

    };

 

    const spy = vi.spyOn(console, 'error');

    handler.handleMessage(message);

 

    expect(spy).toHaveBeenCalled();

  });

});

```

 

### Integration Testing

 

```typescript

// Mock webshell for testing

const mockWebShell = {

  shell: {

    sendMessage: vi.fn(),

    broadcast: vi.fn(),

    onMessage: vi.fn()

  }

};

 

(global as any).webshell = mockWebShell;

 

describe('Message Integration', () => {

  it('sends and receives messages', async () => {

    let messageHandler: Function = () => {};

 

    mockWebShell.shell.onMessage.mockImplementation((handler) => {

      messageHandler = handler;

      return () => {};

    });

 

    // Set up receiver

    const receivedMessages: any[] = [];

    webshell.shell.onMessage((msg) => {

      receivedMessages.push(msg);

    });

 

    // Simulate message

    messageHandler({

      type: 'test.event',

      sender: 'test-app',

      data: { foo: 'bar' }

    });

 

    expect(receivedMessages).toHaveLength(1);

    expect(receivedMessages[0].type).toBe('test.event');

  });

});

```

 

### E2E Testing

 

```typescript

// e2e/messaging.test.ts

import { test, expect } from '@playwright/test';

 

test('apps communicate via messages', async ({ page, context }) => {

  // Open two app windows

  const todoPage = await context.newPage();

  await todoPage.goto('http://localhost:5173/apps/todo');

 

  const calendarPage = await context.newPage();

  await calendarPage.goto('http://localhost:5173/apps/calendar');

 

  // Create task in todo app

  await todoPage.fill('#task-title', 'Meeting');

  await todoPage.click('#create-task');

 

  // Verify message received in calendar

  await calendarPage.waitForSelector('.event[data-title="Meeting"]');

  const event = await calendarPage.$('.event[data-title="Meeting"]');

  expect(event).toBeTruthy();

});

```

 

---

 

## Security Considerations

 

### 1. Validate Message Origin

 

```typescript

const TRUSTED_APPS = ['todo-app', 'calendar', 'notes'];

 

webshell.shell.onMessage((message) => {

  if (!TRUSTED_APPS.includes(message.sender)) {

    console.warn('Message from untrusted app:', message.sender);

    return;

  }

 

  handleMessage(message);

});

```

 

### 2. Sanitize Message Data

 

```typescript

import DOMPurify from 'dompurify';

 

webshell.shell.onMessage((message) => {

  if (message.type === 'note.shared') {

    // Sanitize HTML content

    const clean = DOMPurify.sanitize(message.data.content);

    displayNote({ ...message.data, content: clean });

  }

});

```

 

### 3. Rate Limiting

 

```typescript

class RateLimiter {

  private counts = new Map<string, number[]>();

  private limit = 10; // messages per window

  private window = 1000; // 1 second

 

  isAllowed(sender: string): boolean {

    const now = Date.now();

    const timestamps = this.counts.get(sender) || [];

 

    // Remove old timestamps

    const recent = timestamps.filter(t => now - t < this.window);

 

    if (recent.length >= this.limit) {

      return false;

    }

 

    recent.push(now);

    this.counts.set(sender, recent);

    return true;

  }

}

 

const limiter = new RateLimiter();

 

webshell.shell.onMessage((message) => {

  if (!limiter.isAllowed(message.sender)) {

    console.warn('Rate limit exceeded:', message.sender);

    return;

  }

 

  handleMessage(message);

});

```

 

### 4. Permissions Check

 

```typescript

// Define which apps can send which messages

const MESSAGE_PERMISSIONS = {

  'calendar': ['event.created', 'event.updated', 'event.deleted'],

  'todo-app': ['task.created', 'task.updated', 'task.deleted'],

  'notes': ['note.shared']

};

 

webshell.shell.onMessage((message) => {

  const allowed = MESSAGE_PERMISSIONS[message.sender];

 

  if (!allowed || !allowed.includes(message.type)) {

    console.error('Unauthorized message type:', message.type);

    return;

  }

 

  handleMessage(message);

});

```

 

### 5. Message Size Limits

 

```typescript

const MAX_MESSAGE_SIZE = 100 * 1024; // 100KB

 

function checkMessageSize(data: any): boolean {

  const size = new Blob([JSON.stringify(data)]).size;

  return size <= MAX_MESSAGE_SIZE;

}

 

async function sendSafeMessage(target: string, type: string, data: any) {

  if (!checkMessageSize(data)) {

    throw new Error('Message too large');

  }

 

  await webshell.shell.sendMessage(target, type, data);

}

```

 

---

 

## Complete Examples

 

### Example 1: Chat Application

 

A simple chat system using broadcasts.

 

```typescript

// chat-app.ts

interface ChatMessage {

  id: string;

  author: string;

  text: string;

  timestamp: number;

}

 

class ChatApp {

  private messages: ChatMessage[] = [];

  private username: string;

 

  constructor(username: string) {

    this.username = username;

    this.setupMessageListener();

  }

 

  private setupMessageListener() {

    webshell.shell.onMessage((message) => {

      if (message.type === 'chat.message') {

        this.handleIncomingMessage(message.data);

      } else if (message.type === 'chat.history.request') {

        this.sendChatHistory(message.sender);

      } else if (message.type === 'chat.history.response') {

        this.mergeHistory(message.data.messages);

      }

    });

  }

 

  async sendMessage(text: string) {

    const message: ChatMessage = {

      id: `${Date.now()}-${Math.random()}`,

      author: this.username,

      text,

      timestamp: Date.now()

    };

 

    // Add to local messages

    this.messages.push(message);

    this.renderMessage(message);

 

    // Broadcast to all other chat instances

    await webshell.shell.broadcast('chat.message', message);

  }

 

  private handleIncomingMessage(message: ChatMessage) {

    // Avoid duplicates

    if (this.messages.find(m => m.id === message.id)) {

      return;

    }

 

    this.messages.push(message);

    this.renderMessage(message);

  }

 

  async requestHistory() {

    await webshell.shell.broadcast('chat.history.request', {

      requesterId: webshell.shell.app.getName()

    });

  }

 

  private async sendChatHistory(requester: string) {

    await webshell.shell.sendMessage(requester, 'chat.history.response', {

      messages: this.messages

    });

  }

 

  private mergeHistory(newMessages: ChatMessage[]) {

    newMessages.forEach(msg => {

      if (!this.messages.find(m => m.id === msg.id)) {

        this.messages.push(msg);

      }

    });

 

    // Sort by timestamp

    this.messages.sort((a, b) => a.timestamp - b.timestamp);

    this.renderMessages();

  }

 

  private renderMessage(message: ChatMessage) {

    const el = document.createElement('div');

    el.className = 'chat-message';

    el.innerHTML = `

      <div class="author">${message.author}</div>

      <div class="text">${this.escapeHtml(message.text)}</div>

      <div class="time">${new Date(message.timestamp).toLocaleTimeString()}</div>

    `;

    document.getElementById('messages')?.appendChild(el);

  }

 

  private renderMessages() {

    const container = document.getElementById('messages');

    if (!container) return;

 

    container.innerHTML = '';

    this.messages.forEach(msg => this.renderMessage(msg));

  }

 

  private escapeHtml(text: string): string {

    const div = document.createElement('div');

    div.textContent = text;

    return div.innerHTML;

  }

}

 

// Usage

webshell.ready(() => {

  const chat = new ChatApp('User123');

 

  // Request history from other instances

  chat.requestHistory();

 

  // Send message on form submit

  document.getElementById('send-btn')?.addEventListener('click', () => {

    const input = document.getElementById('message-input') as HTMLInputElement;

    if (input.value.trim()) {

      chat.sendMessage(input.value);

      input.value = '';

    }

  });

});

```

 

### Example 2: Data Synchronization

 

Synchronize data between note-taking app and email client.

 

```typescript

// notes-app.ts

class NotesSync {

  async shareNote(noteId: string) {

    const note = await this.getNote(noteId);

 

    // Send to email client

    await webshell.shell.sendMessage('email-client', 'note.share', {

      id: note.id,

      title: note.title,

      content: note.content,

      format: 'markdown'

    });

 

    webshell.notifications.send({

      title: 'Note Shared',

      message: `"${note.title}" sent to email client`

    });

  }

 

  private async getNote(id: string): Promise<Note> {

    // Fetch note from storage

    return {

      id,

      title: 'Example Note',

      content: '# Hello\n\nThis is a note.'

    };

  }

}

 

// email-client.ts

class EmailClient {

  constructor() {

    webshell.shell.onMessage(async (message) => {

      if (message.type === 'note.share') {

        await this.createDraftFromNote(message.data);

      }

    });

  }

 

  private async createDraftFromNote(note: any) {

    // Convert markdown to HTML

    const html = this.markdownToHtml(note.content);

 

    // Create email draft

    const draft = {

      subject: note.title,

      body: html,

      timestamp: Date.now()

    };

 

    await this.saveDraft(draft);

 

    webshell.notifications.send({

      title: 'Draft Created',

      message: `Email draft created from "${note.title}"`

    });

  }

 

  private markdownToHtml(markdown: string): string {

    // Simple markdown conversion (use proper library in production)

    return markdown

      .replace(/^# (.+)$/gm, '<h1>$1</h1>')

      .replace(/\n\n/g, '</p><p>')

      .replace(/^(.+)$/gm, '<p>$1</p>');

  }

 

  private async saveDraft(draft: any) {

    // Save to drafts storage

    console.log('Draft saved:', draft);

  }

}

```

 

### Example 3: Coordinated Actions

 

Multiple apps coordinate to execute a complex workflow.

 

```typescript

// workflow-orchestrator.ts

class WorkflowOrchestrator {

  async executeWorkflow(workflowId: string) {

    console.log('Starting workflow:', workflowId);

 

    try {

      // Step 1: Create task

      await webshell.shell.sendMessage('todo-app', 'workflow.create-task', {

        workflowId,

        title: 'Complete project report',

        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

      });

 

      // Step 2: Add calendar event

      await webshell.shell.sendMessage('calendar', 'workflow.create-event', {

        workflowId,

        title: 'Project report deadline',

        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

      });

 

      // Step 3: Send notification

      await webshell.shell.sendMessage('notifications-app', 'workflow.schedule-reminder', {

        workflowId,

        message: 'Project report due in 1 day',

        triggerDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000)

      });

 

      // Broadcast workflow completion

      await webshell.shell.broadcast('workflow.completed', {

        workflowId,

        timestamp: Date.now()

      });

 

      console.log('Workflow completed successfully');

 

    } catch (error) {

      console.error('Workflow failed:', error);

 

      // Broadcast failure

      await webshell.shell.broadcast('workflow.failed', {

        workflowId,

        error: (error as Error).message

      });

    }

  }

}

 

// todo-app.ts

webshell.shell.onMessage(async (message) => {

  if (message.type === 'workflow.create-task') {

    const task = await createTask({

      title: message.data.title,

      dueDate: message.data.dueDate,

      metadata: { workflowId: message.data.workflowId }

    });

 

    // Confirm task creation

    await webshell.shell.sendMessage(

      message.sender,

      'workflow.task-created',

      { taskId: task.id, workflowId: message.data.workflowId }

    );

  }

});

```

 

---

 

## Best Practices

 

### 1. Use Type-Safe Messages

 

```typescript

// Define message types

type AppMessage =

  | { type: 'task.created'; data: TaskCreatedData }

  | { type: 'task.updated'; data: TaskUpdatedData }

  | { type: 'task.deleted'; data: TaskDeletedData };

 

function handleMessage(message: AppMessage) {

  switch (message.type) {

    case 'task.created':

      // TypeScript knows data is TaskCreatedData

      console.log(message.data.title);

      break;

    case 'task.updated':

      // TypeScript knows data is TaskUpdatedData

      console.log(message.data.changes);

      break;

  }

}

```

 

### 2. Namespace Your Events

 

```typescript

// Prefix with app name to avoid collisions

const APP_PREFIX = 'myapp';

 

await webshell.shell.broadcast(`${APP_PREFIX}.user.login`, userData);

await webshell.shell.broadcast(`${APP_PREFIX}.data.synced`, syncData);

```

 

### 3. Document Your Messages

 

```typescript

/**

 * Notifies all apps when a new task is created.

 *

 * @event task.created

 * @property {string} id - Task ID

 * @property {string} title - Task title

 * @property {Date} dueDate - When task is due

 * @property {'low'|'medium'|'high'} priority - Task priority

 *

 * @example

 * webshell.shell.broadcast('task.created', {

 *   id: '123',

 *   title: 'Finish report',

 *   dueDate: new Date('2025-12-31'),

 *   priority: 'high'

 * });

 */

```

 

### 4. Clean Up Listeners

 

```typescript

class MyApp {

  private unsubscribers: Array<() => void> = [];

 

  init() {

    this.unsubscribers.push(

      webshell.shell.onMessage(this.handleMessage),

      webshell.theme.onThemeChange(this.handleTheme)

    );

  }

 

  cleanup() {

    this.unsubscribers.forEach(unsub => unsub());

    this.unsubscribers = [];

  }

}

```

 

### 5. Handle Missing Apps Gracefully

 

```typescript

async function sendToAppIfRunning(target: string, type: string, data: any) {

  const apps = await webshell.shell.listApps();

  const isRunning = apps.some(app => app.name === target);

 

  if (isRunning) {

    await webshell.shell.sendMessage(target, type, data);

    return true;

  } else {

    console.log(`App ${target} not running, skipping message`);

    return false;

  }

}

```

 

---

 

## Performance Tips

 

### 1. Debounce High-Frequency Events

 

```typescript

function debounce(fn: Function, delay: number) {

  let timeout: number;

  return (...args: any[]) => {

    clearTimeout(timeout);

    timeout = setTimeout(() => fn(...args), delay);

  };

}

 

const sendThemeUpdate = debounce((theme: string) => {

  webshell.shell.broadcast('theme.changed', { theme });

}, 300);

```

 

### 2. Batch Messages

 

```typescript

class MessageBatcher {

  private batch: any[] = [];

  private flushTimeout: number | null = null;

 

  add(message: any) {

    this.batch.push(message);

 

    if (!this.flushTimeout) {

      this.flushTimeout = setTimeout(() => this.flush(), 100);

    }

  }

 

  private async flush() {

    if (this.batch.length === 0) return;

 

    await webshell.shell.broadcast('messages.batch', {

      messages: this.batch

    });

 

    this.batch = [];

    this.flushTimeout = null;

  }

}

```

 

### 3. Use Broadcast Sparingly

 

Broadcasts are sent to all apps. For one-to-one communication, use `sendMessage()`.

 

```typescript

// Good: Direct message

await webshell.shell.sendMessage('calendar', 'event.created', event);

 

// Bad: Unnecessary broadcast

await webshell.shell.broadcast('event.created.for.calendar', event);

```

 

---

 

## Related Documentation

 

- [SDK API Reference](../sdk-api-reference.md)

- [App Lifecycle Guide](./app-lifecycle.md)

- [Permissions Guide](./permissions.md)

- [Testing Guide](../TEST_GUIDE.md)

 

