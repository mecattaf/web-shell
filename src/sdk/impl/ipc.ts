/**
 * WebShell SDK - IPC Module Implementation
 *
 * Generic backend IPC for custom backend integrations
 */

import { BridgeAdapter } from './bridge';
import type { IPCModule } from '../ipc';
import type { EventHandler, UnsubscribeFn } from '../types';

/**
 * IPC Module Implementation
 *
 * Provides low-level IPC communication with Go backend
 * for custom/app-specific backend logic
 */
export class IPCModuleImpl implements IPCModule {
  private bridge: BridgeAdapter;
  private eventHandlers: Map<string, Set<EventHandler<any>>> = new Map();

  constructor(bridge: BridgeAdapter) {
    this.bridge = bridge;
    this.setupEventForwarding();
  }

  /**
   * Call a custom backend method
   *
   * @param method - Backend method name (e.g., "database.query")
   * @param params - Method parameters
   * @returns Promise with backend response
   *
   * @example
   * const users = await ipc.call('database.query', {
   *   table: 'users',
   *   where: { active: true }
   * });
   */
  async call(method: string, params?: any): Promise<any> {
    return this.bridge.call('ipc.call', {
      method,
      params
    });
  }

  /**
   * Send a one-way message to backend without waiting for response
   *
   * @param message - Message type
   * @param data - Message data
   * @returns Promise that resolves when message is sent
   *
   * @example
   * await ipc.send('user:activity', { action: 'click', target: 'button' });
   */
  async send(message: string, data?: any): Promise<void> {
    await this.bridge.call('ipc.send', {
      message,
      data
    });
  }

  /**
   * Create a streaming channel for receiving data from backend
   *
   * @param channel - Channel name
   * @returns Async iterator for receiving stream data
   *
   * @example
   * for await (const chunk of ipc.stream('logs')) {
   *   console.log(chunk);
   * }
   */
  async *stream(channel: string): AsyncIterableIterator<any> {
    // TODO: Implement streaming using WebSocket or similar
    // For now, stub for future implementation
    throw new Error('Streaming not yet implemented');
  }

  /**
   * Subscribe to backend events
   *
   * @param event - Event name
   * @param handler - Event handler
   * @returns Unsubscribe function
   *
   * @example
   * const unsubscribe = ipc.on('user:created', (user) => {
   *   console.log('New user:', user);
   * });
   *
   * // Later: unsubscribe()
   */
  on(event: string, handler: EventHandler<any>): UnsubscribeFn {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());

      // Register with backend
      this.bridge.call('ipc.subscribe', { event }).catch(err => {
        console.error(`[IPC] Failed to subscribe to event '${event}':`, err);
      });
    }

    this.eventHandlers.get(event)!.add(handler);

    // Return unsubscribe function
    return () => {
      this.off(event, handler);
    };
  }

  /**
   * Unsubscribe from backend events
   *
   * @param event - Event name
   * @param handler - Event handler to remove
   */
  off(event: string, handler: EventHandler<any>): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);

      // If no more handlers for this event, unsubscribe from backend
      if (handlers.size === 0) {
        this.eventHandlers.delete(event);
        this.bridge.call('ipc.unsubscribe', { event }).catch(err => {
          console.error(`[IPC] Failed to unsubscribe from event '${event}':`, err);
        });
      }
    }
  }

  /**
   * Setup forwarding of backend events to registered handlers
   */
  private setupEventForwarding(): void {
    this.bridge.on('ipc-event', (event: { name: string; data: any }) => {
      const handlers = this.eventHandlers.get(event.name);
      if (handlers) {
        handlers.forEach(handler => {
          try {
            handler(event.data);
          } catch (err) {
            console.error(`[IPC] Event handler error (${event.name}):`, err);
          }
        });
      }
    });
  }
}
