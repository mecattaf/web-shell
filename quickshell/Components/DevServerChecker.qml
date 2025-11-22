// DevServerChecker.qml - Checks if a dev server is available
pragma ComponentBehavior: Bound
import QtQuick
import QtNetwork

QtObject {
    id: root

    // Configuration
    property string url: "http://localhost:5173"
    property int checkInterval: 5000  // Check every 5 seconds
    property int timeout: 2000        // 2 second timeout for each check

    // State
    property bool available: false
    property bool checking: false
    property string lastError: ""

    // Signals
    signal checked(bool success)
    signal availabilityChanged(bool available)

    /**
     * Perform a single availability check
     */
    function check() {
        if (checking) {
            console.log("[DevServerChecker] Check already in progress");
            return;
        }

        checking = true;
        console.log("[DevServerChecker] Checking availability of:", url);

        // Create XMLHttpRequest to check server
        const xhr = new XMLHttpRequest();

        xhr.open("HEAD", url);
        xhr.timeout = timeout;

        xhr.onreadystatechange = function() {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                checking = false;
                const wasAvailable = available;
                available = (xhr.status >= 200 && xhr.status < 400);

                if (available) {
                    console.log("[DevServerChecker] Server is available:", url);
                    lastError = "";
                } else {
                    console.warn("[DevServerChecker] Server returned status:", xhr.status);
                    lastError = "HTTP " + xhr.status;
                }

                checked(available);

                if (wasAvailable !== available) {
                    availabilityChanged(available);
                }
            }
        };

        xhr.ontimeout = function() {
            checking = false;
            const wasAvailable = available;
            available = false;
            lastError = "Timeout after " + timeout + "ms";
            console.warn("[DevServerChecker] Check timeout:", url);

            checked(false);

            if (wasAvailable !== available) {
                availabilityChanged(available);
            }
        };

        xhr.onerror = function() {
            checking = false;
            const wasAvailable = available;
            available = false;
            lastError = "Network error";
            console.warn("[DevServerChecker] Check error:", url);

            checked(false);

            if (wasAvailable !== available) {
                availabilityChanged(available);
            }
        };

        try {
            xhr.send();
        } catch (e) {
            checking = false;
            available = false;
            lastError = "Exception: " + e;
            console.error("[DevServerChecker] Exception during check:", e);
            checked(false);
        }
    }

    /**
     * Start periodic checking
     */
    function startChecking() {
        console.log("[DevServerChecker] Starting periodic checks");
        checkTimer.start();
        check(); // Do initial check immediately
    }

    /**
     * Stop periodic checking
     */
    function stopChecking() {
        console.log("[DevServerChecker] Stopping periodic checks");
        checkTimer.stop();
    }

    // Periodic check timer
    property var checkTimer: Timer {
        id: checkTimer
        interval: root.checkInterval
        repeat: true
        running: false
        onTriggered: root.check()
    }

    Component.onCompleted: {
        console.log("[DevServerChecker] Initialized");
        console.log("[DevServerChecker] URL:", url);
        console.log("[DevServerChecker] Check interval:", checkInterval + "ms");

        // Perform initial check
        check();
    }
}
