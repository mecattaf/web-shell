// WindowConfigTest.qml - Test window configuration system
// Demonstrates different window types, sizes, positions, and behaviors
pragma ComponentBehavior: Bound
import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

Rectangle {
    id: testWindow
    width: 1920
    height: 1080
    color: "#2c3e50"

    Text {
        anchors.top: parent.top
        anchors.left: parent.left
        anchors.margins: 20
        text: "Window Configuration Test"
        color: "white"
        font.pixelSize: 24
        font.bold: true
    }

    Column {
        anchors.centerIn: parent
        spacing: 20

        Text {
            text: "Click buttons to test different window configurations"
            color: "white"
            font.pixelSize: 16
        }

        Row {
            spacing: 10
            anchors.horizontalCenter: parent.horizontalCenter

            Button {
                text: "Widget Window"
                onClicked: {
                    widgetWindow.visible = !widgetWindow.visible
                }
            }

            Button {
                text: "Panel Window"
                onClicked: {
                    panelWindow.visible = !panelWindow.visible
                }
            }

            Button {
                text: "Dialog Window"
                onClicked: {
                    dialogWindow.visible = !dialogWindow.visible
                }
            }

            Button {
                text: "Overlay Window"
                onClicked: {
                    overlayWindow.visible = !overlayWindow.visible
                }
            }
        }
    }

    // Widget window example
    WebShellContainer {
        id: widgetWindow
        visible: false
        containerType: "widget"
        enableBlur: true
        blurRadius: 20
        windowConfig: {
            return {
                type: "widget",
                width: 600,
                height: 400,
                position: "center",
                resizable: true,
                movable: true,
                blur: true,
                transparency: true,
                opacity: 0.95,
                minWidth: 400,
                minHeight: 300,
                maxWidth: 1200,
                maxHeight: 800
            };
        }
    }

    // Panel window example (top panel)
    WebShellContainer {
        id: panelWindow
        visible: false
        containerType: "panel"
        enableBlur: true
        blurRadius: 15
        windowConfig: {
            return {
                type: "panel",
                width: -1, // full width
                height: 60,
                position: "top-center",
                resizable: false,
                movable: false,
                blur: true,
                transparency: true,
                opacity: 0.9
            };
        }
    }

    // Dialog window example
    WebShellContainer {
        id: dialogWindow
        visible: false
        containerType: "dialog"
        enableBlur: true
        blurRadius: 20
        windowConfig: {
            return {
                type: "dialog",
                width: 400,
                height: 300,
                position: "center",
                resizable: false,
                movable: true,
                blur: true,
                transparency: true,
                opacity: 0.95
            };
        }
    }

    // Overlay window example
    WebShellContainer {
        id: overlayWindow
        visible: false
        containerType: "overlay"
        enableBlur: true
        blurRadius: 25
        backgroundColor: Qt.rgba(0, 0, 0, 0.7)
        windowConfig: {
            return {
                type: "overlay",
                width: -1, // full width
                height: -1, // full height
                position: "center",
                resizable: false,
                movable: false,
                blur: true,
                transparency: true,
                opacity: 0.85
            };
        }
    }

    // Legend showing window positions
    Rectangle {
        anchors.bottom: parent.bottom
        anchors.left: parent.left
        anchors.margins: 20
        width: 300
        height: legendColumn.height + 40
        color: Qt.rgba(0, 0, 0, 0.7)
        radius: 8

        Column {
            id: legendColumn
            anchors.centerIn: parent
            spacing: 10
            width: parent.width - 40

            Text {
                text: "Window Types:"
                color: "white"
                font.pixelSize: 14
                font.bold: true
            }

            Text {
                text: "• Widget: Resizable, movable, centered"
                color: "#3498db"
                font.pixelSize: 12
                wrapMode: Text.Wrap
                width: parent.width
            }

            Text {
                text: "• Panel: Fixed size, top-aligned, full width"
                color: "#2ecc71"
                font.pixelSize: 12
                wrapMode: Text.Wrap
                width: parent.width
            }

            Text {
                text: "• Dialog: Fixed size, movable, centered"
                color: "#e74c3c"
                font.pixelSize: 12
                wrapMode: Text.Wrap
                width: parent.width
            }

            Text {
                text: "• Overlay: Fullscreen, modal, high z-index"
                color: "#9b59b6"
                font.pixelSize: 12
                wrapMode: Text.Wrap
                width: parent.width
            }
        }
    }

    // Window info display
    Rectangle {
        anchors.bottom: parent.bottom
        anchors.right: parent.right
        anchors.margins: 20
        width: 300
        height: infoColumn.height + 40
        color: Qt.rgba(0, 0, 0, 0.7)
        radius: 8

        Column {
            id: infoColumn
            anchors.centerIn: parent
            spacing: 8
            width: parent.width - 40

            Text {
                text: "Features:"
                color: "white"
                font.pixelSize: 14
                font.bold: true
            }

            Text {
                text: "✓ Size constraints (min/max)"
                color: "#2ecc71"
                font.pixelSize: 11
            }

            Text {
                text: "✓ Position calculation"
                color: "#2ecc71"
                font.pixelSize: 11
            }

            Text {
                text: "✓ Blur & transparency"
                color: "#2ecc71"
                font.pixelSize: 11
            }

            Text {
                text: "✓ Resize handles"
                color: "#2ecc71"
                font.pixelSize: 11
            }

            Text {
                text: "✓ Drag to move"
                color: "#2ecc71"
                font.pixelSize: 11
            }

            Text {
                text: "✓ Type-specific animations"
                color: "#2ecc71"
                font.pixelSize: 11
            }

            Text {
                text: "✓ Z-index management"
                color: "#2ecc71"
                font.pixelSize: 11
            }
        }
    }
}
