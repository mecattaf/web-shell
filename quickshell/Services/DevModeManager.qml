// DevModeManager.qml - Singleton for managing dev mode file watching and hot reload
pragma Singleton
pragma ComponentBehavior: Bound
import QtQuick
import Quickshell.Io

QtObject {
    id: root

    // Configuration
    property bool enabled: false
    property string devServerUrl: "http://localhost:5173"

    // Signals
    signal reloadRequested(string appName)

    // Internal state
    property var watchers: ({})

    /**
     * Start watching an app directory for changes
     * @param appName - Unique name of the app
     * @param appPath - File system path to watch
     */
    function startWatching(appName, appPath) {
        if (!enabled) {
            console.log("[DevModeManager] Not starting watcher - dev mode disabled");
            return;
        }

        if (watchers[appName]) {
            console.warn("[DevModeManager] Already watching:", appName);
            return;
        }

        console.log("[DevModeManager] Starting watcher for:", appName, "at", appPath);

        const watcher = watcherComponent.createObject(root, {
            appName: appName,
            watchPath: appPath
        });

        if (watcher) {
            watchers[appName] = watcher;
        } else {
            console.error("[DevModeManager] Failed to create watcher for:", appName);
        }
    }

    /**
     * Stop watching an app directory
     * @param appName - Name of the app to stop watching
     */
    function stopWatching(appName) {
        const watcher = watchers[appName];
        if (watcher) {
            console.log("[DevModeManager] Stopping watcher for:", appName);
            watcher.destroy();
            delete watchers[appName];
        }
    }

    /**
     * Stop all watchers
     */
    function stopAll() {
        console.log("[DevModeManager] Stopping all watchers");
        for (const appName in watchers) {
            stopWatching(appName);
        }
    }

    /**
     * Get list of currently watched apps
     */
    function getWatchedApps() {
        return Object.keys(watchers);
    }

    // Component for creating file system watchers
    Component {
        id: watcherComponent

        QtObject {
            id: watcherObj

            property string appName: ""
            property string watchPath: ""

            // File system watcher
            property var fsWatcher: FileSystemWatcher {
                id: fsWatcher
                paths: [watcherObj.watchPath]

                onDirectoryChanged: (path) => {
                    console.log("[DevMode] Change detected in:", path, "for app:", watcherObj.appName);
                    // Debounce rapid changes
                    reloadTimer.restart();
                }

                onFileChanged: (path) => {
                    console.log("[DevMode] File changed:", path, "for app:", watcherObj.appName);
                    // Debounce rapid changes
                    reloadTimer.restart();
                }
            }

            // Debounce timer to avoid triggering reload too frequently
            property var reloadTimer: Timer {
                id: reloadTimer
                interval: 300 // 300ms debounce
                repeat: false

                onTriggered: {
                    console.log("[DevMode] Triggering reload for:", watcherObj.appName);
                    root.reloadRequested(watcherObj.appName);
                }
            }

            Component.onCompleted: {
                console.log("[DevMode] Watcher initialized for:", appName, "watching:", watchPath);
            }

            Component.onDestruction: {
                console.log("[DevMode] Watcher destroyed for:", appName);
            }
        }
    }

    Component.onCompleted: {
        console.log("[DevModeManager] Initialized");
        console.log("[DevModeManager] Enabled:", enabled);
        console.log("[DevModeManager] Dev server URL:", devServerUrl);
    }
}
