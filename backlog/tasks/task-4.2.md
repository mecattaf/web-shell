---
id: task-4.2
title: Implement core shell module
status: Done
created_date: 2025-01-18
completed_date: 2025-11-19
milestone: milestone-4
assignees: []
labels: [sdk, implementation]
dependencies: [task-4.1]
---

## Description

Implement the core shell module of the WebShell SDK. This provides app lifecycle management, inter-app communication, and access to the app registry.

## Acceptance Criteria

- [x] Shell module implemented
- [x] App metadata accessible
- [x] Inter-app messaging working
- [x] App registry access functional
- [x] Lifecycle hooks implemented
- [x] Error handling robust
- [x] Tests passing

## Implementation Plan

1. **Create Core Shell Module**
```typescript
// src/modules/shell.ts

import { Bridge } from '../bridge';
import { AppMessage, AppInfo, Manifest } from '../types';

export class ShellModule {
  private bridge: Bridge;
  private messageHandlers: Set<(msg: AppMessage) => void> = new Set();
  
  constructor(bridge: Bridge) {
    this.bridge = bridge;
    this.setupMessageHandling();
  }
  
  // App metadata
  get app() {
    return {
      getName: (): string => {
        return this.bridge.call('shell.getAppName');
      },
      
      getManifest: (): Manifest => {
        return this.bridge.call('shell.getManifest');
      },
      
      close: (): void => {
        this.bridge.call('shell.closeApp');
      },
      
      reload: (): void => {
        this.bridge.call('shell.reloadApp');
      }
    };
  }
  
  // Inter-app messaging
  async sendMessage(target: string, type: string, data: any): Promise<void> {
    await this.bridge.call('shell.sendMessage', {
      target,
      type,
      data
    });
  }
  
  async broadcast(type: string, data: any): Promise<void> {
    await this.bridge.call('shell.broadcast', {
      type,
      data
    });
  }
  
  onMessage(handler: (msg: AppMessage) => void): () => void {
    this.messageHandlers.add(handler);
    
    // Return unsubscribe function
    return () => {
      this.messageHandlers.delete(handler);
    };
  }
  
  private setupMessageHandling(): void {
    this.bridge.on('message', (msg: AppMessage) => {
      this.messageHandlers.forEach(handler => {
        try {
          handler(msg);
        } catch (err) {
          console.error('[WebShell] Message handler error:', err);
        }
      });
    });
  }
  
  // App registry
  async listApps(): Promise<AppInfo[]> {
    return this.bridge.call('shell.listApps');
  }
  
  async launchApp(name: string): Promise<void> {
    await this.bridge.call('shell.launchApp', { name });
  }
  
  async closeApp(name: string): Promise<void> {
    await this.bridge.call('shell.closeApp', { name });
  }
  
  async getAppInfo(name: string): Promise<AppInfo> {
    return this.bridge.call('shell.getAppInfo', { name });
  }
}
```

