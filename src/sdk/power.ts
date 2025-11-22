/**
 * WebShell SDK - Power Module
 *
 * Battery status and power management
 */

import type { BatteryStatus, EventHandler, UnsubscribeFn } from './types';

/**
 * Power Module Interface
 *
 * Monitor battery and control power actions
 */
export interface PowerModule {
  /**
   * Get current battery status
   * @returns Promise with battery status including level, charging state, and time estimates
   * @throws {WebShellError} POWER_OPERATION_FAILED if battery status cannot be retrieved
   * @example
   * ```typescript
   * const battery = await webshell.power.getBatteryStatus();
   * console.log(`Battery: ${battery.level}% (${battery.charging ? 'Charging' : 'Discharging'})`);
   * if (battery.timeToEmpty) {
   *   console.log(`Time remaining: ${battery.timeToEmpty} minutes`);
   * }
   * ```
   */
  getBatteryStatus(): Promise<BatteryStatus>;

  /**
   * Register handler for battery status changes
   * @param handler - Battery change handler called when battery status updates
   * @returns Unsubscribe function to remove the handler
   * @example
   * ```typescript
   * webshell.power.onBatteryChange((status) => {
   *   if (status.level < 20 && !status.charging) {
   *     console.warn('Low battery!');
   *   }
   * });
   * ```
   */
  onBatteryChange(handler: EventHandler<BatteryStatus>): UnsubscribeFn;

  /**
   * Shutdown the system
   * @returns Promise that resolves when shutdown is initiated
   * @throws {WebShellError} PERMISSION_DENIED if power.shutdown permission not granted
   * @throws {WebShellError} POWER_OPERATION_FAILED if shutdown fails
   * @example
   * ```typescript
   * await webshell.power.shutdown();
   * ```
   */
  shutdown(): Promise<void>;

  /**
   * Restart the system
   * @returns Promise that resolves when restart is initiated
   * @throws {WebShellError} PERMISSION_DENIED if power.restart permission not granted
   * @throws {WebShellError} POWER_OPERATION_FAILED if restart fails
   * @example
   * ```typescript
   * await webshell.power.restart();
   * ```
   */
  restart(): Promise<void>;

  /**
   * Suspend the system (sleep)
   * @returns Promise that resolves when suspend is initiated
   * @throws {WebShellError} PERMISSION_DENIED if power.suspend permission not granted
   * @throws {WebShellError} POWER_OPERATION_FAILED if suspend fails
   * @example
   * ```typescript
   * await webshell.power.suspend();
   * ```
   */
  suspend(): Promise<void>;

  /**
   * Hibernate the system
   * @returns Promise that resolves when hibernate is initiated
   * @throws {WebShellError} PERMISSION_DENIED if power.hibernate permission not granted
   * @throws {WebShellError} POWER_OPERATION_FAILED if hibernate fails
   * @example
   * ```typescript
   * await webshell.power.hibernate();
   * ```
   */
  hibernate(): Promise<void>;
}
