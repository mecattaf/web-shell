pragma ComponentBehavior: Bound
import QtQuick
import WebShell.Services

/**
 * DockContainer - Application launcher dock
 *
 * Features:
 * - Centered layout for app icons
 * - Auto-hiding capability
 * - Icon magnification on hover
 * - Configurable positioning (bottom, left, right)
 */
ShellContainer {
    id: dock

    // Dock-specific properties
    property string position: "bottom" // bottom, left, right
    property int dockSize: 70
    property int iconSize: 48
    property int iconSpacing: WebShellTheme.spaceM
    property bool autoHide: false
    property bool revealed: true

    // Container configuration
    containerType: "dock"
    enableBlur: true
    blurRadius: 25
    enableShadow: true
    shadowRadius: 16

    // Z-order for dock
    z: 15

    // Auto-hide behavior
    opacity: (autoHide && !revealed) ? 0.0 : 1.0
    scale: (autoHide && !revealed) ? 0.8 : 1.0

    Behavior on opacity {
        NumberAnimation {
            duration: WebShellTheme.animationDurationNormal
        }
    }

    Behavior on scale {
        NumberAnimation {
            duration: WebShellTheme.animationDurationNormal
            easing.type: Easing.OutCubic
        }
    }

    // Position and size based on dock position
    states: [
        State {
            name: "bottom"
            when: dock.position === "bottom"
            PropertyChanges {
                target: dock
                height: dockSize
                anchors.bottom: parent.bottom
                anchors.horizontalCenter: parent.horizontalCenter
                anchors.bottomMargin: WebShellTheme.spaceM
            }
            PropertyChanges {
                target: contentLayout
                visible: true
            }
            PropertyChanges {
                target: verticalContentLayout
                visible: false
            }
        },
        State {
            name: "left"
            when: dock.position === "left"
            PropertyChanges {
                target: dock
                width: dockSize
                anchors.left: parent.left
                anchors.verticalCenter: parent.verticalCenter
                anchors.leftMargin: WebShellTheme.spaceM
            }
            PropertyChanges {
                target: contentLayout
                visible: false
            }
            PropertyChanges {
                target: verticalContentLayout
                visible: true
            }
        },
        State {
            name: "right"
            when: dock.position === "right"
            PropertyChanges {
                target: dock
                width: dockSize
                anchors.right: parent.right
                anchors.verticalCenter: parent.verticalCenter
                anchors.rightMargin: WebShellTheme.spaceM
            }
            PropertyChanges {
                target: contentLayout
                visible: false
            }
            PropertyChanges {
                target: verticalContentLayout
                visible: true
            }
        }
    ]

    // Horizontal layout (for bottom position)
    Row {
        id: contentLayout
        anchors.centerIn: parent
        spacing: dock.iconSpacing
    }

    // Vertical layout (for left/right positions)
    Column {
        id: verticalContentLayout
        anchors.centerIn: parent
        spacing: dock.iconSpacing
    }

    // Auto-hide trigger areas
    MouseArea {
        id: revealArea
        enabled: dock.autoHide
        hoverEnabled: true

        onEntered: dock.revealed = true
        onExited: dock.revealed = false

        // Position based on dock position
        states: [
            State {
                name: "bottom"
                when: dock.position === "bottom"
                PropertyChanges {
                    target: revealArea
                    anchors.left: parent.left
                    anchors.right: parent.right
                    anchors.bottom: parent.bottom
                    height: 5
                }
            },
            State {
                name: "left"
                when: dock.position === "left"
                PropertyChanges {
                    target: revealArea
                    anchors.top: parent.top
                    anchors.bottom: parent.bottom
                    anchors.left: parent.left
                    width: 5
                }
            },
            State {
                name: "right"
                when: dock.position === "right"
                PropertyChanges {
                    target: revealArea
                    anchors.top: parent.top
                    anchors.bottom: parent.bottom
                    anchors.right: parent.right
                    width: 5
                }
            }
        ]
    }

    Component.onCompleted: {
        console.log("[DockContainer] Initialized at position:", position)
    }
}
