/**
 * Mock QWebChannel for testing
 * Simulates the QtWebChannel environment without requiring QtWebEngine
 */

interface BridgeObject {
  echo(message: string, callback: (result: any) => void): void;
  call(method: string, params: any, callback: (result: any) => void): void;
  getBridgeInfo(callback: (result: any) => void): void;
  emitToJS(message: string): void;
  emitEvent(eventType: string, eventData: any): void;
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

/**
 * Mock signal implementation
 */
class MockSignal<T extends (...args: any[]) => void> {
  private handlers: Set<T> = new Set();

  connect(callback: T): void {
    this.handlers.add(callback);
  }

  disconnect(callback: T): void {
    this.handlers.delete(callback);
  }

  emit(...args: Parameters<T>): void {
    this.handlers.forEach(handler => handler(...args));
  }
}

/**
 * Mock BridgeService object
 */
class MockBridgeObject implements BridgeObject {
  public notifyJS = new MockSignal<(message: string) => void>();
  public shellEvent = new MockSignal<(eventType: string, eventData: any) => void>();
  public bridgeReady = new MockSignal<() => void>();

  // Configurable delays for testing async behavior
  public callDelay = 0;

  echo(message: string, callback: (result: any) => void): void {
    setTimeout(() => {
      callback({
        success: true,
        data: `QML bridge received: ${message}`,
        timestamp: Date.now(),
      });
    }, this.callDelay);
  }

  call(method: string, params: any, callback: (result: any) => void): void {
    setTimeout(() => {
      callback({
        success: true,
        method,
        params,
        note: 'Mock bridge call',
      });
    }, this.callDelay);
  }

  getBridgeInfo(callback: (result: any) => void): void {
    setTimeout(() => {
      callback({
        name: 'WebShell QtWebChannel Bridge (Mock)',
        version: '1.0.0',
        ready: true,
        architecture: 'Mock for testing',
        status: 'Ready',
      });
    }, this.callDelay);
  }

  emitToJS(message: string): void {
    this.notifyJS.emit(message);
  }

  emitEvent(eventType: string, eventData: any): void {
    this.shellEvent.emit(eventType, eventData);
  }
}

/**
 * Mock QWebChannel class
 */
export class MockQWebChannel {
  public objects: {
    bridge: BridgeObject;
  };

  constructor(transport: any, callback: (channel: any) => void) {
    this.objects = {
      bridge: new MockBridgeObject(),
    };

    // Simulate async initialization
    setTimeout(() => {
      callback(this);
    }, 0);
  }
}

/**
 * Setup mock Qt environment
 * Call this in tests to simulate QtWebEngine environment
 */
export function setupMockQtEnvironment(): {
  cleanup: () => void;
  getBridge: () => MockBridgeObject;
} {
  // Mock qt.webChannelTransport
  (window as any).qt = {
    webChannelTransport: {},
  };

  // Mock QWebChannel constructor
  (window as any).QWebChannel = MockQWebChannel;

  // Mock document.head.appendChild to intercept script loading
  const originalAppendChild = document.head.appendChild.bind(document.head);
  const appendedScripts: HTMLElement[] = [];

  (document.head as any).appendChild = function (element: any): any {
    // If it's a script tag loading qwebchannel.js, don't actually append it
    // Instead, trigger the load event immediately
    if (
      element.tagName &&
      element.tagName.toLowerCase() === 'script' &&
      element.src &&
      element.src.includes('qwebchannel.js')
    ) {
      appendedScripts.push(element);

      // Trigger load event asynchronously
      queueMicrotask(() => {
        const event = new Event('load');
        element.dispatchEvent(event);
      });

      // Return the element without actually appending it
      return element;
    }

    // For all other elements, use the original appendChild
    return originalAppendChild(element);
  };

  const getBridge = (): MockBridgeObject => {
    const channel = new MockQWebChannel({}, () => {});
    return channel.objects.bridge as MockBridgeObject;
  };

  const cleanup = () => {
    delete (window as any).qt;
    delete (window as any).QWebChannel;
    (document.head as any).appendChild = originalAppendChild;
    appendedScripts.length = 0;
  };

  return { cleanup, getBridge };
}

/**
 * Create a mock bridge object for direct testing
 */
export function createMockBridge(): MockBridgeObject {
  return new MockBridgeObject();
}

/**
 * Setup error scenario where Qt environment is not available
 */
export function setupNoQtEnvironment(): { cleanup: () => void } {
  // Ensure qt is not defined
  delete (window as any).qt;
  delete (window as any).QWebChannel;

  const cleanup = () => {
    // Nothing to cleanup
  };

  return { cleanup };
}

/**
 * Setup scenario where qwebchannel.js fails to load
 */
export function setupFailedScriptLoad(): { cleanup: () => void } {
  // Mock qt.webChannelTransport (so we pass the first check)
  (window as any).qt = {
    webChannelTransport: {},
  };

  // Don't add QWebChannel to window
  delete (window as any).QWebChannel;

  // Override document.createElement to simulate script load failure
  const originalCreateElement = document.createElement.bind(document);
  const scriptElements: HTMLScriptElement[] = [];

  document.createElement = function (tagName: string, options?: any): any {
    const element = originalCreateElement(tagName, options);
    if (tagName.toLowerCase() === 'script') {
      scriptElements.push(element);
      // Simulate script error after a delay
      setTimeout(() => {
        const event = new Event('error');
        element.dispatchEvent(event);
      }, 0);
    }
    return element;
  } as any;

  const cleanup = () => {
    delete (window as any).qt;
    document.createElement = originalCreateElement;
    scriptElements.forEach(script => script.remove());
  };

  return { cleanup };
}