2. **Create Bridge Abstraction**
```typescript
// src/bridge.ts

import { QWebChannel } from './qwebchannel';

export class Bridge {
  private channel: any;
  private shell: any;
  private eventHandlers: Map<string, Set<Function>> = new Map();
  
  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!window.qt || !window.qt.webChannelTransport) {
        reject(new Error('QtWebChannel not available'));
        return;
      }
      
      new QWebChannel(window.qt.webChannelTransport, (channel) => {
        this.channel = channel;
        this.shell = channel.objects.shell;
        
        if (!this.shell) {
          reject(new Error('Shell API not available'));
          return;
        }
        
        this.setupEventForwarding();
        resolve();
      });
    });
  }
  
  async call(method: string, params?: any): Promise<any> {
    const parts = method.split('.');
    let obj = this.shell;
    
    // Navigate to the method
    for (let i = 0; i < parts.length - 1; i++) {
      obj = obj[parts[i]];
      if (!obj) {
        throw new Error(`Method not found: ${method}`);
      }
    }
    
    const methodName = parts[parts.length - 1];
    const fn = obj[methodName];
    
    if (typeof fn !== 'function') {
      throw new Error(`Not a function: ${method}`);
    }
    
    // Call the method
    return new Promise((resolve, reject) => {
      try {
        const result = params 
          ? fn.call(obj, params)
          : fn.call(obj);
        
        // Handle both sync and async results
        Promise.resolve(result)
          .then(resolve)
          .catch(reject);
      } catch (err) {
        reject(err);
      }
    });
  }
  
  on(event: string, handler: Function): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);
  }
  
  off(event: string, handler: Function): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }
  
  private setupEventForwarding(): void {
    // Connect QML signals to JS event handlers
    if (this.shell.messageReceived) {
      this.shell.messageReceived.connect((msg: string) => {
        const parsed = JSON.parse(msg);
        this.emit('message', parsed);
      });
    }
    
    if (this.shell.themeChanged) {
      this.shell.themeChanged.connect((theme: string) => {
        const parsed = JSON.parse(theme);
        this.emit('theme-change', parsed);
      });
    }
  }
  
  private emit(event: string, data: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (err) {
          console.error(`[Bridge] Event handler error (${event}):`, err);
        }
      });
    }
  }
}
```

3. **Add QML Bridge Interface**
```qml
// In WebShellApi.qml
QtObject {
    id: api
    
    property string appName: ""
    
    // Signals
    signal messageReceived(string message)
    signal themeChanged(string theme)
    
    // App info
    function getAppName() {
        return appName;
    }
    
    function getManifest() {
        const app = WebShellRegistry.apps[appName];
        return JSON.stringify(app.manifest);
    }
    
    function closeApp() {
        AppOrchestrator.closeApp(appName);
    }
    
    function reloadApp() {
        AppOrchestrator.reloadApp(appName);
    }
    
    // Inter-app messaging
    function sendMessage(params) {
        const msg = JSON.parse(params);
        AppMessaging.sendMessage(
            appName,
            msg.target,
            msg.type,
            msg.data
        );
    }
    
    function broadcast(params) {
        const msg = JSON.parse(params);
        AppMessaging.broadcast(appName, msg.type, msg.data);
    }
    
    // App registry
    function listApps() {
        const apps = WebShellRegistry.listApps();
        return JSON.stringify(apps);
    }
    
    function launchApp(params) {
        const { name } = JSON.parse(params);
        AppOrchestrator.launchApp(name);
    }
    
    function closeApp(params) {
        const { name } = JSON.parse(params);
        AppOrchestrator.closeApp(name);
    }
    
    function getAppInfo(params) {
        const { name } = JSON.parse(params);
        const app = WebShellRegistry.apps[name];
        return JSON.stringify(app);
    }
    
    // Connect to app messaging
    Connections {
        target: AppMessaging
        function onMessageReceived(msg) {
            if (msg.to === appName) {
                api.messageReceived(JSON.stringify(msg));
            }
        }
    }
}
```

4. **Create Types**
```typescript
// src/types.ts

export interface Manifest {
  version: string;
  name: string;
  displayName?: string;
  description?: string;
  entrypoint: string;
  permissions: Permissions;
  window?: WindowConfig;
}

export interface AppMessage {
  from: string;
  type: string;
  data: any;
  timestamp: number;
}

export interface AppInfo {
  name: string;
  displayName: string;
  description?: string;
  icon?: string;
  running: boolean;
}

export interface Permissions {
  calendar?: CalendarPermissions;
  filesystem?: FilesystemPermissions;
  network?: NetworkPermissions;
  notifications?: NotificationPermissions;
  processes?: ProcessPermissions;
}
```

