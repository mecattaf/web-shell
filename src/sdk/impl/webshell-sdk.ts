/**
 * WebShell SDK Main Implementation
 *
 * The complete WebShell SDK that apps interact with
 */

import { WebShellBridge, getGlobalBridge } from '../../bridge';
import { BridgeAdapter } from './bridge';
import { LifecycleManager } from './lifecycle';
import { ShellModuleImpl } from './shell';
import { WindowModuleImpl } from './window';
import { ThemeModuleImpl } from './theme';
import { CalendarModuleImpl } from './calendar';
import { NotificationModuleImpl } from './notifications';
import { PowerModuleImpl } from './power';
import { SystemModuleImpl } from './system';
import { IPCModuleImpl } from './ipc';

import type { WebShell } from '../webshell';
import type { ShellModule } from '../shell';
import type { WindowModule } from '../window';
import type { ThemeModule } from '../theme';
import type { CalendarModule } from '../calendar';
import type { NotificationModule } from '../notifications';
import type { PowerModule } from '../power';
import type { SystemModule } from '../system';
import type { IPCModule } from '../ipc';
import type { MessageHandler, UnsubscribeFn } from '../types';

/**
 * WebShell SDK Implementation
 */
export class WebShellSDK implements WebShell {
  private bridgeInstance: WebShellBridge;
  private bridge: BridgeAdapter;
  private lifecycle: LifecycleManager;

  private shellModule: ShellModuleImpl;
  private windowModule: WindowModuleImpl;
  private themeModule: ThemeModuleImpl;
  private calendarModule: CalendarModuleImpl;
  private notificationModule: NotificationModuleImpl;
  private powerModule: PowerModuleImpl;
  private systemModule: SystemModuleImpl;
  private ipcModule: IPCModuleImpl;

  // Version
  readonly version = '1.0.0';

  constructor() {
    // Get or create global bridge instance
    this.bridgeInstance = getGlobalBridge();
    this.bridge = new BridgeAdapter(this.bridgeInstance);
    this.lifecycle = new LifecycleManager(this.bridge);

    // Initialize modules
    this.shellModule = new ShellModuleImpl(this.bridge);
    this.windowModule = new WindowModuleImpl(this.bridge);
    this.themeModule = new ThemeModuleImpl(this.bridge);
    this.calendarModule = new CalendarModuleImpl(this.bridge);
    this.notificationModule = new NotificationModuleImpl(this.bridge);
    this.powerModule = new PowerModuleImpl(this.bridge);
    this.systemModule = new SystemModuleImpl(this.bridge);
    this.ipcModule = new IPCModuleImpl(this.bridge);
  }

  /**
   * Initialize the SDK
   */
  async initialize(): Promise<void> {
    try {
      // Initialize the underlying bridge
      await this.bridgeInstance.initialize();

      // Initialize modules that need async setup
      await this.shellModule.initialize();
      await this.windowModule.initialize();
      await this.themeModule.initialize();

      // Mark as ready
      this.lifecycle.markReady();

      console.log('[WebShell SDK] Initialized successfully');
    } catch (err) {
      console.error('[WebShell SDK] Initialization failed:', err);
      throw err;
    }
  }

  /**
   * Shell module - App management and inter-app communication
   */
  get shell(): ShellModule {
    return this.shellModule;
  }

  /**
   * Window module - Window management and appearance
   */
  get window(): WindowModule {
    return this.windowModule;
  }

  /**
   * Theme module - Theme access and updates
   */
  get theme(): ThemeModule {
    return this.themeModule;
  }

  /**
   * Calendar module - Calendar event management
   */
  get calendar(): CalendarModule {
    return this.calendarModule;
  }

  /**
   * Notifications module - System notifications
   */
  get notifications(): NotificationModule {
    return this.notificationModule;
  }

  /**
   * Power module - Battery and power management
   */
  get power(): PowerModule {
    return this.powerModule;
  }

  /**
   * System module - System info and resources
   */
  get system(): SystemModule {
    return this.systemModule;
  }

  /**
   * IPC module - Direct backend communication
   */
  get ipc(): IPCModule {
    return this.ipcModule;
  }

  /**
   * Register a callback to be called when SDK is ready
   */
  ready(callback: () => void): void {
    this.lifecycle.ready(callback);
  }

  /**
   * Register a global message handler
   */
  onMessage(handler: MessageHandler): UnsubscribeFn {
    return this.shellModule.onMessage(handler);
  }

  /**
   * Check if SDK is initialized and ready
   */
  get isReady(): boolean {
    return this.lifecycle.isReady;
  }
}

/**
 * Global SDK instance
 */
let globalSDK: WebShellSDK | null = null;

/**
 * Get or create the global SDK instance
 */
export function getWebShellSDK(): WebShellSDK {
  if (!globalSDK) {
    globalSDK = new WebShellSDK();
  }
  return globalSDK;
}

/**
 * Initialize the global SDK (convenience function)
 */
export async function initializeWebShellSDK(): Promise<WebShellSDK> {
  const sdk = getWebShellSDK();
  await sdk.initialize();
  return sdk;
}
