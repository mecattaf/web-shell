---
id: task-4.3
title: Implement window management API
status: Done
created_date: 2025-01-18
milestone: milestone-4
assignees: []
labels: [sdk, implementation]
dependencies: [task-4.2]
---

## Description

Implement the window management module that allows WebShell apps to control their window size, position, appearance, and state.

## Acceptance Criteria

- [x] Window module implemented
- [x] Size/position control working
- [x] Blur/transparency control functional
- [x] State management (minimize, maximize) working
- [x] Event handlers functional
- [x] Tests passing

## Implementation Plan

1. **Create Window Module**
```typescript
// src/modules/window.ts

import { Bridge } from '../bridge';
import { WindowSize, WindowPosition } from '../types';

export class WindowModule {
  private bridge: Bridge;
  private resizeHandlers: Set<(size: WindowSize) => void> = new Set();
  private moveHandlers: Set<(pos: WindowPosition) => void> = new Set();
  private focusHandlers: Set<() => void> = new Set();
  private blurHandlers: Set<() => void> = new Set();
  
  constructor(bridge: Bridge) {
    this.bridge = bridge;
    this.setupEventHandling();
  }
  
  // Size management
  getSize(): WindowSize {
    return this.bridge.call('window.getSize');
  }
  
  async setSize(width: number, height: number): Promise<void> {
    await this.bridge.call('window.setSize', { width, height });
  }
  
  async resize(width: number, height: number): Promise<void> {
    await this.setSize(width, height);
  }
  
  // Position management
  getPosition(): WindowPosition {
    return this.bridge.call('window.getPosition');
  }
  
  async setPosition(x: number, y: number): Promise<void> {
    await this.bridge.call('window.setPosition', { x, y });
  }
  
  async center(): Promise<void> {
    await this.bridge.call('window.center');
  }
  
  // Appearance
  async setBlur(enabled: boolean): Promise<void> {
    await this.bridge.call('window.setBlur', { enabled });
  }
  
  async setOpacity(opacity: number): Promise<void> {
    if (opacity < 0 || opacity > 1) {
      throw new Error('Opacity must be between 0 and 1');
    }
    await this.bridge.call('window.setOpacity', { opacity });
  }
  
  async setTransparency(enabled: boolean): Promise<void> {
    await this.bridge.call('window.setTransparency', { enabled });
  }
  
  // State
  async minimize(): Promise<void> {
    await this.bridge.call('window.minimize');
  }
  
  async maximize(): Promise<void> {
    await this.bridge.call('window.maximize');
  }
  
  async restore(): Promise<void> {
    await this.bridge.call('window.restore');
  }
  
  async focus(): Promise<void> {
    await this.bridge.call('window.focus');
  }
  
  async hide(): Promise<void> {
    await this.bridge.call('window.hide');
  }
  
  async show(): Promise<void> {
    await this.bridge.call('window.show');
  }
  
  // Event handlers
  onResize(handler: (size: WindowSize) => void): () => void {
    this.resizeHandlers.add(handler);
    return () => this.resizeHandlers.delete(handler);
  }
  
  onMove(handler: (pos: WindowPosition) => void): () => void {
    this.moveHandlers.add(handler);
    return () => this.moveHandlers.delete(handler);
  }
  
  onFocus(handler: () => void): () => void {
    this.focusHandlers.add(handler);
    return () => this.focusHandlers.delete(handler);
  }
  
  onBlur(handler: () => void): () => void {
    this.blurHandlers.add(handler);
    return () => this.blurHandlers.delete(handler);
  }
  
  private setupEventHandling(): void {
    this.bridge.on('window-resize', (size: WindowSize) => {
      this.resizeHandlers.forEach(handler => handler(size));
    });
    
    this.bridge.on('window-move', (pos: WindowPosition) => {
      this.moveHandlers.forEach(handler => handler(pos));
    });
    
    this.bridge.on('window-focus', () => {
      this.focusHandlers.forEach(handler => handler());
    });
    
    this.bridge.on('window-blur', () => {
      this.blurHandlers.forEach(handler => handler());
    });
  }
}
```

