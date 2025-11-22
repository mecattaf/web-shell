/**
 * Tests for System Module Implementation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SystemModuleImpl } from './system';
import { BridgeAdapter } from './bridge';
import type { SystemInfo, MemoryInfo, DiskInfo, ExecResult } from '../types';
import type { WebShellBridge } from '../../bridge';

describe('SystemModuleImpl', () => {
  let mockBridge: any;
  let bridge: BridgeAdapter;
  let systemModule: SystemModuleImpl;

  beforeEach(() => {
    mockBridge = {
      call: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
      ready: true
    };

    bridge = new BridgeAdapter(mockBridge as WebShellBridge);
    systemModule = new SystemModuleImpl(bridge);
  });

  describe('getInfo', () => {
    it('should get system information', async () => {
      const mockInfo: SystemInfo = {
        platform: 'linux',
        arch: 'x64',
        hostname: 'test-host',
        osVersion: 'Ubuntu 22.04',
        kernelVersion: '5.15.0',
        totalMemory: 16000000000,
        cpuCount: 8
      };

      mockBridge.call.mockResolvedValue({ data: mockInfo });

      const info = await systemModule.getInfo();

      expect(mockBridge.call).toHaveBeenCalledWith('system.getInfo', undefined);
      expect(info).toEqual(mockInfo);
    });

    it('should handle missing system info fields', async () => {
      mockBridge.call.mockResolvedValue({ data: {} });

      const info = await systemModule.getInfo();

      expect(info.platform).toBe('');
      expect(info.cpuCount).toBe(0);
    });
  });

  describe('getUptime', () => {
    it('should get system uptime', async () => {
      mockBridge.call.mockResolvedValue({ data: { uptime: 12345 } });

      const uptime = await systemModule.getUptime();

      expect(mockBridge.call).toHaveBeenCalledWith('system.getUptime', undefined);
      expect(uptime).toBe(12345);
    });
  });

  describe('getCPUUsage', () => {
    it('should get CPU usage', async () => {
      mockBridge.call.mockResolvedValue({ data: { usage: 45.5 } });

      const usage = await systemModule.getCPUUsage();

      expect(mockBridge.call).toHaveBeenCalledWith('system.getCPUUsage', undefined);
      expect(usage).toBe(45.5);
    });
  });

  describe('getMemoryUsage', () => {
    it('should get memory usage', async () => {
      const mockMemory: MemoryInfo = {
        total: 16000000000,
        used: 8000000000,
        free: 8000000000,
        available: 10000000000,
        usedPercent: 50
      };

      mockBridge.call.mockResolvedValue({ data: mockMemory });

      const memory = await systemModule.getMemoryUsage();

      expect(mockBridge.call).toHaveBeenCalledWith('system.getMemoryUsage', undefined);
      expect(memory).toEqual(mockMemory);
    });
  });

  describe('getDiskUsage', () => {
    it('should get disk usage for all filesystems', async () => {
      const mockDisks: DiskInfo[] = [
        {
          path: '/',
          device: '/dev/sda1',
          fstype: 'ext4',
          total: 500000000000,
          used: 250000000000,
          free: 250000000000,
          usedPercent: 50
        },
        {
          path: '/home',
          device: '/dev/sda2',
          fstype: 'ext4',
          total: 1000000000000,
          used: 300000000000,
          free: 700000000000,
          usedPercent: 30
        }
      ];

      mockBridge.call.mockResolvedValue({ data: mockDisks });

      const disks = await systemModule.getDiskUsage();

      expect(mockBridge.call).toHaveBeenCalledWith('system.getDiskUsage', undefined);
      expect(disks).toHaveLength(2);
      expect(disks[0].path).toBe('/');
      expect(disks[1].path).toBe('/home');
    });

    it('should handle empty disk list', async () => {
      mockBridge.call.mockResolvedValue({ data: [] });

      const disks = await systemModule.getDiskUsage();

      expect(disks).toEqual([]);
    });

    it('should handle non-array response', async () => {
      mockBridge.call.mockResolvedValue({ data: null });

      const disks = await systemModule.getDiskUsage();

      expect(disks).toEqual([]);
    });
  });

  describe('exec', () => {
    it('should execute a command', async () => {
      const mockResult: ExecResult = {
        stdout: 'command output',
        stderr: '',
        exitCode: 0,
        success: true
      };

      mockBridge.call.mockResolvedValue({ data: mockResult });

      const result = await systemModule.exec('ls', ['-la']);

      expect(mockBridge.call).toHaveBeenCalledWith('system.exec', {
        command: 'ls',
        args: ['-la']
      });
      expect(result).toEqual(mockResult);
    });

    it('should handle failed command execution', async () => {
      const mockResult: ExecResult = {
        stdout: '',
        stderr: 'command not found',
        exitCode: 127,
        success: false
      };

      mockBridge.call.mockResolvedValue({ data: mockResult });

      const result = await systemModule.exec('invalid-command', []);

      expect(result.success).toBe(false);
      expect(result.exitCode).toBe(127);
    });
  });

  describe('clipboard', () => {
    it('should read text from clipboard', async () => {
      mockBridge.call.mockResolvedValue({ data: { text: 'clipboard content' } });

      const text = await systemModule.clipboard.readText();

      expect(mockBridge.call).toHaveBeenCalledWith('system.clipboard.readText', undefined);
      expect(text).toBe('clipboard content');
    });

    it('should handle empty clipboard', async () => {
      mockBridge.call.mockResolvedValue({ data: { text: '' } });

      const text = await systemModule.clipboard.readText();

      expect(text).toBe('');
    });

    it('should write text to clipboard', async () => {
      mockBridge.call.mockResolvedValue(undefined);

      await systemModule.clipboard.writeText('new content');

      expect(mockBridge.call).toHaveBeenCalledWith('system.clipboard.writeText', {
        text: 'new content'
      });
    });

    it('should clear clipboard', async () => {
      mockBridge.call.mockResolvedValue(undefined);

      await systemModule.clipboard.clear();

      expect(mockBridge.call).toHaveBeenCalledWith('system.clipboard.clear', undefined);
    });
  });
});
