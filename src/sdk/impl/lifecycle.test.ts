/**
 * Tests for Lifecycle Manager
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LifecycleManager } from './lifecycle';
import { BridgeAdapter } from './bridge';

describe('LifecycleManager', () => {
  let mockBridge: any;
  let lifecycle: LifecycleManager;
  let eventHandlers: Map<string, Function>;

  beforeEach(() => {
    eventHandlers = new Map();

    mockBridge = {
      on: vi.fn((event: string, handler: Function) => {
        eventHandlers.set(event, handler);
      }),
      off: vi.fn(),
      call: vi.fn(),
      isReady: true
    };

    lifecycle = new LifecycleManager(mockBridge as any);
  });

  describe('ready callback', () => {
    it('should register ready callback', () => {
      const callback = vi.fn();
      lifecycle.ready(callback);

      expect(callback).not.toHaveBeenCalled();
    });

    it('should call ready callback when marked ready', () => {
      const callback = vi.fn();
      lifecycle.ready(callback);

      lifecycle.markReady();

      expect(callback).toHaveBeenCalled();
    });

    it('should call ready callback immediately if already ready', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      lifecycle.markReady();
      lifecycle.ready(callback1);

      expect(callback1).toHaveBeenCalled();

      lifecycle.ready(callback2);
      expect(callback2).toHaveBeenCalled();
    });

    it('should handle errors in ready callbacks', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      const callback = vi.fn(() => {
        throw new Error('Callback error');
      });

      lifecycle.ready(callback);

      // Should not throw
      expect(() => {
        lifecycle.markReady();
      }).not.toThrow();

      expect(consoleError).toHaveBeenCalled();
      consoleError.mockRestore();
    });

    it('should respond to ready event from bridge', () => {
      const callback = vi.fn();
      lifecycle.ready(callback);

      // Simulate ready event from bridge
      const readyHandler = eventHandlers.get('ready');
      expect(readyHandler).toBeDefined();
      readyHandler!();

      expect(callback).toHaveBeenCalled();
    });
  });

  describe('pause/resume callbacks', () => {
    it('should register pause callback', () => {
      const callback = vi.fn();
      lifecycle.onPause(callback);

      expect(callback).not.toHaveBeenCalled();
    });

    it('should call pause callback on pause event', () => {
      const callback = vi.fn();
      lifecycle.onPause(callback);

      // Simulate pause event
      const pauseHandler = eventHandlers.get('pause');
      expect(pauseHandler).toBeDefined();
      pauseHandler!();

      expect(callback).toHaveBeenCalled();
    });

    it('should register resume callback', () => {
      const callback = vi.fn();
      lifecycle.onResume(callback);

      expect(callback).not.toHaveBeenCalled();
    });

    it('should call resume callback on resume event', () => {
      const callback = vi.fn();
      lifecycle.onResume(callback);

      // Simulate resume event
      const resumeHandler = eventHandlers.get('resume');
      expect(resumeHandler).toBeDefined();
      resumeHandler!();

      expect(callback).toHaveBeenCalled();
    });

    it('should handle errors in pause callbacks', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      const callback = vi.fn(() => {
        throw new Error('Callback error');
      });

      lifecycle.onPause(callback);

      // Simulate pause event
      const pauseHandler = eventHandlers.get('pause');
      expect(() => {
        pauseHandler!();
      }).not.toThrow();

      expect(consoleError).toHaveBeenCalled();
      consoleError.mockRestore();
    });
  });

  describe('close callback', () => {
    it('should register close callback', () => {
      const callback = vi.fn();
      lifecycle.onClose(callback);

      expect(callback).not.toHaveBeenCalled();
    });

    it('should call close callback on close event', () => {
      const callback = vi.fn();
      lifecycle.onClose(callback);

      // Simulate close event
      const closeHandler = eventHandlers.get('close');
      expect(closeHandler).toBeDefined();
      closeHandler!();

      expect(callback).toHaveBeenCalled();
    });

    it('should handle errors in close callbacks', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      const callback = vi.fn(() => {
        throw new Error('Callback error');
      });

      lifecycle.onClose(callback);

      // Simulate close event
      const closeHandler = eventHandlers.get('close');
      expect(() => {
        closeHandler!();
      }).not.toThrow();

      expect(consoleError).toHaveBeenCalled();
      consoleError.mockRestore();
    });
  });

  describe('isReady', () => {
    it('should return false initially', () => {
      expect(lifecycle.isReady).toBe(false);
    });

    it('should return true after marked ready', () => {
      lifecycle.markReady();
      expect(lifecycle.isReady).toBe(true);
    });
  });

  describe('multiple callbacks', () => {
    it('should support multiple ready callbacks', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      const callback3 = vi.fn();

      lifecycle.ready(callback1);
      lifecycle.ready(callback2);
      lifecycle.ready(callback3);

      lifecycle.markReady();

      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
      expect(callback3).toHaveBeenCalled();
    });

    it('should support multiple pause callbacks', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      lifecycle.onPause(callback1);
      lifecycle.onPause(callback2);

      // Simulate pause event
      const pauseHandler = eventHandlers.get('pause');
      pauseHandler!();

      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });
  });
});
