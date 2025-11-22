// WebShellContainer.qml - Container with blur and transparency support
// Provides visual effects and container-specific styling
pragma ComponentBehavior: Bound
import QtQuick
import QtQuick.Controls
import QtQuick.Effects

Item {
    id: root

    // Configuration properties
    property bool useDevMode: true
    property string devServerUrl: "http://localhost:5173"
    property string containerType: "widget"
    property bool enableBlur: true
    property real blurRadius: 20
    property real containerOpacity: 1.0
    property color backgroundColor: Qt.rgba(0.1, 0.1, 0.1, 0.85)
    property var windowConfig: ({})

    Component.onCompleted: {
        console.log("[WebShellContainer] Initialized")
        console.log("[WebShellContainer] Type:", containerType)
        console.log("[WebShellContainer] Dev mode:", useDevMode)
        console.log("[WebShellContainer] Blur enabled:", enableBlur)
    }

    // Background with blur effect
    Rectangle {
        id: background
        anchors.fill: parent
        color: root.backgroundColor
        opacity: root.containerOpacity
        radius: containerType === "widget" || containerType === "dialog" ? 12 : 0

        layer.enabled: root.enableBlur
        layer.effect: MultiEffect {
            blur: 1.0
            blurEnabled: root.enableBlur
            blurMax: root.blurRadius
            saturation: 0.2
        }
    }

    // Border for widget and dialog types
    Rectangle {
        visible: containerType === "widget" || containerType === "dialog"
        anchors.fill: parent
        color: "transparent"
        border.color: Qt.rgba(1, 1, 1, 0.15)
        border.width: 1
        radius: background.radius
    }

    // WebShellView integration
    WebShellView {
        id: webview
        anchors.fill: parent
        anchors.margins: containerType === "widget" || containerType === "dialog" ? 0 : 0

        appName: "test-app"
        devMode: root.useDevMode
        devServerUrl: root.devServerUrl
        manifestPath: Qt.resolvedUrl("../../").toString()
        windowConfig: root.windowConfig

        // In dev mode, connect to dev server; otherwise load local file
        source: Qt.resolvedUrl("../../test.html")

        onReady: {
            console.log("[WebShellContainer] WebShellView ready")
        }

        onLoadError: (error) => {
            console.error("[WebShellContainer] Load error:", error)
        }
    }

    // Status indicator for dev mode
    Rectangle {
        visible: root.useDevMode
        anchors.top: parent.top
        anchors.right: parent.right
        anchors.margins: 8
        width: 100
        height: 30
        color: Qt.rgba(0, 0.5, 0, 0.8)
        radius: 4
        z: 999

        Text {
            anchors.centerIn: parent
            text: "DEV MODE"
            color: "white"
            font.pixelSize: 12
            font.bold: true
        }
    }

    // Type indicator badge
    Rectangle {
        visible: containerType !== "widget"
        anchors.top: parent.top
        anchors.left: parent.left
        anchors.margins: 8
        width: typeText.width + 16
        height: 24
        color: Qt.rgba(0.2, 0.4, 0.8, 0.8)
        radius: 4
        z: 999

        Text {
            id: typeText
            anchors.centerIn: parent
            text: containerType.toUpperCase()
            color: "white"
            font.pixelSize: 10
            font.bold: true
        }
    }
}
