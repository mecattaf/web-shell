import React, { createContext, useContext, useEffect, useState } from 'react';
import { WebShellBridge } from '../bridge';

interface BridgeContextValue {
  bridge: WebShellBridge | null;
  ready: boolean;
  error: Error | null;
}

const BridgeContext = createContext<BridgeContextValue | undefined>(undefined);

/**
 * Loading component displayed while bridge is initializing
 */
function Loading() {
  return (
    <div className="flex items-center justify-center h-screen bg-background">
      <div className="text-center">
        <div className="text-xl font-mono text-primary mb-2">Initializing Bridge...</div>
        <div className="text-sm text-secondary">Connecting to QuickShell</div>
      </div>
    </div>
  );
}

/**
 * Error boundary component for bridge initialization failures
 */
function BridgeError({ error }: { error: Error }) {
  return (
    <div className="flex items-center justify-center h-screen bg-background">
      <div className="text-center max-w-md p-6 border border-primary/40 rounded-[2px]">
        <div className="text-xl font-mono text-primary mb-2">Bridge Error</div>
        <div className="text-sm text-secondary mb-4">{error.message}</div>
        <div className="text-xs text-secondary/60">
          Make sure you're running in QtWebEngine environment
        </div>
      </div>
    </div>
  );
}

/**
 * BridgeProvider component that initializes the QtWebChannel bridge
 * and provides it to all child components via context
 */
export function BridgeProvider({ children }: { children: React.ReactNode }) {
  const [bridge, setBridge] = useState<WebShellBridge | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const b = new WebShellBridge();
        await b.initialize();
        setBridge(b);
        setReady(true);
        console.log('[BridgeProvider] Bridge initialized successfully');
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        console.error('[BridgeProvider] Failed to initialize bridge:', error);
        setError(error);
      }
    };

    init();
  }, []);

  if (error) {
    return <BridgeError error={error} />;
  }

  if (!ready) {
    return <Loading />;
  }

  return (
    <BridgeContext.Provider value={{ bridge, ready, error }}>
      {children}
    </BridgeContext.Provider>
  );
}

/**
 * Custom hook to access the WebShell bridge
 * @throws Error if used outside of BridgeProvider
 * @returns WebShellBridge instance
 */
export function useBridge(): WebShellBridge {
  const context = useContext(BridgeContext);

  if (context === undefined) {
    throw new Error('useBridge must be used within a BridgeProvider');
  }

  if (!context.bridge) {
    throw new Error('Bridge not initialized');
  }

  return context.bridge;
}

/**
 * Hook to check if bridge is ready
 * @returns boolean indicating if bridge is ready
 */
export function useBridgeReady(): boolean {
  const context = useContext(BridgeContext);
  return context?.ready ?? false;
}
