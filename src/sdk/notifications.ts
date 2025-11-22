/**
 * WebShell SDK - Notifications Module
 *
 * System notification management
 */

import type { NotificationOptions, EventHandler, UnsubscribeFn } from './types';

/**
 * Notification Module Interface
 *
 * Send and manage system notifications
 */
export interface NotificationModule {
  /**
   * Send a notification
   * @param notification - Notification options including title and message
   * @returns Promise with unique notification ID
   * @throws {WebShellError} NOTIFICATION_SEND_FAILED if notification cannot be sent
   * @throws {WebShellError} PERMISSION_DENIED if notifications permission not granted
   * @example
   * ```typescript
   * const id = await webshell.notifications.send({
   *   title: 'Build Complete',
   *   message: 'Your project built successfully',
   *   urgency: 'normal',
   *   icon: 'success',
   *   timeout: 5000
   * });
   * console.log(`Notification sent with ID: ${id}`);
   * ```
   */
  send(notification: NotificationOptions): Promise<string>;

  /**
   * Update an existing notification
   * @param id - Notification ID
   * @param updates - Updated notification options
   * @returns Promise that resolves when notification is updated
   * @throws {WebShellError} NOTIFICATION_NOT_FOUND if notification doesn't exist
   * @throws {WebShellError} PERMISSION_DENIED if notifications permission not granted
   * @example
   * ```typescript
   * await webshell.notifications.update(notifId, {
   *   title: 'Updated Title',
   *   message: 'Updated message'
   * });
   * ```
   */
  update(id: string, updates: NotificationOptions): Promise<void>;

  /**
   * Close/dismiss a notification
   * @param id - Notification ID
   * @returns Promise that resolves when notification is closed
   * @throws {WebShellError} NOTIFICATION_NOT_FOUND if notification doesn't exist
   * @example
   * ```typescript
   * await webshell.notifications.close(notifId);
   * ```
   */
  close(id: string): Promise<void>;

  /**
   * Register handler for notification click events
   * @param handler - Click handler (receives notification ID)
   * @returns Unsubscribe function
   * @example
   * ```typescript
   * webshell.notifications.onClicked((notifId) => {
   *   console.log(`Notification ${notifId} clicked`);
   * });
   * ```
   */
  onClicked(handler: EventHandler<string>): UnsubscribeFn;

  /**
   * Register handler for notification closed events
   * @param handler - Close handler (receives notification ID)
   * @returns Unsubscribe function
   * @example
   * ```typescript
   * webshell.notifications.onClosed((notifId) => {
   *   console.log(`Notification ${notifId} closed`);
   * });
   * ```
   */
  onClosed(handler: EventHandler<string>): UnsubscribeFn;

  /**
   * Register handler for notification action button clicks
   * @param handler - Action handler (receives {notificationId, actionId})
   * @returns Unsubscribe function
   * @example
   * ```typescript
   * webshell.notifications.onActionClicked(({ notificationId, actionId }) => {
   *   console.log(`Action ${actionId} clicked on ${notificationId}`);
   *   if (actionId === 'view') {
   *     // Handle view action
   *   }
   * });
   * ```
   */
  onActionClicked(handler: EventHandler<{ notificationId: string; actionId: string }>): UnsubscribeFn;
}
