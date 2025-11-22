/**
 * Tests for Notifications Module Implementation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotificationModuleImpl } from './notifications';
import { BridgeAdapter } from './bridge';
import type { NotificationOptions } from '../types';
import type { WebShellBridge } from '../../bridge';

describe('NotificationModuleImpl', () => {
  let mockBridge: any;
  let bridge: BridgeAdapter;
  let notificationModule: NotificationModuleImpl;
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
    notificationModule = new NotificationModuleImpl(bridge);
  });

  const emitBridgeEvent = (event: string, data: any) => {
    const handler = bridgeEventHandlers.get(event);
    if (handler) {
      handler(data);
    }
  };

  describe('send', () => {
    it('should send a notification with all options', async () => {
      const options: NotificationOptions = {
        title: 'Test Notification',
        message: 'This is a test',
        icon: 'icon.png',
        urgency: 'critical',
        timeout: 10000,
        actions: [
          { id: 'accept', label: 'Accept' },
          { id: 'decline', label: 'Decline' }
        ]
      };

      mockBridge.call.mockResolvedValue({ data: { id: 'notif-1' } });

      const id = await notificationModule.send(options);

      expect(mockBridge.call).toHaveBeenCalledWith('notification.send', {
        title: options.title,
        message: options.message,
        icon: options.icon,
        urgency: options.urgency,
        timeout: options.timeout,
        actions: options.actions
      });
      expect(id).toBe('notif-1');
    });

    it('should send notification with default values', async () => {
      const options: NotificationOptions = {
        title: 'Simple Notification',
        message: 'Message'
      };

      mockBridge.call.mockResolvedValue({ data: { id: 'notif-2' } });

      await notificationModule.send(options);

      expect(mockBridge.call).toHaveBeenCalledWith('notification.send', {
        title: options.title,
        message: options.message,
        icon: undefined,
        urgency: 'normal',
        timeout: 5000,
        actions: undefined
      });
    });
  });

  describe('update', () => {
    it('should update an existing notification', async () => {
      mockBridge.call.mockResolvedValue(undefined);

      await notificationModule.update('notif-1', {
        title: 'Updated Title',
        message: 'Updated message'
      });

      expect(mockBridge.call).toHaveBeenCalledWith('notification.update', {
        id: 'notif-1',
        title: 'Updated Title',
        message: 'Updated message',
        icon: undefined,
        urgency: undefined,
        timeout: undefined,
        actions: undefined
      });
    });
  });

  describe('close', () => {
    it('should close a notification', async () => {
      mockBridge.call.mockResolvedValue(undefined);

      await notificationModule.close('notif-1');

      expect(mockBridge.call).toHaveBeenCalledWith('notification.close', {
        id: 'notif-1'
      });
    });
  });

  describe('event handlers', () => {
    it('should handle notification clicked events', () => {
      const handler = vi.fn();
      notificationModule.onClicked(handler);

      emitBridgeEvent('notification-clicked', { id: 'notif-1' });

      expect(handler).toHaveBeenCalledWith('notif-1');
    });

    it('should handle notification closed events', () => {
      const handler = vi.fn();
      notificationModule.onClosed(handler);

      emitBridgeEvent('notification-closed', { id: 'notif-1' });

      expect(handler).toHaveBeenCalledWith('notif-1');
    });

    it('should handle notification action clicked events', () => {
      const handler = vi.fn();
      notificationModule.onActionClicked(handler);

      emitBridgeEvent('notification-action-clicked', {
        notificationId: 'notif-1',
        actionId: 'accept'
      });

      expect(handler).toHaveBeenCalledWith({
        notificationId: 'notif-1',
        actionId: 'accept'
      });
    });

    it('should unsubscribe from clicked events', () => {
      const handler = vi.fn();
      const unsubscribe = notificationModule.onClicked(handler);

      unsubscribe();

      emitBridgeEvent('notification-clicked', { id: 'notif-1' });

      expect(handler).not.toHaveBeenCalled();
    });
  });
});
