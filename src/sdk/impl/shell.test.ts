/**
 * Tests for Shell Module Implementation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ShellModuleImpl } from './shell';
import { BridgeAdapter } from './bridge';
import type { AppMessage } from '../types';

// Mock BridgeAdapter
vi.mock('./bridge', () => {
  return {
    BridgeAdapter: vi.fn().mockImplementation(() => {
      const eventHandlers = new Map<string, Set<Function>>();

      return {
        call: vi.fn(),
        on: vi.fn((event: string, handler: Function) => {
          if (!eventHandlers.has(event)) {
            eventHandlers.set(event, new Set());
          }
          eventHandlers.get(event)!.add(handler);
        }),
        off: vi.fn(),
        isReady: true,
        // Helper to emit events for testing
        _emit: (event: string, data: any) => {
          const handlers = eventHandlers.get(event);
          if (handlers) {
            handlers.forEach(handler => handler(data));
          }
        },
        _eventHandlers: eventHandlers
      };
    })
  };
});

describe('ShellModuleImpl', () => {
  let bridge: any;
  let shellModule: ShellModuleImpl;

  beforeEach(() => {
    bridge = new BridgeAdapter({} as any);
    shellModule = new ShellModuleImpl(bridge);
  });

  describe('app control', () => {
    it('should get app name', async () => {
      bridge.call.mockResolvedValue('test-app');
      await shellModule.initialize();

      const name = shellModule.app.getName();
      expect(name).toBe('test-app');
    });

    it('should get manifest', async () => {
      const manifest = {
        name: 'test-app',
        version: '1.0.0',
        entry: 'index.html'
      };
      bridge.call.mockResolvedValueOnce('test-app');
      bridge.call.mockResolvedValueOnce(manifest);
      await shellModule.initialize();

      const result = shellModule.app.getManifest();
      expect(result).toEqual(manifest);
    });

    it('should close app', () => {
      shellModule.app.close();
      expect(bridge.call).toHaveBeenCalledWith('shell.closeApp');
    });

    it('should reload app', () => {
      shellModule.app.reload();
      expect(bridge.call).toHaveBeenCalledWith('shell.reloadApp');
    });
  });

  describe('messaging', () => {
    it('should send message to target app', async () => {
      bridge.call.mockResolvedValue(undefined);

      await shellModule.sendMessage('target-app', 'test-message', { foo: 'bar' });

      expect(bridge.call).toHaveBeenCalledWith('shell.sendMessage', {
        target: 'target-app',
        type: 'test-message',
        data: { foo: 'bar' }
      });
    });

    it('should broadcast message', async () => {
      bridge.call.mockResolvedValue(undefined);

      await shellModule.broadcast('announcement', { message: 'hello' });

      expect(bridge.call).toHaveBeenCalledWith('shell.broadcast', {
        type: 'announcement',
        data: { message: 'hello' }
      });
    });

    it('should register message handler', () => {
      const handler = vi.fn();
      const unsubscribe = shellModule.onMessage(handler);

      expect(typeof unsubscribe).toBe('function');
    });

    it('should receive messages via handler', () => {
      const handler = vi.fn();
      shellModule.onMessage(handler);

      const message: AppMessage = {
        from: 'sender-app',
        to: 'test-app',
        type: 'greeting',
        data: { text: 'hello' },
        timestamp: Date.now()
      };

      // Simulate message from bridge
      bridge._emit('message', message);

      expect(handler).toHaveBeenCalledWith(message);
    });

    it('should unsubscribe message handler', () => {
      const handler = vi.fn();
      const unsubscribe = shellModule.onMessage(handler);

      // Unsubscribe
      unsubscribe();

      const message: AppMessage = {
        from: 'sender-app',
        to: 'test-app',
        type: 'greeting',
        data: { text: 'hello' },
        timestamp: Date.now()
      };

      // Simulate message from bridge
      bridge._emit('message', message);

      // Handler should not be called
      expect(handler).not.toHaveBeenCalled();
    });

    it('should handle errors in message handlers gracefully', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      const handler = vi.fn(() => {
        throw new Error('Handler error');
      });
      shellModule.onMessage(handler);

      const message: AppMessage = {
        from: 'sender-app',
        to: 'test-app',
        type: 'greeting',
        data: { text: 'hello' },
        timestamp: Date.now()
      };

      // Should not throw
      expect(() => {
        bridge._emit('message', message);
      }).not.toThrow();

      expect(consoleError).toHaveBeenCalled();
      consoleError.mockRestore();
    });
  });

  describe('app registry', () => {
    it('should list apps', async () => {
      const apps = [
        { name: 'app1', manifest: { name: 'app1', version: '1.0.0', entry: 'index.html' }, running: true },
        { name: 'app2', manifest: { name: 'app2', version: '1.0.0', entry: 'index.html' }, running: false }
      ];
      bridge.call.mockResolvedValue(apps);

      const result = await shellModule.listApps();

      expect(result).toEqual(apps);
      expect(bridge.call).toHaveBeenCalledWith('shell.listApps');
    });

    it('should launch app', async () => {
      bridge.call.mockResolvedValue(undefined);

      await shellModule.launchApp('calendar');

      expect(bridge.call).toHaveBeenCalledWith('shell.launchApp', { name: 'calendar' });
    });

    it('should close app', async () => {
      bridge.call.mockResolvedValue(undefined);

      await shellModule.closeApp('calendar');

      expect(bridge.call).toHaveBeenCalledWith('shell.closeApp', { name: 'calendar' });
    });

    it('should get app info', async () => {
      const appInfo = {
        name: 'calendar',
        manifest: { name: 'calendar', version: '1.0.0', entry: 'index.html' },
        running: true
      };
      bridge.call.mockResolvedValue(appInfo);

      const result = await shellModule.getAppInfo('calendar');

      expect(result).toEqual(appInfo);
      expect(bridge.call).toHaveBeenCalledWith('shell.getAppInfo', { name: 'calendar' });
    });
  });

  describe('initialization', () => {
    it('should initialize and cache app data', async () => {
      bridge.call.mockResolvedValueOnce('test-app');
      bridge.call.mockResolvedValueOnce({
        name: 'test-app',
        version: '1.0.0',
        entry: 'index.html'
      });

      await shellModule.initialize();

      expect(bridge.call).toHaveBeenCalledWith('shell.getAppName');
      expect(bridge.call).toHaveBeenCalledWith('shell.getManifest');
    });

    it('should handle initialization errors gracefully', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      bridge.call.mockRejectedValue(new Error('Initialization failed'));

      await shellModule.initialize();

      // Should set defaults
      expect(shellModule.app.getName()).toBe('unknown');
      expect(consoleError).toHaveBeenCalled();
      consoleError.mockRestore();
    });
  });
});
