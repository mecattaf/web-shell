import QtQuick
import Quickshell
import Quickshell.Wayland

ShellRoot {
    id: root

    // Load WebShell component as a file (no module needed)
    Loader {
        id: webshellLoader
        asynchronous: false
        source: "WebShell.qml"
    }
}
