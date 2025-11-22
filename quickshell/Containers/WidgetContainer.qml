pragma ComponentBehavior: Bound
import QtQuick
import WebShell.Services

/**
 * WidgetContainer - Floating widget container
 *
 * Features:
 * - Configurable size
 * - Elevation/shadow support
 * - Blur enabled
 * - Draggable (optional)
 * - Can be minimized/maximized
 */
ShellContainer {
    id: widget

    // Widget-specific properties
    property bool draggable: false
    property bool minimized: false
    property size defaultSize: Qt.size(400, 600)
    property point defaultPosition: Qt.point(100, 100)

    // Container configuration
    containerType: "widget"
    enableBlur: true
    blurRadius: 20
    enableShadow: true
    shadowRadius: 12

    // Default sizing
    width: defaultSize.width
    height: minimized ? 60 : defaultSize.height
    x: defaultPosition.x
    y: defaultPosition.y

    // Z-order for widgets
    z: 20

    // Animation for minimize/maximize
    Behavior on height {
        NumberAnimation {
            duration: WebShellTheme.animationDurationNormal
            easing.type: Easing.OutCubic
        }
    }

    // Drag functionality
    MouseArea {
        id: dragArea
        anchors.top: parent.top
        anchors.left: parent.left
        anchors.right: parent.right
        height: 40
        enabled: widget.draggable
        cursorShape: enabled ? Qt.OpenHandCursor : Qt.ArrowCursor

        property point lastMousePos: Qt.point(0, 0)

        onPressed: (mouse) => {
            lastMousePos = Qt.point(mouse.x, mouse.y)
            cursorShape = Qt.ClosedHandCursor
        }

        onReleased: {
            cursorShape = Qt.OpenHandCursor
        }

        onPositionChanged: (mouse) => {
            if (pressed) {
                var delta = Qt.point(mouse.x - lastMousePos.x, mouse.y - lastMousePos.y)
                widget.x += delta.x
                widget.y += delta.y
            }
        }

        // Visual indicator for drag area
        Rectangle {
            visible: widget.draggable
            anchors.top: parent.top
            anchors.horizontalCenter: parent.horizontalCenter
            width: 40
            height: 4
            radius: 2
            color: WebShellTheme.colBorder
            opacity: 0.5
            y: 8
        }
    }

    // Widget controls (minimize button)
    Row {
        anchors.top: parent.top
        anchors.right: parent.right
        anchors.margins: WebShellTheme.spaceS
        spacing: WebShellTheme.spaceXs
        z: 999

        // Minimize button
        Rectangle {
            width: 24
            height: 24
            radius: WebShellTheme.radiusS
            color: minimizeHover.containsMouse ? WebShellTheme.colSurfaceHigh : "transparent"

            Text {
                anchors.centerIn: parent
                text: widget.minimized ? "□" : "−"
                color: WebShellTheme.colText
                font.pixelSize: WebShellTheme.fontSizeM
            }

            MouseArea {
                id: minimizeHover
                anchors.fill: parent
                hoverEnabled: true
                onClicked: widget.minimized = !widget.minimized
            }
        }
    }

    Component.onCompleted: {
        console.log("[WidgetContainer] Initialized at", defaultPosition, "with size", defaultSize)
    }
}
