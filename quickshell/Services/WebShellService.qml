pragma Singleton
pragma ComponentBehavior: Bound
import QtQuick

QtObject {
    id: root

    // Server configuration
    property string serverUrl: "http://localhost:5000"
    property bool isConnected: false

    // Shell state
    property bool isInitialized: false

    signal initialized()
    signal connectionStatusChanged(bool connected)

    function initialize() {
        if (root.isInitialized) {
            console.warn("WebShellService: Already initialized")
            return
        }

        console.log("WebShellService: Initializing...")
        root.isInitialized = true
        root.initialized()
    }

    function updateConnectionStatus(connected: bool) {
        if (root.isConnected !== connected) {
            root.isConnected = connected
            root.connectionStatusChanged(connected)
            console.log("WebShellService: Connection status changed:", connected)
        }
    }
}
