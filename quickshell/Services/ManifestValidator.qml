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
