import QtQuick
import WebShell.Services

/**
 * WebShell API - Provides permission-controlled access to system resources
 * This is a reference implementation showing how to integrate permission enforcement
 */
QtObject {
    id: api

    /**
     * The application name using this API
     */
    property string appName: ""

    /**
     * Permission enforcer for this app
     */
    property PermissionEnforcer enforcer: PermissionEnforcer {
        appName: api.appName
    }

    // ========================================
    // Lifecycle Management
    // ========================================

    /**
     * Whether the app is currently active/focused
     */
    property bool isActive: false

    /**
     * Signal emitted when app is resumed/focused
     */
    signal appResumed()

    /**
     * Signal emitted when app is paused/unfocused
     */
    signal appPaused()

    /**
     * Signal emitted when app is about to close
     */
    signal appWillClose()

    /**
     * Lifecycle event connections
     */
    property Connections lifecycleConnections: Connections {
        target: AppOrchestrator

        function onAppFocused(focusedAppName) {
            if (focusedAppName === api.appName) {
                api.isActive = true;
                console.log("[WebShellAPI] App resumed:", api.appName);
                api.appResumed();
            } else if (api.isActive) {
                api.isActive = false;
                console.log("[WebShellAPI] App paused:", api.appName);
                api.appPaused();
            }
        }

        function onAppClosed(closedAppName) {
            if (closedAppName === api.appName) {
                console.log("[WebShellAPI] App will close:", api.appName);
                api.appWillClose();
            }
        }
    }

    /**
     * Inter-app messaging handler
     */
    property var messageHandler: null

    /**
     * Register a message handler for inter-app communication
     * @param handler - Function to handle messages: (message) => void
     */
    function registerMessageHandler(handler) {
        messageHandler = handler;

        // Register with AppMessaging
        AppMessaging.registerHandler(appName, (message) => {
            if (messageHandler) {
                messageHandler(message);
            }
        });

        console.log("[WebShellAPI] Message handler registered for:", appName);
    }

    /**
     * Send a message to another app
     * @param toApp - Target application name
     * @param messageType - Type/category of message
     * @param data - Message payload
     * @return true if delivered
     */
    function sendMessage(toApp, messageType, data) {
        return AppMessaging.sendMessage(appName, toApp, messageType, data);
    }

    /**
     * Broadcast a message to all apps
     * @param messageType - Type/category of message
     * @param data - Message payload
     * @return Number of apps that received the message
     */
    function broadcastMessage(messageType, data) {
        return AppMessaging.broadcast(appName, messageType, data);
    }

    // Calendar API
    /**
     * List calendar events
     * Requires: calendar.read permission
     * @return Array of calendar events
     */
    function listCalendarEvents() {
        enforcer.enforceCalendarRead();

        // TODO: Integrate with actual CalendarService when available
        console.log("[WebShellAPI] listCalendarEvents called by:", appName);
        return [];
    }

    /**
     * Add a calendar event
     * Requires: calendar.write permission
     * @param event Event object to add
     * @return Event ID or null on failure
     */
    function addCalendarEvent(event) {
        enforcer.enforceCalendarWrite();

        // TODO: Integrate with actual CalendarService when available
        console.log("[WebShellAPI] addCalendarEvent called by:", appName, "with:", JSON.stringify(event));
        return null;
    }

    /**
     * Update a calendar event
     * Requires: calendar.write permission
     * @param eventId The event ID to update
     * @param updates Object containing updates
     * @return true on success, false on failure
     */
    function updateCalendarEvent(eventId, updates) {
        enforcer.enforceCalendarWrite();

        // TODO: Integrate with actual CalendarService when available
        console.log("[WebShellAPI] updateCalendarEvent called by:", appName);
        return false;
    }

    /**
     * Delete a calendar event
     * Requires: calendar.write permission
     * @param eventId The event ID to delete
     * @return true on success, false on failure
     */
    function deleteCalendarEvent(eventId) {
        enforcer.enforceCalendarWrite();

        // TODO: Integrate with actual CalendarService when available
        console.log("[WebShellAPI] deleteCalendarEvent called by:", appName);
        return false;
    }

    // Filesystem API
    /**
     * Read file contents
     * Requires: filesystem.read permission for the specified path
     * @param path File path to read
     * @return File contents as string
     */
    function readFile(path) {
        enforcer.enforceFileRead(path);

        // TODO: Implement actual file reading
        console.log("[WebShellAPI] readFile called by:", appName, "for:", path);
        throw new Error("Not implemented");
    }

    /**
     * Write file contents
     * Requires: filesystem.write permission for the specified path
     * @param path File path to write
     * @param content Content to write
     * @return true on success, false on failure
     */
    function writeFile(path, content) {
        enforcer.enforceFileWrite(path);

        // TODO: Implement actual file writing
        console.log("[WebShellAPI] writeFile called by:", appName, "for:", path);
        throw new Error("Not implemented");
    }

    /**
     * List directory contents
     * Requires: filesystem.read permission for the specified path
     * @param path Directory path to list
     * @return Array of file/directory names
     */
    function listDirectory(path) {
        enforcer.enforceFileRead(path);

        // TODO: Implement actual directory listing
        console.log("[WebShellAPI] listDirectory called by:", appName, "for:", path);
        return [];
    }

    // Network API
    /**
     * Make HTTP request
     * Requires: network permission for the host
     * @param url URL to fetch
     * @param options Request options (method, headers, body, etc.)
     * @return Promise-like object or response
     */
    function fetch(url, options) {
        // Extract host from URL
        const urlObj = new URL(url);
        const host = urlObj.hostname;

        enforcer.enforceNetworkAccess(host);

        // TODO: Implement actual network request
        console.log("[WebShellAPI] fetch called by:", appName, "for:", url);
        throw new Error("Not implemented");
    }

    // Notification API
    /**
     * Send a notification
     * Requires: notifications.send permission
     * @param message Notification message
     * @param options Notification options (title, icon, etc.)
     */
    function sendNotification(message, options) {
        enforcer.enforceNotificationSend();

        // TODO: Integrate with actual NotificationService when available
        console.log("[WebShellAPI] sendNotification called by:", appName, ":", message);
    }

    // Process API
    /**
     * Spawn a new process
     * Requires: processes.spawn permission
     * @param command Command to execute
     * @param args Command arguments
     * @return Process handle or null
     */
    function spawnProcess(command, args) {
        enforcer.enforceProcessSpawn();

        // TODO: Implement actual process spawning
        console.log("[WebShellAPI] spawnProcess called by:", appName, ":", command);
        throw new Error("Not implemented");
    }

    // Clipboard API
    /**
     * Read clipboard contents
     * Requires: clipboard.read permission
     * @return Clipboard text content
     */
    function readClipboard() {
        enforcer.enforceClipboardRead();

        // TODO: Integrate with actual clipboard service
        console.log("[WebShellAPI] readClipboard called by:", appName);
        return "";
    }

    /**
     * Write to clipboard
     * Requires: clipboard.write permission
     * @param text Text to write to clipboard
     */
    function writeClipboard(text) {
        enforcer.enforceClipboardWrite();

        // TODO: Integrate with actual clipboard service
        console.log("[WebShellAPI] writeClipboard called by:", appName);
    }

    // Permission checking (non-throwing)
    /**
     * Check if the app has a specific permission
     * @param category Permission category
     * @param action Permission action
     * @return true if permission is granted, false otherwise
     */
    function hasPermission(category, action) {
        return enforcer.checkPermission(category, action);
    }

    /**
     * Check if the app can access a file path
     * @param path File path to check
     * @param mode Access mode: "read" or "write"
     * @return true if access is allowed, false otherwise
     */
    function canAccessFile(path, mode) {
        return enforcer.checkFileAccess(path, mode);
    }

    /**
     * Check if the app can access a network host
     * @param host Hostname to check
     * @return true if access is allowed, false otherwise
     */
    function canAccessHost(host) {
        return enforcer.checkNetworkHost(host);
    }
}
