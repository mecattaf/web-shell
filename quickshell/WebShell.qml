pragma ComponentBehavior: Bound
import QtQuick
import QtQuick.Controls
import QtWebEngine
import Quickshell
import Quickshell.Wayland

import qs.Components

// WebShell windows - manages web-based shell components
PanelWindow {
    id: window

    title: "Web Shell"
    width: 1280
    height: 720
    visible: true

    color: "#1e1e1e"
    
    // Panel-specific properties (adjust as needed)
    anchors {
        top: true
        left: true
        right: true
        bottom: true
    }

    Component.onCompleted: {
        QtWebEngine.initialize();
        console.log("[WebShell] QtWebEngine initialized");
    }

    WebShellContainer {
        id: container
        anchors.fill: parent
    }
}
