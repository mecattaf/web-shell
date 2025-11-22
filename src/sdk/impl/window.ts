/**
 * WebShell SDK Window Module Implementation
 *
 * Implements window management, positioning, and appearance control
 */

import { BridgeAdapter } from './bridge';
import type { WindowModule } from '../window';
import type { WindowSize, WindowPosition, UnsubscribeFn, EventHandler } from '../types';

/**
 * Implementation of the Window module
 */
export class WindowModuleImpl implements WindowModule {
  private bridge: BridgeAdapter;
  private resizeHandlers: Set<EventHandler<WindowSize>> = new Set();
  private moveHandlers: Set<EventHandler<WindowPosition>> = new Set();
  private focusHandlers: Set<EventHandler<void>> = new Set();
  private blurHandlers: Set<EventHandler<void>> = new Set();

  constructor(bridge: BridgeAdapter) {
    this.bridge = bridge;
    this.setupEventHandling();
  }

  /**
   * Get current window size
   */
  getSize(): WindowSize {
    return this.cachedSize;
  }

  /**
   * Set window size
   */
  setSize(width: number, height: number): void {
    this.bridge.call('window.setSize', { width, height }).catch(err => {
      console.error('[Window] Failed to set size:', err);
    });
  }

  /**
   * Resize window (alias for setSize)
   */
  resize(width: number, height: number): void {
    this.setSize(width, height);
  }

  /**
   * Get current window position
   */
  getPosition(): WindowPosition {
    return this.cachedPosition;
  }

  /**
   * Set window position
   */
  setPosition(x: number, y: number): void {
    this.bridge.call('window.setPosition', { x, y }).catch(err => {
      console.error('[Window] Failed to set position:', err);
    });
  }

  /**
   * Center window on screen
   */
  center(): void {
    this.bridge.call('window.center').catch(err => {
      console.error('[Window] Failed to center window:', err);
    });
  }

  /**
   * Enable or disable window blur effect
   */
  setBlur(enabled: boolean): void {
    this.bridge.call('window.setBlur', { enabled }).catch(err => {
      console.error('[Window] Failed to set blur:', err);
    });
  }

  /**
   * Set window opacity
   */
  setOpacity(opacity: number): void {
    if (opacity < 0 || opacity > 1) {
      console.error('[Window] Opacity must be between 0 and 1');
      return;
    }
    this.bridge.call('window.setOpacity', { opacity }).catch(err => {
      console.error('[Window] Failed to set opacity:', err);
    });
  }

  /**
   * Enable or disable window transparency
   */
  setTransparency(enabled: boolean): void {
    this.bridge.call('window.setTransparency', { enabled }).catch(err => {
      console.error('[Window] Failed to set transparency:', err);
    });
  }

  /**
   * Minimize window
   */
  minimize(): void {
    this.bridge.call('window.minimize').catch(err => {
      console.error('[Window] Failed to minimize:', err);
    });
  }

  /**
   * Maximize window
   */
  maximize(): void {
    this.bridge.call('window.maximize').catch(err => {
      console.error('[Window] Failed to maximize:', err);
    });
  }

  /**
   * Restore window from minimized/maximized state
   */
  restore(): void {
    this.bridge.call('window.restore').catch(err => {
      console.error('[Window] Failed to restore:', err);
    });
  }

  /**
   * Focus window
   */
  focus(): void {
    this.bridge.call('window.focus').catch(err => {
      console.error('[Window] Failed to focus:', err);
    });
  }

  /**
   * Register handler for window resize events
   */
  onResize(handler: EventHandler<WindowSize>): UnsubscribeFn {
    this.resizeHandlers.add(handler);

    // Return unsubscribe function
    return () => {
      this.resizeHandlers.delete(handler);
    };
  }

  /**
   * Register handler for window move events
   */
  onMove(handler: EventHandler<WindowPosition>): UnsubscribeFn {
    this.moveHandlers.add(handler);

    // Return unsubscribe function
    return () => {
      this.moveHandlers.delete(handler);
    };
  }

  /**
   * Register handler for window focus events
   */
  onFocus(handler: EventHandler<void>): UnsubscribeFn {
    this.focusHandlers.add(handler);

    // Return unsubscribe function
    return () => {
      this.focusHandlers.delete(handler);
    };
  }

  /**
   * Register handler for window blur events
   */
  onBlur(handler: EventHandler<void>): UnsubscribeFn {
    this.blurHandlers.add(handler);

    // Return unsubscribe function
    return () => {
      this.blurHandlers.delete(handler);
    };
  }

  /**
   * Setup event handling from the bridge
   */
  private setupEventHandling(): void {
    // Listen for window resize events
    this.bridge.on('window-resize', (size: WindowSize) => {
      // Update cached size
      this.cachedSize = size;

      this.resizeHandlers.forEach(handler => {
        try {
          handler(size);
        } catch (err) {
          console.error('[Window] Resize handler error:', err);
        }
      });
    });

    // Listen for window move events
    this.bridge.on('window-move', (pos: WindowPosition) => {
      // Update cached position
      this.cachedPosition = pos;

      this.moveHandlers.forEach(handler => {
        try {
          handler(pos);
        } catch (err) {
          console.error('[Window] Move handler error:', err);
        }
      });
    });

    // Listen for window focus events
    this.bridge.on('window-focus', () => {
      this.focusHandlers.forEach(handler => {
        try {
          handler();
        } catch (err) {
          console.error('[Window] Focus handler error:', err);
        }
      });
    });

    // Listen for window blur events
    this.bridge.on('window-blur', () => {
      this.blurHandlers.forEach(handler => {
        try {
          handler();
        } catch (err) {
          console.error('[Window] Blur handler error:', err);
        }
      });
    });
  }

  /**
   * Cache for window state (populated during initialization)
   */
  private cachedSize: WindowSize = { width: 800, height: 600 };
  private cachedPosition: WindowPosition = { x: 0, y: 0 };

  /**
   * Initialize cached data
   */
  async initialize(): Promise<void> {
    try {
      // Get initial window size and position
      const sizeResult = await this.bridge.call('window.getSize');
      if (sizeResult) {
        this.cachedSize = sizeResult;
      }

      const posResult = await this.bridge.call('window.getPosition');
      if (posResult) {
        this.cachedPosition = posResult;
      }
    } catch (err) {
      console.error('[Window] Failed to initialize cached data:', err);
      // Keep defaults
    }
  }
}
