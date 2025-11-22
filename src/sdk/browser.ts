/**
 * WebShell SDK Browser Entry Point
 *
 * Auto-initializes the global webshell object for browser usage
 */

import { getWebShellSDK } from './impl/webshell-sdk';

// Create and export the global SDK instance
const webshell = getWebShellSDK();

// Auto-initialize when running in browser
if (typeof window !== 'undefined') {
  // Attach to window
  (window as any).webshell = webshell;

  // Auto-initialize the SDK
  webshell.initialize().catch(err => {
    console.error('[WebShell SDK] Auto-initialization failed:', err);
  });
}

// Export for module usage
export { webshell };
export default webshell;

// Re-export types for convenience
export * from './index';
