// AppOrchestrator.qml - Multi-app orchestration layer
// Manages z-order, focus, and coordination of multiple running apps
pragma Singleton
pragma ComponentBehavior: Bound
import QtQuick
import qs.Services

/**
 * AppOrchestrator - Manages multiple WebShell apps running simultaneously
 *
 * Features:
 * - Z-order management
 * - Focus coordination
 * - App lifecycle tracking
 * - Inter-app coordination
 *
 * Builds on WebShellLoader for actual app loading/unloading
 */
QtObject {
    id: root

    // State
    property var runningApps: ([])
    property string focusedApp: ""
    property int nextZOrder: 100

    // Z-order layers
    readonly property int panelLayer: 10
    readonly property int widgetLayer: 100
    readonly property int overlayLayer: 1000
    readonly property int dialogLayer: 2000

    // Signals
    signal appLaunched(string appName)
    signal appClosed(string appName)
    signal appFocused(string appName)
    signal appPaused(string appName)

    /**
     * Launch an app by name
     * If already running, brings it to focus instead
     * @param appName - The application identifier
     * @return The view instance or null if failed
     */
    function launchApp(appName) {
        console.log("[AppOrchestrator] Launch request:", appName);

        // Check if already running
        const existing = runningApps.find(app => app.name === appName);
        if (existing) {
            console.log("[AppOrchestrator] App already running, focusing:", appName);
            focusApp(appName);
            return existing.view;
        }

        // Launch new instance via WebShellLoader
        const view = WebShellLoader.launchApp(appName);
        if (!view) {
            console.error("[AppOrchestrator] Failed to launch:", appName);
            return null;
        }

        // Get app metadata
        const appMetadata = WebShellLoader.getApp(appName);
        const windowType = appMetadata?.windowConfig?.type || "widget";

        // Create app instance record
        const appInstance = {
            name: appName,
            view: view,
            zOrder: nextZOrder++,
            launchedAt: Date.now(),
            windowType: windowType,
            isPaused: false
        };

        runningApps.push(appInstance);

        // Set z-order based on window type
        const baseZ = getZLayer(windowType);
        view.z = baseZ + appInstance.zOrder;

        console.log("[AppOrchestrator] App launched:", appName);
        console.log("[AppOrchestrator]   Window type:", windowType);
        console.log("[AppOrchestrator]   Z-order:", view.z);

        // Connect to view destruction
        view.Component.destruction.connect(() => {
            handleAppDestroyed(appName);
        });

        // Track resources
        ResourceManager.trackApp(appName, view);

        // Focus the new app
        focusApp(appName);

        appLaunched(appName);

        return view;
    }

    /**
     * Close an app by name
     * @param appName - The application identifier
     */
    function closeApp(appName) {
        console.log("[AppOrchestrator] Close request:", appName);

        const index = runningApps.findIndex(app => app.name === appName);
        if (index < 0) {
            console.warn("[AppOrchestrator] App not running:", appName);
            return;
        }

        const app = runningApps[index];

        // Notify app it's closing (via AppMessaging if handlers registered)
        if (AppMessaging.hasHandler(appName)) {
            AppMessaging.sendMessage("system", appName, "willClose", {});
        }

        // Remove from running apps
        runningApps.splice(index, 1);

        // Untrack resources
        ResourceManager.untrackApp(appName);

        // Destroy the view (WebShellLoader handles cleanup)
        app.view.destroy();

        // Focus next app if available
        if (runningApps.length > 0) {
            const nextApp = runningApps[runningApps.length - 1];
            focusApp(nextApp.name);
        } else {
            focusedApp = "";
        }

        console.log("[AppOrchestrator] App closed:", appName);
        appClosed(appName);
    }

    /**
     * Focus an app and bring it to front
     * @param appName - The application identifier
     */
    function focusApp(appName) {
        const app = runningApps.find(a => a.name === appName);
        if (!app) {
            console.warn("[AppOrchestrator] Cannot focus - app not running:", appName);
            return;
        }

        // Pause previously focused app
        if (focusedApp !== "" && focusedApp !== appName) {
            const prevApp = runningApps.find(a => a.name === focusedApp);
            if (prevApp) {
                prevApp.isPaused = true;
                appPaused(focusedApp);

                // Notify app it was paused
                if (AppMessaging.hasHandler(focusedApp)) {
                    AppMessaging.sendMessage("system", focusedApp, "paused", {});
                }
            }
        }

        // Bring to front (increment z-order)
        const baseZ = getZLayer(app.windowType);
        app.zOrder = nextZOrder++;
        app.view.z = baseZ + app.zOrder;

        // Set focus
        app.view.forceActiveFocus();
        app.isPaused = false;
        focusedApp = appName;

        console.log("[AppOrchestrator] App focused:", appName, "z:", app.view.z);

        // Notify app it was resumed/focused
        if (AppMessaging.hasHandler(appName)) {
            AppMessaging.sendMessage("system", appName, "resumed", {});
        }

        appFocused(appName);
    }

    /**
     * Get list of running apps
     * @return Array of app info objects
     */
    function getRunningApps() {
        return runningApps.map(app => ({
            name: app.name,
            launchedAt: app.launchedAt,
            focused: app.name === focusedApp,
            paused: app.isPaused,
            windowType: app.windowType,
            zOrder: app.view.z
        }));
    }

    /**
     * Get Z-layer base value for window type
     * @param windowType - Window type (panel, widget, overlay, dialog)
     * @return Base z-order value
     */
    function getZLayer(windowType) {
        switch (windowType) {
            case "panel": return panelLayer;
            case "widget": return widgetLayer;
            case "overlay": return overlayLayer;
            case "dialog": return dialogLayer;
            default: return widgetLayer;
        }
    }

    /**
     * Check if an app is running
     * @param appName - The application identifier
     * @return true if running
     */
    function isAppRunning(appName) {
        return runningApps.some(app => app.name === appName);
    }

    /**
     * Get focused app name
     * @return Name of focused app or empty string
     */
    function getFocusedApp() {
        return focusedApp;
    }

    /**
     * Cycle focus to next app
     */
    function focusNextApp() {
        if (runningApps.length === 0) {
            return;
        }

        const currentIndex = runningApps.findIndex(app => app.name === focusedApp);
        const nextIndex = (currentIndex + 1) % runningApps.length;
        focusApp(runningApps[nextIndex].name);
    }

    /**
     * Cycle focus to previous app
     */
    function focusPreviousApp() {
        if (runningApps.length === 0) {
            return;
        }

        const currentIndex = runningApps.findIndex(app => app.name === focusedApp);
        const prevIndex = (currentIndex - 1 + runningApps.length) % runningApps.length;
        focusApp(runningApps[prevIndex].name);
    }

    /**
     * Handle app view destruction
     * @param appName - The application identifier
     */
    function handleAppDestroyed(appName) {
        const index = runningApps.findIndex(app => app.name === appName);
        if (index >= 0) {
            console.log("[AppOrchestrator] App view destroyed:", appName);
            runningApps.splice(index, 1);

            // Untrack resources
            ResourceManager.untrackApp(appName);

            if (focusedApp === appName) {
                if (runningApps.length > 0) {
                    focusApp(runningApps[runningApps.length - 1].name);
                } else {
                    focusedApp = "";
                }
            }

            appClosed(appName);
        }
    }

    /**
     * Get debug information
     * @return String with orchestrator state
     */
    function getDebugInfo() {
        let info = "App Orchestrator State:\n";
        info += `  Running apps: ${runningApps.length}\n`;
        info += `  Focused app: ${focusedApp || "none"}\n`;
        info += `  Next z-order: ${nextZOrder}\n`;
        info += "\nRunning apps:\n";

        runningApps.forEach((app, i) => {
            info += `  ${i + 1}. ${app.name}\n`;
            info += `     Type: ${app.windowType}\n`;
            info += `     Z-order: ${app.view.z}\n`;
            info += `     Focused: ${app.name === focusedApp}\n`;
            info += `     Paused: ${app.isPaused}\n`;
        });

        return info;
    }

    Component.onCompleted: {
        console.log("[AppOrchestrator] Initialized");
        console.log("[AppOrchestrator] Z-order layers:");
        console.log("[AppOrchestrator]   Panel:", panelLayer);
        console.log("[AppOrchestrator]   Widget:", widgetLayer);
        console.log("[AppOrchestrator]   Overlay:", overlayLayer);
        console.log("[AppOrchestrator]   Dialog:", dialogLayer);
    }
}
