---
id: task-3.3
title: Build permission system
status: Done
created_date: 2025-01-18
milestone: milestone-3
assignees: []
labels: [security, qml]
dependencies: [task-3.2]
---

## Description

Implement a capability-based permission system that enforces manifest-declared permissions. This ensures WebShell apps can only access resources they've explicitly requested and been granted.

## Acceptance Criteria

- [x] Permission enforcer QML component created
- [x] All permission types implemented
- [x] Runtime permission checking works
- [x] Permission denial handled gracefully
- [x] Audit logging for sensitive operations
- [x] User permission prompt system (for future)
- [x] Integration with WebShellAPI

## Implementation Plan

1. **Create PermissionManager Singleton**
````qml
// qs/modules/webshell/PermissionManager.qml
pragma Singleton
import QtQuick

Singleton {
    id: root
    
    // Store granted permissions per app
    property var grantedPermissions: ({})
    
    signal permissionDenied(string appName, string permission)
    signal permissionGranted(string appName, string permission)
    
    function registerApp(appName, requestedPermissions) {
        grantedPermissions[appName] = requestedPermissions;
        console.log("[PermissionManager] Registered:", appName);
    }
    
    function hasPermission(appName, category, action) {
        const appPerms = grantedPermissions[appName];
        if (!appPerms) {
            console.warn("[PermissionManager] Unknown app:", appName);
            return false;
        }
        
        const categoryPerms = appPerms[category];
        if (!categoryPerms) {
            return false;
        }
        
        const allowed = categoryPerms[action] === true;
        
        if (!allowed) {
            permissionDenied(appName, `${category}.${action}`);
            console.warn(`[PermissionManager] Denied: ${appName} -> ${category}.${action}`);
        }
        
        return allowed;
    }
    
    function checkFilesystemAccess(appName, path, mode) {
        const appPerms = grantedPermissions[appName];
        if (!appPerms?.filesystem) return false;
        
        const allowedPaths = mode === 'read' 
            ? appPerms.filesystem.read || []
            : appPerms.filesystem.write || [];
        
        // Check if path matches any allowed path
        return allowedPaths.some(allowedPath => {
            return path.startsWith(expandPath(allowedPath));
        });
    }
    
    function checkNetworkAccess(appName, host) {
        const appPerms = grantedPermissions[appName];
        if (!appPerms?.network) return false;
        
        const allowedHosts = appPerms.network.allowed_hosts || [];
        
        // Special case: localhost always needs explicit permission
        if (host === 'localhost' || host === '127.0.0.1') {
            return allowedHosts.includes('localhost');
        }
        
        return allowedHosts.includes(host) || allowedHosts.includes('*');
    }
    
    function expandPath(path) {
        // Expand ~ to home directory
        if (path.startsWith('~')) {
            return StandardPaths.standardLocations(
                StandardPaths.HomeLocation
            )[0].toString().replace('file://', '') + path.substring(1);
        }
        return path;
    }
    
    // Audit logging
    function logAccess(appName, resource, action, granted) {
        const timestamp = new Date().toISOString();
        console.log(`[PermissionAudit] ${timestamp} | ${appName} | ${resource} | ${action} | ${granted ? 'GRANTED' : 'DENIED'}`);
        
        // Could write to audit log file here
    }
}
````

2. **Create Permission Enforcement Layer**
````qml
// PermissionEnforcer.qml
QtObject {
    id: root
    
    property string appName: ""
    property var permissions: ({})
    
    // Enforce calendar access
    function enforceCalendarRead() {
        if (!PermissionManager.hasPermission(appName, "calendar", "read")) {
            throw new Error("Permission denied: calendar.read");
        }
        PermissionManager.logAccess(appName, "calendar", "read", true);
    }
    
    function enforceCalendarWrite() {
        if (!PermissionManager.hasPermission(appName, "calendar", "write")) {
            throw new Error("Permission denied: calendar.write");
        }
        PermissionManager.logAccess(appName, "calendar", "write", true);
    }
    
    // Enforce filesystem access
    function enforceFileRead(path) {
        if (!PermissionManager.checkFilesystemAccess(appName, path, "read")) {
            throw new Error(`Permission denied: filesystem.read ${path}`);
        }
        PermissionManager.logAccess(appName, `filesystem:${path}`, "read", true);
    }
    
    function enforceFileWrite(path) {
        if (!PermissionManager.checkFilesystemAccess(appName, path, "write")) {
            throw new Error(`Permission denied: filesystem.write ${path}`);
        }
        PermissionManager.logAccess(appName, `filesystem:${path}`, "write", true);
    }
    
    // Enforce network access
    function enforceNetworkAccess(host) {
        if (!PermissionManager.checkNetworkAccess(appName, host)) {
            throw new Error(`Permission denied: network access to ${host}`);
        }
        PermissionManager.logAccess(appName, `network:${host}`, "access", true);
    }
    
    // Enforce notification access
    function enforceNotificationSend() {
        if (!PermissionManager.hasPermission(appName, "notifications", "send")) {
            throw new Error("Permission denied: notifications.send");
        }
        PermissionManager.logAccess(appName, "notifications", "send", true);
    }
    
    // Enforce process spawning
    function enforceProcessSpawn() {
        if (!PermissionManager.hasPermission(appName, "processes", "spawn")) {
            throw new Error("Permission denied: processes.spawn");
        }
        PermissionManager.logAccess(appName, "processes", "spawn", true);
    }
}
````

