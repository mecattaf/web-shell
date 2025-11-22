// ResourceManager.qml - Resource tracking and management
// Monitors memory, CPU, and other resources used by apps
pragma Singleton
pragma ComponentBehavior: Bound
import QtQuick

/**
 * ResourceManager - Tracks resource usage across running apps
 *
 * Features:
 * - Memory estimation and monitoring
 * - Resource usage tracking per app
 * - Resource limit enforcement
 * - Usage reporting
 */
QtObject {
    id: root

    // Resource usage tracking: { appName: resourceData }
    property var resourceUsage: ({})

    // Resource limits
    readonly property int maxMemoryPerApp: 500 * 1024 * 1024 // 500MB
    readonly property int maxTotalMemory: 2 * 1024 * 1024 * 1024 // 2GB

    // Current totals
    property int totalMemoryUsage: 0

    // Signals
    signal resourceWarning(string appName, string resourceType, var current, var limit)
    signal resourceLimitExceeded(string appName, string resourceType)

    /**
     * Track a new app
     * @param appName - The application identifier
     * @param view - The view instance
     */
    function trackApp(appName, view) {
        console.log("[ResourceManager] Tracking app:", appName);

        resourceUsage[appName] = {
            view: view,
            memoryEstimate: 50 * 1024 * 1024, // Base estimate: 50MB
            cpuTime: 0,
            networkRequests: 0,
            storageUsed: 0,
            startTime: Date.now(),
            lastMonitored: Date.now()
        };

        // Start memory monitoring
        monitorMemory(appName, view);

        updateTotals();
    }

    /**
     * Untrack an app (when it closes)
     * @param appName - The application identifier
     */
    function untrackApp(appName) {
        if (resourceUsage[appName]) {
            console.log("[ResourceManager] Untracking app:", appName);
            delete resourceUsage[appName];
            updateTotals();
        }
    }

    /**
     * Monitor memory usage for an app
     * @param appName - The application identifier
     * @param view - The view instance
     */
    function monitorMemory(appName, view) {
        if (!view || !view.webView) {
            console.warn("[ResourceManager] Cannot monitor memory - no webView:", appName);
            return;
        }

        // Try to get memory info from performance.memory API
        view.webView.runJavaScript(`
            (function() {
                if (performance.memory) {
                    return JSON.stringify({
                        used: performance.memory.usedJSHeapSize,
                        total: performance.memory.totalJSHeapSize,
                        limit: performance.memory.jsHeapSizeLimit
                    });
                }
                return null;
            })()
        `, (result) => {
            if (result && resourceUsage[appName]) {
                try {
                    const memory = JSON.parse(result);
                    resourceUsage[appName].memoryEstimate = memory.used;
                    resourceUsage[appName].lastMonitored = Date.now();

                    // Check for warnings
                    if (memory.used > maxMemoryPerApp * 0.8) {
                        console.warn(`[ResourceManager] Memory warning for ${appName}:`,
                                     Math.round(memory.used / 1024 / 1024), "MB");
                        resourceWarning(appName, "memory", memory.used, maxMemoryPerApp);
                    }

                    if (memory.used > maxMemoryPerApp) {
                        console.error(`[ResourceManager] Memory limit exceeded for ${appName}:`,
                                      Math.round(memory.used / 1024 / 1024), "MB");
                        resourceLimitExceeded(appName, "memory");
                    }

                    updateTotals();
                } catch (e) {
                    console.warn("[ResourceManager] Failed to parse memory data:", e);
                }
            }
        });
    }

    /**
     * Record a network request for an app
     * @param appName - The application identifier
     */
    function recordNetworkRequest(appName) {
        if (resourceUsage[appName]) {
            resourceUsage[appName].networkRequests++;
        }
    }

    /**
     * Record storage usage for an app
     * @param appName - The application identifier
     * @param bytes - Number of bytes used
     */
    function recordStorageUsage(appName, bytes) {
        if (resourceUsage[appName]) {
            resourceUsage[appName].storageUsed = bytes;
        }
    }

    /**
     * Update total resource usage across all apps
     */
    function updateTotals() {
        let totalMem = 0;

        Object.keys(resourceUsage).forEach(appName => {
            totalMem += resourceUsage[appName].memoryEstimate;
        });

        totalMemoryUsage = totalMem;

        // Check total memory limits
        if (totalMem > maxTotalMemory * 0.8) {
            console.warn("[ResourceManager] Total memory usage high:",
                         Math.round(totalMem / 1024 / 1024), "MB");
        }
    }

    /**
     * Get total memory usage
     * @return Number of bytes
     */
    function getTotalMemoryUsage() {
        return totalMemoryUsage;
    }

    /**
     * Check if total memory limit is exceeded
     * @return true if exceeded
     */
    function isMemoryLimitExceeded() {
        return totalMemoryUsage > maxTotalMemory;
    }

    /**
     * Get resource usage for a specific app
     * @param appName - The application identifier
     * @return Resource usage object or null
     */
    function getAppResourceUsage(appName) {
        const usage = resourceUsage[appName];
        if (!usage) {
            return null;
        }

        const uptime = Date.now() - usage.startTime;

        return {
            app: appName,
            memory: usage.memoryEstimate,
            memoryMB: Math.round(usage.memoryEstimate / 1024 / 1024),
            cpuTime: usage.cpuTime,
            networkRequests: usage.networkRequests,
            storageUsed: usage.storageUsed,
            uptime: uptime,
            uptimeMinutes: Math.round(uptime / 60000),
            lastMonitored: usage.lastMonitored
        };
    }

    /**
     * Get resource report for all apps
     * @return Array of resource usage objects
     */
    function getResourceReport() {
        return Object.keys(resourceUsage).map(appName => {
            return getAppResourceUsage(appName);
        }).filter(usage => usage !== null);
    }

    /**
     * Get formatted resource summary
     * @return String with formatted summary
     */
    function getResourceSummary() {
        const apps = getResourceReport();
        let summary = "Resource Usage Summary:\n";
        summary += `  Total memory: ${Math.round(totalMemoryUsage / 1024 / 1024)} MB\n`;
        summary += `  Memory limit: ${Math.round(maxTotalMemory / 1024 / 1024)} MB\n`;
        summary += `  Tracked apps: ${apps.length}\n\n`;

        apps.forEach(usage => {
            summary += `  ${usage.app}:\n`;
            summary += `    Memory: ${usage.memoryMB} MB\n`;
            summary += `    Network requests: ${usage.networkRequests}\n`;
            summary += `    Uptime: ${usage.uptimeMinutes} min\n`;
        });

        return summary;
    }

    /**
     * Force garbage collection (if available)
     * Note: This is browser-dependent and may not work
     */
    function forceGarbageCollection() {
        console.log("[ResourceManager] Requesting garbage collection...");

        Object.keys(resourceUsage).forEach(appName => {
            const usage = resourceUsage[appName];
            if (usage.view && usage.view.webView) {
                usage.view.webView.runJavaScript(`
                    if (window.gc) {
                        window.gc();
                        console.log('[WebShell] Garbage collection triggered');
                    }
                `);
            }
        });
    }

    /**
     * Get apps sorted by memory usage
     * @return Array of app names sorted by memory (highest first)
     */
    function getAppsByMemoryUsage() {
        const apps = getResourceReport();
        apps.sort((a, b) => b.memory - a.memory);
        return apps.map(usage => usage.app);
    }

    /**
     * Monitor all tracked apps
     * Called periodically by timer
     */
    function monitorAllApps() {
        Object.keys(resourceUsage).forEach(appName => {
            const usage = resourceUsage[appName];
            if (usage.view) {
                monitorMemory(appName, usage.view);
            }
        });
    }

    // Monitoring timer - runs every 30 seconds
    property Timer monitorTimer: Timer {
        interval: 30000 // 30 seconds
        running: true
        repeat: true

        onTriggered: {
            if (Object.keys(resourceUsage).length > 0) {
                root.monitorAllApps();
            }
        }
    }

    // Debug reporting timer - runs every 5 minutes in dev mode
    property Timer reportTimer: Timer {
        interval: 300000 // 5 minutes
        running: false // Enable in dev mode if needed
        repeat: true

        onTriggered: {
            console.log("[ResourceManager] === Resource Report ===");
            console.log(root.getResourceSummary());
        }
    }

    Component.onCompleted: {
        console.log("[ResourceManager] Initialized");
        console.log("[ResourceManager] Memory limits:");
        console.log("[ResourceManager]   Per app:", Math.round(maxMemoryPerApp / 1024 / 1024), "MB");
        console.log("[ResourceManager]   Total:", Math.round(maxTotalMemory / 1024 / 1024), "MB");
    }
}
