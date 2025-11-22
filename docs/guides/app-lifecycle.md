# App Lifecycle Management Guide

 

Complete guide to managing WebShell application lifecycle, from initialization to shutdown.

 

## Table of Contents

 

1. [Overview](#overview)

2. [Lifecycle Stages](#lifecycle-stages)

3. [Initialization Patterns](#initialization-patterns)

4. [Cleanup & Shutdown](#cleanup--shutdown)

5. [State Persistence](#state-persistence)

6. [Background Tasks](#background-tasks)

7. [Hot Reload Handling](#hot-reload-handling)

8. [Restart & Recovery](#restart--recovery)

9. [Complete Examples](#complete-examples)

 

---

 

## Overview

 

Understanding and properly managing your app's lifecycle is crucial for:

 

- **Resource management**: Prevent memory leaks and excessive CPU usage

- **Data integrity**: Save user data before shutdown

- **User experience**: Smooth transitions and fast startup

- **System integration**: Clean cooperation with WebShell runtime

 

### Lifecycle Flow

 

```

┌─────────────┐

│   Created   │  App loaded into memory

└──────┬──────┘

       ▼

┌─────────────┐

│Initializing │  SDK initializes, resources load

└──────┬──────┘

       ▼

┌─────────────┐

│    Ready    │  webshell.ready() callback fires

└──────┬──────┘

       ▼

┌─────────────┐

│   Active    │  App running, user interaction

└──────┬──────┘

       ▼

┌─────────────┐

│   Hidden    │  Window hidden/minimized (optional)

└──────┬──────┘

       ▼

┌─────────────┐

│   Closing   │  beforeunload event fires

└──────┬──────┘

       ▼

┌─────────────┐

│  Destroyed  │  App removed from memory

└─────────────┘

```

 

---

 

## Lifecycle Stages

 

### Stage 1: Created

 

The app HTML/JS is loaded but SDK is not yet ready.

 

```typescript

// DOM Content Loaded (earliest hook)

document.addEventListener('DOMContentLoaded', () => {

  console.log('DOM ready, but WebShell SDK may not be');

 

  // Safe to manipulate DOM

  const container = document.getElementById('app');

  container?.classList.add('loading');

});

```

 

**What to do:**

- Minimal DOM setup

- Show loading indicators

- Don't call WebShell APIs yet

 

**What to avoid:**

- Heavy computation

- WebShell SDK calls

- Loading large resources

 

### Stage 2: Initializing

 

WebShell SDK is initializing backend connections.

 

```typescript

// This runs BEFORE webshell.ready()

console.log('SDK initializing...');

 

// You can prepare data structures

const appState = {

  initialized: false,

  data: null

};

```

 

**What to do:**

- Prepare data structures

- Define event handlers

- Set up utilities

 

**What to avoid:**

- SDK API calls (not ready yet)

- User interaction handling

 

### Stage 3: Ready

 

SDK fully initialized and ready to use.

 

```typescript

webshell.ready(async () => {

  console.log('App is ready!');

 

  // Now safe to use all SDK features

  const appName = webshell.shell.app.getName();

  const theme = webshell.theme.getTheme();

 

  // Initialize app

  await initializeApp();

 

  // Signal ready to user

  document.body.classList.remove('loading');

  document.body.classList.add('ready');

});

```

 

**What to do:**

- Initialize SDK-dependent features

- Load user data

- Setup event listeners

- Apply theme

- Show UI

 

### Stage 4: Active

 

App is running and user is interacting.

 

```typescript

// App is fully active

webshell.window.onFocus(() => {

  console.log('Window focused');

  appState.isActive = true;

 

  // Resume animations

  resumeAnimations();

 

  // Refresh data if needed

  if (shouldRefreshData()) {

    refreshData();

  }

});

```

 

**What to do:**

- Handle user interactions

- Process events

- Update UI

- Background sync

 

### Stage 5: Hidden

 

Window is hidden/minimized but app still running.

 

```typescript

webshell.window.onBlur(() => {

  console.log('Window lost focus');

  appState.isActive = false;

 

  // Pause non-critical work

  pauseAnimations();

  pausePolling();

 

  // Continue critical background tasks

  continueBackgroundSync();

});

 

document.addEventListener('visibilitychange', () => {

  if (document.hidden) {

    console.log('Tab hidden');

    pauseNonEssentialWork();

  } else {

    console.log('Tab visible');

    resumeWork();

  }

});

```

 

**What to do:**

- Pause animations

- Reduce polling frequency

- Save state periodically

 

**What to avoid:**

- Stopping critical background tasks

- Losing unsaved data

 

### Stage 6: Closing

 

App is about to close.

 

```typescript

window.addEventListener('beforeunload', (event) => {

  console.log('App closing');

 

  // Save critical data

  saveAppState();

 

  // Cleanup resources

  cleanup();

 

  // Warn user if needed

  if (hasUnsavedChanges()) {

    event.preventDefault();

    event.returnValue = 'You have unsaved changes. Really close?';

  }

});

```

 

**What to do:**

- Save user data

- Cleanup resources

- Close connections

- Warn about unsaved changes

 

**What to avoid:**

- Long-running async operations

- User dialogs (except beforeunload confirmation)

 

### Stage 7: Destroyed

 

App is removed from memory (no code runs).

 

---

 

## Initialization Patterns

 

### Pattern 1: Sequential Initialization

 

Initialize components in a specific order.

 

```typescript

class App {

  async initialize() {

    console.log('Starting initialization...');

 

    try {

      // Step 1: Load config

      await this.loadConfiguration();

 

      // Step 2: Initialize SDK features

      await this.setupSDK();

 

      // Step 3: Load user data

      await this.loadUserData();

 

      // Step 4: Setup UI

      await this.initializeUI();

 

      // Step 5: Start background tasks

      this.startBackgroundTasks();

 

      console.log('Initialization complete');

      this.markAsReady();

 

    } catch (error) {

      console.error('Initialization failed:', error);

      this.handleInitializationError(error);

    }

  }

 

  private async loadConfiguration() {

    this.config = await fetch('/config.json').then(r => r.json());

  }

 

  private async setupSDK() {

    // Setup theme

    webshell.theme.applyTheme();

 

    // Setup message handlers

    webshell.shell.onMessage(this.handleMessage.bind(this));

 

    // Setup window

    webshell.window.onResize(this.handleResize.bind(this));

  }

 

  private async loadUserData() {

    const userId = await this.getUserId();

    this.userData = await this.fetchUserData(userId);

  }

 

  private async initializeUI() {

    this.renderApp();

    this.attachEventListeners();

  }

 

  private startBackgroundTasks() {

    this.syncInterval = setInterval(() => this.sync(), 60000);

  }

 

  private markAsReady() {

    document.body.classList.add('ready');

    document.body.classList.remove('loading');

  }

}

 

webshell.ready(() => {

  const app = new App();

  app.initialize();

});

```

 

### Pattern 2: Parallel Initialization

 

Load independent components in parallel for faster startup.

 

```typescript

class FastApp {

  async initialize() {

    const startTime = Date.now();

 

    try {

      // Load independent resources in parallel

      const [config, theme, userData] = await Promise.all([

        this.loadConfiguration(),

        this.loadTheme(),

        this.loadUserData()

      ]);

 

      this.config = config;

      this.theme = theme;

      this.userData = userData;

 

      // Sequential steps that depend on parallel results

      await this.initializeUI();

      this.startBackgroundTasks();

 

      const duration = Date.now() - startTime;

      console.log(`Initialized in ${duration}ms`);

 

      this.markAsReady();

 

    } catch (error) {

      console.error('Initialization failed:', error);

      this.handleInitializationError(error);

    }

  }

 

  private async loadConfiguration(): Promise<Config> {

    return fetch('/config.json').then(r => r.json());

  }

 

  private async loadTheme(): Promise<Theme> {

    return webshell.theme.getTheme();

  }

 

  private async loadUserData(): Promise<UserData> {

    const userId = localStorage.getItem('userId');

    if (!userId) return this.getDefaultUserData();

 

    return fetch(`/api/users/${userId}`).then(r => r.json());

  }

}

```

 

### Pattern 3: Lazy Initialization

 

Initialize features on-demand for faster perceived startup.

 

```typescript

class LazyApp {

  private features = new Map<string, boolean>();

 

  async initialize() {

    // Minimal critical initialization

    await this.loadCriticalData();

    this.renderBasicUI();

 

    this.markAsReady();

 

    // Lazy load features as needed

    this.setupLazyLoading();

  }

 

  private async loadCriticalData() {

    // Only load what's needed for initial render

    this.theme = webshell.theme.getTheme();

    this.user = { id: localStorage.getItem('userId') };

  }

 

  private renderBasicUI() {

    // Render skeleton UI immediately

    document.getElementById('app')!.innerHTML = `

      <div class="app-shell">

        <nav class="skeleton"></nav>

        <main class="skeleton"></main>

      </div>

    `;

  }

 

  private setupLazyLoading() {

    // Load features when user navigates to them

    document.addEventListener('click', (e) => {

      const target = e.target as HTMLElement;

 

      if (target.matches('[data-feature]')) {

        const feature = target.dataset.feature!;

        this.loadFeature(feature);

      }

    });

  }

 

  private async loadFeature(name: string) {

    if (this.features.get(name)) return; // Already loaded

 

    console.log(`Loading feature: ${name}`);

 

    switch (name) {

      case 'calendar':

        await this.loadCalendarFeature();

        break;

      case 'settings':

        await this.loadSettingsFeature();

        break;

      case 'reports':

        await this.loadReportsFeature();

        break;

    }

 

    this.features.set(name, true);

  }

 

  private async loadCalendarFeature() {

    const events = await webshell.calendar.eventsToday();

    this.renderCalendar(events);

  }

}

```

 

### Pattern 4: Progressive Enhancement

 

Start with basic functionality, enhance progressively.

 

```typescript

class ProgressiveApp {

  async initialize() {

    // Level 1: Basic offline functionality

    this.initializeOfflineMode();

 

    // Level 2: Online features if available

    if (navigator.onLine) {

      await this.initializeOnlineFeatures();

    }

 

    // Level 3: Advanced features if supported

    if (this.supportsAdvancedFeatures()) {

      await this.initializeAdvancedFeatures();

    }

 

    this.markAsReady();

  }

 

  private initializeOfflineMode() {

    // Load from local storage

    this.data = this.loadFromCache();

    this.renderBasicUI();

  }

 

  private async initializeOnlineFeatures() {

    try {

      // Sync with server

      const freshData = await this.fetchFromServer();

      this.data = this.mergeData(this.data, freshData);

      this.updateUI();

 

      // Setup real-time updates

      this.setupWebSocket();

 

    } catch (error) {

      console.warn('Online features unavailable:', error);

      // Continue with offline mode

    }

  }

 

  private async initializeAdvancedFeatures() {

    // Enable if permissions granted

    if (webshell.permissions.has('notifications', 'send')) {

      this.enableNotifications();

    }

 

    // Enable if SDK version supports

    if (webshell.version >= '2.0.0') {

      this.enableNewFeatures();

    }

  }

 

  private supportsAdvancedFeatures(): boolean {

    return (

      webshell.permissions.has('notifications', 'send') ||

      webshell.version >= '2.0.0'

    );

  }

}

```

 

---

 

## Cleanup & Shutdown

 

### Resource Cleanup

 

```typescript

class ResourceManager {

  private timers: number[] = [];

  private intervals: number[] = [];

  private eventListeners: Array<{

    target: EventTarget;

    type: string;

    listener: EventListener;

  }> = [];

  private unsubscribers: Array<() => void> = [];

 

  // Tracked setTimeout

  setTimeout(callback: Function, delay: number): number {

    const id = window.setTimeout(callback, delay);

    this.timers.push(id);

    return id;

  }

 

  // Tracked setInterval

  setInterval(callback: Function, delay: number): number {

    const id = window.setInterval(callback, delay);

    this.intervals.push(id);

    return id;

  }

 

  // Tracked event listener

  addEventListener(

    target: EventTarget,

    type: string,

    listener: EventListener

  ): void {

    target.addEventListener(type, listener);

    this.eventListeners.push({ target, type, listener });

  }

 

  // Tracked subscription

  subscribe(unsubscribe: () => void): void {

    this.unsubscribers.push(unsubscribe);

  }

 

  // Cleanup all resources

  cleanup(): void {

    // Clear timers

    this.timers.forEach(id => clearTimeout(id));

    this.timers = [];

 

    // Clear intervals

    this.intervals.forEach(id => clearInterval(id));

    this.intervals = [];

 

    // Remove event listeners

    this.eventListeners.forEach(({ target, type, listener }) => {

      target.removeEventListener(type, listener);

    });

    this.eventListeners = [];

 

    // Unsubscribe

    this.unsubscribers.forEach(unsub => unsub());

    this.unsubscribers = [];

 

    console.log('All resources cleaned up');

  }

}

 

// Usage

const resources = new ResourceManager();

 

// Use tracked methods

resources.setTimeout(() => console.log('Hello'), 1000);

resources.setInterval(() => syncData(), 60000);

 

resources.addEventListener(window, 'resize', handleResize);

 

const unsub = webshell.shell.onMessage(handleMessage);

resources.subscribe(unsub);

 

// Cleanup on shutdown

window.addEventListener('beforeunload', () => {

  resources.cleanup();

});

```

 

### Graceful Shutdown

 

```typescript

class GracefulShutdown {

  private isShuttingDown = false;

  private shutdownTasks: Array<() => Promise<void>> = [];

 

  registerShutdownTask(task: () => Promise<void>): void {

    this.shutdownTasks.push(task);

  }

 

  async shutdown(): Promise<void> {

    if (this.isShuttingDown) return;

    this.isShuttingDown = true;

 

    console.log('Starting graceful shutdown...');

 

    try {

      // Run all shutdown tasks in parallel

      await Promise.allSettled(

        this.shutdownTasks.map(task => task())

      );

 

      console.log('Graceful shutdown complete');

 

    } catch (error) {

      console.error('Shutdown error:', error);

    }

  }

}

 

// Usage

const shutdown = new GracefulShutdown();

 

// Register cleanup tasks

shutdown.registerShutdownTask(async () => {

  console.log('Saving user data...');

  await saveUserData();

});

 

shutdown.registerShutdownTask(async () => {

  console.log('Closing connections...');

  await closeWebSocket();

});

 

shutdown.registerShutdownTask(async () => {

  console.log('Flushing logs...');

  await flushLogs();

});

 

// Trigger on beforeunload

window.addEventListener('beforeunload', (event) => {

  shutdown.shutdown();

 

  // Warn if unsaved changes

  if (hasUnsavedChanges()) {

    event.preventDefault();

    event.returnValue = '';

  }

});

```

 

### Handling Unsaved Changes

 

```typescript

class UnsavedChangesHandler {

  private hasChanges = false;

 

  markDirty(): void {

    this.hasChanges = true;

  }

 

  markClean(): void {

    this.hasChanges = false;

  }

 

  confirmClose(): boolean {

    if (!this.hasChanges) return true;

 

    return confirm(

      'You have unsaved changes. Are you sure you want to close?'

    );

  }

 

  setupCloseWarning(): void {

    window.addEventListener('beforeunload', (event) => {

      if (this.hasChanges) {

        event.preventDefault();

        event.returnValue = 'Unsaved changes';

      }

    });

  }

}

 

// Usage

const changes = new UnsavedChangesHandler();

changes.setupCloseWarning();

 

// Mark dirty on edits

document.getElementById('editor')?.addEventListener('input', () => {

  changes.markDirty();

});

 

// Mark clean after save

async function save() {

  await saveData();

  changes.markClean();

}

```

 

---

 

## State Persistence

 

### Pattern 1: Auto-save

 

Automatically save state periodically.

 

```typescript

class AutoSave {

  private saveInterval: number | null = null;

  private isDirty = false;

  private saveDelay = 5000; // 5 seconds

 

  start(): void {

    this.saveInterval = setInterval(() => {

      if (this.isDirty) {

        this.save();

      }

    }, this.saveDelay);

  }

 

  stop(): void {

    if (this.saveInterval) {

      clearInterval(this.saveInterval);

      this.saveInterval = null;

    }

  }

 

  markDirty(): void {

    this.isDirty = true;

  }

 

  private async save(): Promise<void> {

    console.log('Auto-saving...');

    const state = this.collectState();

 

    try {

      await this.persistState(state);

      this.isDirty = false;

      console.log('Auto-save complete');

 

    } catch (error) {

      console.error('Auto-save failed:', error);

    }

  }

 

  private collectState(): any {

    return {

      data: getAppData(),

      timestamp: Date.now()

    };

  }

 

  private async persistState(state: any): Promise<void> {

    localStorage.setItem('app-state', JSON.stringify(state));

  }

 

  async forceSave(): Promise<void> {

    await this.save();

  }

}

 

// Usage

const autoSave = new AutoSave();

 

webshell.ready(() => {

  autoSave.start();

});

 

// Mark dirty on changes

document.addEventListener('input', () => {

  autoSave.markDirty();

});

 

// Force save on close

window.addEventListener('beforeunload', async () => {

  await autoSave.forceSave();

  autoSave.stop();

});

```

 

### Pattern 2: Versioned State

 

Track state versions for rollback capability.

 

```typescript

interface VersionedState {

  version: number;

  timestamp: number;

  data: any;

}

 

class StateVersioning {

  private currentVersion = 0;

  private states: VersionedState[] = [];

  private maxVersions = 10;

 

  saveState(data: any): void {

    const state: VersionedState = {

      version: ++this.currentVersion,

      timestamp: Date.now(),

      data: JSON.parse(JSON.stringify(data)) // Deep clone

    };

 

    this.states.push(state);

 

    // Keep only recent versions

    if (this.states.length > this.maxVersions) {

      this.states.shift();

    }

 

    this.persist();

  }

 

  loadState(version?: number): any | null {

    if (version !== undefined) {

      const state = this.states.find(s => s.version === version);

      return state ? state.data : null;

    }

 

    // Load latest

    return this.states.length > 0

      ? this.states[this.states.length - 1].data

      : null;

  }

 

  getVersions(): VersionedState[] {

    return this.states.map(s => ({

      version: s.version,

      timestamp: s.timestamp,

      data: null // Don't include data in list

    }));

  }

 

  rollback(version: number): boolean {

    const state = this.states.find(s => s.version === version);

    if (!state) return false;

 

    // Remove newer versions

    this.states = this.states.filter(s => s.version <= version);

    this.currentVersion = version;

 

    this.persist();

    return true;

  }

 

  private persist(): void {

    localStorage.setItem('state-versions', JSON.stringify({

      currentVersion: this.currentVersion,

      states: this.states

    }));

  }

 

  restore(): void {

    const stored = localStorage.getItem('state-versions');

    if (!stored) return;

 

    const { currentVersion, states } = JSON.parse(stored);

    this.currentVersion = currentVersion;

    this.states = states;

  }

}

 

// Usage

const versioning = new StateVersioning();

versioning.restore();

 

// Save state on changes

function handleChange() {

  const data = collectAppData();

  versioning.saveState(data);

}

 

// Show version history

function showHistory() {

  const versions = versioning.getVersions();

  versions.forEach(v => {

    console.log(`Version ${v.version} - ${new Date(v.timestamp)}`);

  });

}

 

// Rollback

function undo() {

  const versions = versioning.getVersions();

  if (versions.length > 1) {

    const previousVersion = versions[versions.length - 2].version;

    versioning.rollback(previousVersion);

 

    const data = versioning.loadState();

    restoreAppData(data);

  }

}

```

 

### Pattern 3: Cloud Sync

 

Sync state to backend server.

 

```typescript

class CloudSync {

  private syncInterval: number | null = null;

  private isDirty = false;

  private isSyncing = false;

 

  async initialize(): Promise<void> {

    // Load from cloud on startup

    await this.pull();

 

    // Start periodic sync

    this.syncInterval = setInterval(() => this.sync(), 30000);

 

    // Sync on visibility change

    document.addEventListener('visibilitychange', () => {

      if (!document.hidden) {

        this.sync();

      }

    });

  }

 

  markDirty(): void {

    this.isDirty = true;

  }

 

  private async sync(): Promise<void> {

    if (!this.isDirty || this.isSyncing) return;

 

    this.isSyncing = true;

 

    try {

      await this.push();

      this.isDirty = false;

 

    } catch (error) {

      console.error('Sync failed:', error);

 

    } finally {

      this.isSyncing = false;

    }

  }

 

  private async push(): Promise<void> {

    const state = this.collectState();

 

    const response = await fetch('/api/state', {

      method: 'POST',

      headers: { 'Content-Type': 'application/json' },

      body: JSON.stringify(state)

    });

 

    if (!response.ok) {

      throw new Error('Push failed');

    }

 

    console.log('State pushed to cloud');

  }

 

  private async pull(): Promise<void> {

    const response = await fetch('/api/state');

 

    if (response.ok) {

      const state = await response.json();

      this.restoreState(state);

      console.log('State pulled from cloud');

    }

  }

 

  private collectState(): any {

    return {

      data: getAppData(),

      timestamp: Date.now()

    };

  }

 

  private restoreState(state: any): void {

    restoreAppData(state.data);

  }

 

  async forcePush(): Promise<void> {

    await this.push();

    this.isDirty = false;

  }

 

  stop(): void {

    if (this.syncInterval) {

      clearInterval(this.syncInterval);

      this.syncInterval = null;

    }

  }

}

 

// Usage

const cloudSync = new CloudSync();

 

webshell.ready(async () => {

  await cloudSync.initialize();

});

 

// Mark dirty on changes

document.addEventListener('input', () => {

  cloudSync.markDirty();

});

 

// Push on close

window.addEventListener('beforeunload', async () => {

  await cloudSync.forcePush();

  cloudSync.stop();

});

```

 

---

 

## Background Tasks

 

### Pattern 1: Periodic Tasks

 

Run tasks at regular intervals.

 

```typescript

class BackgroundTasks {

  private tasks = new Map<string, number>();

 

  register(name: string, task: () => void | Promise<void>, interval: number): void {

    const id = setInterval(async () => {

      try {

        await task();

      } catch (error) {

        console.error(`Background task ${name} failed:`, error);

      }

    }, interval);

 

    this.tasks.set(name, id);

    console.log(`Background task registered: ${name}`);

  }

 

  unregister(name: string): void {

    const id = this.tasks.get(name);

    if (id) {

      clearInterval(id);

      this.tasks.delete(name);

      console.log(`Background task unregistered: ${name}`);

    }

  }

 

  unregisterAll(): void {

    this.tasks.forEach((id, name) => {

      clearInterval(id);

      console.log(`Background task stopped: ${name}`);

    });

    this.tasks.clear();

  }

}

 

// Usage

const background = new BackgroundTasks();

 

webshell.ready(() => {

  // Sync every minute

  background.register('sync', async () => {

    await syncWithServer();

  }, 60000);

 

  // Check notifications every 30 seconds

  background.register('notifications', async () => {

    await checkNotifications();

  }, 30000);

 

  // Cleanup old data every hour

  background.register('cleanup', async () => {

    await cleanupOldData();

  }, 3600000);

});

 

window.addEventListener('beforeunload', () => {

  background.unregisterAll();

});

```

 

### Pattern 2: Idle Detection

 

Run tasks only when user is idle.

 

```typescript

class IdleTaskRunner {

  private idleTimeout = 5000; // 5 seconds

  private isIdle = false;

  private idleTimer: number | null = null;

  private pendingTasks: Array<() => Promise<void>> = [];

 

  constructor() {

    this.setupIdleDetection();

  }

 

  private setupIdleDetection(): void {

    const resetTimer = () => {

      if (this.isIdle) {

        this.isIdle = false;

        console.log('User active');

      }

 

      if (this.idleTimer) {

        clearTimeout(this.idleTimer);

      }

 

      this.idleTimer = setTimeout(() => {

        this.isIdle = true;

        console.log('User idle');

        this.runPendingTasks();

      }, this.idleTimeout);

    };

 

    // Reset on user activity

    ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'].forEach(event => {

      document.addEventListener(event, resetTimer, { passive: true });

    });

 

    resetTimer();

  }

 

  scheduleIdleTask(task: () => Promise<void>): void {

    this.pendingTasks.push(task);

 

    if (this.isIdle) {

      this.runPendingTasks();

    }

  }

 

  private async runPendingTasks(): Promise<void> {

    if (!this.isIdle || this.pendingTasks.length === 0) return;

 

    console.log(`Running ${this.pendingTasks.length} idle tasks`);

 

    while (this.pendingTasks.length > 0 && this.isIdle) {

      const task = this.pendingTasks.shift()!;

 

      try {

        await task();

      } catch (error) {

        console.error('Idle task failed:', error);

      }

    }

  }

}

 

// Usage

const idleRunner = new IdleTaskRunner();

 

// Schedule expensive tasks for idle time

idleRunner.scheduleIdleTask(async () => {

  await indexSearchData();

});

 

idleRunner.scheduleIdleTask(async () => {

  await generateThumbnails();

});

 

idleRunner.scheduleIdleTask(async () => {

  await compressOldLogs();

});

```

 

### Pattern 3: Web Workers

 

Offload heavy computation to Web Workers.

 

```typescript

class WorkerPool {

  private workers: Worker[] = [];

  private queue: Array<{

    task: any;

    resolve: (value: any) => void;

    reject: (error: any) => void;

  }> = [];

 

  constructor(workerScript: string, poolSize = 4) {

    for (let i = 0; i < poolSize; i++) {

      const worker = new Worker(workerScript);

 

      worker.onmessage = (e) => {

        const pending = this.queue.shift();

        if (pending) {

          if (e.data.error) {

            pending.reject(new Error(e.data.error));

          } else {

            pending.resolve(e.data.result);

          }

        }

 

        // Process next task

        this.processQueue();

      };

 

      this.workers.push(worker);

    }

  }

 

  async execute(task: any): Promise<any> {

    return new Promise((resolve, reject) => {

      this.queue.push({ task, resolve, reject });

      this.processQueue();

    });

  }

 

  private processQueue(): void {

    const availableWorker = this.workers.find(w => !this.isWorkerBusy(w));

    const nextTask = this.queue[0];

 

    if (availableWorker && nextTask) {

      availableWorker.postMessage(nextTask.task);

    }

  }

 

  private isWorkerBusy(worker: Worker): boolean {

    // Simple check - in real implementation track worker state

    return false;

  }

 

  terminate(): void {

    this.workers.forEach(w => w.terminate());

    this.workers = [];

  }

}

 

// worker.js

self.onmessage = (e) => {

  const { type, data } = e.data;

 

  try {

    let result;

 

    switch (type) {

      case 'process-data':

        result = processLargeDataset(data);

        break;

      case 'compute':

        result = heavyComputation(data);

        break;

    }

 

    self.postMessage({ result });

 

  } catch (error) {

    self.postMessage({ error: error.message });

  }

};

 

// Usage

const workerPool = new WorkerPool('/worker.js');

 

async function processData(data: any) {

  const result = await workerPool.execute({

    type: 'process-data',

    data

  });

 

  return result;

}

 

window.addEventListener('beforeunload', () => {

  workerPool.terminate();

});

```

 

---

 

## Hot Reload Handling

 

### Detecting Hot Reload

 

```typescript

class HotReloadDetector {

  private isHotReload = false;

 

  constructor() {

    this.detectHotReload();

  }

 

  private detectHotReload(): void {

    // Check if state exists in sessionStorage

    this.isHotReload = sessionStorage.getItem('hot-reload') === 'true';

 

    // Mark for next reload

    sessionStorage.setItem('hot-reload', 'true');

 

    // Clear on normal close

    window.addEventListener('beforeunload', (e) => {

      // If user is actually closing, clear the flag

      if (!e.defaultPrevented) {

        sessionStorage.removeItem('hot-reload');

      }

    });

  }

 

  isHotReloading(): boolean {

    return this.isHotReload;

  }

}

 

// Usage

const hotReload = new HotReloadDetector();

 

webshell.ready(() => {

  if (hotReload.isHotReloading()) {

    console.log('Hot reload detected - restoring state');

    restoreState();

  } else {

    console.log('Normal startup - fresh state');

    initializeFreshState();

  }

});

```

 

### Preserving State Across Reloads

 

```typescript

class HotReloadState {

  private stateKey = 'hot-reload-state';

 

  save(state: any): void {

    sessionStorage.setItem(this.stateKey, JSON.stringify(state));

  }

 

  restore(): any | null {

    const stored = sessionStorage.getItem(this.stateKey);

    if (!stored) return null;

 

    try {

      return JSON.parse(stored);

    } catch {

      return null;

    }

  }

 

  clear(): void {

    sessionStorage.removeItem(this.stateKey);

  }

}

 

// Usage

const hotReloadState = new HotReloadState();

 

// Save state before reload

window.addEventListener('beforeunload', () => {

  const state = {

    scrollPosition: window.scrollY,

    formData: collectFormData(),

    selectedTab: getActiveTab(),

    timestamp: Date.now()

  };

 

  hotReloadState.save(state);

});

 

// Restore state after reload

webshell.ready(() => {

  const state = hotReloadState.restore();

 

  if (state) {

    // Check if recent (within 5 seconds)

    if (Date.now() - state.timestamp < 5000) {

      console.log('Restoring hot reload state');

 

      window.scrollTo(0, state.scrollPosition);

      restoreFormData(state.formData);

      setActiveTab(state.selectedTab);

    }

  }

});

```

 

---

 

## Restart & Recovery

 

### Crash Recovery

 

```typescript

class CrashRecovery {

  private crashKey = 'app-crash-data';

  private heartbeatInterval: number | null = null;

 

  start(): void {

    // Check for previous crash

    this.checkForCrash();

 

    // Start heartbeat

    this.startHeartbeat();

 

    // Clear on clean shutdown

    window.addEventListener('beforeunload', () => {

      this.clearCrashData();

    });

  }

 

  private checkForCrash(): void {

    const crashData = localStorage.getItem(this.crashKey);

 

    if (crashData) {

      console.warn('Previous crash detected');

      const data = JSON.parse(crashData);

 

      // Offer recovery

      this.offerRecovery(data);

    }

  }

 

  private startHeartbeat(): void {

    // Update timestamp every second

    this.heartbeatInterval = setInterval(() => {

      const data = {

        timestamp: Date.now(),

        state: this.captureState()

      };

 

      localStorage.setItem(this.crashKey, JSON.stringify(data));

    }, 1000);

  }

 

  private captureState(): any {

    return {

      url: window.location.href,

      scrollPosition: window.scrollY,

      formData: collectFormData()

    };

  }

 

  private clearCrashData(): void {

    if (this.heartbeatInterval) {

      clearInterval(this.heartbeatInterval);

    }

    localStorage.removeItem(this.crashKey);

  }

 

  private offerRecovery(data: any): void {

    const shouldRecover = confirm(

      'The app crashed previously. Would you like to recover your work?'

    );

 

    if (shouldRecover) {

      this.recoverState(data.state);

    }

 

    this.clearCrashData();

  }

 

  private recoverState(state: any): void {

    // Restore state

    if (state.url !== window.location.href) {

      window.location.href = state.url;

      return;

    }

 

    window.scrollTo(0, state.scrollPosition);

    restoreFormData(state.formData);

  }

}

 

// Usage

const recovery = new CrashRecovery();

recovery.start();

```

 

### Automatic Restart

 

```typescript

class AutoRestart {

  private maxRestarts = 3;

  private restartWindow = 60000; // 1 minute

  private restarts: number[] = [];

 

  setupErrorHandlers(): void {

    window.addEventListener('error', (event) => {

      console.error('Global error:', event.error);

      this.handleError(event.error);

    });

 

    window.addEventListener('unhandledrejection', (event) => {

      console.error('Unhandled rejection:', event.reason);

      this.handleError(event.reason);

    });

  }

 

  private handleError(error: any): void {

    // Check if we should restart

    if (this.shouldRestart(error)) {

      this.restart();

    } else {

      this.showErrorUI(error);

    }

  }

 

  private shouldRestart(error: any): boolean {

    // Don't restart for certain errors

    if (error.name === 'NetworkError') return false;

    if (error.name === 'PermissionError') return false;

 

    // Check restart frequency

    const now = Date.now();

    this.restarts = this.restarts.filter(t => now - t < this.restartWindow);

 

    return this.restarts.length < this.maxRestarts;

  }

 

  private restart(): void {

    console.log('Auto-restarting app...');

 

    // Save state

    const state = captureCurrentState();

    sessionStorage.setItem('restart-state', JSON.stringify(state));

 

    // Record restart

    this.restarts.push(Date.now());

    localStorage.setItem('restart-history', JSON.stringify(this.restarts));

 

    // Reload

    window.location.reload();

  }

 

  private showErrorUI(error: any): void {

    document.body.innerHTML = `

      <div class="error-screen">

        <h1>Something went wrong</h1>

        <p>${error.message}</p>

        <button onclick="location.reload()">Restart App</button>

      </div>

    `;

  }

}

 

// Usage

const autoRestart = new AutoRestart();

autoRestart.setupErrorHandlers();

```

 

---

 

## Complete Examples

 

### Example 1: Data Synchronization

 

App that syncs data in background and handles offline mode.

 

```typescript

class DataSyncApp {

  private db: any;

  private syncInterval: number | null = null;

  private isOnline = navigator.onLine;

 

  async initialize() {

    // Initialize local database

    this.db = await this.initializeDB();

 

    // Setup online/offline handlers

    this.setupNetworkHandlers();

 

    // Initial sync if online

    if (this.isOnline) {

      await this.sync();

    }

 

    // Start background sync

    this.startBackgroundSync();

 

    // Render UI

    this.render();

  }

 

  private setupNetworkHandlers() {

    window.addEventListener('online', async () => {

      console.log('Back online');

      this.isOnline = true;

      await this.sync();

      this.updateUI();

    });

 

    window.addEventListener('offline', () => {

      console.log('Gone offline');

      this.isOnline = false;

      this.updateUI();

    });

  }

 

  private startBackgroundSync() {

    this.syncInterval = setInterval(async () => {

      if (this.isOnline) {

        await this.sync();

      }

    }, 30000);

  }

 

  private async sync() {

    try {

      // Push local changes

      const localChanges = await this.db.getPendingChanges();

      if (localChanges.length > 0) {

        await this.pushChanges(localChanges);

      }

 

      // Pull remote changes

      const remoteChanges = await this.fetchRemoteChanges();

      if (remoteChanges.length > 0) {

        await this.applyRemoteChanges(remoteChanges);

      }

 

      console.log('Sync complete');

 

    } catch (error) {

      console.error('Sync failed:', error);

    }

  }

 

  cleanup() {

    if (this.syncInterval) {

      clearInterval(this.syncInterval);

    }

  }

}

 

webshell.ready(async () => {

  const app = new DataSyncApp();

  await app.initialize();

 

  window.addEventListener('beforeunload', () => {

    app.cleanup();

  });

});

```

 

### Example 2: Autosave with Conflict Resolution

 

Editor with automatic saving and conflict resolution.

 

```typescript

class AutosaveEditor {

  private editor: any;

  private saveTimeout: number | null = null;

  private lastSavedVersion: string = '';

  private currentVersion: string = '';

 

  async initialize() {

    this.editor = document.getElementById('editor');

 

    // Load document

    await this.loadDocument();

 

    // Setup autosave

    this.setupAutosave();

 

    // Check for conflicts periodically

    setInterval(() => this.checkForConflicts(), 10000);

  }

 

  private setupAutosave() {

    this.editor.addEventListener('input', () => {

      // Debounced save

      if (this.saveTimeout) {

        clearTimeout(this.saveTimeout);

      }

 

      this.saveTimeout = setTimeout(() => {

        this.save();

      }, 2000);

    });

  }

 

  private async save() {

    const content = this.editor.value;

    this.currentVersion = this.hashContent(content);

 

    try {

      await fetch('/api/documents/123', {

        method: 'PUT',

        body: JSON.stringify({

          content,

          version: this.currentVersion,

          previousVersion: this.lastSavedVersion

        })

      });

 

      this.lastSavedVersion = this.currentVersion;

      this.showSaveStatus('Saved');

 

    } catch (error: any) {

      if (error.code === 'CONFLICT') {

        await this.handleConflict();

      } else {

        this.showSaveStatus('Save failed');

      }

    }

  }

 

  private async handleConflict() {

    const shouldOverwrite = confirm(

      'Document was modified elsewhere. Overwrite remote changes?'

    );

 

    if (shouldOverwrite) {

      await this.forceSave();

    } else {

      await this.loadDocument();

    }

  }

 

  private hashContent(content: string): string {

    // Simple hash for demo

    return btoa(content).substring(0, 16);

  }

}

```

 

### Example 3: Graceful Shutdown

 

App that ensures all data is saved before closing.

 

```typescript

class GracefulApp {

  private saveQueue: Promise<void>[] = [];

  private isClosing = false;

 

  async initialize() {

    this.setupCloseHandler();

    await this.loadData();

  }

 

  private setupCloseHandler() {

    window.addEventListener('beforeunload', async (event) => {

      if (this.saveQueue.length > 0) {

        event.preventDefault();

        event.returnValue = 'Saving...';

 

        await this.finalizeSaves();

      }

    });

  }

 

  private async finalizeSaves() {

    this.isClosing = true;

 

    try {

      await Promise.all(this.saveQueue);

      console.log('All saves complete');

    } catch (error) {

      console.error('Some saves failed:', error);

    }

  }

 

  queueSave(saveOperation: Promise<void>) {

    this.saveQueue.push(saveOperation);

 

    saveOperation.finally(() => {

      const index = this.saveQueue.indexOf(saveOperation);

      if (index > -1) {

        this.saveQueue.splice(index, 1);

      }

    });

  }

}

 

webshell.ready(async () => {

  const app = new GracefulApp();

  await app.initialize();

});

```

 

---

 

## Best Practices

 

1. **Initialize Asynchronously**: Use async/await for clean initialization

2. **Clean Up Resources**: Always remove event listeners and clear timers

3. **Save User Data**: Persist state before closing

4. **Handle Errors**: Graceful degradation on initialization failures

5. **Progress Indicators**: Show loading states during initialization

6. **Lazy Load**: Initialize features on-demand for faster startup

7. **Background Tasks**: Use Web Workers for heavy computation

8. **Hot Reload**: Preserve state across development reloads

9. **Crash Recovery**: Implement crash detection and recovery

10. **Test Lifecycle**: Test initialization, runtime, and shutdown paths

 

---

 

## Related Documentation

 

- [SDK API Reference](../sdk-api-reference.md)

- [Window Management Guide](./window-management.md)

- [Inter-App Messaging Guide](./inter-app-messaging.md)

- [Best Practices](../best-practices.md)

 

