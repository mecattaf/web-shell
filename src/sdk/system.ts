/**
 * WebShell SDK - System Module
 *
 * System information, resources, clipboard, and process execution
 */

import type { SystemInfo, MemoryInfo, DiskInfo, ExecResult } from './types';

/**
 * System Module Interface
 *
 * Access system information and resources
 */
export interface SystemModule {
  /**
   * Get system information
   * @returns Promise with system info including platform, architecture, and OS details
   * @throws {WebShellError} SYSTEM_CALL_FAILED if system info cannot be retrieved
   * @example
   * ```typescript
   * const info = await webshell.system.getInfo();
   * console.log(`Platform: ${info.platform} ${info.arch}`);
   * console.log(`OS: ${info.osVersion}`);
   * console.log(`CPUs: ${info.cpuCount}`);
   * ```
   */
  getInfo(): Promise<SystemInfo>;

  /**
   * Get system uptime
   * @returns Promise with uptime in seconds
   * @throws {WebShellError} SYSTEM_CALL_FAILED if uptime cannot be retrieved
   * @example
   * ```typescript
   * const uptime = await webshell.system.getUptime();
   * const hours = Math.floor(uptime / 3600);
   * console.log(`System uptime: ${hours} hours`);
   * ```
   */
  getUptime(): Promise<number>;

  /**
   * Get current CPU usage
   * @returns Promise with CPU usage percentage (0-100)
   * @throws {WebShellError} SYSTEM_CALL_FAILED if CPU usage cannot be retrieved
   * @example
   * ```typescript
   * const cpu = await webshell.system.getCPUUsage();
   * console.log(`CPU usage: ${cpu.toFixed(1)}%`);
   * ```
   */
  getCPUUsage(): Promise<number>;

  /**
   * Get current memory usage
   * @returns Promise with memory info including total, used, free, and available memory
   * @throws {WebShellError} SYSTEM_CALL_FAILED if memory info cannot be retrieved
   * @example
   * ```typescript
   * const mem = await webshell.system.getMemoryUsage();
   * console.log(`Memory: ${mem.usedPercent.toFixed(1)}% used`);
   * console.log(`Available: ${(mem.available / 1024 / 1024 / 1024).toFixed(2)} GB`);
   * ```
   */
  getMemoryUsage(): Promise<MemoryInfo>;

  /**
   * Get disk usage for all mounted filesystems
   * @returns Promise with array of disk info
   */
  getDiskUsage(): Promise<DiskInfo[]>;

  /**
   * Clipboard operations
   */
  clipboard: ClipboardControl;

  /**
   * Execute a system command
   * @param command - Command to execute
   * @param args - Command arguments
   * @returns Promise with execution result including stdout, stderr, and exit code
   * @throws {WebShellError} PERMISSION_DENIED if system.exec permission not granted
   * @throws {WebShellError} SYSTEM_CALL_FAILED if command execution fails
   * @example
   * ```typescript
   * const result = await webshell.system.exec('ls', ['-la', '/tmp']);
   * if (result.success) {
   *   console.log(result.stdout);
   * } else {
   *   console.error(`Command failed: ${result.stderr}`);
   * }
   * ```
   */
  exec(command: string, args: string[]): Promise<ExecResult>;
}

/**
 * Clipboard Control Interface
 *
 * Read and write clipboard contents
 */
export interface ClipboardControl {
  /**
   * Read text from clipboard
   * @returns Promise with clipboard text content
   * @throws {WebShellError} PERMISSION_DENIED if clipboard.read permission not granted
   * @throws {WebShellError} CLIPBOARD_OPERATION_FAILED if read fails
   * @example
   * ```typescript
   * const text = await webshell.system.clipboard.readText();
   * console.log(`Clipboard contains: ${text}`);
   * ```
   */
  readText(): Promise<string>;

  /**
   * Write text to clipboard
   * @param text - Text to write to clipboard
   * @returns Promise that resolves when text is written
   * @throws {WebShellError} PERMISSION_DENIED if clipboard.write permission not granted
   * @throws {WebShellError} CLIPBOARD_OPERATION_FAILED if write fails
   * @example
   * ```typescript
   * await webshell.system.clipboard.writeText('Hello, World!');
   * console.log('Text copied to clipboard');
   * ```
   */
  writeText(text: string): Promise<void>;

  /**
   * Clear clipboard
   * @returns Promise that resolves when clipboard is cleared
   * @throws {WebShellError} CLIPBOARD_OPERATION_FAILED if clear fails
   * @example
   * ```typescript
   * await webshell.system.clipboard.clear();
   * ```
   */
  clear(): Promise<void>;
}
