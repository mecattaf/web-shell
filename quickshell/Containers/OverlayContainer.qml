pragma ComponentBehavior: Bound
import QtQuick
import WebShell.Services

/**
 * OverlayContainer - Full-screen overlay with backdrop
 *
 * Features:
 * - Full-screen with centered content area
 * - Strong blur effect
 * - Dark backdrop for focus
 * - Highest z-order
 * - Can be shown/hidden with animations
 */
Item {
    id: overlay

    // Overlay properties
    property bool active: false
    property real contentWidthRatio: 0.8
    property real contentHeightRatio: 0.8
    property alias contentItem: contentContainer

    // Control visibility
    visible: active
    anchors.fill: parent
    z: 100

    // Backdrop (darkened background)
    Rectangle {
        id: backdrop
        anchors.fill: parent
        color: WebShellTheme.colScrim
        opacity: overlay.active ? 0.6 : 0.0

        Behavior on opacity {
            NumberAnimation {
                duration: WebShellTheme.animationDurationNormal
            }
        }

        // Close on backdrop click
        MouseArea {
            anchors.fill: parent
            onClicked: overlay.active = false
        }
    }

    // Content container with blur
    ShellContainer {
        id: contentContainer
        containerType: "overlay"
        enableBlur: true
        blurRadius: 30
        backgroundOpacity: 0.98

        anchors.centerIn: parent
        width: parent.width * overlay.contentWidthRatio
        height: parent.height * overlay.contentHeightRatio

        // Scale animation
        scale: overlay.active ? 1.0 : 0.9
        opacity: overlay.active ? 1.0 : 0.0

        Behavior on scale {
            NumberAnimation {
                duration: WebShellTheme.animationDurationNormal
                easing.type: Easing.OutCubic
            }
        }

        Behavior on opacity {
            NumberAnimation {
                duration: WebShellTheme.animationDurationNormal
            }
        }

        // Prevent clicks from passing through to backdrop
        MouseArea {
            anchors.fill: parent
            onClicked: {} // Consume click
        }
    }

    // Keyboard handling
    Keys.onEscapePressed: overlay.active = false

    Component.onCompleted: {
        console.log("[OverlayContainer] Initialized")
    }

    // Functions
    function show() {
        active = true
        contentContainer.forceActiveFocus()
    }

    function hide() {
        active = false
    }

    function toggle() {
        active = !active
        if (active) {
            contentContainer.forceActiveFocus()
        }
    }
}
