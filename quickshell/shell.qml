
import QtQuick
import Quickshell

import qs 1.0     // ← your root module

ShellRoot {
    id: root

    qs.WebShell {  // ← must be prefixed
        id: webshell
    }
}
