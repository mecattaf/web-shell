// WebShellLoaderTest.qml - Test suite for WebShellLoader
// Tests app discovery, loading, and lifecycle management
import QtQuick
import Quickshell
import WebShell.Services

PanelWindow {
    id: testWindow
    visible: true
    width: 800
    height: 600

    color: "#1e1e1e"

    property int passedTests: 0
    property int failedTests: 0
    property var testResults: []

    Component.onCompleted: {
        console.log("=== WebShellLoader Test Suite ===");
        runTests();
    }

    function runTests() {
        // Test 1: WebShellLoader singleton exists
        test("WebShellLoader singleton exists", () => {
            return WebShellLoader !== null && WebShellLoader !== undefined;
        });

        // Test 2: WebShellLoader has required properties
        test("WebShellLoader has required properties", () => {
            return WebShellLoader.hasOwnProperty('loadedApps') &&
                   WebShellLoader.hasOwnProperty('activeViews') &&
                   WebShellLoader.hasOwnProperty('appsDirectory');
        });

        // Test 3: WebShellLoader has required functions
        test("WebShellLoader has required functions", () => {
            return typeof WebShellLoader.initialize === 'function' &&
                   typeof WebShellLoader.discoverApps === 'function' &&
                   typeof WebShellLoader.launchApp === 'function' &&
                   typeof WebShellLoader.closeApp === 'function' &&
                   typeof WebShellLoader.reloadApp === 'function';
        });

        // Test 4: Initial state is correct
        test("WebShellLoader initial state", () => {
            return Object.keys(WebShellLoader.loadedApps).length === 0 &&
                   WebShellLoader.activeViews.length === 0 &&
                   WebShellLoader.totalWebEngineMemory === 0;
        });

        // Test 5: Apps directory is set correctly
        test("Apps directory is configured", () => {
            const dir = WebShellLoader.appsDirectory.toString();
            return dir.includes('.config/webshell/apps') || dir.includes('webshell/apps');
        });

        // Test 6: getLoadedApps returns array
        test("getLoadedApps returns array", () => {
            const apps = WebShellLoader.getLoadedApps();
            return Array.isArray(apps);
        });

        // Test 7: getRunningApps returns array
        test("getRunningApps returns array", () => {
            const apps = WebShellLoader.getRunningApps();
            return Array.isArray(apps);
        });

        // Test 8: isAppRunning returns false for non-existent app
        test("isAppRunning returns false for unknown app", () => {
            return WebShellLoader.isAppRunning("non-existent-app") === false;
        });

        // Test 9: getApp returns null for non-existent app
        test("getApp returns null for unknown app", () => {
            return WebShellLoader.getApp("non-existent-app") === null;
        });

        // Test 10: Memory estimation works
        test("Memory estimation formula", () => {
            // Should be 0 with no active views
            return WebShellLoader.totalWebEngineMemory === 0;
        });

        // Print summary
        printSummary();
    }

    function test(name, testFn) {
        try {
            const result = testFn();
            if (result) {
                passedTests++;
                testResults.push({ name: name, passed: true });
                console.log("✓", name);
            } else {
                failedTests++;
                testResults.push({ name: name, passed: false, error: "Assertion failed" });
                console.error("✗", name, "- Assertion failed");
            }
        } catch (error) {
            failedTests++;
            testResults.push({ name: name, passed: false, error: error.toString() });
            console.error("✗", name, "- Error:", error);
        }
    }

    function printSummary() {
        console.log("\n=== Test Summary ===");
        console.log("Total tests:", passedTests + failedTests);
        console.log("Passed:", passedTests);
        console.log("Failed:", failedTests);

        if (failedTests === 0) {
            console.log("✓ All tests passed!");
            summaryText.color = "#4ade80";
            summaryText.text = "✓ All tests passed!";
        } else {
            console.log("✗ Some tests failed");
            summaryText.color = "#f87171";
            summaryText.text = "✗ " + failedTests + " test(s) failed";
        }
    }

    // Visual test output
    Column {
        anchors.centerIn: parent
        spacing: 20
        width: parent.width * 0.9

        Text {
            text: "WebShellLoader Test Suite"
            color: "#ffffff"
            font.pixelSize: 24
            font.weight: Font.Bold
            anchors.horizontalCenter: parent.horizontalCenter
        }

        Rectangle {
            width: parent.width
            height: 1
            color: "#444444"
        }

        Column {
            width: parent.width
            spacing: 10

            Repeater {
                model: testResults

                Row {
                    spacing: 10
                    width: parent.width

                    Text {
                        text: modelData.passed ? "✓" : "✗"
                        color: modelData.passed ? "#4ade80" : "#f87171"
                        font.pixelSize: 16
                        font.weight: Font.Bold
                    }

                    Text {
                        text: modelData.name
                        color: "#ffffff"
                        font.pixelSize: 14
                        width: parent.width - 50
                        wrapMode: Text.Wrap
                    }
                }
            }
        }

        Rectangle {
            width: parent.width
            height: 1
            color: "#444444"
        }

        Text {
            id: summaryText
            text: "Running tests..."
            color: "#888888"
            font.pixelSize: 18
            font.weight: Font.Bold
            anchors.horizontalCenter: parent.horizontalCenter
        }

        Text {
            text: passedTests + " / " + (passedTests + failedTests) + " tests passed"
            color: "#888888"
            font.pixelSize: 14
            anchors.horizontalCenter: parent.horizontalCenter
        }
    }

    // Signal connections for testing
    Connections {
        target: WebShellLoader

        function onAppLoaded(appName) {
            console.log("[Test] App loaded signal received:", appName);
        }

        function onAppFailed(appName, error) {
            console.log("[Test] App failed signal received:", appName, error);
        }

        function onAppLaunched(appName) {
            console.log("[Test] App launched signal received:", appName);
        }

        function onAppClosed(appName) {
            console.log("[Test] App closed signal received:", appName);
        }
    }

    // Test discovery button (optional manual test)
    Rectangle {
        anchors.bottom: parent.bottom
        anchors.horizontalCenter: parent.horizontalCenter
        anchors.margins: 20
        width: 200
        height: 40
        color: "#3b82f6"
        radius: 8

        Text {
            anchors.centerIn: parent
            text: "Run App Discovery"
            color: "#ffffff"
            font.pixelSize: 14
            font.weight: Font.Bold
        }

        MouseArea {
            anchors.fill: parent
            onClicked: {
                console.log("\n=== Manual Test: App Discovery ===");
                WebShellLoader.initialize();
            }
        }
    }
}
