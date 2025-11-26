import QtQuick
import QtTest
import qs.Services

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
