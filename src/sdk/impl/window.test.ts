/**
 * Tests for Window Module Implementation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WindowModuleImpl } from './window';
import { BridgeAdapter } from './bridge';
import type { WindowSize, WindowPosition } from '../types';
import type { WebShellBridge } from '../../bridge';

describe('WindowModuleImpl', () => {
  let mockBridge: any;
  let bridge: BridgeAdapter;
  let windowModule: WindowModuleImpl;
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
    windowModule = new WindowModuleImpl(bridge);
  });

  // Helper to emit bridge events
  const emitBridgeEvent = (event: string, data: any) => {
    const handler = bridgeEventHandlers.get(event);
    if (handler) {
      handler(data);
    }
  };

  describe('size management', () => {
    it('should get window size', async () => {
      const size: WindowSize = { width: 1024, height: 768 };
      mockBridge.call.mockResolvedValue({ data: size });
      await windowModule.initialize();

      const result = windowModule.getSize();
      expect(result).toEqual(size);
    });

    it('should set window size', () => {
      mockBridge.call.mockResolvedValue(undefined);

      windowModule.setSize(800, 600);

      expect(mockBridge.call).toHaveBeenCalledWith('window.setSize', {
        width: 800,
        height: 600
      });
    });

    it('should resize window (alias for setSize)', () => {
      mockBridge.call.mockResolvedValue(undefined);

      windowModule.resize(1280, 720);

      expect(mockBridge.call).toHaveBeenCalledWith('window.setSize', {
        width: 1280,
        height: 720
      });
    });

    it('should update cached size on resize event', () => {
      const newSize: WindowSize = { width: 1920, height: 1080 };

      // Emit resize event
      emitBridgeEvent('window-resize', newSize);

      // Size should be cached
      expect(windowModule.getSize()).toEqual(newSize);
    });
  });

  describe('position management', () => {
    it('should get window position', async () => {
      const size: WindowSize = { width: 800, height: 600 };
      const position: WindowPosition = { x: 100, y: 200 };
      mockBridge.call.mockResolvedValueOnce({ data: size });
      mockBridge.call.mockResolvedValueOnce({ data: position });
      await windowModule.initialize();

      const result = windowModule.getPosition();
      expect(result).toEqual(position);
    });

    it('should set window position', () => {
      mockBridge.call.mockResolvedValue(undefined);

      windowModule.setPosition(300, 400);

      expect(mockBridge.call).toHaveBeenCalledWith('window.setPosition', {
        x: 300,
        y: 400
      });
    });

    it('should center window', () => {
      mockBridge.call.mockResolvedValue(undefined);

      windowModule.center();

      expect(mockBridge.call).toHaveBeenCalledWith('window.center', undefined);
    });

    it('should update cached position on move event', () => {
      const newPosition: WindowPosition = { x: 500, y: 600 };

      // Emit move event
      emitBridgeEvent('window-move', newPosition);

      // Position should be cached
      expect(windowModule.getPosition()).toEqual(newPosition);
    });
  });

  describe('appearance', () => {
    it('should set blur', () => {
      mockBridge.call.mockResolvedValue(undefined);

      windowModule.setBlur(true);

      expect(mockBridge.call).toHaveBeenCalledWith('window.setBlur', {
        enabled: true
      });
    });

    it('should set opacity', () => {
      mockBridge.call.mockResolvedValue(undefined);

      windowModule.setOpacity(0.8);

      expect(mockBridge.call).toHaveBeenCalledWith('window.setOpacity', {
        opacity: 0.8
      });
    });

    it('should reject invalid opacity values', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      windowModule.setOpacity(1.5);
      expect(mockBridge.call).not.toHaveBeenCalled();
      expect(consoleError).toHaveBeenCalled();

      mockBridge.call.mockClear();
      consoleError.mockClear();

      windowModule.setOpacity(-0.1);
      expect(mockBridge.call).not.toHaveBeenCalled();
      expect(consoleError).toHaveBeenCalled();

      consoleError.mockRestore();
    });

    it('should set transparency', () => {
      mockBridge.call.mockResolvedValue(undefined);

      windowModule.setTransparency(true);

      expect(mockBridge.call).toHaveBeenCalledWith('window.setTransparency', {
        enabled: true
      });
    });
  });

  describe('state management', () => {
    it('should minimize window', () => {
      mockBridge.call.mockResolvedValue(undefined);

      windowModule.minimize();

      expect(mockBridge.call).toHaveBeenCalledWith('window.minimize', undefined);
    });

    it('should maximize window', () => {
      mockBridge.call.mockResolvedValue(undefined);

      windowModule.maximize();

      expect(mockBridge.call).toHaveBeenCalledWith('window.maximize', undefined);
    });

    it('should restore window', () => {
      mockBridge.call.mockResolvedValue(undefined);

      windowModule.restore();

      expect(mockBridge.call).toHaveBeenCalledWith('window.restore', undefined);
    });

    it('should focus window', () => {
      mockBridge.call.mockResolvedValue(undefined);

      windowModule.focus();

      expect(mockBridge.call).toHaveBeenCalledWith('window.focus', undefined);
    });
  });

  describe('event handlers', () => {
    it('should register resize handler', () => {
      const handler = vi.fn();
      const unsubscribe = windowModule.onResize(handler);

      expect(typeof unsubscribe).toBe('function');
    });

    it('should receive resize events via handler', () => {
      const handler = vi.fn();
      windowModule.onResize(handler);

      const size: WindowSize = { width: 1024, height: 768 };
      emitBridgeEvent('window-resize', size);

      expect(handler).toHaveBeenCalledWith(size);
    });

    it('should unsubscribe resize handler', () => {
      const handler = vi.fn();
      const unsubscribe = windowModule.onResize(handler);

      unsubscribe();

      const size: WindowSize = { width: 1024, height: 768 };
      emitBridgeEvent('window-resize', size);

      expect(handler).not.toHaveBeenCalled();
    });

    it('should register move handler', () => {
      const handler = vi.fn();
      const unsubscribe = windowModule.onMove(handler);

      expect(typeof unsubscribe).toBe('function');
    });

    it('should receive move events via handler', () => {
      const handler = vi.fn();
      windowModule.onMove(handler);

      const position: WindowPosition = { x: 100, y: 200 };
      emitBridgeEvent('window-move', position);

      expect(handler).toHaveBeenCalledWith(position);
    });

    it('should unsubscribe move handler', () => {
      const handler = vi.fn();
      const unsubscribe = windowModule.onMove(handler);

      unsubscribe();

      const position: WindowPosition = { x: 100, y: 200 };
      emitBridgeEvent('window-move', position);

      expect(handler).not.toHaveBeenCalled();
    });

    it('should register focus handler', () => {
      const handler = vi.fn();
      const unsubscribe = windowModule.onFocus(handler);

      expect(typeof unsubscribe).toBe('function');
    });

    it('should receive focus events via handler', () => {
      const handler = vi.fn();
      windowModule.onFocus(handler);

      emitBridgeEvent('window-focus', undefined);

      expect(handler).toHaveBeenCalled();
    });

    it('should unsubscribe focus handler', () => {
      const handler = vi.fn();
      const unsubscribe = windowModule.onFocus(handler);

      unsubscribe();

      emitBridgeEvent('window-focus', undefined);

      expect(handler).not.toHaveBeenCalled();
    });

    it('should register blur handler', () => {
      const handler = vi.fn();
      const unsubscribe = windowModule.onBlur(handler);

      expect(typeof unsubscribe).toBe('function');
    });

    it('should receive blur events via handler', () => {
      const handler = vi.fn();
      windowModule.onBlur(handler);

      emitBridgeEvent('window-blur', undefined);

      expect(handler).toHaveBeenCalled();
    });

    it('should unsubscribe blur handler', () => {
      const handler = vi.fn();
      const unsubscribe = windowModule.onBlur(handler);

      unsubscribe();

      emitBridgeEvent('window-blur', undefined);

      expect(handler).not.toHaveBeenCalled();
    });

    it('should handle errors in event handlers gracefully', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      const resizeHandler = vi.fn(() => {
        throw new Error('Resize handler error');
      });
      windowModule.onResize(resizeHandler);

      const size: WindowSize = { width: 1024, height: 768 };

      expect(() => {
        emitBridgeEvent('window-resize', size);
      }).not.toThrow();

      expect(consoleError).toHaveBeenCalled();
      consoleError.mockRestore();
    });

    it('should support multiple handlers for the same event', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      windowModule.onResize(handler1);
      windowModule.onResize(handler2);

      const size: WindowSize = { width: 1024, height: 768 };
      emitBridgeEvent('window-resize', size);

      expect(handler1).toHaveBeenCalledWith(size);
      expect(handler2).toHaveBeenCalledWith(size);
    });
  });

  describe('initialization', () => {
    it('should initialize and cache window data', async () => {
      const size: WindowSize = { width: 1024, height: 768 };
      const position: WindowPosition = { x: 100, y: 200 };

      mockBridge.call.mockResolvedValueOnce({ data: size });
      mockBridge.call.mockResolvedValueOnce({ data: position });

      await windowModule.initialize();

      expect(mockBridge.call).toHaveBeenCalledWith('window.getSize', undefined);
      expect(mockBridge.call).toHaveBeenCalledWith('window.getPosition', undefined);
      expect(windowModule.getSize()).toEqual(size);
      expect(windowModule.getPosition()).toEqual(position);
    });

    it('should handle initialization errors gracefully', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockBridge.call.mockRejectedValue(new Error('Initialization failed'));

      await windowModule.initialize();

      // Should keep defaults
      expect(windowModule.getSize()).toEqual({ width: 800, height: 600 });
      expect(windowModule.getPosition()).toEqual({ x: 0, y: 0 });
      expect(consoleError).toHaveBeenCalled();
      consoleError.mockRestore();
    });

    it('should handle partial initialization data', async () => {
      mockBridge.call.mockResolvedValueOnce(null); // size is null
      mockBridge.call.mockResolvedValueOnce({ data: { x: 100, y: 200 } }); // position succeeds

      await windowModule.initialize();

      // Size should use default
      expect(windowModule.getSize()).toEqual({ width: 800, height: 600 });
      // Position should use returned value
      expect(windowModule.getPosition()).toEqual({ x: 100, y: 200 });
    });
  });

  describe('error handling', () => {
    it('should handle setSize errors gracefully', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockBridge.call.mockRejectedValue(new Error('setSize failed'));

      windowModule.setSize(800, 600);

      // Wait for promise to reject
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(consoleError).toHaveBeenCalled();
      consoleError.mockRestore();
    });

    it('should handle setPosition errors gracefully', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockBridge.call.mockRejectedValue(new Error('setPosition failed'));

      windowModule.setPosition(100, 200);

      // Wait for promise to reject
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(consoleError).toHaveBeenCalled();
      consoleError.mockRestore();
    });
  });
});
