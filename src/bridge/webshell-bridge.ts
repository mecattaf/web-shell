/**
 * WebShell QtWebChannel Bridge Client
 *
 * Provides a Promise-based TypeScript API for communicating with QML via QtWebChannel.
 * This bridge enables bidirectional communication between the web application and QuickShell.
 *
 * Architecture: JS/TS -> QtWebChannel -> QML (thin proxy) -> Go backend (IPC)
 */

// Declare global qt object provided by QtWebEngine
declare global {
  interface Window {
    qt?: {
      webChannelTransport: any;
    };
    QWebChannel: any;
  }
}

/**
 * Bridge object interface matching BridgeService.qml
 */
interface BridgeObject {
  // Methods
  echo(message: string, callback: (result: any) => void): void;
  call(method: string, params: any, callback: (result: any) => void): void;
  getBridgeInfo(callback: (result: any) => void): void;
  emitToJS(message: string): void;
  emitEvent(eventType: string, eventData: any): void;

  // Signals
  notifyJS: {
    connect(callback: (message: string) => void): void;
    disconnect(callback: (message: string) => void): void;
  };
  shellEvent: {
    connect(callback: (eventType: string, eventData: any) => void): void;
    disconnect(callback: (eventType: string, eventData: any) => void): void;
  };
  bridgeReady: {
    connect(callback: () => void): void;
    disconnect(callback: () => void): void;
  };
}

interface QWebChannel {
  objects: {
    bridge: BridgeObject;
    [key: string]: any;
  };
}

/**
 * WebShell Bridge Client
 *
 * Example usage:
 * ```typescript
 * const bridge = new WebShellBridge();
 * await bridge.initialize();
 * const result = await bridge.echo('Hello from JavaScript!');
 * console.log(result); // { success: true, data: "QML bridge received: Hello from JavaScript!", ... }
 * ```
 */
export class WebShellBridge {
  private channel: QWebChannel | null = null;
  private bridge: BridgeObject | null = null;
  private isInitialized = false;
  private eventHandlers: Map<string, Set<(eventData: any) => void>> = new Map();

  /**
   * Initialize the bridge connection
   * @returns Promise that resolves when the bridge is ready
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.warn('[WebShellBridge] Already initialized');
      return;
    }

    return new Promise((resolve, reject) => {
      // Check if we're running in QtWebEngine environment
      if (!window.qt?.webChannelTransport) {
        const error = 'QtWebChannel transport not available. Are you running in QtWebEngine?';
        console.error('[WebShellBridge]', error);
        reject(new Error(error));
        return;
      }

      // Load QWebChannel library
      const script = document.createElement('script');
      script.src = '/qwebchannel.js';
      script.onload = () => {
        // Initialize QWebChannel
        new window.QWebChannel(window.qt!.webChannelTransport, (channel: QWebChannel) => {
          this.channel = channel;
          this.bridge = channel.objects.bridge;

          if (!this.bridge) {
            reject(new Error('Bridge object not found in QWebChannel'));
            return;
          }

          this.isInitialized = true;
          console.log('[WebShellBridge] Initialized successfully');

          // Set up default signal handlers
          this.setupSignalHandlers();

          resolve();
        });
      };
      script.onerror = () => {
        reject(new Error('Failed to load qwebchannel.js'));
      };
      document.head.appendChild(script);
    });
  }

  /**
   * Set up signal handlers for QML -> JS communication
   */
  private setupSignalHandlers(): void {
    if (!this.bridge) return;

    // Handle notifyJS signal
    this.bridge.notifyJS.connect((message: string) => {
      console.log('[WebShellBridge] Received notification from QML:', message);
    });

    // Handle shellEvent signal
    this.bridge.shellEvent.connect((eventType: string, eventData: any) => {
      console.log('[WebShellBridge] Received event from QML:', eventType, eventData);

      // Dispatch to registered event handlers
      const handlers = this.eventHandlers.get(eventType);
      if (handlers) {
        handlers.forEach(handler => handler(eventData));
      }
    });

    // Handle bridgeReady signal
    this.bridge.bridgeReady.connect(() => {
      console.log('[WebShellBridge] Bridge ready signal received from QML');
    });
  }

  /**
   * Ensure the bridge is initialized before making calls
   */
  private ensureInitialized(): void {
    if (!this.isInitialized || !this.bridge) {
      throw new Error('Bridge not initialized. Call initialize() first.');
    }
  }

  /**
   * Call the echo method (example method for testing)
   * @param message - Message to echo
   * @returns Promise with the echo result
   */
  async echo(message: string): Promise<any> {
    this.ensureInitialized();
    return this.promisify(this.bridge!.echo, message);
  }

  /**
   * Generic method call to QML/Go backend
   * @param method - Method name to call
   * @param params - Parameters to pass
   * @returns Promise with the method result
   */
  async call(method: string, params?: any): Promise<any> {
    this.ensureInitialized();
    return this.promisify(this.bridge!.call, method, params);
  }

  /**
   * Get information about the bridge
   * @returns Promise with bridge information
   */
  async getBridgeInfo(): Promise<any> {
    this.ensureInitialized();
    return this.promisify(this.bridge!.getBridgeInfo);
  }

  /**
   * Register an event handler for a specific event type
   * @param eventType - Type of event to listen for
   * @param handler - Handler function to call when event is received
   */
  on(eventType: string, handler: (eventData: any) => void): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, new Set());
    }
    this.eventHandlers.get(eventType)!.add(handler);
  }

  /**
   * Remove an event handler
   * @param eventType - Type of event
   * @param handler - Handler function to remove
   */
  off(eventType: string, handler: (eventData: any) => void): void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.eventHandlers.delete(eventType);
      }
    }
  }

  /**
   * Helper to convert callback-based QML calls to Promises
   */
  private promisify(fn: Function, ...args: any[]): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        fn.call(this.bridge, ...args, (result: any) => {
          resolve(result);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Check if the bridge is ready
   */
  get ready(): boolean {
    return this.isInitialized;
  }
}

/**
 * Global bridge instance (optional singleton pattern)
 */
let globalBridge: WebShellBridge | null = null;

/**
 * Get or create the global bridge instance
 */
export function getGlobalBridge(): WebShellBridge {
  if (!globalBridge) {
    globalBridge = new WebShellBridge();
  }
  return globalBridge;
}

/**
 * Initialize the global bridge (convenience function)
 */
export async function initializeBridge(): Promise<WebShellBridge> {
  const bridge = getGlobalBridge();
  await bridge.initialize();
  return bridge;
}
