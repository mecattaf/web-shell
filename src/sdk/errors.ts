/**
 * WebShell SDK Error Handling
 *
 * Standard error types for SDK operations
 */

/**
 * Base error class for all WebShell SDK errors
 */
export class WebShellError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'WebShellError';

    // Maintain proper stack trace for where our error was thrown (only available on V8)
    if (typeof (Error as any).captureStackTrace === 'function') {
      (Error as any).captureStackTrace(this, WebShellError);
    }
  }
}

/**
 * Error codes used throughout the SDK
 */
export enum WebShellErrorCode {
  // Bridge errors
  BRIDGE_NOT_INITIALIZED = 'BRIDGE_NOT_INITIALIZED',
  BRIDGE_CONNECTION_FAILED = 'BRIDGE_CONNECTION_FAILED',
  BRIDGE_CALL_FAILED = 'BRIDGE_CALL_FAILED',

  // IPC errors
  IPC_TIMEOUT = 'IPC_TIMEOUT',
  IPC_METHOD_NOT_FOUND = 'IPC_METHOD_NOT_FOUND',
  IPC_INVALID_PARAMS = 'IPC_INVALID_PARAMS',

  // App errors
  APP_NOT_FOUND = 'APP_NOT_FOUND',
  APP_ALREADY_RUNNING = 'APP_ALREADY_RUNNING',
  APP_LAUNCH_FAILED = 'APP_LAUNCH_FAILED',
  APP_CLOSE_FAILED = 'APP_CLOSE_FAILED',

  // Window errors
  WINDOW_OPERATION_FAILED = 'WINDOW_OPERATION_FAILED',

  // Calendar errors
  CALENDAR_EVENT_NOT_FOUND = 'CALENDAR_EVENT_NOT_FOUND',
  CALENDAR_INVALID_DATE = 'CALENDAR_INVALID_DATE',
  CALENDAR_OPERATION_FAILED = 'CALENDAR_OPERATION_FAILED',

  // Notification errors
  NOTIFICATION_SEND_FAILED = 'NOTIFICATION_SEND_FAILED',
  NOTIFICATION_NOT_FOUND = 'NOTIFICATION_NOT_FOUND',

  // System errors
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  SYSTEM_CALL_FAILED = 'SYSTEM_CALL_FAILED',
  CLIPBOARD_OPERATION_FAILED = 'CLIPBOARD_OPERATION_FAILED',

  // Power errors
  POWER_OPERATION_FAILED = 'POWER_OPERATION_FAILED',

  // Generic service errors
  NOT_FOUND = 'NOT_FOUND',
  INVALID_INPUT = 'INVALID_INPUT',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  METHOD_NOT_FOUND = 'METHOD_NOT_FOUND',
  BACKEND_ERROR = 'BACKEND_ERROR',
  TIMEOUT = 'TIMEOUT',

  // Generic
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Create a WebShellError with a specific code
 */
export function createError(code: WebShellErrorCode, message: string, details?: any): WebShellError {
  return new WebShellError(message, code, details);
}
