/**
 * Tests for IPC Module Implementation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { IPCModuleImpl } from './ipc';
import { BridgeAdapter } from './bridge';
import type { WebShellBridge } from '../../bridge';

describe('IPCModuleImpl', () => {
  let mockBridge: any;
  let bridge: BridgeAdapter;
  let ipcModule: IPCModuleImpl;
  let bridgeEventHandlers: Map<string, Function>;

  beforeEach(() => {
    bridgeEventHandlers = new Map();

    mockBridge = {
      call: vi.fn(),
      on: vi.fn((event: string, handler: Function) => {
        bridgeEventHandlers.set(event, handler);
      }),
      off: vi.fn(),
      ready: true
    };

    bridge = new BridgeAdapter(mockBridge as WebShellBridge);
    ipcModule = new IPCModuleImpl(bridge);
  });

  // Helper to emit bridge events
  const emitBridgeEvent = (event: string, data: any) => {
    const handler = bridgeEventHandlers.get(event);
    if (handler) {
      handler(data);
    }
  };

  describe('call', () => {
    it('should call backend method with params', async () => {
      const mockResult = { users: [{ id: 1, name: 'John' }] };
      mockBridge.call.mockResolvedValue({ data: mockResult });

      const result = await ipcModule.call('database.query', {
        table: 'users',
        where: { active: true }
      });

      expect(mockBridge.call).toHaveBeenCalledWith('ipc.call', {
        method: 'database.query',
        params: {
          table: 'users',
          where: { active: true }
        }
      });
      expect(result).toEqual(mockResult);
    });

    it('should call backend method without params', async () => {
      mockBridge.call.mockResolvedValue({ data: { status: 'ok' } });

      await ipcModule.call('service.ping');

      expect(mockBridge.call).toHaveBeenCalledWith('ipc.call', {
        method: 'service.ping',
        params: undefined
      });
    });

    it('should handle errors from backend', async () => {
      mockBridge.call.mockRejectedValue(new Error('Backend error'));

      await expect(
        ipcModule.call('invalid.method')
      ).rejects.toThrow('Backend error');
    });
  });

  describe('send', () => {
    it('should send one-way message with data', async () => {
      mockBridge.call.mockResolvedValue(undefined);

      await ipcModule.send('user:activity', {
        action: 'click',
        target: 'button'
      });

      expect(mockBridge.call).toHaveBeenCalledWith('ipc.send', {
        message: 'user:activity',
        data: {
          action: 'click',
          target: 'button'
        }
      });
    });

    it('should send message without data', async () => {
      mockBridge.call.mockResolvedValue(undefined);

      await ipcModule.send('app:ready');

      expect(mockBridge.call).toHaveBeenCalledWith('ipc.send', {
        message: 'app:ready',
        data: undefined
      });
    });
  });

  describe('stream', () => {
    it('should throw not implemented error', async () => {
      const generator = ipcModule.stream('logs');

      await expect(generator.next()).rejects.toThrow(
        'Streaming not yet implemented'
      );
    });
  });

  describe('event subscription', () => {
    it('should subscribe to backend events', () => {
      const handler = vi.fn();
      mockBridge.call.mockResolvedValue(undefined);

      const unsubscribe = ipcModule.on('user:created', handler);

      expect(typeof unsubscribe).toBe('function');
      expect(mockBridge.call).toHaveBeenCalledWith('ipc.subscribe', {
        event: 'user:created'
      });
    });

    it('should receive backend events', () => {
      const handler = vi.fn();
      mockBridge.call.mockResolvedValue(undefined);

      ipcModule.on('user:created', handler);

      const userData = { id: 1, name: 'John' };
      emitBridgeEvent('ipc-event', {
        name: 'user:created',
        data: userData
      });

      expect(handler).toHaveBeenCalledWith(userData);
    });

    it('should unsubscribe from events', () => {
      const handler = vi.fn();
      mockBridge.call.mockResolvedValue(undefined);

      const unsubscribe = ipcModule.on('user:created', handler);
      unsubscribe();

      expect(mockBridge.call).toHaveBeenCalledWith('ipc.unsubscribe', {
        event: 'user:created'
      });

      const userData = { id: 1, name: 'John' };
      emitBridgeEvent('ipc-event', {
        name: 'user:created',
        data: userData
      });

      expect(handler).not.toHaveBeenCalled();
    });

    it('should support multiple handlers for same event', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      mockBridge.call.mockResolvedValue(undefined);

      ipcModule.on('user:created', handler1);
      ipcModule.on('user:created', handler2);

      const userData = { id: 1, name: 'John' };
      emitBridgeEvent('ipc-event', {
        name: 'user:created',
        data: userData
      });

      expect(handler1).toHaveBeenCalledWith(userData);
      expect(handler2).toHaveBeenCalledWith(userData);
    });

    it('should only subscribe once for multiple handlers', () => {
      mockBridge.call.mockResolvedValue(undefined);

      ipcModule.on('user:created', vi.fn());
      ipcModule.on('user:created', vi.fn());

      // Should only subscribe once
      expect(mockBridge.call).toHaveBeenCalledTimes(1);
    });

    it('should handle event handler errors gracefully', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      const handler = vi.fn(() => {
        throw new Error('Handler error');
      });

      ipcModule.on('user:created', handler);

      expect(() => {
        emitBridgeEvent('ipc-event', {
          name: 'user:created',
          data: {}
        });
      }).not.toThrow();

      expect(consoleError).toHaveBeenCalled();
      consoleError.mockRestore();
    });

    it('should use off method to unsubscribe', () => {
      const handler = vi.fn();
      mockBridge.call.mockResolvedValue(undefined);

      ipcModule.on('user:created', handler);
      ipcModule.off('user:created', handler);

      const userData = { id: 1, name: 'John' };
      emitBridgeEvent('ipc-event', {
        name: 'user:created',
        data: userData
      });

      expect(handler).not.toHaveBeenCalled();
    });
  });
});
