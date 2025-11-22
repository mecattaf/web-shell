/**
 * Stub implementations for modules not yet implemented
 *
 * These will be replaced with full implementations in future tasks
 */

import type { WindowModule } from '../window';
import type { ThemeModule } from '../theme';
import type { CalendarModule } from '../calendar';
import type { NotificationModule } from '../notifications';
import type { PowerModule } from '../power';
import type { SystemModule } from '../system';
import type { IPCModule } from '../ipc';

/**
 * Stub for Window module
 */
export const WindowModuleStub: WindowModule = {
  getSize: () => { throw new Error('Window module not yet implemented'); },
  setSize: () => { throw new Error('Window module not yet implemented'); },
  resize: () => { throw new Error('Window module not yet implemented'); },
  getPosition: () => { throw new Error('Window module not yet implemented'); },
  setPosition: () => { throw new Error('Window module not yet implemented'); },
  center: () => { throw new Error('Window module not yet implemented'); },
  setBlur: () => { throw new Error('Window module not yet implemented'); },
  setOpacity: () => { throw new Error('Window module not yet implemented'); },
  setTransparency: () => { throw new Error('Window module not yet implemented'); },
  minimize: () => { throw new Error('Window module not yet implemented'); },
  maximize: () => { throw new Error('Window module not yet implemented'); },
  restore: () => { throw new Error('Window module not yet implemented'); },
  focus: () => { throw new Error('Window module not yet implemented'); },
  onResize: () => { throw new Error('Window module not yet implemented'); },
  onMove: () => { throw new Error('Window module not yet implemented'); },
  onFocus: () => { throw new Error('Window module not yet implemented'); },
  onBlur: () => { throw new Error('Window module not yet implemented'); }
};

/**
 * Stub for Theme module
 */
export const ThemeModuleStub: ThemeModule = {
  getColors: () => { throw new Error('Theme module not yet implemented'); },
  getSpacing: () => { throw new Error('Theme module not yet implemented'); },
  getTypography: () => { throw new Error('Theme module not yet implemented'); },
  getRadii: () => { throw new Error('Theme module not yet implemented'); },
  getTheme: () => { throw new Error('Theme module not yet implemented'); },
  onThemeChange: () => { throw new Error('Theme module not yet implemented'); },
  applyTheme: () => { throw new Error('Theme module not yet implemented'); },
  get colors(): any { throw new Error('Theme module not yet implemented'); },
  get spacing(): any { throw new Error('Theme module not yet implemented'); },
  get typography(): any { throw new Error('Theme module not yet implemented'); },
  get radii(): any { throw new Error('Theme module not yet implemented'); }
};

/**
 * Stub for Calendar module
 */
export const CalendarModuleStub: CalendarModule = {
  listEvents: async () => { throw new Error('Calendar module not yet implemented'); },
  getEvent: async () => { throw new Error('Calendar module not yet implemented'); },
  createEvent: async () => { throw new Error('Calendar module not yet implemented'); },
  updateEvent: async () => { throw new Error('Calendar module not yet implemented'); },
  deleteEvent: async () => { throw new Error('Calendar module not yet implemented'); },
  eventsToday: async () => { throw new Error('Calendar module not yet implemented'); },
  eventsThisWeek: async () => { throw new Error('Calendar module not yet implemented'); },
  eventsThisMonth: async () => { throw new Error('Calendar module not yet implemented'); },
  onEventCreated: () => { throw new Error('Calendar module not yet implemented'); },
  onEventUpdated: () => { throw new Error('Calendar module not yet implemented'); },
  onEventDeleted: () => { throw new Error('Calendar module not yet implemented'); }
};

/**
 * Stub for Notification module
 */
export const NotificationModuleStub: NotificationModule = {
  send: async () => { throw new Error('Notification module not yet implemented'); },
  update: async () => { throw new Error('Notification module not yet implemented'); },
  close: async () => { throw new Error('Notification module not yet implemented'); },
  onClicked: () => { throw new Error('Notification module not yet implemented'); },
  onClosed: () => { throw new Error('Notification module not yet implemented'); },
  onActionClicked: () => { throw new Error('Notification module not yet implemented'); }
};

/**
 * Stub for Power module
 */
export const PowerModuleStub: PowerModule = {
  getBatteryStatus: async () => { throw new Error('Power module not yet implemented'); },
  onBatteryChange: () => { throw new Error('Power module not yet implemented'); },
  shutdown: async () => { throw new Error('Power module not yet implemented'); },
  restart: async () => { throw new Error('Power module not yet implemented'); },
  suspend: async () => { throw new Error('Power module not yet implemented'); },
  hibernate: async () => { throw new Error('Power module not yet implemented'); }
};

/**
 * Stub for System module
 */
export const SystemModuleStub: SystemModule = {
  getInfo: async () => { throw new Error('System module not yet implemented'); },
  getUptime: async () => { throw new Error('System module not yet implemented'); },
  getCPUUsage: async () => { throw new Error('System module not yet implemented'); },
  getMemoryUsage: async () => { throw new Error('System module not yet implemented'); },
  getDiskUsage: async () => { throw new Error('System module not yet implemented'); },
  get clipboard() {
    return {
      readText: async () => { throw new Error('System module not yet implemented'); },
      writeText: async () => { throw new Error('System module not yet implemented'); },
      clear: async () => { throw new Error('System module not yet implemented'); }
    };
  },
  exec: async () => { throw new Error('System module not yet implemented'); }
};

/**
 * Stub for IPC module
 */
export const IPCModuleStub: IPCModule = {
  call: async () => { throw new Error('IPC module not yet implemented'); },
  send: async () => { throw new Error('IPC module not yet implemented'); },
  stream: () => { throw new Error('IPC module not yet implemented'); },
  on: () => { throw new Error('IPC module not yet implemented'); },
  off: () => { throw new Error('IPC module not yet implemented'); }
};
