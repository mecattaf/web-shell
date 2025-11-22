// WebShellView.qml - WebEngine wrapper for WebShell apps
// Provides transparent background, security policies, and sandbox configuration
pragma ComponentBehavior: Bound
import QtQuick
import QtQuick.Controls
import QtWebEngine
import QtWebChannel
import WebShell.Services

Item {
    id: root

    // Public properties
    property bool devMode: false
    property string appName: ""
    property string devServerUrl: "http://localhost:5173"
    property string manifestPath: ""
    property int devToolsPort: 9222
    property url source: ""
    property var windowConfig: ({})

    // Signals
    signal ready()
    signal loadError(string error)

    // Window configuration
    WindowConfig {
        id: config
        Component.onCompleted: {
            fromManifest(root.windowConfig);
            applyTypeDefaults();
        }
    }

    // Window type behavior
    WindowTypeBehavior {
        id: typeBehavior
        type: config.type
    }

    // Window animations
    WindowAnimations {
        id: animations
        target: root
        enabled: true
    }

    // Apply dimensions from config
    width: config.width > 0 ? config.width : parent.width
    height: config.height > 0 ? config.height : parent.height

    // Apply opacity
    opacity: config.opacity

    // Calculate and apply position
    property var calculatedPosition: config.calculatePosition(
        width, height,
        parent ? parent.width : 1920,
        parent ? parent.height : 1080
    )

    x: calculatedPosition.x
    y: calculatedPosition.y

    // Apply z-index based on window type
    z: typeBehavior.getZIndex()

    // Main WebEngine view
    WebEngineView {
        id: webview
        anchors.fill: parent

        // Determine URL based on dev mode
        url: root.devMode ? root.devServerUrl : root.source

        // Use shared profile for memory efficiency (or dev profile in dev mode)
        profile: root.devMode ? devProfile : WebShellProfile

        // Dev-specific profile
        WebEngineProfile {
            id: devProfile
            storageName: "webshell-dev"
            offTheRecord: false

            // Disable cache in dev mode for fresh reloads
            httpCacheType: WebEngineProfile.NoCache

            // User agent with dev marker
            httpUserAgent: WebShellProfile.httpUserAgent + " WebShell-Dev"

            persistentStoragePath: StandardPaths.writableLocation(
                StandardPaths.AppDataLocation
            ) + "/webshell-dev"
        }

        // QtWebChannel bridge for JS<->QML communication
        webChannel: WebChannel {
            id: channel
            registeredObjects: ({
                "bridge": BridgeService
            })
        }

        // Transparent background (required for compositor blur)
        backgroundColor: "transparent"

        // Security and feature settings
        settings {
            // JavaScript
            javascriptEnabled: true
            javascriptCanOpenWindows: false          // Prevent popups
            javascriptCanAccessClipboard: true       // For clipboard API

            // Security policies (relaxed in dev mode)
            localContentCanAccessRemoteUrls: root.devMode   // Allow localhost in dev mode
            allowRunningInsecureContent: root.devMode       // Allow http:// in dev mode
            allowGeolocationOnInsecureOrigins: false        // Security: require HTTPS for geolocation

            // Plugins
            pluginsEnabled: false                    // No Flash, NPAPI, etc.

            // Performance
            accelerated2dCanvasEnabled: true
            webGLEnabled: true

            // Development
            errorPageEnabled: true
            devToolsEnabled: root.devMode
        }

        // Load state handling
        onLoadingChanged: (loadRequest) => {
            if (loadRequest.status === WebEngineView.LoadSucceededStatus) {
                console.log("[WebShellView]", root.appName, "loaded successfully");
                // Initialize bridge when page is loaded
                BridgeService.initialize();
                root.ready();
                // Hide error overlay on successful load
                errorOverlay.visible = false;
            } else if (loadRequest.status === WebEngineView.LoadFailedStatus) {
                console.error("[WebShellView]", root.appName, "load failed:", loadRequest.errorString);
                root.loadError(loadRequest.errorString);
                if (root.devMode) {
                    root.showDevError(loadRequest.errorString);
                }
            }
        }

        // Navigation security policy
        onNavigationRequested: (request) => {
            const url = request.url.toString();

            // Allow localhost in dev mode
            if (root.devMode) {
                if (url.startsWith('http://localhost') ||
                    url.startsWith('http://127.0.0.1')) {
                    request.action = WebEngineNavigationRequest.AcceptRequest;
                    return;
                }
            }

            // Allow local resources (file:// and qrc://)
            if (url.startsWith('file://') ||
                url.startsWith('qrc://')) {
                request.action = WebEngineNavigationRequest.AcceptRequest;
                return;
            }

            // Block everything else (external URLs)
            console.warn("[WebShellView] Blocked navigation to:", url);
            request.action = WebEngineNavigationRequest.IgnoreRequest;
        }

        // Render process crash handling
        onRenderProcessTerminated: (terminationStatus, exitCode) => {
            console.error("[WebShellView]", root.appName, "render process terminated:",
                          terminationStatus, "exit code:", exitCode);

            if (terminationStatus === WebEngineView.CrashedTerminationStatus) {
                console.log("[WebShellView] Attempting to reload", root.appName);
                reload();
            }
        }

        // Context menu handling (for DevTools)
        onContextMenuRequested: (request) => {
            if (root.devMode) {
                request.accepted = true;
                // In a full implementation, show custom context menu with DevTools option
                // For now, just accept to allow default behavior
            }
        }

        // JavaScript console message logging
        onJavaScriptConsoleMessage: (level, message, lineNumber, sourceID) => {
            const prefix = "[WebShellView:" + root.appName + "]";
            const location = sourceID + ":" + lineNumber;

            switch (level) {
                case WebEngineView.InfoMessageLevel:
                    console.log(prefix, "INFO:", message, location);
                    break;
                case WebEngineView.WarningMessageLevel:
                    console.warn(prefix, "WARN:", message, location);
                    break;
                case WebEngineView.ErrorMessageLevel:
                    console.error(prefix, "ERROR:", message, location);
                    break;
            }
        }
    }

    // Dev mode error overlay
    Rectangle {
        id: errorOverlay
        visible: false
        anchors.fill: parent
        color: Qt.rgba(0.1, 0, 0, 0.95)
        z: 1000

        Column {
            anchors.centerIn: parent
            spacing: 20
            width: parent.width * 0.8

            Text {
                text: "⚠️ Dev Server Error"
                color: "#ff6b6b"
                font.pixelSize: 24
                font.weight: Font.Bold
                anchors.horizontalCenter: parent.horizontalCenter
            }

            Text {
                id: errorText
                color: "#ffffff"
                font.pixelSize: 14
                wrapMode: Text.Wrap
                width: parent.width
            }

            Button {
                text: "Retry"
                anchors.horizontalCenter: parent.horizontalCenter
                onClicked: webview.reload()
            }
        }
    }

    // Connect to DevModeManager for hot reload
    Connections {
        target: DevModeManager
        enabled: root.devMode

        function onReloadRequested(appName) {
            if (appName === root.appName) {
                console.log("[WebShellView] Hot reloading:", appName);
                webview.reload();
            }
        }
    }

    // F12 shortcut for inspector
    Shortcut {
        sequence: "F12"
        enabled: root.devMode
        onActivated: {
            // Trigger DevTools inspector
            webview.triggerWebAction(WebEngineView.InspectElement);
        }
    }

    // F5 shortcut for manual reload in dev mode
    Shortcut {
        sequence: "F5"
        enabled: root.devMode
        onActivated: {
            console.log("[WebShellView] Manual reload triggered");
            webview.reload();
        }
    }

    // Public functions
    function showDevError(error) {
        errorText.text = error;
        errorOverlay.visible = true;
    }

    function reload() {
        webview.reload();
    }

    function injectCSP(cspContent) {
        webview.runJavaScript(`
            const meta = document.createElement('meta');
            meta.httpEquiv = 'Content-Security-Policy';
            meta.content = "${cspContent}";
            if (document.head) {
                document.head.appendChild(meta);
            } else {
                document.addEventListener('DOMContentLoaded', () => {
                    document.head.appendChild(meta);
                });
            }
        `);
    }

    function openInspector() {
        if (root.devMode) {
            webview.triggerWebAction(WebEngineView.InspectElement);
        }
    }

    // Resize handle (bottom-right corner)
    MouseArea {
        id: resizeHandle
        visible: config.resizable
        anchors.right: parent.right
        anchors.bottom: parent.bottom
        width: 16
        height: 16
        cursorShape: Qt.SizeFDiagCursor
        z: 1001

        property point startPos
        property size startSize

        onPressed: (mouse) => {
            startPos = Qt.point(mouse.x, mouse.y);
            startSize = Qt.size(root.width, root.height);
        }

        onPositionChanged: (mouse) => {
            if (pressed) {
                const delta = Qt.point(
                    mouse.x - startPos.x,
                    mouse.y - startPos.y
                );

                const newSize = config.constrainSize(
                    startSize.width + delta.x,
                    startSize.height + delta.y
                );

                root.width = newSize.width;
                root.height = newSize.height;
            }
        }

        // Visual indicator for resize handle
        Rectangle {
            anchors.fill: parent
            color: "transparent"
            border.color: Qt.rgba(1, 1, 1, 0.3)
            border.width: 2
            visible: parent.containsMouse
        }
    }

    // Move handle (drag anywhere if movable)
    MouseArea {
        id: moveHandle
        enabled: config.movable && !resizeHandle.pressed
        anchors.fill: parent
        z: -1 // Behind WebEngineView

        property point startPos
        property point startWindowPos

        onPressed: (mouse) => {
            startPos = Qt.point(mouse.x, mouse.y);
            startWindowPos = Qt.point(root.x, root.y);
        }

        onPositionChanged: (mouse) => {
            if (pressed && config.movable) {
                const delta = Qt.point(
                    mouse.x - startPos.x,
                    mouse.y - startPos.y
                );

                root.x = startWindowPos.x + delta.x;
                root.y = startWindowPos.y + delta.y;
            }
        }
    }

    // Lifecycle management
    Component.onCompleted: {
        if (root.devMode) {
            console.log("[WebShellView] Dev mode enabled for", root.appName);
            console.log("[WebShellView] Dev server URL:", root.devServerUrl);
            console.log("[WebShellView] Remote debugging available at: http://localhost:" + root.devToolsPort);

            // Start watching for file changes if manifestPath is provided
            if (root.manifestPath !== "") {
                DevModeManager.startWatching(root.appName, root.manifestPath);
            }
        }

        // Play default animation based on window type
        animations.playDefaultAnimation(config.type);

        console.log("[WebShellView] Window config:", JSON.stringify({
            type: config.type,
            width: config.width,
            height: config.height,
            position: config.position,
            resizable: config.resizable,
            movable: config.movable
        }));
    }

    Component.onDestruction: {
        if (root.devMode) {
            DevModeManager.stopWatching(root.appName);
        }
    }
}
