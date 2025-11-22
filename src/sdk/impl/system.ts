/**
 * WebShell SDK - System Module Implementation
 *
 * System information, resources, clipboard, and process execution
 */

import { BridgeAdapter } from './bridge';
import type { SystemModule, ClipboardControl } from '../system';
import type { SystemInfo, MemoryInfo, DiskInfo, ExecResult } from '../types';

/**
 * Clipboard Control Implementation
 */
class ClipboardControlImpl implements ClipboardControl {
  private bridge: BridgeAdapter;

  constructor(bridge: BridgeAdapter) {
    this.bridge = bridge;
  }

  /**
   * Read text from clipboard
   *
   * @returns Promise with clipboard text
   *
   * @example
   * const text = await system.clipboard.readText();
   */
  async readText(): Promise<string> {
    const result = await this.bridge.call('system.clipboard.readText');
    return result?.text ?? result ?? '';
  }

  /**
   * Write text to clipboard
   *
   * @param text - Text to write
   * @returns Promise that resolves when text is written
   *
   * @example
   * await system.clipboard.writeText('Hello, clipboard!');
   */
  async writeText(text: string): Promise<void> {
    await this.bridge.call('system.clipboard.writeText', { text });
  }

  /**
   * Clear clipboard
   *
   * @returns Promise that resolves when clipboard is cleared
   *
   * @example
   * await system.clipboard.clear();
   */
  async clear(): Promise<void> {
    await this.bridge.call('system.clipboard.clear');
  }
}

/**
 * System Module Implementation
 *
 * Provides system information and resource monitoring
 */
export class SystemModuleImpl implements SystemModule {
  private bridge: BridgeAdapter;
  public clipboard: ClipboardControl;

  constructor(bridge: BridgeAdapter) {
    this.bridge = bridge;
    this.clipboard = new ClipboardControlImpl(bridge);
  }

  /**
   * Get system information
   *
   * @returns Promise with system info
   *
   * @example
   * const info = await system.getInfo();
   * console.log(`Running on ${info.platform} ${info.osVersion}`);
   */
  async getInfo(): Promise<SystemInfo> {
    const result = await this.bridge.call('system.getInfo');
    return this.parseSystemInfo(result);
  }

  /**
   * Get system uptime
   *
   * @returns Promise with uptime in seconds
   *
   * @example
   * const uptime = await system.getUptime();
   * console.log(`System uptime: ${uptime} seconds`);
   */
  async getUptime(): Promise<number> {
    const result = await this.bridge.call('system.getUptime');
    return result.uptime ?? result ?? 0;
  }

  /**
   * Get current CPU usage
   *
   * @returns Promise with CPU usage percentage (0-100)
   *
   * @example
   * const cpuUsage = await system.getCPUUsage();
   * console.log(`CPU usage: ${cpuUsage}%`);
   */
  async getCPUUsage(): Promise<number> {
    const result = await this.bridge.call('system.getCPUUsage');
    return result.usage ?? result ?? 0;
  }

  /**
   * Get current memory usage
   *
   * @returns Promise with memory info
   *
   * @example
   * const memory = await system.getMemoryUsage();
   * console.log(`Memory: ${memory.usedPercent}% used`);
   */
  async getMemoryUsage(): Promise<MemoryInfo> {
    const result = await this.bridge.call('system.getMemoryUsage');
    return this.parseMemoryInfo(result);
  }

  /**
   * Get disk usage for all mounted filesystems
   *
   * @returns Promise with array of disk info
   *
   * @example
   * const disks = await system.getDiskUsage();
   * disks.forEach(disk => {
   *   console.log(`${disk.path}: ${disk.usedPercent}% used`);
   * });
   */
  async getDiskUsage(): Promise<DiskInfo[]> {
    const result = await this.bridge.call('system.getDiskUsage');
    return this.parseDiskInfoList(result);
  }

  /**
   * Execute a system command
   *
   * @param command - Command to execute
   * @param args - Command arguments
   * @returns Promise with execution result
   *
   * @example
   * const result = await system.exec('ls', ['-la']);
   * console.log(result.stdout);
   */
  async exec(command: string, args: string[]): Promise<ExecResult> {
    const result = await this.bridge.call('system.exec', {
      command,
      args
    });

    return this.parseExecResult(result);
  }

  /**
   * Parse system info from backend format
   */
  private parseSystemInfo(data: any): SystemInfo {
    return {
      platform: data.platform ?? '',
      arch: data.arch ?? '',
      hostname: data.hostname ?? '',
      osVersion: data.osVersion ?? '',
      kernelVersion: data.kernelVersion ?? '',
      totalMemory: data.totalMemory ?? 0,
      cpuCount: data.cpuCount ?? 0
    };
  }

  /**
   * Parse memory info from backend format
   */
  private parseMemoryInfo(data: any): MemoryInfo {
    return {
      total: data.total ?? 0,
      used: data.used ?? 0,
      free: data.free ?? 0,
      available: data.available ?? 0,
      usedPercent: data.usedPercent ?? 0
    };
  }

  /**
   * Parse disk info list from backend format
   */
  private parseDiskInfoList(data: any): DiskInfo[] {
    if (!Array.isArray(data)) {
      return [];
    }

    return data.map(disk => ({
      path: disk.path ?? '',
      device: disk.device ?? '',
      fstype: disk.fstype ?? '',
      total: disk.total ?? 0,
      used: disk.used ?? 0,
      free: disk.free ?? 0,
      usedPercent: disk.usedPercent ?? 0
    }));
  }

  /**
   * Parse exec result from backend format
   */
  private parseExecResult(data: any): ExecResult {
    return {
      stdout: data.stdout ?? '',
      stderr: data.stderr ?? '',
      exitCode: data.exitCode ?? 0,
      success: data.success ?? (data.exitCode === 0)
    };
  }
}