5. **Add Lifecycle Management**
```typescript
// src/lifecycle.ts

export class LifecycleManager {
  private readyCallbacks: Function[] = [];
  private pauseCallbacks: Function[] = [];
  private resumeCallbacks: Function[] = [];
  private closeCallbacks: Function[] = [];
  
  private isReady = false;
  private isPaused = false;
  
  constructor(bridge: Bridge) {
    this.setupLifecycleHooks(bridge);
  }
  
  ready(callback: Function): void {
    if (this.isReady) {
      callback();
    } else {
      this.readyCallbacks.push(callback);
    }
  }
  
  onPause(callback: Function): void {
    this.pauseCallbacks.push(callback);
  }
  
  onResume(callback: Function): void {
    this.resumeCallbacks.push(callback);
  }
  
  onClose(callback: Function): void {
    this.closeCallbacks.push(callback);
  }
  
  private setupLifecycleHooks(bridge: Bridge): void {
    bridge.on('ready', () => {
      this.isReady = true;
      this.readyCallbacks.forEach(cb => cb());
      this.readyCallbacks = [];
    });
    
    bridge.on('pause', () => {
      this.isPaused = true;
      this.pauseCallbacks.forEach(cb => cb());
    });
    
    bridge.on('resume', () => {
      this.isPaused = false;
      this.resumeCallbacks.forEach(cb => cb());
    });
    
    bridge.on('close', () => {
      this.closeCallbacks.forEach(cb => cb());
    });
  }
}
```

6. **Create Main SDK Entry Point**
```typescript
// src/index.ts

import { Bridge } from './bridge';
import { ShellModule } from './modules/shell';
import { WindowModule } from './modules/window';
import { ThemeModule } from './modules/theme';
import { LifecycleManager } from './lifecycle';

class WebShellSDK {
  private bridge: Bridge;
  private lifecycle: LifecycleManager;
  
  public shell: ShellModule;
  public window: WindowModule;
  public theme: ThemeModule;
  // ... other modules
  
  constructor() {
    this.bridge = new Bridge();
    this.lifecycle = new LifecycleManager(this.bridge);
    
    // Initialize modules
    this.shell = new ShellModule(this.bridge);
    this.window = new WindowModule(this.bridge);
    this.theme = new ThemeModule(this.bridge);
  }
  
  async initialize(): Promise<void> {
    await this.bridge.initialize();
    this.lifecycle.ready(() => {
      console.log('[WebShell SDK] Ready');
    });
  }
  
  ready(callback: Function): void {
    this.lifecycle.ready(callback);
  }
  
  onMessage(handler: (msg: any) => void): () => void {
    return this.shell.onMessage(handler);
  }
}

// Global instance
const webshell = new WebShellSDK();

// Auto-initialize
if (typeof window !== 'undefined') {
  webshell.initialize().catch(err => {
    console.error('[WebShell SDK] Initialization failed:', err);
  });
}

export { webshell };
export default webshell;
```

## Technical Notes

**Usage Example**:
```typescript
import { webshell } from 'webshell-sdk';

webshell.ready(() => {
  console.log('App name:', webshell.shell.app.getName());
  
  // Listen for messages
  webshell.onMessage(msg => {
    console.log('Received:', msg);
  });
  
  // Send a message
  webshell.shell.sendMessage('email', 'open', {
    messageId: '12345'
  });
});
```

**Error Handling**:
```typescript
try {
  await webshell.shell.launchApp('calendar');
} catch (err) {
  if (err.code === 'APP_NOT_FOUND') {
    console.error('Calendar app not installed');
  }
}
```

**QML Signal Connection**:
```qml
// In WebShellApi.qml
Connections {
    target: AppOrchestrator
    function onAppFocused(appName) {
        if (appName === api.appName) {
            api.appResumed();
        }
    }
}
```

## Reference Material

Study QWebChannel usage:
```bash
find . -name "qwebchannel.js"
```

## Definition of Done

- Shell module implemented
- Bridge abstraction working
- QML interface complete
- Lifecycle management functional
- Tests passing
- Git commit: "task-4.2: Implement core shell module"
