---
id: task-3.2
title: Implement manifest parser in QML
status: To Do
created_date: 2025-01-18
milestone: milestone-3
assignees: []
labels: [qml, parser]
dependencies: [task-3.1]
---

## Description

Create a QML component that reads, validates, and parses webshell.json manifests. This enables the shell to load and configure WebShell applications dynamically.

## Acceptance Criteria

- [ ] ManifestParser QML component created
- [ ] Reads and validates JSON
- [ ] Exposes manifest data as QML properties
- [ ] Error handling for invalid manifests
- [ ] Supports manifest versioning
- [ ] Integration tests pass

## Implementation Plan

1. **Create ManifestParser Component**
```qml
// qs/modules/webshell/ManifestParser.qml
import QtQuick
import Qt.labs.platform

QtObject {
    id: root
    
    property url manifestPath
    property bool isValid: false
    property string errorMessage: ""
    
    // Parsed manifest data
    property var manifest: null
    property string appName: ""
    property string displayName: ""
    property string entrypoint: ""
    property var permissions: ({})
    property var windowConfig: ({})
    
    signal manifestLoaded()
    signal manifestError(string error)
    
    function load(path) {
        manifestPath = path;
        
        // Read file
        const xhr = new XMLHttpRequest();
        xhr.open("GET", manifestPath);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    parseManifest(xhr.responseText);
                } else {
                    handleError("Failed to load manifest");
                }
            }
        };
        xhr.send();
    }
    
    function parseManifest(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            
            // Validate
            if (!validate(data)) {
                return;
            }
            
            // Extract fields
            manifest = data;
            appName = data.name;
            displayName = data.displayName || data.name;
            entrypoint = data.entrypoint;
            permissions = data.permissions || {};
            windowConfig = data.window || {};
            
            isValid = true;
            manifestLoaded();
            
        } catch (e) {
            handleError("JSON parse error: " + e.message);
        }
    }
    
    function validate(data) {
        // Check required fields
        if (!data.version) {
            handleError("Missing required field: version");
            return false;
        }
        
        if (!data.name) {
            handleError("Missing required field: name");
            return false;
        }
        
        if (!data.entrypoint) {
            handleError("Missing required field: entrypoint");
            return false;
        }
        
        // Validate version format
        const versionRegex = /^\d+\.\d+\.\d+$/;
        if (!versionRegex.test(data.version)) {
            handleError("Invalid version format");
            return false;
        }
        
        // Validate name format (alphanumeric + hyphens)
        const nameRegex = /^[a-z0-9-]+$/;
        if (!nameRegex.test(data.name)) {
            handleError("Invalid app name format");
            return false;
        }
        
        return true;
    }
    
    function handleError(message) {
        isValid = false;
        errorMessage = message;
        console.error("[ManifestParser]", message);
        manifestError(message);
    }
    
    // Permission checking helpers
    function hasPermission(category, action) {
        return permissions[category]?.[action] === true;
    }
    
    function getAllowedHosts() {
        return permissions.network?.allowed_hosts || [];
    }
}
```

2. **Create Manifest Validator**
```qml
// ManifestValidator.qml
pragma Singleton
import QtQuick

QtObject {
    id: root
    
    function validateManifest(manifest) {
        const errors = [];
        
        // Required fields
        if (!manifest.version) errors.push("Missing version");
        if (!manifest.name) errors.push("Missing name");
        if (!manifest.entrypoint) errors.push("Missing entrypoint");
        
        // Validate permissions structure
        if (manifest.permissions) {
            errors.push(...validatePermissions(manifest.permissions));
        }
        
        // Validate window config
        if (manifest.window) {
            errors.push(...validateWindowConfig(manifest.window));
        }
        
        return {
            valid: errors.length === 0,
            errors: errors
        };
    }
    
    function validatePermissions(perms) {
        const errors = [];
        
        // Calendar permissions
        if (perms.calendar) {
            if (typeof perms.calendar.read !== 'boolean') {
                errors.push("calendar.read must be boolean");
            }
        }
        
        // Network permissions
        if (perms.network) {
            if (perms.network.allowed_hosts && 
                !Array.isArray(perms.network.allowed_hosts)) {
                errors.push("network.allowed_hosts must be array");
            }
        }
        
        return errors;
    }
    
    function validateWindowConfig(config) {
        const errors = [];
        
        const validTypes = ['widget', 'panel', 'overlay', 'dialog'];
        if (config.type && !validTypes.includes(config.type)) {
            errors.push("Invalid window type");
        }
        
        if (config.width && typeof config.width !== 'number') {
            errors.push("window.width must be number");
        }
        
        return errors;
    }
}
```

3. **Create Test Suite**
```qml
// tests/ManifestParserTest.qml
import QtQuick
import QtTest

TestCase {
    name: "ManifestParser"
    
    ManifestParser {
        id: parser
    }
    
    function test_validManifest() {
        const testManifest = {
            "version": "1.0.0",
            "name": "test-app",
            "entrypoint": "index.html"
        };
        
        parser.parseManifest(JSON.stringify(testManifest));
        
        compare(parser.isValid, true);
        compare(parser.appName, "test-app");
    }
    
    function test_missingVersion() {
        const testManifest = {
            "name": "test-app",
            "entrypoint": "index.html"
        };
        
        parser.parseManifest(JSON.stringify(testManifest));
        
        compare(parser.isValid, false);
        verify(parser.errorMessage.includes("version"));
    }
    
    function test_invalidVersionFormat() {
        const testManifest = {
            "version": "1.0",
            "name": "test-app",
            "entrypoint": "index.html"
        };
        
        parser.parseManifest(JSON.stringify(testManifest));
        
        compare(parser.isValid, false);
    }
    
    function test_permissionChecking() {
        const testManifest = {
            "version": "1.0.0",
            "name": "test-app",
            "entrypoint": "index.html",
            "permissions": {
                "calendar": { "read": true, "write": false }
            }
        };
        
        parser.parseManifest(JSON.stringify(testManifest));
        
        compare(parser.hasPermission("calendar", "read"), true);
        compare(parser.hasPermission("calendar", "write"), false);
    }
}
```

## Technical Notes

**File Loading**:
```qml
// Load from app directory
const manifestPath = `file://${appDir}/webshell.json`;
parser.load(manifestPath);
```

**Error Handling**:
```qml
Connections {
    target: parser
    function onManifestError(error) {
        console.error("Manifest error:", error);
        // Show error dialog to user
    }
}
```

**Integration with App Loader**:
```qml
// In WebShellLoader
ManifestParser {
    id: manifestParser
    onManifestLoaded: {
        // Create WebShellView with manifest config
        createWebShellView(manifest);
    }
}
```

## Reference Material

Study QML JSON handling:
```bash
cd DankMaterialShell/quickshell/Services
grep -r "JSON.parse" .
```

## Definition of Done

- ManifestParser component working
- Validation complete
- Error handling robust
- Tests passing
- Integration documented
- Git commit: "task-3.2: Implement manifest parser in QML"
