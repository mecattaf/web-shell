/**
 * WebShell SDK - Window Module
 *
 * Window management, positioning, and appearance control
 */

import type { WindowSize, WindowPosition, EventHandler, UnsubscribeFn } from './types';

/**
 * Window Module Interface
 *
 * Control window size, position, appearance, and state
 */
export interface WindowModule {
  /**
   * Get current window size
   * @returns Window size
   */
  getSize(): WindowSize;

  /**
   * Set window size
   * @param width - Window width in pixels
   * @param height - Window height in pixels
   * @throws {WebShellError} WINDOW_OPERATION_FAILED if resize fails
   * @example
   * ```typescript
   * webshell.window.setSize(1280, 720);
   * ```
   */
  setSize(width: number, height: number): void;

  /**
   * Resize window (alias for setSize)
   * @param width - Window width in pixels
   * @param height - Window height in pixels
   * @throws {WebShellError} WINDOW_OPERATION_FAILED if resize fails
   * @example
   * ```typescript
   * webshell.window.resize(800, 600);
   * ```
   */
  resize(width: number, height: number): void;

  /**
   * Get current window position
   * @returns Window position
   */
  getPosition(): WindowPosition;

  /**
   * Set window position
   * @param x - X coordinate
   * @param y - Y coordinate
   */
  setPosition(x: number, y: number): void;

  /**
   * Center window on screen
   */
  center(): void;

  /**
   * Enable or disable window blur effect
   * @param enabled - Whether to enable blur
   */
  setBlur(enabled: boolean): void;

  /**
   * Set window opacity
   * @param opacity - Opacity value (0-1), where 0 is fully transparent and 1 is fully opaque
   * @example
   * ```typescript
   * // Make window 50% transparent
   * webshell.window.setOpacity(0.5);
   * ```
   */
  setOpacity(opacity: number): void;

  /**
   * Enable or disable window transparency
   * @param enabled - Whether to enable transparency
   */
  setTransparency(enabled: boolean): void;

  /**
   * Minimize window
   */
  minimize(): void;

  /**
   * Maximize window
   */
  maximize(): void;

  /**
   * Restore window from minimized/maximized state
   */
  restore(): void;

  /**
   * Focus window
   */
  focus(): void;

  /**
   * Register handler for window resize events
   * @param handler - Resize handler
   * @returns Unsubscribe function
   */
  onResize(handler: EventHandler<WindowSize>): UnsubscribeFn;

  /**
   * Register handler for window move events
   * @param handler - Move handler
   * @returns Unsubscribe function
   */
  onMove(handler: EventHandler<WindowPosition>): UnsubscribeFn;

  /**
   * Register handler for window focus events
   * @param handler - Focus handler
   * @returns Unsubscribe function
   */
  onFocus(handler: EventHandler<void>): UnsubscribeFn;

  /**
   * Register handler for window blur (lose focus) events
   * @param handler - Blur handler
   * @returns Unsubscribe function
   */
  onBlur(handler: EventHandler<void>): UnsubscribeFn;
}