3. **Integrate with WebShellAPI**
````qml
// In WebShellApi.qml
QtObject {
    id: api
    
    property string appName: ""
    property var enforcer: PermissionEnforcer {
        appName: api.appName
    }
    
    function listCalendarEvents() {
        enforcer.enforceCalendarRead();
        return CalendarService.eventsInWeek;
    }
    
    function addCalendarEvent(event) {
        enforcer.enforceCalendarWrite();
        return CalendarService.addItem(event);
    }
    
    function readFile(path) {
        enforcer.enforceFileRead(path);
        // Actual file reading logic
    }
    
    function sendNotification(message) {
        enforcer.enforceNotificationSend();
        NotificationService.send(message);
    }
}
````

4. **Create Permission Prompt System** (for future user prompts)
````qml
// PermissionPromptDialog.qml
Dialog {
    id: dialog
    
    property string appName: ""
    property string permissionName: ""
    property string reason: ""
    
    title: qsTr("Permission Request")
    
    contentItem: Column {
        spacing: 16
        
        Text {
            text: qsTr("%1 is requesting permission:").arg(appName)
            font.weight: Font.Medium
        }
        
        Text {
            text: permissionName
            font.weight: Font.Bold
        }
        
        Text {
            text: reason
            wrapMode: Text.Wrap
        }
    }
    
    standardButtons: Dialog.Yes | Dialog.No
    
    signal granted()
    signal denied()
    
    onAccepted: granted()
    onRejected: denied()
}
````

5. **Create Test Suite**
````qml
// tests/PermissionSystemTest.qml
import QtQuick
import QtTest

TestCase {
    name: "PermissionSystem"
    
    Component.onCompleted: {
        // Register test app with permissions
        PermissionManager.registerApp("test-app", {
            "calendar": { "read": true, "write": false },
            "filesystem": { 
                "read": ["~/Documents"],
                "write": []
            },
            "network": {
                "allowed_hosts": ["localhost"]
            }
        });
    }
    
    function test_calendarReadAllowed() {
        compare(
            PermissionManager.hasPermission("test-app", "calendar", "read"),
            true
        );
    }
    
    function test_calendarWriteDenied() {
        compare(
            PermissionManager.hasPermission("test-app", "calendar", "write"),
            false
        );
    }
    
    function test_filesystemPathAllowed() {
        compare(
            PermissionManager.checkFilesystemAccess(
                "test-app",
                "~/Documents/file.txt",
                "read"
            ),
            true
        );
    }
    
    function test_filesystemPathDenied() {
        compare(
            PermissionManager.checkFilesystemAccess(
                "test-app",
                "~/Downloads/file.txt",
                "read"
            ),
            false
        );
    }
    
    function test_networkLocalhostAllowed() {
        compare(
            PermissionManager.checkNetworkAccess("test-app", "localhost"),
            true
        );
    }
    
    function test_networkExternalDenied() {
        compare(
            PermissionManager.checkNetworkAccess("test-app", "google.com"),
            false
        );
    }
}
````

## Technical Notes

**Security Principles**:
- Default deny all permissions
- Explicit opt-in required
- Principle of least privilege
- Capability-based security
- Audit all sensitive operations

**Path Security**:
````qml
// Prevent directory traversal attacks
function sanitizePath(path) {
    const normalized = path.replace(/\.\./g, '');
    return normalized;
}
````

**Future Enhancements**:
````qml
// Runtime permission requests
function requestPermission(appName, permission) {
    // Show user prompt
    // Update granted permissions if approved
}

// Temporary permissions (session-only)
function grantTemporaryPermission(appName, permission, duration) {
    // Grant for limited time
    // Auto-revoke after duration
}
````

## Reference Material

Study security models:
- Android permission system
- Flatpak sandboxing
- Snap confinement
- Chrome extension permissions

## Definition of Done

- Permission system implemented
- All permission types enforced
- Tests passing
- Audit logging working
- Documentation complete
- Git commit: "task-3.3: Build permission system"
