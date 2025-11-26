pragma ComponentBehavior: Bound
import QtQuick
import qs.Services

/**
 * NotificationAreaContainer - Notification stack container
 *
 * Features:
 * - Vertical stack layout
 * - Auto-dismiss with timeout
 * - Slide-in animation
 * - Multiple notification types (info, success, warning, error)
 * - Positioned in corner (configurable)
 */
Item {
    id: notificationArea

    // Notification area properties
    property string position: "top-right" // top-right, top-left, bottom-right, bottom-left
    property int maxNotifications: 5
    property int notificationWidth: 350
    property int defaultTimeout: 5000 // milliseconds

    // Internal notification list
    property var notifications: []

    anchors.fill: parent
    z: 90 // Below overlays, above widgets

    // Notification stack layout
    Column {
        id: notificationStack
        spacing: WebShellTheme.spaceM
        width: notificationArea.notificationWidth

        // Position based on corner
        states: [
            State {
                name: "top-right"
                when: notificationArea.position === "top-right"
                PropertyChanges {
                    target: notificationStack
                    anchors.top: parent.top
                    anchors.right: parent.right
                    anchors.margins: WebShellTheme.spaceL
                }
            },
            State {
                name: "top-left"
                when: notificationArea.position === "top-left"
                PropertyChanges {
                    target: notificationStack
                    anchors.top: parent.top
                    anchors.left: parent.left
                    anchors.margins: WebShellTheme.spaceL
                }
            },
            State {
                name: "bottom-right"
                when: notificationArea.position === "bottom-right"
                PropertyChanges {
                    target: notificationStack
                    anchors.bottom: parent.bottom
                    anchors.right: parent.right
                    anchors.margins: WebShellTheme.spaceL
                }
            },
            State {
                name: "bottom-left"
                when: notificationArea.position === "bottom-left"
                PropertyChanges {
                    target: notificationStack
                    anchors.bottom: parent.bottom
                    anchors.left: parent.left
                    anchors.margins: WebShellTheme.spaceL
                }
            }
        ]
    }

    // Notification component
    Component {
        id: notificationComponent

        ShellContainer {
            id: notification
            containerType: "notification"
            enableBlur: true
            blurRadius: 20
            enableShadow: true
            width: notificationArea.notificationWidth
            height: notificationContent.height + WebShellTheme.spaceM * 2

            required property string title
            required property string message
            required property string type // info, success, warning, error
            required property int index

            // Type-based colors
            property color accentColor: {
                switch (type) {
                    case "success": return WebShellTheme.colSuccess
                    case "warning": return WebShellTheme.colWarning
                    case "error": return WebShellTheme.colError
                    default: return WebShellTheme.colInfo
                }
            }

            // Slide-in animation
            x: {
                if (notificationArea.position.includes("right"))
                    return notificationArea.notificationWidth
                else
                    return -notificationArea.notificationWidth
            }

            Component.onCompleted: {
                slideIn.start()
            }

            NumberAnimation on x {
                id: slideIn
                to: 0
                duration: WebShellTheme.animationDurationNormal
                easing.type: Easing.OutCubic
            }

            // Accent bar
            Rectangle {
                anchors.left: parent.left
                anchors.top: parent.top
                anchors.bottom: parent.bottom
                width: 4
                color: notification.accentColor
                radius: parent.radius
            }

            // Content
            Column {
                id: notificationContent
                anchors.left: parent.left
                anchors.right: parent.right
                anchors.verticalCenter: parent.verticalCenter
                anchors.leftMargin: WebShellTheme.spaceM + 4
                anchors.rightMargin: WebShellTheme.spaceM
                spacing: WebShellTheme.spaceXs

                // Title
                Text {
                    text: notification.title
                    color: WebShellTheme.colText
                    font.pixelSize: WebShellTheme.fontSizeM
                    font.weight: WebShellTheme.fontWeightSemibold
                    wrapMode: Text.WordWrap
                    width: parent.width
                }

                // Message
                Text {
                    text: notification.message
                    color: WebShellTheme.colTextSecondary
                    font.pixelSize: WebShellTheme.fontSizeS
                    wrapMode: Text.WordWrap
                    width: parent.width
                }
            }

            // Close button
            Rectangle {
                anchors.top: parent.top
                anchors.right: parent.right
                anchors.margins: WebShellTheme.spaceS
                width: 24
                height: 24
                radius: WebShellTheme.radiusS
                color: closeHover.containsMouse ? WebShellTheme.colSurfaceHigh : "transparent"

                Text {
                    anchors.centerIn: parent
                    text: "×"
                    color: WebShellTheme.colText
                    font.pixelSize: 18
                }

                MouseArea {
                    id: closeHover
                    anchors.fill: parent
                    hoverEnabled: true
                    onClicked: notificationArea.removeNotification(notification.index)
                }
            }

            // Auto-dismiss timer
            Timer {
                interval: notificationArea.defaultTimeout
                running: true
                onTriggered: notificationArea.removeNotification(notification.index)
            }
        }
    }

    Component.onCompleted: {
        console.log("[NotificationAreaContainer] Initialized at position:", position)
    }

    // Functions
    function addNotification(title, message, type) {
        if (notifications.length >= maxNotifications) {
            // Remove oldest notification
            removeNotification(0)
        }

        var props = {
            title: title,
            message: message,
            type: type || "info",
            index: notifications.length
        }

        var obj = notificationComponent.createObject(notificationStack, props)
        notifications.push(obj)
        return obj
    }

    function removeNotification(index) {
        if (index >= 0 && index < notifications.length) {
            var notification = notifications[index]
            notifications.splice(index, 1)
            notification.destroy()
        }
    }

    function clearAll() {
        for (var i = 0; i < notifications.length; i++) {
            notifications[i].destroy()
        }
        notifications = []
    }
}
