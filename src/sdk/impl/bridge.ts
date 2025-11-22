/**
 * WebShell SDK Bridge Adapter
 *
 * Wraps the low-level WebShellBridge to provide a cleaner API for SDK modules
 */

import { WebShellBridge } from '../../bridge';
import { WebShellError, WebShellErrorCode } from '../errors';

/**
 * Bridge adapter for SDK modules
 *
 * Provides a Promise-based API with better error handling
 */
export class BridgeAdapter {
  private bridge: WebShellBridge;
  private eventHandlers: Map<string, Set<Function>> = new Map();

  constructor(bridge: WebShellBridge) {
    this.bridge = bridge;
  }

  /**
   * Call a backend method
   * @param method - Method name (e.g., 'shell.getAppName')
   * @param params - Optional parameters
   * @returns Promise with the result
   */
  async call(method: string, params?: any): Promise<any> {
    try {
      const result = await this.bridge.call(method, params);

      // Handle error responses from backend
      if (result && result.error) {
        throw new WebShellError(
          result.error.message || 'Backend call failed',
          result.error.code || WebShellErrorCode.BRIDGE_CALL_FAILED,
          result.error.details
        );
      }

      // Return the data from the result
      return result?.data ?? result;
    } catch (error) {
      if (error instanceof WebShellError) {
        throw error;
      }

      throw new WebShellError(
        error instanceof Error ? error.message : 'Unknown error',
        WebShellErrorCode.BRIDGE_CALL_FAILED,
        { originalError: error }
      );
    }
  }

  /**
   * Register an event handler
   * @param event - Event name
   * @param handler - Handler function
   */
  on(event: string, handler: Function): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());

      // Register with the underlying bridge
      this.bridge.on(event, (data: any) => {
        this.emit(event, data);
      });
    }

    this.eventHandlers.get(event)!.add(handler);
  }

  /**
   * Remove an event handler
   * @param event - Event name
   * @param handler - Handler function
   */
  off(event: string, handler: Function): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);

      // If no more handlers, remove from bridge
      if (handlers.size === 0) {
        this.eventHandlers.delete(event);
        // Note: WebShellBridge doesn't expose the handler, so we can't unregister it
        // This is fine as the emit() will just not call any handlers
      }
    }
  }

  /**
   * Emit an event to all registered handlers
   * @param event - Event name
   * @param data - Event data
   */
  private emit(event: string, data: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (err) {
          console.error(`[BridgeAdapter] Event handler error (${event}):`, err);
        }
      });
    }
  }

  /**
   * Check if bridge is ready
   */
  get isReady(): boolean {
    return this.bridge.ready;
  }
}
