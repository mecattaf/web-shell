/**
 * Tests for Bridge Adapter
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BridgeAdapter } from './bridge';
import { WebShellError, WebShellErrorCode } from '../errors';
import type { WebShellBridge } from '../../bridge';

describe('BridgeAdapter', () => {
  let mockBridge: any;
  let adapter: BridgeAdapter;

  beforeEach(() => {
    mockBridge = {
      call: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
      ready: true
    };

    adapter = new BridgeAdapter(mockBridge as WebShellBridge);
  });

  describe('call method', () => {
    it('should call bridge method and return data', async () => {
      const testData = { result: 'success' };
      mockBridge.call.mockResolvedValue({ data: testData });

      const result = await adapter.call('test.method', { param: 'value' });

      expect(result).toEqual(testData);
      expect(mockBridge.call).toHaveBeenCalledWith('test.method', { param: 'value' });
    });

    it('should handle direct result without data wrapper', async () => {
      const testData = { result: 'success' };
      mockBridge.call.mockResolvedValue(testData);

      const result = await adapter.call('test.method');

      expect(result).toEqual(testData);
    });

    it('should throw WebShellError on backend error', async () => {
      mockBridge.call.mockResolvedValue({
        error: {
          message: 'Backend error',
          code: 'TEST_ERROR',
          details: { foo: 'bar' }
        }
      });

      await expect(adapter.call('test.method')).rejects.toThrow(WebShellError);
      await expect(adapter.call('test.method')).rejects.toThrow('Backend error');
    });

    it('should wrap non-WebShellError exceptions', async () => {
      mockBridge.call.mockRejectedValue(new Error('Network error'));

      await expect(adapter.call('test.method')).rejects.toThrow(WebShellError);
      await expect(adapter.call('test.method')).rejects.toMatchObject({
        code: WebShellErrorCode.BRIDGE_CALL_FAILED
      });
    });

    it('should handle unknown errors', async () => {
      mockBridge.call.mockRejectedValue('string error');

      await expect(adapter.call('test.method')).rejects.toThrow(WebShellError);
    });
  });

  describe('event handling', () => {
    it('should register event handler', () => {
      const handler = vi.fn();
      adapter.on('test-event', handler);

      expect(mockBridge.on).toHaveBeenCalled();
    });

    it('should call handler when event is emitted', () => {
      const handler = vi.fn();
      let bridgeHandler: Function | null = null;

      mockBridge.on.mockImplementation((event: string, h: Function) => {
        bridgeHandler = h;
      });

      adapter.on('test-event', handler);

      // Simulate bridge emitting event
      const eventData = { foo: 'bar' };
      bridgeHandler!(eventData);

      expect(handler).toHaveBeenCalledWith(eventData);
    });

    it('should support multiple handlers for same event', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      let bridgeHandler: Function | null = null;

      mockBridge.on.mockImplementation((event: string, h: Function) => {
        bridgeHandler = h;
      });

      adapter.on('test-event', handler1);
      adapter.on('test-event', handler2);

      // Simulate bridge emitting event
      const eventData = { foo: 'bar' };
      bridgeHandler!(eventData);

      expect(handler1).toHaveBeenCalledWith(eventData);
      expect(handler2).toHaveBeenCalledWith(eventData);
    });

    it('should remove event handler', () => {
      const handler = vi.fn();
      let bridgeHandler: Function | null = null;

      mockBridge.on.mockImplementation((event: string, h: Function) => {
        bridgeHandler = h;
      });

      adapter.on('test-event', handler);
      adapter.off('test-event', handler);

      // Simulate bridge emitting event
      bridgeHandler!({ foo: 'bar' });

      expect(handler).not.toHaveBeenCalled();
    });

    it('should handle errors in event handlers gracefully', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      const handler = vi.fn(() => {
        throw new Error('Handler error');
      });
      let bridgeHandler: Function | null = null;

      mockBridge.on.mockImplementation((event: string, h: Function) => {
        bridgeHandler = h;
      });

      adapter.on('test-event', handler);

      // Should not throw
      expect(() => {
        bridgeHandler!({ foo: 'bar' });
      }).not.toThrow();

      expect(consoleError).toHaveBeenCalled();
      consoleError.mockRestore();
    });
  });

  describe('isReady', () => {
    it('should return bridge ready status', () => {
      expect(adapter.isReady).toBe(true);

      mockBridge.ready = false;
      const adapter2 = new BridgeAdapter(mockBridge as WebShellBridge);
      expect(adapter2.isReady).toBe(false);
    });
  });
});
