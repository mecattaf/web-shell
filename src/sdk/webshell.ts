/**
 * WebShell SDK - Main Interface
 *
 * The complete WebShell SDK API surface
 */

import type { MessageHandler, UnsubscribeFn } from './types';
import type { ShellModule } from './shell';
import type { WindowModule } from './window';
import type { ThemeModule } from './theme';
import type { CalendarModule } from './calendar';
import type { NotificationModule } from './notifications';
import type { PowerModule } from './power';
import type { SystemModule } from './system';
import type { IPCModule } from './ipc';

/**
 * WebShell SDK Global Interface
 *
 * Main namespace for all WebShell SDK functionality
 */
export interface WebShell {
  /**
   * SDK version
   */
  readonly version: string;

  /**
   * Shell module - App management and inter-app communication
   */
  readonly shell: ShellModule;

  /**
   * Window module - Window management and appearance
   */
  readonly window: WindowModule;

  /**
   * Theme module - Theme access and updates
   */
  readonly theme: ThemeModule;

  /**
   * Calendar module - Calendar event management
   */
  readonly calendar: CalendarModule;

  /**
   * Notifications module - System notifications
   */
  readonly notifications: NotificationModule;

  /**
   * Power module - Battery and power management
   */
  readonly power: PowerModule;

  /**
   * System module - System info and resources
   */
  readonly system: SystemModule;

  /**
   * IPC module - Direct backend communication
   */
  readonly ipc: IPCModule;

  /**
   * Register a callback to be called when SDK is ready
   * @param callback - Callback function
   */
  ready(callback: () => void): void;

  /**
   * Register a global message handler
   * @param handler - Message handler
   * @returns Unsubscribe function
   */
  onMessage(handler: MessageHandler): UnsubscribeFn;

  /**
   * Check if SDK is initialized and ready
   */
  readonly isReady: boolean;
}

/**
 * Declare global webshell object
 */
declare global {
  interface Window {
    webshell: WebShell;
  }

  const webshell: WebShell;
}
