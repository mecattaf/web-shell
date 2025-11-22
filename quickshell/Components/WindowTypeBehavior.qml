// WindowTypeBehavior.qml - Type-specific window behaviors
// Defines behavior differences between widget, panel, overlay, and dialog windows
pragma ComponentBehavior: Bound
import QtQuick

QtObject {
    id: root

    property string type: "widget"

    // Behavior definitions for each window type
    readonly property var behaviors: ({
        "widget": {
            floating: true,
            alwaysOnTop: false,
            showInTaskbar: false,
            closeOnFocusLoss: false,
            modal: false,
            fullscreen: false
        },
        "panel": {
            floating: false,
            alwaysOnTop: true,
            showInTaskbar: false,
            closeOnFocusLoss: false,
            modal: false,
            fullscreen: false
        },
        "overlay": {
            floating: true,
            alwaysOnTop: true,
            showInTaskbar: false,
            closeOnFocusLoss: true,
            modal: false,
            fullscreen: true
        },
        "dialog": {
            floating: true,
            alwaysOnTop: true,
            showInTaskbar: false,
            closeOnFocusLoss: false,
            modal: true,
            fullscreen: false
        }
    })

    // Get a specific behavior property
    function getBehavior(property) {
        if (behaviors[type] && behaviors[type][property] !== undefined) {
            return behaviors[type][property];
        }
        return false;
    }

    // Get all behaviors for current type
    function getAllBehaviors() {
        return behaviors[type] || behaviors["widget"];
    }

    // Check if window should be floating
    readonly property bool isFloating: getBehavior("floating")

    // Check if window should always be on top
    readonly property bool isAlwaysOnTop: getBehavior("alwaysOnTop")

    // Check if window should show in taskbar
    readonly property bool showInTaskbar: getBehavior("showInTaskbar")

    // Check if window should close when losing focus
    readonly property bool closeOnFocusLoss: getBehavior("closeOnFocusLoss")

    // Check if window is modal
    readonly property bool isModal: getBehavior("modal")

    // Check if window should be fullscreen
    readonly property bool isFullscreen: getBehavior("fullscreen")

    // Get z-index based on type
    function getZIndex() {
        switch (type) {
            case "overlay":
                return 1000;
            case "dialog":
                return 900;
            case "panel":
                return 800;
            case "widget":
            default:
                return 100;
        }
    }

    Component.onCompleted: {
        console.log("[WindowTypeBehavior] Type:", type);
        console.log("[WindowTypeBehavior] Behaviors:", JSON.stringify(getAllBehaviors()));
    }
}
