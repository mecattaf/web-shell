/**
 * WebShell SDK - IPC Module
 *
 * Direct IPC communication with Go backend
 */

import type { EventHandler, UnsubscribeFn } from './types';

/**
 * IPC Module Interface
 *
 * Low-level IPC communication for advanced use cases
 */
export interface IPCModule {
  /**
   * Call a backend method directly
   * @param method - Method name
   * @param params - Method parameters
   * @returns Promise with method result
   */
  call(method: string, params?: any): Promise<any>;

  /**
   * Send a one-way message to backend
   * @param message - Message type
   * @param data - Message data
   * @returns Promise that resolves when message is sent
   */
  send(message: string, data?: any): Promise<void>;

  /**
   * Create a streaming channel
   * @param channel - Channel name
   * @returns Async iterator for receiving stream data
   */
  stream(channel: string): AsyncIterableIterator<any>;

  /**
   * Subscribe to backend events
   * @param event - Event name
   * @param handler - Event handler
   * @returns Unsubscribe function
   */
  on(event: string, handler: EventHandler<any>): UnsubscribeFn;

  /**
   * Unsubscribe from backend events
   * @param event - Event name
   * @param handler - Event handler to remove
   */
  off(event: string, handler: EventHandler<any>): void;
}
