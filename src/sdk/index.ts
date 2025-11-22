/**
 * WebShell SDK
 *
 * Complete TypeScript SDK for building WebShell applications
 *
 * @example
 * ```typescript
 * import { webshell } from 'webshell-sdk';
 *
 * webshell.ready(() => {
 *   console.log('WebShell SDK ready!');
 *   console.log('App name:', webshell.shell.app.getName());
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Import specific modules
 * import { calendar, notifications } from 'webshell-sdk';
 *
 * // Create a calendar event
 * const event = await calendar.createEvent({
 *   title: 'Meeting',
 *   start: new Date(),
 *   end: new Date(Date.now() + 3600000),
 * });
 *
 * // Send a notification
 * await notifications.send({
 *   title: 'Event Created',
 *   message: 'Your meeting has been scheduled',
 * });
 * ```
 */

// Export all types
export * from './types';
export * from './errors';

// Export module interfaces
export type { ShellModule, AppControl } from './shell';
export type { WindowModule } from './window';
export type { ThemeModule } from './theme';
export type { CalendarModule } from './calendar';
export type { NotificationModule } from './notifications';
export type { PowerModule } from './power';
export type { SystemModule, ClipboardControl } from './system';
export type { IPCModule } from './ipc';
export type { WebShell } from './webshell';

// Re-export for convenience
export { WebShellError, WebShellErrorCode, createError } from './errors';

// Export SDK implementation
export { WebShellSDK, getWebShellSDK, initializeWebShellSDK } from './impl/webshell-sdk';

// Export module implementations (for advanced use cases)
export { CalendarModuleImpl } from './impl/calendar';
export { NotificationModuleImpl } from './impl/notifications';
export { PowerModuleImpl } from './impl/power';
export { SystemModuleImpl } from './impl/system';
export { IPCModuleImpl } from './impl/ipc';
