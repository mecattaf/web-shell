pragma ComponentBehavior: Bound
import QtQuick
import QtQuick.Controls
import QtWebEngine
import Quickshell

import qs 1.0
import qs.Components 1.0

Scope {
    id: root

    // Initialize QtWebEngine (must be done before creating WebEngineView)
    Component.onCompleted: {
        QtWebEngine.initialize();
        console.log("[WebShell] QtWebEngine initialized");
    }

    ShellWindow {
        id: window

        title: "Web Shell"
        width: 1280
        height: 720
        visible: true

        color: "#1e1e1e"

        WebShellContainer {
            id: container
            anchors.fill: parent
        }
    }
}
