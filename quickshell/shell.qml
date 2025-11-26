import QtQuick
import Quickshell

ShellRoot {
    id: root

    // Load WebShell component as a file (no module needed)
    Loader {
        id: webshellLoader
        asynchronous: false
        source: "WebShell.qml"
    }
}
