import QtQuick
import QtTest
import WebShell.Services

/**
 * Test suite for the Permission System
 * Tests PermissionManager and PermissionEnforcer functionality
 */
TestCase {
    name: "PermissionSystem"

    // Clean up permissions before each test
    function init() {
        // Clear all registered apps
        const apps = PermissionManager.getRegisteredApps();
        for (let i = 0; i < apps.length; i++) {
            PermissionManager.revokeApp(apps[i]);
        }
    }

    // Test: Register an app with permissions
    function test_registerApp() {
        const permissions = {
            "calendar": { "read": true, "write": false },
            "filesystem": {
                "read": ["~/Documents"],
                "write": []
            }
        };

        PermissionManager.registerApp("test-app", permissions);

        const registered = PermissionManager.getRegisteredApps();
        verify(registered.includes("test-app"));
    }

    // Test: Calendar read permission allowed
    function test_calendarReadAllowed() {
        PermissionManager.registerApp("test-app", {
            "calendar": { "read": true, "write": false }
        });

        compare(
            PermissionManager.hasPermission("test-app", "calendar", "read"),
            true
        );
    }

    // Test: Calendar write permission denied
    function test_calendarWriteDenied() {
        PermissionManager.registerApp("test-app", {
            "calendar": { "read": true, "write": false }
        });

        compare(
            PermissionManager.hasPermission("test-app", "calendar", "write"),
            false
        );
    }

    // Test: Unknown app denied
    function test_unknownAppDenied() {
        compare(
            PermissionManager.hasPermission("unknown-app", "calendar", "read"),
            false
        );
    }

    // Test: Category not granted
    function test_categoryNotGranted() {
        PermissionManager.registerApp("test-app", {
            "calendar": { "read": true }
        });

        compare(
            PermissionManager.hasPermission("test-app", "filesystem", "read"),
            false
        );
    }

    // Test: Filesystem path allowed
    function test_filesystemPathAllowed() {
        PermissionManager.registerApp("test-app", {
            "filesystem": {
                "read": ["~/Documents"],
                "write": []
            }
        });

        compare(
            PermissionManager.checkFilesystemAccess(
                "test-app",
                "~/Documents/file.txt",
                "read"
            ),
            true
        );
    }

    // Test: Filesystem path denied
    function test_filesystemPathDenied() {
        PermissionManager.registerApp("test-app", {
            "filesystem": {
                "read": ["~/Documents"],
                "write": []
            }
        });

        compare(
            PermissionManager.checkFilesystemAccess(
                "test-app",
                "~/Downloads/file.txt",
                "read"
            ),
            false
        );
    }

    // Test: Filesystem write denied when only read granted
    function test_filesystemWriteDenied() {
        PermissionManager.registerApp("test-app", {
            "filesystem": {
                "read": ["~/Documents"],
                "write": []
            }
        });

        compare(
            PermissionManager.checkFilesystemAccess(
                "test-app",
                "~/Documents/file.txt",
                "write"
            ),
            false
        );
    }

    // Test: Network localhost allowed
    function test_networkLocalhostAllowed() {
        PermissionManager.registerApp("test-app", {
            "network": {
                "allowed_hosts": ["localhost"]
            }
        });

        compare(
            PermissionManager.checkNetworkAccess("test-app", "localhost"),
            true
        );
    }

    // Test: Network localhost denied without permission
    function test_networkLocalhostDenied() {
        PermissionManager.registerApp("test-app", {
            "network": {
                "allowed_hosts": ["example.com"]
            }
        });

        compare(
            PermissionManager.checkNetworkAccess("test-app", "localhost"),
            false
        );
    }

    // Test: Network external host allowed
    function test_networkExternalAllowed() {
        PermissionManager.registerApp("test-app", {
            "network": {
                "allowed_hosts": ["google.com"]
            }
        });

        compare(
            PermissionManager.checkNetworkAccess("test-app", "google.com"),
            true
        );
    }

    // Test: Network external host denied
    function test_networkExternalDenied() {
        PermissionManager.registerApp("test-app", {
            "network": {
                "allowed_hosts": ["google.com"]
            }
        });

        compare(
            PermissionManager.checkNetworkAccess("test-app", "example.com"),
            false
        );
    }

    // Test: Network wildcard allows all hosts
    function test_networkWildcard() {
        PermissionManager.registerApp("test-app", {
            "network": {
                "allowed_hosts": ["*"]
            }
        });

        compare(
            PermissionManager.checkNetworkAccess("test-app", "google.com"),
            true
        );
        compare(
            PermissionManager.checkNetworkAccess("test-app", "example.com"),
            true
        );
    }

    // Test: Path sanitization prevents directory traversal
    function test_pathSanitization() {
        const malicious = "~/Documents/../../../etc/passwd";
        const sanitized = PermissionManager.sanitizePath(malicious);

        verify(!sanitized.includes(".."));
    }

    // Test: Revoke app permissions
    function test_revokeApp() {
        PermissionManager.registerApp("test-app", {
            "calendar": { "read": true }
        });

        PermissionManager.revokeApp("test-app");

        compare(
            PermissionManager.hasPermission("test-app", "calendar", "read"),
            false
        );
    }

    // Test: Get app permissions
    function test_getAppPermissions() {
        const permissions = {
            "calendar": { "read": true, "write": false }
        };

        PermissionManager.registerApp("test-app", permissions);

        const retrieved = PermissionManager.getAppPermissions("test-app");
        verify(retrieved !== null);
        compare(retrieved.calendar.read, true);
        compare(retrieved.calendar.write, false);
    }

    // Test: Get app permissions for unknown app
    function test_getAppPermissionsUnknown() {
        const retrieved = PermissionManager.getAppPermissions("unknown-app");
        compare(retrieved, null);
    }

    // Test: PermissionEnforcer - enforce success
    function test_enforcerAllowed() {
        PermissionManager.registerApp("test-app", {
            "calendar": { "read": true }
        });

        const enforcer = Qt.createQmlObject(
            'import QtQuick; import WebShell.Services; PermissionEnforcer { appName: "test-app" }',
            this
        );

        // Should not throw
        try {
            enforcer.enforceCalendarRead();
            verify(true);
        } catch (e) {
            verify(false, "Should not throw: " + e.message);
        }

        enforcer.destroy();
    }

    // Test: PermissionEnforcer - enforce denied
    function test_enforcerDenied() {
        PermissionManager.registerApp("test-app", {
            "calendar": { "read": false }
        });

        const enforcer = Qt.createQmlObject(
            'import QtQuick; import WebShell.Services; PermissionEnforcer { appName: "test-app" }',
            this
        );

        // Should throw
        try {
            enforcer.enforceCalendarRead();
            verify(false, "Should have thrown");
        } catch (e) {
            verify(e.message.includes("Permission denied"));
        }

        enforcer.destroy();
    }

    // Test: PermissionEnforcer - check permission non-throwing
    function test_enforcerCheckPermission() {
        PermissionManager.registerApp("test-app", {
            "calendar": { "read": true, "write": false }
        });

        const enforcer = Qt.createQmlObject(
            'import QtQuick; import WebShell.Services; PermissionEnforcer { appName: "test-app" }',
            this
        );

        compare(enforcer.checkPermission("calendar", "read"), true);
        compare(enforcer.checkPermission("calendar", "write"), false);

        enforcer.destroy();
    }

    // Test: 127.0.0.1 treated as localhost
    function test_networkIPAsLocalhost() {
        PermissionManager.registerApp("test-app", {
            "network": {
                "allowed_hosts": ["localhost"]
            }
        });

        compare(
            PermissionManager.checkNetworkAccess("test-app", "127.0.0.1"),
            true
        );
    }
}
