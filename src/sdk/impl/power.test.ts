/**
 * Tests for Power Module Implementation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PowerModuleImpl } from './power';
import { BridgeAdapter } from './bridge';
import type { BatteryStatus } from '../types';
import type { WebShellBridge } from '../../bridge';

describe('PowerModuleImpl', () => {
  let mockBridge: any;
  let bridge: BridgeAdapter;
  let powerModule: PowerModuleImpl;
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
    powerModule = new PowerModuleImpl(bridge);
  });

  const emitBridgeEvent = (event: string, data: any) => {
    const handler = bridgeEventHandlers.get(event);
    if (handler) {
      handler(data);
    }
  };

  describe('getBatteryStatus', () => {
    it('should get battery status', async () => {
      const batteryStatus: BatteryStatus = {
        level: 85,
        charging: true,
        timeToEmpty: undefined,
        timeToFull: 45
      };

      mockBridge.call.mockResolvedValue({ data: batteryStatus });

      const status = await powerModule.getBatteryStatus();

      expect(mockBridge.call).toHaveBeenCalledWith('power.getBatteryStatus', undefined);
      expect(status.level).toBe(85);
      expect(status.charging).toBe(true);
      expect(status.timeToFull).toBe(45);
    });

    it('should handle battery status with defaults', async () => {
      mockBridge.call.mockResolvedValue({ data: {} });

      const status = await powerModule.getBatteryStatus();

      expect(status.level).toBe(0);
      expect(status.charging).toBe(false);
    });
  });

  describe('battery change subscription', () => {
    it('should subscribe to battery changes', () => {
      const handler = vi.fn();
      const unsubscribe = powerModule.onBatteryChange(handler);

      expect(typeof unsubscribe).toBe('function');
    });

    it('should receive battery change events', () => {
      const handler = vi.fn();
      powerModule.onBatteryChange(handler);

      const newStatus: BatteryStatus = {
        level: 50,
        charging: false,
        timeToEmpty: 120
      };

      emitBridgeEvent('power-battery-changed', newStatus);

      expect(handler).toHaveBeenCalled();
      const status = handler.mock.calls[0][0];
      expect(status.level).toBe(50);
      expect(status.charging).toBe(false);
    });

    it('should unsubscribe from battery changes', () => {
      const handler = vi.fn();
      const unsubscribe = powerModule.onBatteryChange(handler);

      unsubscribe();

      emitBridgeEvent('power-battery-changed', {
        level: 50,
        charging: false
      });

      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('power actions', () => {
    it('should shutdown system', async () => {
      mockBridge.call.mockResolvedValue(undefined);

      await powerModule.shutdown();

      expect(mockBridge.call).toHaveBeenCalledWith('power.shutdown', undefined);
    });

    it('should restart system', async () => {
      mockBridge.call.mockResolvedValue(undefined);

      await powerModule.restart();

      expect(mockBridge.call).toHaveBeenCalledWith('power.restart', undefined);
    });

    it('should suspend system', async () => {
      mockBridge.call.mockResolvedValue(undefined);

      await powerModule.suspend();

      expect(mockBridge.call).toHaveBeenCalledWith('power.suspend', undefined);
    });

    it('should hibernate system', async () => {
      mockBridge.call.mockResolvedValue(undefined);

      await powerModule.hibernate();

      expect(mockBridge.call).toHaveBeenCalledWith('power.hibernate', undefined);
    });
  });
});
