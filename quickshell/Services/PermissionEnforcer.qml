import QtQuick
import qs.Services

QtObject {
    id: root

    /**
     * The application name this enforcer is protecting
     */
    property string appName: ""

    /**
     * Enforce calendar read permission
     * @throws Error if permission is denied
     */
    function enforceCalendarRead() {
        if (!PermissionManager.hasPermission(appName, "calendar", "read")) {
            const error = `Permission denied: calendar.read for app '${appName}'`;
            PermissionManager.logAccess(appName, "calendar", "read", false);
            throw new Error(error);
        }
        PermissionManager.logAccess(appName, "calendar", "read", true);
    }

    /**
     * Enforce calendar write permission
     * @throws Error if permission is denied
     */
    function enforceCalendarWrite() {
        if (!PermissionManager.hasPermission(appName, "calendar", "write")) {
            const error = `Permission denied: calendar.write for app '${appName}'`;
            PermissionManager.logAccess(appName, "calendar", "write", false);
            throw new Error(error);
        }
        PermissionManager.logAccess(appName, "calendar", "write", true);
    }

    /**
     * Enforce filesystem read permission for a specific path
     * @param path The file path to read
     * @throws Error if permission is denied
     */
    function enforceFileRead(path) {
        if (!PermissionManager.checkFilesystemAccess(appName, path, "read")) {
            const error = `Permission denied: filesystem.read ${path} for app '${appName}'`;
            PermissionManager.logAccess(appName, `filesystem:${path}`, "read", false);
            throw new Error(error);
        }
        PermissionManager.logAccess(appName, `filesystem:${path}`, "read", true);
    }

    /**
     * Enforce filesystem write permission for a specific path
     * @param path The file path to write
     * @throws Error if permission is denied
     */
    function enforceFileWrite(path) {
        if (!PermissionManager.checkFilesystemAccess(appName, path, "write")) {
            const error = `Permission denied: filesystem.write ${path} for app '${appName}'`;
            PermissionManager.logAccess(appName, `filesystem:${path}`, "write", false);
            throw new Error(error);
        }
        PermissionManager.logAccess(appName, `filesystem:${path}`, "write", true);
    }

    /**
     * Enforce network access permission for a specific host
     * @param host The hostname to access
     * @throws Error if permission is denied
     */
    function enforceNetworkAccess(host) {
        if (!PermissionManager.checkNetworkAccess(appName, host)) {
            const error = `Permission denied: network access to ${host} for app '${appName}'`;
            PermissionManager.logAccess(appName, `network:${host}`, "access", false);
            throw new Error(error);
        }
        PermissionManager.logAccess(appName, `network:${host}`, "access", true);
    }

    /**
     * Enforce notification send permission
     * @throws Error if permission is denied
     */
    function enforceNotificationSend() {
        if (!PermissionManager.hasPermission(appName, "notifications", "send")) {
            const error = `Permission denied: notifications.send for app '${appName}'`;
            PermissionManager.logAccess(appName, "notifications", "send", false);
            throw new Error(error);
        }
        PermissionManager.logAccess(appName, "notifications", "send", true);
    }

    /**
     * Enforce process spawn permission
     * @throws Error if permission is denied
     */
    function enforceProcessSpawn() {
        if (!PermissionManager.hasPermission(appName, "processes", "spawn")) {
            const error = `Permission denied: processes.spawn for app '${appName}'`;
            PermissionManager.logAccess(appName, "processes", "spawn", false);
            throw new Error(error);
        }
        PermissionManager.logAccess(appName, "processes", "spawn", true);
    }

    /**
     * Enforce clipboard read permission
     * @throws Error if permission is denied
     */
    function enforceClipboardRead() {
        if (!PermissionManager.hasPermission(appName, "clipboard", "read")) {
            const error = `Permission denied: clipboard.read for app '${appName}'`;
            PermissionManager.logAccess(appName, "clipboard", "read", false);
            throw new Error(error);
        }
        PermissionManager.logAccess(appName, "clipboard", "read", true);
    }

    /**
     * Enforce clipboard write permission
     * @throws Error if permission is denied
     */
    function enforceClipboardWrite() {
        if (!PermissionManager.hasPermission(appName, "clipboard", "write")) {
            const error = `Permission denied: clipboard.write for app '${appName}'`;
            PermissionManager.logAccess(appName, "clipboard", "write", false);
            throw new Error(error);
        }
        PermissionManager.logAccess(appName, "clipboard", "write", true);
    }

    /**
     * Check if a permission is granted without throwing
     * @param category The permission category
     * @param action The action within the category
     * @return true if permission is granted, false otherwise
     */
    function checkPermission(category, action) {
        return PermissionManager.hasPermission(appName, category, action);
    }

    /**
     * Check filesystem access without throwing
     * @param path The file path to check
     * @param mode Access mode: "read" or "write"
     * @return true if access is allowed, false otherwise
     */
    function checkFileAccess(path, mode) {
        return PermissionManager.checkFilesystemAccess(appName, path, mode);
    }

    /**
     * Check network access without throwing
     * @param host The hostname to check
     * @return true if access is allowed, false otherwise
     */
    function checkNetworkHost(host) {
        return PermissionManager.checkNetworkAccess(appName, host);
    }
}
