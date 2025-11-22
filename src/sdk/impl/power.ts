/**
 * WebShell SDK - Power Module Implementation
 *
 * Battery status and power management
 */

import { BridgeAdapter } from './bridge';
import type { PowerModule } from '../power';
import type { BatteryStatus, EventHandler, UnsubscribeFn } from '../types';

/**
 * Power Module Implementation
 *
 * Provides battery monitoring and power action controls
 */
export class PowerModuleImpl implements PowerModule {
  private bridge: BridgeAdapter;

  constructor(bridge: BridgeAdapter) {
    this.bridge = bridge;
  }

  /**
   * Get current battery status
   *
   * @returns Promise with battery status
   *
   * @example
   * const battery = await power.getBatteryStatus();
   * console.log(`Battery: ${battery.level}%, charging: ${battery.charging}`);
   */
  async getBatteryStatus(): Promise<BatteryStatus> {
    const result = await this.bridge.call('power.getBatteryStatus');
    return this.parseBatteryStatus(result);
  }

  /**
   * Register handler for battery status changes
   *
   * @param handler - Battery change handler
   * @returns Unsubscribe function
   *
   * @example
   * const unsubscribe = power.onBatteryChange((status) => {
   *   console.log(`Battery changed: ${status.level}%`);
   * });
   */
  onBatteryChange(handler: EventHandler<BatteryStatus>): UnsubscribeFn {
    const wrappedHandler = (data: any) => {
      handler(this.parseBatteryStatus(data));
    };

    this.bridge.on('power-battery-changed', wrappedHandler);

    return () => {
      this.bridge.off('power-battery-changed', wrappedHandler);
    };
  }

  /**
   * Shutdown the system
   *
   * @returns Promise that resolves when shutdown is initiated
   *
   * @example
   * await power.shutdown();
   */
  async shutdown(): Promise<void> {
    await this.bridge.call('power.shutdown');
  }

  /**
   * Restart the system
   *
   * @returns Promise that resolves when restart is initiated
   *
   * @example
   * await power.restart();
   */
  async restart(): Promise<void> {
    await this.bridge.call('power.restart');
  }

  /**
   * Suspend the system (sleep)
   *
   * @returns Promise that resolves when suspend is initiated
   *
   * @example
   * await power.suspend();
   */
  async suspend(): Promise<void> {
    await this.bridge.call('power.suspend');
  }

  /**
   * Hibernate the system
   *
   * @returns Promise that resolves when hibernate is initiated
   *
   * @example
   * await power.hibernate();
   */
  async hibernate(): Promise<void> {
    await this.bridge.call('power.hibernate');
  }

  /**
   * Parse battery status from backend format
   */
  private parseBatteryStatus(data: any): BatteryStatus {
    return {
      level: data.level ?? 0,
      charging: data.charging ?? false,
      timeToEmpty: data.timeToEmpty,
      timeToFull: data.timeToFull
    };
  }
}
