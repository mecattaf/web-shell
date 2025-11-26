pragma ComponentBehavior: Bound
import QtQuick
import qs.Services

/**
 * PanelContainer - Top/bottom panel container for system widgets
 *
 * Features:
 * - Blur enabled by default
 * - Horizontal layout for widgets
 * - Configurable positioning (top, bottom, left, right)
 * - Auto-sizing with configurable height/width
 */
ShellContainer {
    id: panel

    // Panel-specific properties
    property string position: "top" // top, bottom, left, right
    property int panelSize: 60      // Height for horizontal, width for vertical
    property int panelMargin: WebShellTheme.spaceM

    // Container configuration
    containerType: "panel"
    enableBlur: true
    blurRadius: 20

    // Z-order for panels
    z: 10

    // Override content area to provide layout
    contentData: Row {
        id: contentRow
        anchors.fill: parent
        anchors.margins: WebShellTheme.spaceS
        spacing: WebShellTheme.spaceS
        visible: panel.position === "top" || panel.position === "bottom"

        // For vertical panels (left/right), use Column instead
        Column {
            id: contentColumn
            anchors.fill: parent
            anchors.margins: WebShellTheme.spaceS
            spacing: WebShellTheme.spaceS
            visible: panel.position === "left" || panel.position === "right"
        }
    }

    // Position and size based on panel position
    Component.onCompleted: {
        switch (position) {
            case "top":
                height = panelSize
                anchors.left = parent.left
                anchors.right = parent.right
                anchors.top = parent.top
                anchors.margins = panelMargin
                break
            case "bottom":
                height = panelSize
                anchors.left = parent.left
                anchors.right = parent.right
                anchors.bottom = parent.bottom
                anchors.margins = panelMargin
                break
            case "left":
                width = panelSize
                anchors.top = parent.top
                anchors.bottom = parent.bottom
                anchors.left = parent.left
                anchors.margins = panelMargin
                break
            case "right":
                width = panelSize
                anchors.top = parent.top
                anchors.bottom = parent.bottom
                anchors.right = parent.right
                anchors.margins = panelMargin
                break
        }
        console.log("[PanelContainer] Initialized at position:", position)
    }
}
