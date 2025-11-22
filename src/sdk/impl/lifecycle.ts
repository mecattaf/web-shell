/**
 * WebShell SDK Lifecycle Manager
 *
 * Manages app lifecycle events and callbacks
 */

import { BridgeAdapter } from './bridge';

/**
 * Lifecycle manager for handling app lifecycle events
 */
export class LifecycleManager {
  private readyCallbacks: Function[] = [];
  private pauseCallbacks: Function[] = [];
  private resumeCallbacks: Function[] = [];
  private closeCallbacks: Function[] = [];

  private _isReady = false;
  private isPaused = false;

  constructor(bridge: BridgeAdapter) {
    this.setupLifecycleHooks(bridge);
  }

  /**
   * Register a callback to be called when the SDK is ready
   * @param callback - Callback function
   */
  ready(callback: Function): void {
    if (this._isReady) {
      // If already ready, call immediately
      try {
        callback();
      } catch (err) {
        console.error('[Lifecycle] Ready callback error:', err);
      }
    } else {
      this.readyCallbacks.push(callback);
    }
  }

  /**
   * Register a callback for when the app is paused
   * @param callback - Callback function
   */
  onPause(callback: Function): void {
    this.pauseCallbacks.push(callback);
  }

  /**
   * Register a callback for when the app is resumed
   * @param callback - Callback function
   */
  onResume(callback: Function): void {
    this.resumeCallbacks.push(callback);
  }

  /**
   * Register a callback for when the app is closing
   * @param callback - Callback function
   */
  onClose(callback: Function): void {
    this.closeCallbacks.push(callback);
  }

  /**
   * Mark the SDK as ready and trigger callbacks
   */
  markReady(): void {
    if (this._isReady) return;

    this._isReady = true;
    console.log('[Lifecycle] SDK ready');

    // Execute all ready callbacks
    this.readyCallbacks.forEach(cb => {
      try {
        cb();
      } catch (err) {
        console.error('[Lifecycle] Ready callback error:', err);
      }
    });

    // Clear the callbacks
    this.readyCallbacks = [];
  }

  /**
   * Setup lifecycle event handlers
   */
  private setupLifecycleHooks(bridge: BridgeAdapter): void {
    // Listen for ready event from bridge
    bridge.on('ready', () => {
      this.markReady();
    });

    // Listen for pause event
    bridge.on('pause', () => {
      this.isPaused = true;
      this.pauseCallbacks.forEach(cb => {
        try {
          cb();
        } catch (err) {
          console.error('[Lifecycle] Pause callback error:', err);
        }
      });
    });

    // Listen for resume event
    bridge.on('resume', () => {
      this.isPaused = false;
      this.resumeCallbacks.forEach(cb => {
        try {
          cb();
        } catch (err) {
          console.error('[Lifecycle] Resume callback error:', err);
        }
      });
    });

    // Listen for close event
    bridge.on('close', () => {
      this.closeCallbacks.forEach(cb => {
        try {
          cb();
        } catch (err) {
          console.error('[Lifecycle] Close callback error:', err);
        }
      });
    });
  }

  /**
   * Check if the SDK is ready
   */
  get isReady(): boolean {
    return this._isReady;
  }
}