2. **Add QML Window Interface**
```qml
// In WebShellApi.qml
QtObject {
    id: api
    
    // Window reference
    property var windowView: null
    
    // Signals
    signal windowResized(int width, int height)
    signal windowMoved(int x, int y)
    signal windowFocused()
    signal windowBlurred()
    
    // Size
    function getSize() {
        return JSON.stringify({
            width: windowView.width,
            height: windowView.height
        });
    }
    
    function setSize(params) {
        const { width, height } = JSON.parse(params);
        windowView.width = width;
        windowView.height = height;
    }
    
    // Position
    function getPosition() {
        return JSON.stringify({
            x: windowView.x,
            y: windowView.y
        });
    }
    
    function setPosition(params) {
        const { x, y } = JSON.parse(params);
        windowView.x = x;
        windowView.y = y;
    }
    
    function center() {
        const parent = windowView.parent;
        windowView.x = (parent.width - windowView.width) / 2;
        windowView.y = (parent.height - windowView.height) / 2;
    }
    
    // Appearance
    function setBlur(params) {
        const { enabled } = JSON.parse(params);
        windowView.container.enableBlur = enabled;
    }
    
    function setOpacity(params) {
        const { opacity } = JSON.parse(params);
        windowView.opacity = opacity;
    }
    
    function setTransparency(params) {
        const { enabled } = JSON.parse(params);
        windowView.container.transparency = enabled;
    }
    
    // State
    function minimize() {
        // Minimize logic
        windowView.visible = false;
    }
    
    function maximize() {
        const parent = windowView.parent;
        windowView.x = 0;
        windowView.y = 0;
        windowView.width = parent.width;
        windowView.height = parent.height;
    }
    
    function restore() {
        // Restore to original size
        windowView.width = windowView.originalWidth;
        windowView.height = windowView.originalHeight;
    }
    
    function focus() {
        windowView.forceActiveFocus();
    }
    
    function hide() {
        windowView.visible = false;
    }
    
    function show() {
        windowView.visible = true;
    }
    
    // Monitor window changes
    Connections {
        target: windowView
        function onWidthChanged() {
            api.windowResized(windowView.width, windowView.height);
        }
        function onHeightChanged() {
            api.windowResized(windowView.width, windowView.height);
        }
        function onXChanged() {
            api.windowMoved(windowView.x, windowView.y);
        }
        function onYChanged() {
            api.windowMoved(windowView.x, windowView.y);
        }
        function onActiveFocusChanged() {
            if (windowView.activeFocus) {
                api.windowFocused();
            } else {
                api.windowBlurred();
            }
        }
    }
}
```

3. **Add Animation Support**
```typescript
// src/modules/window-animations.ts

export class WindowAnimations {
  constructor(private window: WindowModule) {}
  
  async slideIn(from: 'top' | 'bottom' | 'left' | 'right', duration = 250): Promise<void> {
    // Implementation would use CSS transitions
    const currentPos = this.window.getPosition();
    
    // Calculate start position based on direction
    let startX = currentPos.x;
    let startY = currentPos.y;
    
    switch (from) {
      case 'top':
        startY = -window.innerHeight;
        break;
      case 'bottom':
        startY = window.innerHeight;
        break;
      case 'left':
        startX = -window.innerWidth;
        break;
      case 'right':
        startX = window.innerWidth;
        break;
    }
    
    // Set start position
    await this.window.setPosition(startX, startY);
    
    // Animate to current position
    // (Implementation would use requestAnimationFrame or CSS)
    await this.animatePosition(currentPos.x, currentPos.y, duration);
  }
  
  async fadeIn(duration = 200): Promise<void> {
    await this.window.setOpacity(0);
    await this.animateOpacity(1, duration);
  }
  
  async scaleIn(duration = 200): Promise<void> {
    // Implementation would apply CSS transform
  }
  
  private async animatePosition(x: number, y: number, duration: number): Promise<void> {
    // Animation implementation
  }
  
  private async animateOpacity(opacity: number, duration: number): Promise<void> {
    // Animation implementation
  }
}
```

4. **Create Reactive Window State**
```typescript
// src/modules/window-state.ts

import { reactive, watch } from './reactivity';

export function createWindowState(window: WindowModule) {
  const state = reactive({
    size: window.getSize(),
    position: window.getPosition(),
    focused: false,
    minimized: false,
    maximized: false
  });
  
  // Sync with actual window
  window.onResize(size => {
    state.size = size;
  });
  
  window.onMove(pos => {
    state.position = pos;
  });
  
  window.onFocus(() => {
    state.focused = true;
  });
  
  window.onBlur(() => {
    state.focused = false;
  });
  
  // Watch for changes
  watch(() => state.size, (newSize) => {
    window.setSize(newSize.width, newSize.height);
  });
  
  return state;
}
```

## Technical Notes

**Usage Example**:
```typescript
import { webshell } from 'webshell-sdk';

// Resize window
await webshell.window.setSize(800, 600);

// Center window
await webshell.window.center();

// Enable blur
await webshell.window.setBlur(true);

// Listen for resize
webshell.window.onResize(size => {
  console.log('New size:', size);
});
```

**React Hook Example**:
```tsx
function useWindow() {
  const [size, setSize] = useState(webshell.window.getSize());
  
  useEffect(() => {
    return webshell.window.onResize(setSize);
  }, []);
  
  return {
    size,
    resize: (w, h) => webshell.window.setSize(w, h),
    center: () => webshell.window.center()
  };
}
```

**Constraints Enforcement**:
```typescript
// In QML
function setSize(params) {
    const { width, height } = JSON.parse(params);
    
    // Apply constraints from manifest
    const constrained = windowView.config.constrainSize(width, height);
    
    windowView.width = constrained.width;
    windowView.height = constrained.height;
}
```

## Reference Material

Study QuickShell window APIs:
```bash
grep -r "FloatingWindow" quickshell/
grep -r "PanelWindow" quickshell/
```

## Definition of Done

- Window module implemented
- All methods functional
- Event handlers working
- QML integration complete
- Tests passing
- Git commit: "task-4.3: Implement window management API"
