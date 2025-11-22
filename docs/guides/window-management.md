# Window Management Guide

 

Complete guide to controlling window size, position, appearance, and behavior in WebShell applications.

 

## Table of Contents

 

1. [Overview](#overview)

2. [Window Lifecycle](#window-lifecycle)

3. [Size & Position Control](#size--position-control)

4. [Visual Effects](#visual-effects)

5. [Responsive Window Sizing](#responsive-window-sizing)

6. [Window State Persistence](#window-state-persistence)

7. [Multi-Window Applications](#multi-window-applications)

8. [Platform-Specific Considerations](#platform-specific-considerations)

9. [Complete Examples](#complete-examples)

 

---

 

## Overview

 

WebShell provides comprehensive window management APIs that allow apps to control every aspect of their window behavior, from basic size/position to advanced visual effects.

 

### Key Features

 

- **Declarative configuration** via manifest

- **Runtime control** via SDK APIs

- **Smooth animations** built-in

- **State persistence** across sessions

- **Multi-window support** for complex apps

- **Platform-aware** behavior

 

### Window Types

 

WebShell supports four window types, each with specific defaults:

 

| Type | Use Case | Floating | Resizable | Typical Size |

|------|----------|----------|-----------|--------------|

| **widget** | Standard apps | Yes | Yes | 800x600 |

| **panel** | Toolbars, docks | No | No | Full width, 60px high |

| **overlay** | Fullscreen UI | Yes | No | Full screen |

| **dialog** | Modals, prompts | Yes | No | 400x300 |

 

---

 

## Window Lifecycle

 

### Lifecycle Stages

 

```

Created → Initializing → Ready → Active → Hidden → Closing → Destroyed

```

 

### Lifecycle Events

 

```typescript

webshell.ready(() => {

  console.log('Window ready');

 

  // Listen for window events

  const unsubscribeResize = webshell.window.onResize((size) => {

    console.log('Window resized:', size);

  });

 

  const unsubscribeMove = webshell.window.onMove((position) => {

    console.log('Window moved:', position);

  });

 

  const unsubscribeFocus = webshell.window.onFocus(() => {

    console.log('Window focused');

  });

 

  const unsubscribeBlur = webshell.window.onBlur(() => {

    console.log('Window lost focus');

  });

 

  // Clean up on close

  window.addEventListener('beforeunload', () => {

    unsubscribeResize();

    unsubscribeMove();

    unsubscribeFocus();

    unsubscribeBlur();

  });

});

```

 

### Initial Window Configuration

 

Define initial window properties in `webshell.json`:

 

```json

{

  "window": {

    "type": "widget",

    "width": 1024,

    "height": 768,

    "minWidth": 640,

    "minHeight": 480,

    "position": "center",

    "resizable": true,

    "movable": true,

    "blur": true,

    "transparency": true

  }

}

```

 

---

 

## Size & Position Control

 

### Getting Window Size

 

```typescript

// Get current size

const size = webshell.window.getSize();

console.log(`Window is ${size.width}x${size.height}`);

 

// Check against minimum

const minSize = webshell.window.getMinSize();

const maxSize = webshell.window.getMaxSize();

```

 

### Setting Window Size

 

```typescript

// Set exact size

webshell.window.setSize(800, 600);

 

// Set with constraints

function resizeWithConstraints(width: number, height: number) {

  const min = webshell.window.getMinSize();

  const max = webshell.window.getMaxSize();

 

  const w = Math.max(min.width, Math.min(width, max.width));

  const h = Math.max(min.height, Math.min(height, max.height));

 

  webshell.window.setSize(w, h);

}

 

resizeWithConstraints(1920, 1080);

```

 

### Aspect Ratio Lock

 

```typescript

class AspectRatioWindow {

  private aspectRatio: number;

 

  constructor(ratio: number) {

    this.aspectRatio = ratio;

 

    webshell.window.onResize((size) => {

      this.maintainAspectRatio(size);

    });

  }

 

  private maintainAspectRatio(size: { width: number; height: number }) {

    const expectedHeight = size.width / this.aspectRatio;

 

    if (Math.abs(size.height - expectedHeight) > 1) {

      webshell.window.setSize(size.width, expectedHeight);

    }

  }

 

  setSize(width: number) {

    const height = width / this.aspectRatio;

    webshell.window.setSize(width, height);

  }

}

 

// Usage: 16:9 aspect ratio

const window = new AspectRatioWindow(16 / 9);

window.setSize(1280); // Sets 1280x720

```

 

### Getting Window Position

 

```typescript

// Get current position

const pos = webshell.window.getPosition();

console.log(`Window at (${pos.x}, ${pos.y})`);

 

// Check screen bounds

const screen = webshell.window.getScreenGeometry();

console.log('Screen size:', screen.width, 'x', screen.height);

```

 

### Setting Window Position

 

```typescript

// Absolute positioning

webshell.window.setPosition(100, 100);

 

// Center on screen

webshell.window.center();

 

// Named positions

function moveToPosition(position: string) {

  const screen = webshell.window.getScreenGeometry();

  const size = webshell.window.getSize();

 

  let x = 0, y = 0;

 

  switch (position) {

    case 'top-left':

      x = 0; y = 0;

      break;

    case 'top-center':

      x = (screen.width - size.width) / 2;

      y = 0;

      break;

    case 'top-right':

      x = screen.width - size.width;

      y = 0;

      break;

    case 'center':

      x = (screen.width - size.width) / 2;

      y = (screen.height - size.height) / 2;

      break;

    case 'bottom-right':

      x = screen.width - size.width;

      y = screen.height - size.height;

      break;

    // Add more positions as needed

  }

 

  webshell.window.setPosition(x, y);

}

 

moveToPosition('top-right');

```

 

### Edge Snapping

 

```typescript

class EdgeSnapping {

  private snapThreshold = 20; // pixels

 

  enable() {

    webshell.window.onMove((pos) => {

      const snapped = this.snapToEdge(pos);

      if (snapped.x !== pos.x || snapped.y !== pos.y) {

        webshell.window.setPosition(snapped.x, snapped.y);

      }

    });

  }

 

  private snapToEdge(pos: { x: number; y: number }) {

    const screen = webshell.window.getScreenGeometry();

    const size = webshell.window.getSize();

 

    let { x, y } = pos;

 

    // Snap to left edge

    if (x < this.snapThreshold) {

      x = 0;

    }

 

    // Snap to right edge

    if (screen.width - (x + size.width) < this.snapThreshold) {

      x = screen.width - size.width;

    }

 

    // Snap to top edge

    if (y < this.snapThreshold) {

      y = 0;

    }

 

    // Snap to bottom edge

    if (screen.height - (y + size.height) < this.snapThreshold) {

      y = screen.height - size.height;

    }

 

    return { x, y };

  }

}

 

// Usage

const snapping = new EdgeSnapping();

snapping.enable();

```

 

### Window State Control

 

```typescript

// Minimize window

webshell.window.minimize();

 

// Maximize window

webshell.window.maximize();

 

// Restore to normal size

webshell.window.restore();

 

// Toggle maximize

function toggleMaximize() {

  const state = webshell.window.getState();

  if (state === 'maximized') {

    webshell.window.restore();

  } else {

    webshell.window.maximize();

  }

}

 

// Focus window

webshell.window.focus();

 

// Check if focused

const isFocused = webshell.window.isFocused();

```

 

---

 

## Visual Effects

 

### Blur Effect

 

Apply background blur to window for modern glass effect.

 

```typescript

// Enable blur

webshell.window.setBlur(true);

 

// Adjust blur radius (0-100)

webshell.window.setBlurRadius(20);

 

// Disable blur

webshell.window.setBlur(false);

 

// Animated blur transition

async function animateBlur(from: number, to: number, duration = 300) {

  const steps = 30;

  const stepDuration = duration / steps;

  const increment = (to - from) / steps;

 

  for (let i = 0; i < steps; i++) {

    const radius = from + (increment * i);

    webshell.window.setBlurRadius(radius);

    await new Promise(resolve => setTimeout(resolve, stepDuration));

  }

 

  webshell.window.setBlurRadius(to);

}

 

// Usage

await animateBlur(0, 20); // Fade in blur

```

 

### Transparency

 

Control window transparency for overlay effects.

 

```typescript

// Enable transparency

webshell.window.setTransparency(true);

 

// Set opacity (0.0 - 1.0)

webshell.window.setOpacity(0.95);

 

// Fade in animation

async function fadeIn(duration = 500) {

  const steps = 50;

  const stepDuration = duration / steps;

 

  webshell.window.setOpacity(0);

  webshell.window.setTransparency(true);

 

  for (let i = 0; i <= steps; i++) {

    webshell.window.setOpacity(i / steps);

    await new Promise(resolve => setTimeout(resolve, stepDuration));

  }

}

 

// Fade out animation

async function fadeOut(duration = 500) {

  const steps = 50;

  const stepDuration = duration / steps;

 

  for (let i = steps; i >= 0; i--) {

    webshell.window.setOpacity(i / steps);

    await new Promise(resolve => setTimeout(resolve, stepDuration));

  }

}

 

// Usage

await fadeIn(); // Fade in over 500ms

```

 

### Combining Effects

 

```typescript

class GlassWindow {

  async show() {

    // Start transparent

    webshell.window.setTransparency(true);

    webshell.window.setOpacity(0);

    webshell.window.setBlur(false);

 

    // Fade in with blur

    const steps = 30;

    for (let i = 0; i <= steps; i++) {

      const progress = i / steps;

      webshell.window.setOpacity(progress * 0.95);

      webshell.window.setBlurRadius(progress * 20);

      webshell.window.setBlur(true);

      await new Promise(resolve => setTimeout(resolve, 10));

    }

  }

 

  async hide() {

    const steps = 30;

    for (let i = steps; i >= 0; i--) {

      const progress = i / steps;

      webshell.window.setOpacity(progress * 0.95);

      webshell.window.setBlurRadius(progress * 20);

      await new Promise(resolve => setTimeout(resolve, 10));

    }

 

    webshell.window.setBlur(false);

  }

}

 

// Usage

const glassWindow = new GlassWindow();

await glassWindow.show();

```

 

---

 

## Responsive Window Sizing

 

### Breakpoint-Based Layouts

 

```typescript

type Breakpoint = 'mobile' | 'tablet' | 'desktop' | 'large';

 

class ResponsiveWindow {

  private currentBreakpoint: Breakpoint = 'desktop';

 

  constructor() {

    this.updateBreakpoint();

    webshell.window.onResize(() => this.updateBreakpoint());

  }

 

  private updateBreakpoint() {

    const { width } = webshell.window.getSize();

 

    let breakpoint: Breakpoint;

    if (width < 640) {

      breakpoint = 'mobile';

    } else if (width < 1024) {

      breakpoint = 'tablet';

    } else if (width < 1920) {

      breakpoint = 'desktop';

    } else {

      breakpoint = 'large';

    }

 

    if (breakpoint !== this.currentBreakpoint) {

      this.currentBreakpoint = breakpoint;

      this.onBreakpointChange(breakpoint);

    }

  }

 

  private onBreakpointChange(breakpoint: Breakpoint) {

    document.body.className = `breakpoint-${breakpoint}`;

    console.log('Breakpoint changed:', breakpoint);

 

    // Dispatch custom event

    window.dispatchEvent(new CustomEvent('breakpoint-change', {

      detail: { breakpoint }

    }));

  }

 

  getBreakpoint(): Breakpoint {

    return this.currentBreakpoint;

  }

}

 

// Usage

const responsive = new ResponsiveWindow();

 

window.addEventListener('breakpoint-change', (e: any) => {

  const { breakpoint } = e.detail;

 

  if (breakpoint === 'mobile') {

    // Adjust UI for mobile

    document.getElementById('sidebar')?.classList.add('hidden');

  } else {

    document.getElementById('sidebar')?.classList.remove('hidden');

  }

});

```

 

### Automatic Layout Adjustment

 

```typescript

class AdaptiveLayout {

  private minContentWidth = 600;

 

  constructor() {

    webshell.window.onResize(() => this.adjustLayout());

    this.adjustLayout();

  }

 

  private adjustLayout() {

    const { width } = webshell.window.getSize();

 

    if (width < this.minContentWidth) {

      this.switchToCompactMode();

    } else {

      this.switchToFullMode();

    }

  }

 

  private switchToCompactMode() {

    document.body.classList.add('compact');

    document.body.classList.remove('full');

 

    // Hide optional UI elements

    document.querySelectorAll('.optional').forEach(el => {

      (el as HTMLElement).style.display = 'none';

    });

  }

 

  private switchToFullMode() {

    document.body.classList.add('full');

    document.body.classList.remove('compact');

 

    // Show optional UI elements

    document.querySelectorAll('.optional').forEach(el => {

      (el as HTMLElement).style.display = '';

    });

  }

}

 

// Usage

const layout = new AdaptiveLayout();

```

 

### Font Scaling

 

```typescript

class FontScaler {

  private baseSize = 16;

  private minSize = 12;

  private maxSize = 20;

 

  constructor() {

    webshell.window.onResize(() => this.updateFontSize());

    this.updateFontSize();

  }

 

  private updateFontSize() {

    const { width } = webshell.window.getSize();

 

    // Scale font based on window width

    // 800px = 16px, 400px = 12px, 1600px = 20px

    let fontSize = this.baseSize * (width / 800);

    fontSize = Math.max(this.minSize, Math.min(fontSize, this.maxSize));

 

    document.documentElement.style.fontSize = `${fontSize}px`;

  }

}

 

// Usage

const scaler = new FontScaler();

```

 

---

 

## Window State Persistence

 

### Saving Window State

 

```typescript

interface WindowState {

  width: number;

  height: number;

  x: number;

  y: number;

  maximized: boolean;

}

 

class WindowStatePersistence {

  private storageKey = 'window-state';

 

  constructor() {

    this.loadState();

    this.setupAutoSave();

  }

 

  private loadState() {

    const savedState = localStorage.getItem(this.storageKey);

    if (!savedState) return;

 

    try {

      const state: WindowState = JSON.parse(savedState);

 

      // Restore size

      webshell.window.setSize(state.width, state.height);

 

      // Restore position

      webshell.window.setPosition(state.x, state.y);

 

      // Restore maximized state

      if (state.maximized) {

        webshell.window.maximize();

      }

 

      console.log('Window state restored');

    } catch (error) {

      console.error('Failed to restore window state:', error);

    }

  }

 

  private saveState() {

    const state: WindowState = {

      ...webshell.window.getSize(),

      ...webshell.window.getPosition(),

      maximized: webshell.window.getState() === 'maximized'

    };

 

    localStorage.setItem(this.storageKey, JSON.stringify(state));

  }

 

  private setupAutoSave() {

    // Debounced save

    let saveTimeout: number;

 

    const debouncedSave = () => {

      clearTimeout(saveTimeout);

      saveTimeout = setTimeout(() => this.saveState(), 500);

    };

 

    webshell.window.onResize(debouncedSave);

    webshell.window.onMove(debouncedSave);

 

    // Save on close

    window.addEventListener('beforeunload', () => this.saveState());

  }

}

 

// Usage

const persistence = new WindowStatePersistence();

```

 

### Multi-Monitor Persistence

 

```typescript

interface MultiMonitorState extends WindowState {

  screenId: string;

  screenWidth: number;

  screenHeight: number;

}

 

class MultiMonitorPersistence {

  private storageKey = 'window-state-multi';

 

  private getCurrentScreenId(): string {

    const screens = webshell.window.getScreens();

    const pos = webshell.window.getPosition();

 

    // Find which screen contains the window

    for (const screen of screens) {

      if (

        pos.x >= screen.x &&

        pos.x < screen.x + screen.width &&

        pos.y >= screen.y &&

        pos.y < screen.y + screen.height

      ) {

        return screen.id;

      }

    }

 

    return screens[0]?.id || 'primary';

  }

 

  saveState() {

    const screen = webshell.window.getScreenGeometry();

 

    const state: MultiMonitorState = {

      ...webshell.window.getSize(),

      ...webshell.window.getPosition(),

      maximized: webshell.window.getState() === 'maximized',

      screenId: this.getCurrentScreenId(),

      screenWidth: screen.width,

      screenHeight: screen.height

    };

 

    localStorage.setItem(this.storageKey, JSON.stringify(state));

  }

 

  loadState() {

    const savedState = localStorage.getItem(this.storageKey);

    if (!savedState) return;

 

    const state: MultiMonitorState = JSON.parse(savedState);

    const currentScreen = webshell.window.getScreenGeometry();

 

    // Check if screen configuration changed

    if (

      state.screenWidth !== currentScreen.width ||

      state.screenHeight !== currentScreen.height

    ) {

      console.log('Screen configuration changed, using defaults');

      webshell.window.center();

      return;

    }

 

    // Restore state

    webshell.window.setSize(state.width, state.height);

    webshell.window.setPosition(state.x, state.y);

 

    if (state.maximized) {

      webshell.window.maximize();

    }

  }

}

```

 

---

 

## Multi-Window Applications

 

### Window Manager

 

```typescript

interface ManagedWindow {

  id: string;

  type: 'main' | 'secondary' | 'dialog';

  handle: Window;

}

 

class WindowManager {

  private windows = new Map<string, ManagedWindow>();

 

  async openWindow(

    id: string,

    url: string,

    type: 'main' | 'secondary' | 'dialog',

    config?: Partial<WindowConfig>

  ): Promise<string> {

    const windowHandle = window.open(url, id);

    if (!windowHandle) {

      throw new Error('Failed to open window');

    }

 

    this.windows.set(id, { id, type, handle: windowHandle });

 

    // Configure window

    if (config) {

      // Wait for window to load

      windowHandle.addEventListener('load', () => {

        this.configureWindow(windowHandle, config);

      });

    }

 

    return id;

  }

 

  private configureWindow(win: Window, config: Partial<WindowConfig>) {

    // Access webshell API in the new window

    const windowWebShell = (win as any).webshell;

    if (!windowWebShell) return;

 

    if (config.width && config.height) {

      windowWebShell.window.setSize(config.width, config.height);

    }

 

    if (config.x !== undefined && config.y !== undefined) {

      windowWebShell.window.setPosition(config.x, config.y);

    }

 

    if (config.blur !== undefined) {

      windowWebShell.window.setBlur(config.blur);

    }

  }

 

  closeWindow(id: string) {

    const window = this.windows.get(id);

    if (window) {

      window.handle.close();

      this.windows.delete(id);

    }

  }

 

  closeAll() {

    this.windows.forEach(window => {

      window.handle.close();

    });

    this.windows.clear();

  }

 

  getWindow(id: string): ManagedWindow | undefined {

    return this.windows.get(id);

  }

 

  getAllWindows(): ManagedWindow[] {

    return Array.from(this.windows.values());

  }

}

 

// Usage

const windowManager = new WindowManager();

 

// Open settings window

await windowManager.openWindow(

  'settings',

  '/settings.html',

  'dialog',

  { width: 600, height: 400, blur: true }

);

 

// Close settings

windowManager.closeWindow('settings');

```

 

### Window Communication

 

```typescript

class WindowCommunication {

  private messageHandlers = new Map<string, Function[]>();

 

  constructor(private windowManager: WindowManager) {

    this.setupMessageListener();

  }

 

  private setupMessageListener() {

    window.addEventListener('message', (event) => {

      const { type, data } = event.data;

      const handlers = this.messageHandlers.get(type);

 

      if (handlers) {

        handlers.forEach(handler => handler(data, event.source));

      }

    });

  }

 

  send(windowId: string, type: string, data: any) {

    const window = this.windowManager.getWindow(windowId);

    if (window) {

      window.handle.postMessage({ type, data }, '*');

    }

  }

 

  broadcast(type: string, data: any) {

    const windows = this.windowManager.getAllWindows();

    windows.forEach(window => {

      window.handle.postMessage({ type, data }, '*');

    });

  }

 

  on(type: string, handler: Function) {

    if (!this.messageHandlers.has(type)) {

      this.messageHandlers.set(type, []);

    }

    this.messageHandlers.get(type)!.push(handler);

  }

}

 

// Usage

const comm = new WindowCommunication(windowManager);

 

// In main window

comm.on('settings-changed', (settings) => {

  console.log('Settings updated:', settings);

  applySettings(settings);

});

 

// In settings window

comm.send('main', 'settings-changed', {

  theme: 'dark',

  fontSize: 16

});

```

 

---

 

## Platform-Specific Considerations

 

### macOS

 

```typescript

class MacOSWindowFeatures {

  enableTrafficLights() {

    // macOS-specific window controls

    webshell.window.setNativeTitleBar(true);

  }

 

  enableVibrancy() {

    // Use macOS vibrancy effect

    webshell.window.setBlur(true);

    webshell.window.setBlurRadius(30);

    webshell.window.setTransparency(true);

    webshell.window.setOpacity(0.95);

  }

 

  setupTouchBar() {

    // Configure Touch Bar (if supported)

    if (webshell.platform.hasTouchBar) {

      webshell.platform.configureTouchBar({

        items: [

          { type: 'button', label: 'Save', action: 'save' },

          { type: 'button', label: 'Export', action: 'export' }

        ]

      });

    }

  }

}

```

 

### Linux (Wayland)

 

```typescript

class WaylandWindowFeatures {

  setupGtk() {

    // GTK-specific features

    webshell.window.setDecorated(true);

    webshell.window.setSkipTaskbar(false);

  }

 

  enableBlur() {

    // Wayland blur requires compositor support

    if (webshell.platform.supportsBlur) {

      webshell.window.setBlur(true);

    } else {

      console.warn('Compositor does not support blur');

      // Fallback: use semi-transparent background

      document.body.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';

    }

  }

}

```

 

### Windows

 

```typescript

class WindowsWindowFeatures {

  enableAcrylicBlur() {

    // Windows 10+ Acrylic effect

    if (webshell.platform.supportsAcrylic) {

      webshell.window.setAcrylicBlur(true);

    } else {

      webshell.window.setBlur(true);

    }

  }

 

  enableSnapAssist() {

    // Windows Snap Assist integration

    webshell.window.setSnapAssist(true);

  }

}

```

 

### Platform Detection

 

```typescript

function applyPlatformFeatures() {

  const platform = webshell.platform.getName();

 

  switch (platform) {

    case 'macos':

      const mac = new MacOSWindowFeatures();

      mac.enableVibrancy();

      break;

 

    case 'linux':

      const linux = new WaylandWindowFeatures();

      linux.enableBlur();

      break;

 

    case 'windows':

      const win = new WindowsWindowFeatures();

      win.enableAcrylicBlur();

      break;

  }

}

 

webshell.ready(() => {

  applyPlatformFeatures();

});

```

 

---

 

## Complete Examples

 

### Example 1: Floating Widget

 

A small, always-on-top widget that follows the cursor.

 

```typescript

// manifest.json

{

  "window": {

    "type": "widget",

    "width": 200,

    "height": 150,

    "blur": true,

    "transparency": true,

    "resizable": false,

    "movable": true

  }

}

 

// floating-widget.ts

class FloatingWidget {

  private isDragging = false;

  private dragOffset = { x: 0, y: 0 };

 

  constructor() {

    this.setupDragging();

    this.setupEffects();

  }

 

  private setupDragging() {

    const header = document.getElementById('widget-header')!;

 

    header.addEventListener('mousedown', (e) => {

      this.isDragging = true;

      const pos = webshell.window.getPosition();

      this.dragOffset = {

        x: e.clientX,

        y: e.clientY

      };

    });

 

    window.addEventListener('mousemove', (e) => {

      if (!this.isDragging) return;

 

      const pos = webshell.window.getPosition();

      const newX = pos.x + (e.clientX - this.dragOffset.x);

      const newY = pos.y + (e.clientY - this.dragOffset.y);

 

      webshell.window.setPosition(newX, newY);

 

      this.dragOffset = { x: e.clientX, y: e.clientY };

    });

 

    window.addEventListener('mouseup', () => {

      this.isDragging = false;

    });

  }

 

  private setupEffects() {

    // Glass effect

    webshell.window.setBlur(true);

    webshell.window.setBlurRadius(20);

    webshell.window.setOpacity(0.95);

 

    // Focus effect

    webshell.window.onFocus(() => {

      webshell.window.setOpacity(0.95);

    });

 

    webshell.window.onBlur(() => {

      webshell.window.setOpacity(0.7);

    });

  }

}

 

webshell.ready(() => {

  const widget = new FloatingWidget();

});

```

 

### Example 2: Fullscreen Application

 

An app that toggles between windowed and fullscreen modes.

 

```typescript

class FullscreenApp {

  private isFullscreen = false;

  private previousState: WindowState | null = null;

 

  toggleFullscreen() {

    if (this.isFullscreen) {

      this.exitFullscreen();

    } else {

      this.enterFullscreen();

    }

  }

 

  private async enterFullscreen() {

    // Save current state

    this.previousState = {

      ...webshell.window.getSize(),

      ...webshell.window.getPosition(),

      maximized: webshell.window.getState() === 'maximized'

    };

 

    // Get screen size

    const screen = webshell.window.getScreenGeometry();

 

    // Animate to fullscreen

    const steps = 20;

    const currentSize = webshell.window.getSize();

    const currentPos = webshell.window.getPosition();

 

    for (let i = 1; i <= steps; i++) {

      const progress = i / steps;

 

      const width = currentSize.width + (screen.width - currentSize.width) * progress;

      const height = currentSize.height + (screen.height - currentSize.height) * progress;

      const x = currentPos.x - currentPos.x * progress;

      const y = currentPos.y - currentPos.y * progress;

 

      webshell.window.setSize(width, height);

      webshell.window.setPosition(x, y);

 

      await new Promise(resolve => setTimeout(resolve, 10));

    }

 

    this.isFullscreen = true;

    document.body.classList.add('fullscreen');

  }

 

  private async exitFullscreen() {

    if (!this.previousState) return;

 

    // Animate back to previous size

    const screen = webshell.window.getScreenGeometry();

    const steps = 20;

 

    for (let i = 1; i <= steps; i++) {

      const progress = i / steps;

 

      const width = screen.width + (this.previousState.width - screen.width) * progress;

      const height = screen.height + (this.previousState.height - screen.height) * progress;

      const x = this.previousState.x * progress;

      const y = this.previousState.y * progress;

 

      webshell.window.setSize(width, height);

      webshell.window.setPosition(x, y);

 

      await new Promise(resolve => setTimeout(resolve, 10));

    }

 

    this.isFullscreen = false;

    document.body.classList.remove('fullscreen');

    this.previousState = null;

  }

}

 

// Usage

const app = new FullscreenApp();

 

// F11 to toggle

window.addEventListener('keydown', (e) => {

  if (e.key === 'F11') {

    e.preventDefault();

    app.toggleFullscreen();

  }

});

```

 

### Example 3: Resizable Sidebar

 

A sidebar panel that can be resized by dragging.

 

```typescript

class ResizableSidebar {

  private minWidth = 200;

  private maxWidth = 600;

  private isResizing = false;

 

  constructor() {

    this.setupResize();

    this.setupPosition();

  }

 

  private setupResize() {

    const handle = document.getElementById('resize-handle')!;

 

    handle.addEventListener('mousedown', () => {

      this.isResizing = true;

      document.body.style.cursor = 'ew-resize';

    });

 

    window.addEventListener('mousemove', (e) => {

      if (!this.isResizing) return;

 

      const width = Math.max(

        this.minWidth,

        Math.min(e.clientX, this.maxWidth)

      );

 

      webshell.window.setSize(width, window.innerHeight);

    });

 

    window.addEventListener('mouseup', () => {

      if (this.isResizing) {

        this.isResizing = false;

        document.body.style.cursor = '';

      }

    });

  }

 

  private setupPosition() {

    // Always stick to right edge of screen

    const updatePosition = () => {

      const screen = webshell.window.getScreenGeometry();

      const size = webshell.window.getSize();

 

      webshell.window.setPosition(

        screen.width - size.width,

        0

      );

 

      webshell.window.setSize(size.width, screen.height);

    };

 

    updatePosition();

 

    webshell.window.onResize(updatePosition);

  }

}

 

webshell.ready(() => {

  const sidebar = new ResizableSidebar();

});

```

 

---

 

## Best Practices

 

### 1. Set Appropriate Constraints

 

Always define minimum and maximum window sizes:

 

```json

{

  "window": {

    "minWidth": 400,

    "minHeight": 300,

    "maxWidth": 1920,

    "maxHeight": 1080

  }

}

```

 

### 2. Save Window State

 

Persist window size and position for better UX:

 

```typescript

const persistence = new WindowStatePersistence();

```

 

### 3. Handle Screen Changes

 

React to screen resolution changes:

 

```typescript

window.addEventListener('resize', () => {

  const screen = webshell.window.getScreenGeometry();

  // Adjust layout

});

```

 

### 4. Use Smooth Animations

 

Animate size/position changes for polish:

 

```typescript

async function smoothResize(targetWidth: number, targetHeight: number) {

  const current = webshell.window.getSize();

  const steps = 20;

 

  for (let i = 1; i <= steps; i++) {

    const progress = i / steps;

    const width = current.width + (targetWidth - current.width) * progress;

    const height = current.height + (targetHeight - current.height) * progress;

 

    webshell.window.setSize(width, height);

    await new Promise(resolve => setTimeout(resolve, 10));

  }

}

```

 

### 5. Validate Positions

 

Ensure windows stay within screen bounds:

 

```typescript

function ensureOnScreen() {

  const pos = webshell.window.getPosition();

  const size = webshell.window.getSize();

  const screen = webshell.window.getScreenGeometry();

 

  const x = Math.max(0, Math.min(pos.x, screen.width - size.width));

  const y = Math.max(0, Math.min(pos.y, screen.height - size.height));

 

  if (x !== pos.x || y !== pos.y) {

    webshell.window.setPosition(x, y);

  }

}

```

 

---

 

## Related Documentation

 

- [Window Configuration](../window-configuration.md)

- [SDK API Reference](../sdk-api-reference.md)

- [Manifest Reference](../manifest-reference.md)

- [App Lifecycle Guide](./app-lifecycle.md)

 

