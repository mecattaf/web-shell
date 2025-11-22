/**
 * WebShell SDK - Notifications Module Implementation
 *
 * System notification management
 */

import { BridgeAdapter } from './bridge';
import type { NotificationModule } from '../notifications';
import type { NotificationOptions, EventHandler, UnsubscribeFn } from '../types';

/**
 * Notification Module Implementation
 *
 * Provides system notification sending and management
 */
export class NotificationModuleImpl implements NotificationModule {
  private bridge: BridgeAdapter;

  constructor(bridge: BridgeAdapter) {
    this.bridge = bridge;
  }

  /**
   * Send a notification
   *
   * @param notification - Notification options
   * @returns Promise with notification ID
   *
   * @example
   * const notificationId = await notifications.send({
   *   title: 'Hello',
   *   message: 'This is a notification',
   *   urgency: 'normal'
   * });
   */
  async send(notification: NotificationOptions): Promise<string> {
    const result = await this.bridge.call('notification.send', {
      title: notification.title,
      message: notification.message,
      icon: notification.icon,
      urgency: notification.urgency ?? 'normal',
      timeout: notification.timeout ?? 5000,
      actions: notification.actions
    });

    return result.id || result;
  }

  /**
   * Update an existing notification
   *
   * @param id - Notification ID
   * @param updates - Updated notification options
   * @returns Promise that resolves when notification is updated
   *
   * @example
   * await notifications.update(notificationId, {
   *   title: 'Updated Title',
   *   message: 'Updated message'
   * });
   */
  async update(id: string, updates: NotificationOptions): Promise<void> {
    await this.bridge.call('notification.update', {
      id,
      title: updates.title,
      message: updates.message,
      icon: updates.icon,
      urgency: updates.urgency,
      timeout: updates.timeout,
      actions: updates.actions
    });
  }

  /**
   * Close/dismiss a notification
   *
   * @param id - Notification ID
   * @returns Promise that resolves when notification is closed
   *
   * @example
   * await notifications.close(notificationId);
   */
  async close(id: string): Promise<void> {
    await this.bridge.call('notification.close', { id });
  }

  /**
   * Register handler for notification click events
   *
   * @param handler - Click handler (receives notification ID)
   * @returns Unsubscribe function
   *
   * @example
   * const unsubscribe = notifications.onClicked((notificationId) => {
   *   console.log('Notification clicked:', notificationId);
   * });
   */
  onClicked(handler: EventHandler<string>): UnsubscribeFn {
    const wrappedHandler = (data: any) => {
      handler(data.id || data);
    };

    this.bridge.on('notification-clicked', wrappedHandler);

    return () => {
      this.bridge.off('notification-clicked', wrappedHandler);
    };
  }

  /**
   * Register handler for notification closed events
   *
   * @param handler - Close handler (receives notification ID)
   * @returns Unsubscribe function
   *
   * @example
   * const unsubscribe = notifications.onClosed((notificationId) => {
   *   console.log('Notification closed:', notificationId);
   * });
   */
  onClosed(handler: EventHandler<string>): UnsubscribeFn {
    const wrappedHandler = (data: any) => {
      handler(data.id || data);
    };

    this.bridge.on('notification-closed', wrappedHandler);

    return () => {
      this.bridge.off('notification-closed', wrappedHandler);
    };
  }

  /**
   * Register handler for notification action button clicks
   *
   * @param handler - Action handler (receives {notificationId, actionId})
   * @returns Unsubscribe function
   *
   * @example
   * const unsubscribe = notifications.onActionClicked(({ notificationId, actionId }) => {
   *   console.log('Action clicked:', actionId, 'on notification:', notificationId);
   * });
   */
  onActionClicked(handler: EventHandler<{ notificationId: string; actionId: string }>): UnsubscribeFn {
    const wrappedHandler = (data: any) => {
      handler({
        notificationId: data.notificationId || data.id,
        actionId: data.actionId || data.action
      });
    };

    this.bridge.on('notification-action-clicked', wrappedHandler);

    return () => {
      this.bridge.off('notification-action-clicked', wrappedHandler);
    };
  }
}
