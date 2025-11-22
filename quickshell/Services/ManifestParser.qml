import QtQuick

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

        // Validate version format (supports semantic versioning with pre-release and build metadata)
        const versionRegex = /^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?$/;
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
