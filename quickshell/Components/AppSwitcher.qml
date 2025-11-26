// AppSwitcher.qml - Visual app switcher overlay
// Displays running apps and allows quick switching
import QtQuick
import QtQuick.Layouts
import Quickshell
import qs.Services

/**
 * AppSwitcher - Visual overlay for switching between running apps
 *
 * Features:
 * - Shows list of running apps
 * - Highlights focused app
 * - Allows clicking to switch
 * - Keyboard navigation support
 * - Shows app metadata (uptime, memory)
 */
Rectangle {
    id: switcher

    // Visibility control
    visible: false
    z: 5000 // Very high z-order to appear above everything

    // Fill the screen
    anchors.fill: parent

    // Semi-transparent dark overlay
    color: Qt.rgba(0, 0, 0, 0.75)

    // Opacity animation
    opacity: visible ? 1.0 : 0.0
    Behavior on opacity {
        NumberAnimation {
            duration: 200
            easing.type: Easing.OutCubic
        }
    }

    // Click outside to close
    MouseArea {
        anchors.fill: parent
        onClicked: {
            switcher.visible = false;
        }
    }

    // Main content container
    Rectangle {
        id: contentContainer

        anchors.centerIn: parent
        width: Math.min(parent.width * 0.7, 800)
        height: Math.min(parent.height * 0.8, 600)

        color: Qt.rgba(0.1, 0.1, 0.1, 0.95)
        radius: 12

        border.color: Qt.rgba(1, 1, 1, 0.1)
        border.width: 1

        // Prevent clicks from propagating to background
        MouseArea {
            anchors.fill: parent
            onClicked: {} // Absorb clicks
        }

        ColumnLayout {
            anchors.fill: parent
            anchors.margins: 20
            spacing: 15

            // Header
            Text {
                Layout.fillWidth: true
                text: "Running Applications"
                color: "white"
                font.pixelSize: 24
                font.weight: Font.Bold
            }

            Text {
                Layout.fillWidth: true
                text: appList.count + " app" + (appList.count !== 1 ? "s" : "") + " running"
                color: Qt.rgba(1, 1, 1, 0.7)
                font.pixelSize: 14
            }

            // App list
            ListView {
                id: appList

                Layout.fillWidth: true
                Layout.fillHeight: true

                clip: true
                spacing: 10

                model: switcher.visible ? AppOrchestrator.getRunningApps() : []

                delegate: Rectangle {
                    id: appItem

                    required property var modelData
                    required property int index

                    width: appList.width
                    height: 100
                    radius: 8

                    // Highlight focused app
                    color: modelData.focused
                        ? Qt.rgba(0.3, 0.5, 0.8, 0.4)
                        : Qt.rgba(0.2, 0.2, 0.2, 0.4)

                    border.color: modelData.focused
                        ? Qt.rgba(0.4, 0.6, 1.0, 0.8)
                        : Qt.rgba(0.3, 0.3, 0.3, 0.3)
                    border.width: modelData.focused ? 2 : 1

                    // Hover effect
                    property bool hovered: false

                    Behavior on color {
                        ColorAnimation { duration: 150 }
                    }

                    Behavior on border.color {
                        ColorAnimation { duration: 150 }
                    }

                    MouseArea {
                        anchors.fill: parent
                        hoverEnabled: true

                        onEntered: {
                            appItem.hovered = true;
                        }

                        onExited: {
                            appItem.hovered = false;
                        }

                        onClicked: {
                            console.log("[AppSwitcher] Switching to:", appItem.modelData.name);
                            AppOrchestrator.focusApp(appItem.modelData.name);
                            switcher.visible = false;
                        }
                    }

                    RowLayout {
                        anchors.fill: parent
                        anchors.margins: 15
                        spacing: 15

                        // App icon placeholder
                        Rectangle {
                            Layout.preferredWidth: 60
                            Layout.preferredHeight: 60
                            Layout.alignment: Qt.AlignVCenter

                            radius: 8
                            color: Qt.rgba(0.4, 0.4, 0.4, 0.5)

                            // Simple icon representation
                            Text {
                                anchors.centerIn: parent
                                text: appItem.modelData.name.substring(0, 2).toUpperCase()
                                color: "white"
                                font.pixelSize: 24
                                font.weight: Font.Bold
                            }
                        }

                        // App information
                        ColumnLayout {
                            Layout.fillWidth: true
                            Layout.fillHeight: true
                            spacing: 5

                            // App name
                            Text {
                                Layout.fillWidth: true
                                text: appItem.modelData.name
                                color: "white"
                                font.pixelSize: 18
                                font.weight: Font.Medium
                                elide: Text.ElideRight
                            }

                            // Status badge
                            Row {
                                spacing: 5

                                Rectangle {
                                    width: 8
                                    height: 8
                                    radius: 4
                                    anchors.verticalCenter: parent.verticalCenter

                                    color: appItem.modelData.focused
                                        ? Qt.rgba(0.3, 0.8, 0.3, 1.0)
                                        : (appItem.modelData.paused
                                            ? Qt.rgba(0.8, 0.6, 0.2, 1.0)
                                            : Qt.rgba(0.5, 0.5, 0.5, 1.0))
                                }

                                Text {
                                    text: appItem.modelData.focused ? "Active" : (appItem.modelData.paused ? "Paused" : "Background")
                                    color: Qt.rgba(1, 1, 1, 0.7)
                                    font.pixelSize: 12
                                }
                            }

                            // Metadata
                            Text {
                                Layout.fillWidth: true
                                text: {
                                    const elapsed = Date.now() - appItem.modelData.launchedAt;
                                    const minutes = Math.floor(elapsed / 60000);
                                    const hours = Math.floor(minutes / 60);

                                    let timeStr = "";
                                    if (hours > 0) {
                                        timeStr = hours + "h " + (minutes % 60) + "m";
                                    } else {
                                        timeStr = minutes + "m";
                                    }

                                    return `Window: ${appItem.modelData.windowType} • Uptime: ${timeStr}`;
                                }
                                color: Qt.rgba(1, 1, 1, 0.5)
                                font.pixelSize: 11
                                elide: Text.ElideRight
                            }
                        }

                        // Close button
                        Rectangle {
                            Layout.preferredWidth: 40
                            Layout.preferredHeight: 40
                            Layout.alignment: Qt.AlignVCenter

                            radius: 20
                            color: closeButtonArea.pressed
                                ? Qt.rgba(0.8, 0.2, 0.2, 0.8)
                                : (closeButtonArea.containsMouse
                                    ? Qt.rgba(0.8, 0.2, 0.2, 0.6)
                                    : Qt.rgba(0.3, 0.3, 0.3, 0.3))

                            Behavior on color {
                                ColorAnimation { duration: 150 }
                            }

                            Text {
                                anchors.centerIn: parent
                                text: "×"
                                color: "white"
                                font.pixelSize: 28
                                font.weight: Font.Bold
                            }

                            MouseArea {
                                id: closeButtonArea
                                anchors.fill: parent
                                hoverEnabled: true

                                onClicked: {
                                    console.log("[AppSwitcher] Closing:", appItem.modelData.name);
                                    AppOrchestrator.closeApp(appItem.modelData.name);

                                    // Close switcher if no apps left
                                    if (AppOrchestrator.getRunningApps().length === 0) {
                                        switcher.visible = false;
                                    }
                                }
                            }
                        }
                    }
                }

                // Empty state
                Item {
                    anchors.fill: parent
                    visible: appList.count === 0

                    ColumnLayout {
                        anchors.centerIn: parent
                        spacing: 10

                        Text {
                            Layout.alignment: Qt.AlignHCenter
                            text: "No running apps"
                            color: Qt.rgba(1, 1, 1, 0.5)
                            font.pixelSize: 16
                        }

                        Text {
                            Layout.alignment: Qt.AlignHCenter
                            text: "Launch apps to see them here"
                            color: Qt.rgba(1, 1, 1, 0.3)
                            font.pixelSize: 12
                        }
                    }
                }
            }

            // Footer with keyboard hints
            Rectangle {
                Layout.fillWidth: true
                Layout.preferredHeight: 40

                color: Qt.rgba(0.15, 0.15, 0.15, 0.5)
                radius: 6

                Row {
                    anchors.centerIn: parent
                    spacing: 20

                    Row {
                        spacing: 5

                        Rectangle {
                            width: 60
                            height: 24
                            radius: 4
                            color: Qt.rgba(0.3, 0.3, 0.3, 0.8)
                            anchors.verticalCenter: parent.verticalCenter

                            Text {
                                anchors.centerIn: parent
                                text: "Esc"
                                color: "white"
                                font.pixelSize: 11
                            }
                        }

                        Text {
                            text: "Close"
                            color: Qt.rgba(1, 1, 1, 0.7)
                            font.pixelSize: 12
                            anchors.verticalCenter: parent.verticalCenter
                        }
                    }

                    Row {
                        spacing: 5

                        Rectangle {
                            width: 60
                            height: 24
                            radius: 4
                            color: Qt.rgba(0.3, 0.3, 0.3, 0.8)
                            anchors.verticalCenter: parent.verticalCenter

                            Text {
                                anchors.centerIn: parent
                                text: "Click"
                                color: "white"
                                font.pixelSize: 11
                            }
                        }

                        Text {
                            text: "Switch"
                            color: Qt.rgba(1, 1, 1, 0.7)
                            font.pixelSize: 12
                            anchors.verticalCenter: parent.verticalCenter
                        }
                    }
                }
            }
        }
    }

    // Keyboard handling
    Keys.onEscapePressed: {
        visible = false;
    }

    // Focus handling when visible
    onVisibleChanged: {
        if (visible) {
            forceActiveFocus();

            // Refresh the list
            appList.model = AppOrchestrator.getRunningApps();
        }
    }

    // Public function to toggle visibility
    function toggle() {
        visible = !visible;
    }

    // Public function to show switcher
    function show() {
        visible = true;
    }

    // Public function to hide switcher
    function hide() {
        visible = false;
    }
}
