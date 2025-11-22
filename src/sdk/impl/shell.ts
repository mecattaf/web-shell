/**
 * WebShell SDK Shell Module Implementation
 *
 * Implements core shell functionality for app management and inter-app communication
 */

import { BridgeAdapter } from './bridge';
import type { ShellModule, AppControl } from '../shell';
import type { AppMessage, AppInfo, Manifest, UnsubscribeFn, EventHandler } from '../types';

/**
 * Implementation of the Shell module
 */
export class ShellModuleImpl implements ShellModule {
  private bridge: BridgeAdapter;
  private messageHandlers: Set<EventHandler<AppMessage>> = new Set();

  constructor(bridge: BridgeAdapter) {
    this.bridge = bridge;
    this.setupMessageHandling();
  }

  /**
   * App control interface
   */
  get app(): AppControl {
    return {
      getName: (): string => {
        // For synchronous calls, we'll need to store the app name during initialization
        // For now, we'll make it async-friendly by caching
        return this.getCachedAppName();
      },

      getManifest: (): Manifest => {
        return this.getCachedManifest();
      },

      close: (): void => {
        this.bridge.call('shell.closeApp').catch(err => {
          console.error('[Shell] Failed to close app:', err);
        });
      },

      reload: (): void => {
        this.bridge.call('shell.reloadApp').catch(err => {
          console.error('[Shell] Failed to reload app:', err);
        });
      }
    };
  }

  /**
   * Send a message to a specific app
   */
  async sendMessage(target: string, type: string, data: any): Promise<void> {
    await this.bridge.call('shell.sendMessage', {
      target,
      type,
      data
    });
  }

  /**
   * Broadcast a message to all running apps
   */
  async broadcast(type: string, data: any): Promise<void> {
    await this.bridge.call('shell.broadcast', {
      type,
      data
    });
  }

  /**
   * Register a handler for incoming messages
   */
  onMessage(handler: EventHandler<AppMessage>): UnsubscribeFn {
    this.messageHandlers.add(handler);

    // Return unsubscribe function
    return () => {
      this.messageHandlers.delete(handler);
    };
  }

  /**
   * List all registered apps
   */
  async listApps(): Promise<AppInfo[]> {
    return await this.bridge.call('shell.listApps');
  }

  /**
   * Launch an app by name
   */
  async launchApp(name: string): Promise<void> {
    await this.bridge.call('shell.launchApp', { name });
  }

  /**
   * Close a running app
   */
  async closeApp(name: string): Promise<void> {
    await this.bridge.call('shell.closeApp', { name });
  }

  /**
   * Get app info for a specific app
   */
  async getAppInfo(name: string): Promise<AppInfo> {
    return await this.bridge.call('shell.getAppInfo', { name });
  }

  /**
   * Setup message handling from the bridge
   */
  private setupMessageHandling(): void {
    this.bridge.on('message', (msg: AppMessage) => {
      this.messageHandlers.forEach(handler => {
        try {
          handler(msg);
        } catch (err) {
          console.error('[Shell] Message handler error:', err);
        }
      });
    });
  }

  /**
   * Cache for app name (populated during initialization)
   */
  private cachedAppName: string = '';
  private cachedManifest: Manifest | null = null;

  /**
   * Initialize cached data
   */
  async initialize(): Promise<void> {
    try {
      this.cachedAppName = await this.bridge.call('shell.getAppName');
      this.cachedManifest = await this.bridge.call('shell.getManifest');
    } catch (err) {
      console.error('[Shell] Failed to initialize cached data:', err);
      // Set defaults
      this.cachedAppName = 'unknown';
      this.cachedManifest = {
        name: 'unknown',
        version: '0.0.0',
        entry: 'index.html'
      };
    }
  }

  private getCachedAppName(): string {
    return this.cachedAppName || 'unknown';
  }

  private getCachedManifest(): Manifest {
    return this.cachedManifest || {
      name: 'unknown',
      version: '0.0.0',
      entry: 'index.html'
    };
  }
}
