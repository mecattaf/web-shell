pragma ComponentBehavior: Bound
import QtQuick
import QtQuick.Effects
import WebShell.Services

/**
 * ShellContainer - Base container for WebShell structural layout
 *
 * Provides:
 * - Blur support for compositor-level background blur
 * - Transparency and theming via WebShellTheme
 * - Positioning and z-order management
 * - Mounting points for WebShell apps
 */
Rectangle {
    id: root

    // Configuration properties
    property bool enableBlur: false
    property real blurRadius: 20
    property string containerType: "panel"
    property bool hasFocus: false

    // Shadow properties
    property bool enableShadow: false
    property real shadowRadius: 8
    property color shadowColor: Qt.rgba(0, 0, 0, 0.3)
    property real shadowOffsetX: 0
    property real shadowOffsetY: 4

    // Background opacity
    property real backgroundOpacity: 0.95

    // Default appearance
    color: "transparent"
    radius: WebShellTheme.radiusL

    // Register with container registry on creation
    Component.onCompleted: {
        if (typeof WebShellContainerRegistry !== 'undefined') {
            WebShellContainerRegistry.registerContainer(containerType, root)
        }
        console.log("[ShellContainer] Created:", containerType)
    }

    // Blur layer (compositor-handled)
    // Note: This uses Qt's MultiEffect for blur. In production with Wayland,
    // this should be replaced with compositor-specific blur protocols
    layer.enabled: enableBlur || enableShadow
    layer.effect: MultiEffect {
        // Blur effect
        blurEnabled: root.enableBlur
        blur: root.enableBlur ? 1.0 : 0.0
        blurMax: Math.round(root.blurRadius)
        blurMultiplier: 0.5

        // Shadow effect
        shadowEnabled: root.enableShadow
        shadowBlur: root.enableShadow ? 1.0 : 0.0
        shadowColor: root.shadowColor
        shadowHorizontalOffset: root.shadowOffsetX
        shadowVerticalOffset: root.shadowOffsetY
        shadowScale: 1.0
    }

    // Background with theme color
    Rectangle {
        id: background
        anchors.fill: parent
        color: WebShellTheme.colSurface
        opacity: root.backgroundOpacity
        radius: parent.radius

        // Focus indicator
        border.width: root.hasFocus ? 2 : 0
        border.color: root.hasFocus ? WebShellTheme.colPrimary : "transparent"

        Behavior on border.width {
            NumberAnimation {
                duration: WebShellTheme.animationDurationFast
            }
        }

        Behavior on border.color {
            ColorAnimation {
                duration: WebShellTheme.animationDurationFast
            }
        }
    }

    // Content area (to be filled by subclasses or users)
    // This is the default child item container
    default property alias contentData: contentArea.data

    Item {
        id: contentArea
        anchors.fill: parent
        anchors.margins: WebShellTheme.spaceM
    }
}
