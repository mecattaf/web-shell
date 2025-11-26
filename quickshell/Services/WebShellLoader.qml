// WebShellLoader.qml - App discovery, loading, and lifecycle management
// Implements shared WebEngineProfile model for memory efficiency
pragma Singleton
pragma ComponentBehavior: Bound
import QtQuick
import Quickshell
import Quickshell.Io
import qs.Services

QtObject {
    id: root

    // Configuration
    property url appsDirectory: "file:///home/" + Quickshell.env("USER") + "/.config/webshell/apps"
    property bool devMode: false

    // State
    property var loadedApps: ({})
    property var activeViews: ([])

    // Memory tracking
    property int totalWebEngineMemory: 0

    // Signals
    signal appLoaded(string appName)
    signal appFailed(string appName, string error)
    signal appLaunched(string appName)
    signal appClosed(string appName)

    /**
     * Initialize the loader and discover apps
     */
    function initialize() {
        console.log("[WebShellLoader] Initializing...");
        console.log("[WebShellLoader] Using shared WebEngineProfile");
        console.log("[WebShellLoader] All apps share one Chromium process");
        console.log("[WebShellLoader] Expected memory: ~150MB base + 10-30MB per app");
        console.log("[WebShellLoader] Apps directory:", appsDirectory);

        discoverApps();
    }

    /**
     * Discover all apps in the apps directory
     */
    function discoverApps() {
        console.log("[WebShellLoader] Discovering apps in:", appsDirectory);

        const appsPath = appsDirectory.toString().replace("file://", "");

        // Use Process to find all webshell.json manifest files
        const findProcess = Process.exec([
            "find", appsPath,
            "-name", "webshell.json",
            "-type", "f"
        ]);

        findProcess.finished.connect(() => {
            const output = findProcess.readAllStandardOutput();
            const manifestPaths = output.split('\n').filter(p => p.length > 0);

            console.log(`[WebShellLoader] Found ${manifestPaths.length} app manifest(s)`);

            manifestPaths.forEach(path => {
                loadApp(path);
            });
        });

        findProcess.errorOccurred.connect((error) => {
            console.error("[WebShellLoader] Error discovering apps:", error);
        });
    }

    /**
     * Load an app from its manifest path
     * @param manifestPath - Filesystem path to webshell.json
     */
    function loadApp(manifestPath) {
        console.log("[WebShellLoader] Loading app from:", manifestPath);

        const parser = manifestParserComponent.createObject(root, {
            manifestPath: "file://" + manifestPath
        });

        parser.manifestLoaded.connect(() => {
            registerApp(parser, manifestPath);
        });

        parser.manifestError.connect((error) => {
            console.error("[WebShellLoader] Failed to load:", manifestPath, error);
            const appName = parser.appName || "unknown";
            appFailed(appName, error);
            parser.destroy();
        });

        parser.load(parser.manifestPath);
    }

    /**
     * Register a loaded app
     * @param parser - ManifestParser instance with loaded data
     * @param manifestPath - Path to the manifest file
     */
    function registerApp(parser, manifestPath) {
        const appName = parser.appName;

        // Register permissions with PermissionManager
        PermissionManager.registerApp(appName, parser.permissions);

        // Get directory containing the manifest
        const manifestDir = manifestPath.substring(0, manifestPath.lastIndexOf('/'));

        // Store app metadata
        loadedApps[appName] = {
            name: appName,
            displayName: parser.displayName,
            manifest: parser.manifest,
            entrypoint: parser.entrypoint,
            windowConfig: parser.windowConfig,
            manifestPath: manifestPath,
            manifestDir: manifestDir
        };

        console.log("[WebShellLoader] Registered app:", appName);
        console.log("[WebShellLoader]   Display name:", parser.displayName);
        console.log("[WebShellLoader]   Entrypoint:", parser.entrypoint);
        console.log("[WebShellLoader]   Window type:", parser.windowConfig.type || "widget");

        appLoaded(appName);

        // Don't destroy parser immediately, keep reference for potential use
        parser.destroy();
    }

    /**
     * Launch an app by name
     * @param appName - The application identifier
     * @return The created view instance or null if failed
     */
    function launchApp(appName) {
        const app = loadedApps[appName];
        if (!app) {
            console.error("[WebShellLoader] Unknown app:", appName);
            return null;
        }

        console.log("[WebShellLoader] Launching:", appName);

        const entrypointUrl = getAppEntrypoint(app);
        console.log("[WebShellLoader]   URL:", entrypointUrl);

        // Create view component dynamically
        // Note: This creates the QML component but doesn't display it.
        // The caller is responsible for adding it to the appropriate container.
        const viewProps = {
            appName: appName,
            source: entrypointUrl,
            devMode: root.devMode
        };

        // If dev mode and devServer is specified, use it
        if (root.devMode && app.manifest.devServer) {
            viewProps.devServerUrl = app.manifest.devServer;
        }

        // Create the view
        const view = webShellViewComponent.createObject(null, viewProps);

        if (view) {
            activeViews.push(view);
            estimateMemoryUsage();
            appLaunched(appName);

            // Connect to view destruction
            view.Component.destruction.connect(() => {
                const index = activeViews.indexOf(view);
                if (index >= 0) {
                    activeViews.splice(index, 1);
                    estimateMemoryUsage();
                }
            });
        } else {
            console.error("[WebShellLoader] Failed to create view for:", appName);
        }

        return view;
    }

    /**
     * Get the entrypoint URL for an app
     * @param app - App metadata object
     * @return URL to load
     */
    function getAppEntrypoint(app) {
        // In dev mode with dev server configured, use dev server
        if (root.devMode && app.manifest.devServer) {
            return app.manifest.devServer;
        }

        // Use bundled entrypoint
        return `file://${app.manifestDir}/${app.entrypoint}`;
    }

    /**
     * Close an app by name
     * @param appName - The application identifier
     */
    function closeApp(appName) {
        const index = activeViews.findIndex(v => v.appName === appName);
        if (index >= 0) {
            const view = activeViews[index];
            view.destroy();
            activeViews.splice(index, 1);

            estimateMemoryUsage();

            console.log("[WebShellLoader] Closed app:", appName);
            appClosed(appName);
        } else {
            console.warn("[WebShellLoader] Cannot close - app not running:", appName);
        }
    }

    /**
     * Reload an app (close and relaunch)
     * @param appName - The application identifier
     */
    function reloadApp(appName) {
        console.log("[WebShellLoader] Reloading app:", appName);
        closeApp(appName);
        launchApp(appName);
    }

    /**
     * Get list of all loaded apps
     * @return Array of app metadata objects
     */
    function getLoadedApps() {
        return Object.keys(loadedApps).map(name => loadedApps[name]);
    }

    /**
     * Get app metadata by name
     * @param appName - The application identifier
     * @return App metadata or null
     */
    function getApp(appName) {
        return loadedApps[appName] || null;
    }

    /**
     * Check if an app is running
     * @param appName - The application identifier
     * @return true if running
     */
    function isAppRunning(appName) {
        return activeViews.some(v => v.appName === appName);
    }

    /**
     * Get list of running apps
     * @return Array of app names
     */
    function getRunningApps() {
        return activeViews.map(v => v.appName);
    }

    /**
     * Estimate total memory usage
     * This provides rough estimates based on shared profile model
     */
    function estimateMemoryUsage() {
        const appCount = activeViews.length;

        if (appCount === 0) {
            totalWebEngineMemory = 0;
            return;
        }

        // Memory estimation for shared profile:
        // - First app: ~150MB (WebEngine runtime + Chromium + first DOM)
        // - Each additional app: ~20-30MB (DOM/JS only, shares runtime)
        const baseMemory = 150; // MB
        const perAppMemory = 25; // MB (average)
        const estimated = baseMemory + (appCount - 1) * perAppMemory;

        totalWebEngineMemory = estimated;

        console.log(`[WebShellLoader] Memory estimate: ${estimated}MB for ${appCount} app(s)`);
        console.log(`[WebShellLoader] Running apps:`, getRunningApps().join(', '));

        // Warn if memory usage is getting high
        if (estimated > 500) {
            console.warn("[WebShellLoader] High memory usage detected:", estimated, "MB");
            console.warn("[WebShellLoader] Consider closing some apps");
        }
    }

    /**
     * Unload an app (remove from registry)
     * @param appName - The application identifier
     */
    function unloadApp(appName) {
        // Close if running
        if (isAppRunning(appName)) {
            closeApp(appName);
        }

        // Remove from registry
        if (loadedApps[appName]) {
            delete loadedApps[appName];
            PermissionManager.revokeApp(appName);
            console.log("[WebShellLoader] Unloaded app:", appName);
        }
    }

    // Components for dynamic creation
    Component {
        id: manifestParserComponent
        ManifestParser {}
    }

    Component {
        id: webShellViewComponent
        // Import and create WebShellView
        // Note: Actual WebShellView is in Components module
        // This is a factory that loads it dynamically
        Loader {
            id: viewLoader
            source: "qrc:/qt/qml/WebShell/Components/WebShellView.qml"

            // Forward properties
            property string appName: ""
            property url source: ""
            property bool devMode: false
            property string devServerUrl: ""

            onLoaded: {
                // Transfer properties to loaded item
                if (item) {
                    item.appName = viewLoader.appName;
                    item.source = viewLoader.source;
                    item.devMode = viewLoader.devMode;
                    if (viewLoader.devServerUrl !== "") {
                        item.devServerUrl = viewLoader.devServerUrl;
                    }
                }
            }
        }
    }

    // Memory monitoring timer (dev mode only)
    property Timer memoryMonitor: Timer {
        interval: 60000 // Check every minute
        running: root.devMode && activeViews.length > 0
        repeat: true

        onTriggered: {
            console.log("[WebShellLoader] === Memory Report ===");
            console.log("[WebShellLoader] Active apps:", activeViews.length);
            console.log("[WebShellLoader] Estimated memory:", totalWebEngineMemory, "MB");
            console.log("[WebShellLoader] Running:", getRunningApps().join(', '));

            // Could add actual memory querying via /proc or Qt C++ extension
        }
    }

    Component.onCompleted: {
        console.log("[WebShellLoader] Service created");
        console.log("[WebShellLoader] Process Model: Shared WebEngineProfile");
        console.log("[WebShellLoader] Dev mode:", devMode);
    }
}
