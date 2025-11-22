pragma Singleton
pragma ComponentBehavior: Bound
import QtQuick
import Qt.labs.platform

QtObject {
    id: root

    // Store granted permissions per app
    property var grantedPermissions: ({})

    signal permissionDenied(string appName, string permission)
    signal permissionGranted(string appName, string permission)

    /**
     * Register an app with its requested permissions
     * @param appName The application identifier
     * @param requestedPermissions Object containing permission categories and actions
     */
    function registerApp(appName, requestedPermissions) {
        grantedPermissions[appName] = requestedPermissions;
        console.log("[PermissionManager] Registered:", appName, "with permissions:", JSON.stringify(requestedPermissions));
    }

    /**
     * Check if an app has a specific permission
     * @param appName The application identifier
     * @param category The permission category (e.g., "calendar", "filesystem")
     * @param action The action within the category (e.g., "read", "write")
     * @return true if permission is granted, false otherwise
     */
    function hasPermission(appName, category, action) {
        const appPerms = grantedPermissions[appName];
        if (!appPerms) {
            console.warn("[PermissionManager] Unknown app:", appName);
            return false;
        }

        const categoryPerms = appPerms[category];
        if (!categoryPerms) {
            permissionDenied(appName, `${category}.${action}`);
            console.warn(`[PermissionManager] Denied: ${appName} -> ${category}.${action} (category not granted)`);
            return false;
        }

        const allowed = categoryPerms[action] === true;

        if (!allowed) {
            permissionDenied(appName, `${category}.${action}`);
            console.warn(`[PermissionManager] Denied: ${appName} -> ${category}.${action}`);
        }

        return allowed;
    }

    /**
     * Check filesystem access for a specific path
     * @param appName The application identifier
     * @param path The file path to check
     * @param mode Access mode: "read" or "write"
     * @return true if access is allowed, false otherwise
     */
    function checkFilesystemAccess(appName, path, mode) {
        const appPerms = grantedPermissions[appName];
        if (!appPerms?.filesystem) {
            console.warn(`[PermissionManager] Denied filesystem access: ${appName} -> ${path} (no filesystem permissions)`);
            return false;
        }

        const allowedPaths = mode === 'read'
            ? appPerms.filesystem.read || []
            : appPerms.filesystem.write || [];

        // Sanitize and normalize the requested path
        const sanitizedPath = sanitizePath(path);

        // Check if path matches any allowed path
        const allowed = allowedPaths.some(allowedPath => {
            const expandedPath = expandPath(allowedPath);
            return sanitizedPath.startsWith(expandedPath);
        });

        if (!allowed) {
            console.warn(`[PermissionManager] Denied filesystem.${mode}: ${appName} -> ${path}`);
        }

        return allowed;
    }

    /**
     * Check network access for a specific host
     * @param appName The application identifier
     * @param host The hostname to access
     * @return true if access is allowed, false otherwise
     */
    function checkNetworkAccess(appName, host) {
        const appPerms = grantedPermissions[appName];
        if (!appPerms?.network) {
            console.warn(`[PermissionManager] Denied network access: ${appName} -> ${host} (no network permissions)`);
            return false;
        }

        const allowedHosts = appPerms.network.allowed_hosts || [];

        // Special case: localhost always needs explicit permission
        if (host === 'localhost' || host === '127.0.0.1' || host === '::1') {
            const allowed = allowedHosts.includes('localhost') || allowedHosts.includes('127.0.0.1');
            if (!allowed) {
                console.warn(`[PermissionManager] Denied network access: ${appName} -> ${host}`);
            }
            return allowed;
        }

        // Check if host is in allowed list or wildcard is present
        const allowed = allowedHosts.includes(host) || allowedHosts.includes('*');
        if (!allowed) {
            console.warn(`[PermissionManager] Denied network access: ${appName} -> ${host}`);
        }
        return allowed;
    }

    /**
     * Expand path shortcuts like ~ to full paths
     * @param path The path to expand
     * @return Expanded path
     */
    function expandPath(path) {
        // Expand ~ to home directory
        if (path.startsWith('~')) {
            const homePath = StandardPaths.standardLocations(
                StandardPaths.HomeLocation
            )[0].toString().replace('file://', '');
            return homePath + path.substring(1);
        }
        return path;
    }

    /**
     * Sanitize path to prevent directory traversal attacks
     * @param path The path to sanitize
     * @return Sanitized path
     */
    function sanitizePath(path) {
        // Remove .. to prevent directory traversal
        let normalized = path.replace(/\.\./g, '');

        // Expand ~ if present
        normalized = expandPath(normalized);

        // Remove multiple slashes
        normalized = normalized.replace(/\/+/g, '/');

        return normalized;
    }

    /**
     * Log access attempts for auditing
     * @param appName The application identifier
     * @param resource The resource being accessed
     * @param action The action being performed
     * @param granted Whether access was granted
     */
    function logAccess(appName, resource, action, granted) {
        const timestamp = new Date().toISOString();
        const status = granted ? 'GRANTED' : 'DENIED';
        console.log(`[PermissionAudit] ${timestamp} | ${appName} | ${resource} | ${action} | ${status}`);

        // Future enhancement: Write to persistent audit log file
        // Could use Qt.labs.settings or file I/O to persist audit logs
    }

    /**
     * Revoke all permissions for an app
     * @param appName The application identifier
     */
    function revokeApp(appName) {
        if (grantedPermissions[appName]) {
            delete grantedPermissions[appName];
            console.log("[PermissionManager] Revoked all permissions for:", appName);
        }
    }

    /**
     * Get all registered apps
     * @return Array of app names
     */
    function getRegisteredApps() {
        return Object.keys(grantedPermissions);
    }

    /**
     * Get permissions for a specific app
     * @param appName The application identifier
     * @return Permissions object or null if app not found
     */
    function getAppPermissions(appName) {
        return grantedPermissions[appName] || null;
    }
}
