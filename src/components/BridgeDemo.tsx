/**
 * Bridge Demo Component
 *
 * Demonstrates bidirectional communication between JavaScript and QML using QtWebChannel
 */

import { useState, useEffect } from 'react';
import { WebShellBridge } from '../bridge';

interface BridgeInfo {
  name?: string;
  version?: string;
  ready?: boolean;
  architecture?: string;
  status?: string;
}

interface EchoResult {
  success?: boolean;
  data?: string;
  timestamp?: number;
}

export function BridgeDemo() {
  const [bridge] = useState(() => new WebShellBridge());
  const [isReady, setIsReady] = useState(false);
  const [bridgeInfo, setBridgeInfo] = useState<BridgeInfo | null>(null);
  const [echoMessage, setEchoMessage] = useState('Hello from JavaScript!');
  const [echoResult, setEchoResult] = useState<EchoResult | null>(null);
  const [events, setEvents] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Initialize bridge on mount
  useEffect(() => {
    const initBridge = async () => {
      try {
        await bridge.initialize();
        setIsReady(true);
        setError(null);

        // Get bridge info
        const info = await bridge.getBridgeInfo();
        setBridgeInfo(info);

        // Register event handlers
        bridge.on('test', (data) => {
          setEvents((prev) => [...prev, `Event received: ${JSON.stringify(data)}`]);
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize bridge');
        console.error('Bridge initialization error:', err);
      }
    };

    initBridge();
  }, [bridge]);

  // Test echo function (JS -> QML -> Go backend)
  const handleEcho = async () => {
    try {
      const result = await bridge.echo(echoMessage);
      setEchoResult(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Echo failed');
    }
  };

  // Test generic call method
  const handleGenericCall = async () => {
    try {
      const result = await bridge.call('testMethod', { param: 'test value' });
      setEvents((prev) => [...prev, `Generic call result: ${JSON.stringify(result)}`]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generic call failed');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">QtWebChannel Bridge Demo</h1>

      {/* Bridge Status */}
      <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Bridge Status</h2>
        <div className="flex items-center gap-2 mb-2">
          <div
            className={`w-3 h-3 rounded-full ${isReady ? 'bg-green-500' : 'bg-red-500'}`}
          ></div>
          <span>{isReady ? 'Connected' : 'Disconnected'}</span>
        </div>

        {bridgeInfo && (
          <div className="mt-4 space-y-1 text-sm">
            <p>
              <strong>Name:</strong> {bridgeInfo.name}
            </p>
            <p>
              <strong>Version:</strong> {bridgeInfo.version}
            </p>
            <p>
              <strong>Architecture:</strong> {bridgeInfo.architecture}
            </p>
            <p>
              <strong>Status:</strong> {bridgeInfo.status}
            </p>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded">
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>

      {/* Echo Test (JS -> QML) */}
      <div className="mb-6 p-4 bg-white dark:bg-gray-900 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Echo Test (JS → QML → Go)</h2>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={echoMessage}
            onChange={(e) => setEchoMessage(e.target.value)}
            className="flex-1 px-3 py-2 border rounded dark:bg-gray-800 dark:border-gray-700"
            placeholder="Enter message to echo"
            disabled={!isReady}
          />
          <button
            onClick={handleEcho}
            disabled={!isReady}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Send Echo
          </button>
        </div>

        {echoResult && (
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
            <p className="font-mono text-sm">
              {JSON.stringify(echoResult, null, 2)}
            </p>
          </div>
        )}
      </div>

      {/* Generic Call Test */}
      <div className="mb-6 p-4 bg-white dark:bg-gray-900 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Generic Method Call</h2>
        <button
          onClick={handleGenericCall}
          disabled={!isReady}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Test Generic Call
        </button>
      </div>

      {/* Event Log (QML -> JS) */}
      <div className="p-4 bg-white dark:bg-gray-900 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Event Log (QML → JS)</h2>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {events.length === 0 ? (
            <p className="text-gray-500">No events received yet</p>
          ) : (
            events.map((event, index) => (
              <div
                key={index}
                className="p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm font-mono"
              >
                {event}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Documentation */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">How It Works</h2>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>JavaScript calls bridge methods via Promise-based API</li>
          <li>QtWebChannel forwards calls to QML BridgeService (thin proxy)</li>
          <li>BridgeService forwards to Go backend via IPC (future)</li>
          <li>QML can emit signals back to JavaScript</li>
          <li>All communication is type-safe and asynchronous</li>
        </ul>
      </div>
    </div>
  );
}
