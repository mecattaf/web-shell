pragma ComponentBehavior: Bound
import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

/**
 * Permission Prompt Dialog
 * Future enhancement: Display permission request dialogs to users
 * Currently a stub for the permission prompt system
 */
Popup {
    id: dialog

    /**
     * The application name requesting permission
     */
    property string appName: ""

    /**
     * The permission being requested (e.g., "calendar.read")
     */
    property string permissionName: ""

    /**
     * The reason for requesting this permission
     */
    property string reason: ""

    /**
     * Whether to show this dialog
     */
    property bool show: false

    signal granted()
    signal denied()

    // Center in parent
    anchors.centerIn: parent
    width: 400
    height: 250
    modal: true
    focus: true
    closePolicy: Popup.CloseOnEscape

    // Make visible when show is true
    visible: show

    // Background
    background: Rectangle {
        color: "#ffffff"
        radius: 8
        border.color: "#dddddd"
        border.width: 1
    }

    contentItem: ColumnLayout {
        spacing: 16

        // Title
        Label {
            text: qsTr("Permission Request")
            font.pixelSize: 18
            font.weight: Font.DemiBold
            Layout.fillWidth: true
        }

        // App name
        Label {
            text: qsTr("%1 is requesting permission:").arg(dialog.appName)
            font.pixelSize: 14
            wrapMode: Text.Wrap
            Layout.fillWidth: true
        }

        // Permission name
        Label {
            text: dialog.permissionName
            font.pixelSize: 16
            font.weight: Font.Bold
            color: "#0066cc"
            Layout.fillWidth: true
        }

        // Reason
        Label {
            text: dialog.reason
            font.pixelSize: 13
            color: "#666666"
            wrapMode: Text.Wrap
            Layout.fillWidth: true
            visible: dialog.reason !== ""
        }

        // Spacer
        Item {
            Layout.fillHeight: true
        }

        // Buttons
        RowLayout {
            spacing: 12
            Layout.fillWidth: true
            Layout.alignment: Qt.AlignRight

            Button {
                text: qsTr("Deny")
                onClicked: {
                    dialog.denied();
                    dialog.close();
                }
            }

            Button {
                text: qsTr("Allow")
                highlighted: true
                onClicked: {
                    dialog.granted();
                    dialog.close();
                }
            }
        }
    }

    // Close when clicking outside (if closePolicy allows)
    onClosed: {
        show = false;
    }
}
