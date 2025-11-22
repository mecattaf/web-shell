/**
 * WebShell SDK - Shell Module
 *
 * Core shell functionality for app management and inter-app communication
 */

import type { Manifest, AppInfo, AppMessage, EventHandler, UnsubscribeFn } from './types';

/**
 * Shell Module Interface
 *
 * Provides access to app lifecycle, inter-app communication, and app registry
 */
export interface ShellModule {
  /**
   * Current app management
   */
  app: AppControl;

  /**
   * Send a message to a specific app
   * @param target - Target app name
   * @param type - Message type identifier
   * @param data - Message payload data
   * @throws {WebShellError} APP_NOT_FOUND if target app doesn't exist
   * @throws {WebShellError} PERMISSION_DENIED if messaging permission not granted
   * @example
   * ```typescript
   * await webshell.shell.sendMessage('calendar-app', 'sync', { force: true });
   * ```
   */
  sendMessage(target: string, type: string, data: any): Promise<void>;

  /**
   * Broadcast a message to all running apps
   * @param type - Message type identifier
   * @param data - Message payload data
   * @throws {WebShellError} PERMISSION_DENIED if messaging permission not granted
   * @example
   * ```typescript
   * // Notify all apps of theme change
   * await webshell.shell.broadcast('theme-changed', { theme: 'dark' });
   * ```
   */
  broadcast(type: string, data: any): Promise<void>;

  /**
   * Register a handler for incoming messages
   * @param handler - Message handler function called when messages arrive
   * @returns Unsubscribe function to remove the handler
   * @example
   * ```typescript
   * webshell.shell.onMessage((message) => {
   *   console.log(`Message from ${message.from}:`, message.type, message.data);
   * });
   * ```
   */
  onMessage(handler: EventHandler<AppMessage>): UnsubscribeFn;

  /**
   * List all registered apps
   * @returns Promise with list of all apps and their status
   * @example
   * ```typescript
   * const apps = await webshell.shell.listApps();
   * apps.forEach(app => {
   *   console.log(`${app.name}: ${app.running ? 'running' : 'stopped'}`);
   * });
   * ```
   */
  listApps(): Promise<AppInfo[]>;

  /**
   * Launch an app by name
   * @param name - App name to launch
   * @returns Promise that resolves when app is launched
   * @throws {WebShellError} APP_NOT_FOUND if app doesn't exist
   * @throws {WebShellError} APP_ALREADY_RUNNING if app is already running
   * @throws {WebShellError} APP_LAUNCH_FAILED if launch fails
   * @example
   * ```typescript
   * await webshell.shell.launchApp('calendar-app');
   * ```
   */
  launchApp(name: string): Promise<void>;

  /**
   * Close a running app
   * @param name - App name to close
   * @returns Promise that resolves when app is closed
   * @throws {WebShellError} APP_NOT_FOUND if app doesn't exist
   * @throws {WebShellError} APP_CLOSE_FAILED if close fails
   * @example
   * ```typescript
   * await webshell.shell.closeApp('calendar-app');
   * ```
   */
  closeApp(name: string): Promise<void>;
}

/**
 * App Control Interface
 *
 * Control the current app instance
 */
export interface AppControl {
  /**
   * Get the current app name
   * @returns App name
   */
  getName(): string;

  /**
   * Get the current app manifest
   * @returns App manifest
   */
  getManifest(): Manifest;

  /**
   * Close the current app
   */
  close(): void;

  /**
   * Reload the current app
   */
  reload(): void;
}
