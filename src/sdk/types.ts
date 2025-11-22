/**
 * WebShell SDK Core Types
 *
 * Common types and interfaces used across SDK modules
 */

/**
 * App manifest structure
 */
export interface Manifest {
  name: string;
  version: string;
  description?: string;
  author?: string;
  icon?: string;
  permissions?: string[];
  entry: string;
  [key: string]: any;
}

/**
 * App information from registry
 */
export interface AppInfo {
  name: string;
  manifest: Manifest;
  running: boolean;
  windowId?: string;
}

/**
 * Inter-app message structure
 */
export interface AppMessage {
  from: string;
  to: string;
  type: string;
  data: any;
  timestamp: number;
}

/**
 * Window size
 */
export interface WindowSize {
  width: number;
  height: number;
}

/**
 * Window position
 */
export interface WindowPosition {
  x: number;
  y: number;
}

/**
 * Calendar event structure
 */
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  description?: string;
  location?: string;
  color?: string;
  attendees?: string[];
  reminders?: number[]; // minutes before event
}

/**
 * Input for creating a calendar event
 */
export interface CreateEventInput {
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  description?: string;
  location?: string;
  color?: string;
  attendees?: string[];
  reminders?: number[];
}

/**
 * Input for updating a calendar event
 */
export interface UpdateEventInput {
  title?: string;
  start?: Date;
  end?: Date;
  allDay?: boolean;
  description?: string;
  location?: string;
  color?: string;
  attendees?: string[];
  reminders?: number[];
}

/**
 * Notification options
 */
export interface NotificationOptions {
  title: string;
  message: string;
  icon?: string;
  urgency?: 'low' | 'normal' | 'critical';
  timeout?: number; // milliseconds, -1 for persistent
  actions?: NotificationAction[];
}

/**
 * Notification action button
 */
export interface NotificationAction {
  id: string;
  label: string;
}

/**
 * Battery status information
 */
export interface BatteryStatus {
  level: number; // 0-100
  charging: boolean;
  timeToEmpty?: number; // minutes
  timeToFull?: number; // minutes
}

/**
 * System information
 */
export interface SystemInfo {
  platform: string;
  arch: string;
  hostname: string;
  osVersion: string;
  kernelVersion: string;
  totalMemory: number; // bytes
  cpuCount: number;
}

/**
 * Memory usage information
 */
export interface MemoryInfo {
  total: number; // bytes
  used: number; // bytes
  free: number; // bytes
  available: number; // bytes
  usedPercent: number; // 0-100
}

/**
 * Disk usage information
 */
export interface DiskInfo {
  path: string;
  device: string;
  fstype: string;
  total: number; // bytes
  used: number; // bytes
  free: number; // bytes
  usedPercent: number; // 0-100
}

/**
 * Command execution result
 */
export interface ExecResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  success: boolean;
}

/**
 * Theme color tokens
 */
export interface ColorTokens {
  // Surface colors
  surface: string;
  surfaceHigh: string;
  surfaceLow: string;

  // Primary colors
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;

  // Secondary colors
  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;

  // Tertiary colors
  tertiary: string;
  onTertiary: string;
  tertiaryContainer: string;
  onTertiaryContainer: string;

  // Error colors
  error: string;
  onError: string;
  errorContainer: string;
  onErrorContainer: string;

  // Background and text
  background: string;
  onBackground: string;
  outline: string;
  outlineVariant: string;

  // Additional
  [key: string]: string;
}

/**
 * Theme spacing tokens
 */
export interface SpacingTokens {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  xxl: string;
  [key: string]: string;
}

/**
 * Theme typography tokens
 */
export interface TypographyTokens {
  fontFamily: string;
  fontFamilyMono: string;
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    xxl: string;
    [key: string]: string;
  };
  fontWeight: {
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
    [key: string]: number;
  };
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
    [key: string]: number;
  };
}

/**
 * Theme radius tokens
 */
export interface RadiusTokens {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  full: string;
  [key: string]: string;
}

/**
 * Complete theme object
 */
export interface Theme {
  colors: ColorTokens;
  spacing: SpacingTokens;
  typography: TypographyTokens;
  radii: RadiusTokens;
}

/**
 * Event handler function type
 */
export type EventHandler<T = any> = (data: T) => void;

/**
 * Unsubscribe function returned by event listeners
 */
export type UnsubscribeFn = () => void;

/**
 * Message handler for global messages
 */
export type MessageHandler = (message: any) => void;
