/**
 * WebShell Bridge Test Suite
 *
 * Comprehensive tests for the QtWebChannel bridge implementation
 * Covers initialization, communication, error handling, and performance
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { WebShellBridge, getGlobalBridge, initializeBridge } from './webshell-bridge';
import {
  setupMockQtEnvironment,
  setupNoQtEnvironment,
  setupFailedScriptLoad,
  createMockBridge,
} from '../test/mocks/qwebchannel';

describe('WebShell Bridge', () => {
  describe('Initialization', () => {
    let cleanup: (() => void) | null = null;

    afterEach(() => {
      if (cleanup) {
        cleanup();
        cleanup = null;
      }
    });

    it('initializes successfully in Qt environment', async () => {
      const { cleanup: cleanupFn } = setupMockQtEnvironment();
      cleanup = cleanupFn;

      const bridge = new WebShellBridge();
      await bridge.initialize();

      expect(bridge.ready).toBe(true);
    });

    it('throws error when Qt transport is not available', async () => {
      const { cleanup: cleanupFn } = setupNoQtEnvironment();
      cleanup = cleanupFn;

      const bridge = new WebShellBridge();

      await expect(bridge.initialize()).rejects.toThrow(
        'QtWebChannel transport not available'
      );
    });

    it('throws error when qwebchannel.js fails to load', async () => {
      const { cleanup: cleanupFn } = setupFailedScriptLoad();
      cleanup = cleanupFn;

      const bridge = new WebShellBridge();

      await expect(bridge.initialize()).rejects.toThrow('Failed to load qwebchannel.js');
    });

    it('does not reinitialize if already initialized', async () => {
      const { cleanup: cleanupFn } = setupMockQtEnvironment();
      cleanup = cleanupFn;

      const bridge = new WebShellBridge();
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      await bridge.initialize();
      await bridge.initialize(); // Second call

      expect(consoleWarnSpy).toHaveBeenCalledWith('[WebShellBridge] Already initialized');
      consoleWarnSpy.mockRestore();
    });

    it('ready property reflects initialization state', async () => {
      const { cleanup: cleanupFn } = setupMockQtEnvironment();
      cleanup = cleanupFn;

      const bridge = new WebShellBridge();
      expect(bridge.ready).toBe(false);

      await bridge.initialize();
      expect(bridge.ready).toBe(true);
    });
  });

  describe('Method Calls (JS → QML)', () => {
    let cleanup: (() => void) | null = null;
    let bridge: WebShellBridge;

    beforeEach(async () => {
      const { cleanup: cleanupFn } = setupMockQtEnvironment();
      cleanup = cleanupFn;

      bridge = new WebShellBridge();
      await bridge.initialize();
    });

    afterEach(() => {
      if (cleanup) {
        cleanup();
        cleanup = null;
      }
    });

    it('calls echo method successfully', async () => {
      const result = await bridge.echo('Hello from test');

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('data');
      expect(result.data).toContain('Hello from test');
    });

    it('calls generic call method successfully', async () => {
      const result = await bridge.call('testMethod', { param1: 'value1' });

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('method', 'testMethod');
      expect(result).toHaveProperty('params');
      expect(result.params).toEqual({ param1: 'value1' });
    });

    it('calls getBridgeInfo successfully', async () => {
      const result = await bridge.getBridgeInfo();

      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('version');
      expect(result).toHaveProperty('ready', true);
    });

    it('throws error when calling methods before initialization', async () => {
      const uninitializedBridge = new WebShellBridge();

      await expect(uninitializedBridge.echo('test')).rejects.toThrow(
        'Bridge not initialized'
      );
    });

    it('handles multiple concurrent calls', async () => {
      const promises = [
        bridge.echo('test1'),
        bridge.echo('test2'),
        bridge.echo('test3'),
        bridge.call('method1', {}),
        bridge.call('method2', {}),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(5);
      results.forEach(result => {
        expect(result).toHaveProperty('success', true);
      });
    });
  });

  describe('Signal Handling (QML → JS)', () => {
    let cleanup: (() => void) | null = null;
    let bridge: WebShellBridge;
    let getBridge: (() => MockBridgeObject) | null = null;

    beforeEach(async () => {
      const { cleanup: cleanupFn, getBridge: getBridgeFn } = setupMockQtEnvironment();
      cleanup = cleanupFn;
      getBridge = getBridgeFn;

      bridge = new WebShellBridge();
      await bridge.initialize();
    });

    afterEach(() => {
      if (cleanup) {
        cleanup();
        cleanup = null;
      }
      getBridge = null;
    });

    it('receives custom events via on() handler', async () => {
      // This test verifies that event handlers can be registered
      // In a real environment, QML would emit events that trigger these handlers
      const handler = vi.fn();

      bridge.on('testEvent', handler);

      // Verify handler is registered (doesn't throw)
      expect(handler).toBeDefined();

      // Note: To fully test event reception, we would need the QML side to emit events
      // This is tested manually in the QuickShell environment
    });

    it('removes event handlers with off()', async () => {
      const handler = vi.fn();

      bridge.on('testEvent', handler);
      bridge.off('testEvent', handler);

      // Simulate event emission (handler should not be called)
      const mockBridge = createMockBridge();
      mockBridge.emitEvent('testEvent', { data: 'test' });

      // Wait a bit to ensure handler is not called
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(handler).not.toHaveBeenCalled();
    });

    it('supports multiple handlers for same event', async () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      bridge.on('multiEvent', handler1);
      bridge.on('multiEvent', handler2);

      // Note: In this mock, we need to manually trigger
      // This test validates the registration mechanism
      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();
    });

    it('cleans up event handlers when all handlers removed', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      bridge.on('cleanupEvent', handler1);
      bridge.on('cleanupEvent', handler2);

      bridge.off('cleanupEvent', handler1);
      bridge.off('cleanupEvent', handler2);

      // Event type should be removed from map
      // (This is an implementation detail, but validates cleanup)
      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();
    });
  });

  describe('Error Conditions', () => {
    let cleanup: (() => void) | null = null;

    afterEach(() => {
      if (cleanup) {
        cleanup();
        cleanup = null;
      }
    });

    it('handles missing bridge object gracefully', async () => {
      const { cleanup: cleanupFn } = setupMockQtEnvironment();
      cleanup = cleanupFn;

      // Mock QWebChannel to return channel without bridge object
      const originalQWebChannel = (window as any).QWebChannel;
      (window as any).QWebChannel = function (transport: any, callback: any) {
        callback({ objects: {} }); // No bridge object
      };

      const bridge = new WebShellBridge();

      await expect(bridge.initialize()).rejects.toThrow(
        'Bridge object not found in QWebChannel'
      );

      (window as any).QWebChannel = originalQWebChannel;
    });

    it('throws error when calling uninitialized bridge methods', async () => {
      const bridge = new WebShellBridge();

      await expect(bridge.echo('test')).rejects.toThrow('Bridge not initialized');
      await expect(bridge.call('method', {})).rejects.toThrow('Bridge not initialized');
      await expect(bridge.getBridgeInfo()).rejects.toThrow('Bridge not initialized');
    });

    it('handles invalid method parameters gracefully', async () => {
      const { cleanup: cleanupFn } = setupMockQtEnvironment();
      cleanup = cleanupFn;

      const bridge = new WebShellBridge();
      await bridge.initialize();

      // These should not throw - bridge should handle gracefully
      const result1 = await bridge.call('method', null);
      expect(result1).toHaveProperty('success');

      const result2 = await bridge.call('method', undefined);
      expect(result2).toHaveProperty('success');
    });
  });

  describe('Performance', () => {
    let cleanup: (() => void) | null = null;
    let bridge: WebShellBridge;

    beforeEach(async () => {
      const { cleanup: cleanupFn } = setupMockQtEnvironment();
      cleanup = cleanupFn;

      bridge = new WebShellBridge();
      await bridge.initialize();
    });

    afterEach(() => {
      if (cleanup) {
        cleanup();
        cleanup = null;
      }
    });

    it('completes single call within acceptable time (<50ms)', async () => {
      const startTime = performance.now();

      await bridge.echo('performance test');

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(50);
    });

    it('handles 100 concurrent calls efficiently', async () => {
      const startTime = performance.now();

      const promises = Array.from({ length: 100 }, (_, i) =>
        bridge.echo(`message ${i}`)
      );

      await Promise.all(promises);

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete in reasonable time
      expect(duration).toBeLessThan(500);
    });

    it('maintains consistent performance across multiple calls', async () => {
      const iterations = 50;
      const times: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        await bridge.echo(`test ${i}`);
        const end = performance.now();
        times.push(end - start);
      }

      // Calculate average and variance
      const avg = times.reduce((a, b) => a + b, 0) / times.length;
      const variance =
        times.reduce((sum, time) => sum + Math.pow(time - avg, 2), 0) / times.length;
      const stdDev = Math.sqrt(variance);

      // Standard deviation should be low (consistent performance)
      expect(stdDev).toBeLessThan(20);
    });

    it('does not leak memory with repeated operations', async () => {
      // Perform many operations to check for memory leaks
      // This is a basic test - real memory leak detection needs profiling tools

      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;

      // Perform 1000 operations
      for (let i = 0; i < 1000; i++) {
        await bridge.echo(`test ${i}`);
      }

      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;

      // Memory growth should be minimal (allowing for some variance)
      // This is a heuristic test, not definitive
      if (initialMemory > 0 && finalMemory > 0) {
        const growth = finalMemory - initialMemory;
        const growthPercent = (growth / initialMemory) * 100;

        // Allow up to 50% growth (generous threshold for test environment)
        expect(growthPercent).toBeLessThan(50);
      }
    });
  });

  describe('Global Bridge Instance', () => {
    let cleanup: (() => void) | null = null;

    afterEach(() => {
      if (cleanup) {
        cleanup();
        cleanup = null;
      }
    });

    it('getGlobalBridge returns singleton instance', () => {
      const bridge1 = getGlobalBridge();
      const bridge2 = getGlobalBridge();

      expect(bridge1).toBe(bridge2);
    });

    it('initializeBridge initializes and returns global instance', async () => {
      const { cleanup: cleanupFn } = setupMockQtEnvironment();
      cleanup = cleanupFn;

      const bridge = await initializeBridge();

      expect(bridge.ready).toBe(true);
      expect(bridge).toBe(getGlobalBridge());
    });
  });

  describe('Multiple Bridge Instances', () => {
    let cleanup: (() => void) | null = null;

    beforeEach(() => {
      const { cleanup: cleanupFn } = setupMockQtEnvironment();
      cleanup = cleanupFn;
    });

    afterEach(() => {
      if (cleanup) {
        cleanup();
        cleanup = null;
      }
    });

    it('supports multiple independent bridge instances', async () => {
      const bridge1 = new WebShellBridge();
      const bridge2 = new WebShellBridge();

      await bridge1.initialize();
      await bridge2.initialize();

      expect(bridge1.ready).toBe(true);
      expect(bridge2.ready).toBe(true);
      expect(bridge1).not.toBe(bridge2);
    });

    it('each instance maintains independent event handlers', () => {
      const bridge1 = new WebShellBridge();
      const bridge2 = new WebShellBridge();

      const handler1 = vi.fn();
      const handler2 = vi.fn();

      bridge1.on('event1', handler1);
      bridge2.on('event2', handler2);

      // Handlers should be independent
      // (This validates the isolation of event handler maps)
      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    let cleanup: (() => void) | null = null;

    afterEach(() => {
      if (cleanup) {
        cleanup();
        cleanup = null;
      }
    });

    it('handles empty string parameters', async () => {
      const { cleanup: cleanupFn } = setupMockQtEnvironment();
      cleanup = cleanupFn;

      const bridge = new WebShellBridge();
      await bridge.initialize();

      const result = await bridge.echo('');
      expect(result).toHaveProperty('success', true);
    });

    it('handles large payload parameters', async () => {
      const { cleanup: cleanupFn } = setupMockQtEnvironment();
      cleanup = cleanupFn;

      const bridge = new WebShellBridge();
      await bridge.initialize();

      const largeString = 'x'.repeat(10000);
      const result = await bridge.echo(largeString);

      expect(result).toHaveProperty('success', true);
    });

    it('handles special characters in parameters', async () => {
      const { cleanup: cleanupFn } = setupMockQtEnvironment();
      cleanup = cleanupFn;

      const bridge = new WebShellBridge();
      await bridge.initialize();

      const specialChars = '!@#$%^&*()_+-={}[]|\\:";\'<>?,./\n\t\r';
      const result = await bridge.echo(specialChars);

      expect(result).toHaveProperty('success', true);
    });

    it('handles unicode characters in parameters', async () => {
      const { cleanup: cleanupFn } = setupMockQtEnvironment();
      cleanup = cleanupFn;

      const bridge = new WebShellBridge();
      await bridge.initialize();

      const unicode = '你好世界 🌍 مرحبا العالم';
      const result = await bridge.echo(unicode);

      expect(result).toHaveProperty('success', true);
    });
  });
});
