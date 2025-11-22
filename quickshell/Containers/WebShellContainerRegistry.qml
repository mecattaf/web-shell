pragma Singleton
pragma ComponentBehavior: Bound
import QtQuick

/**
 * WebShellContainerRegistry - Singleton for managing shell containers
 *
 * Features:
 * - Central registry for all container instances
 * - Z-order management
 * - Container lookup by type or ID
 * - Focus management integration
 */
QtObject {
    id: root

    // Container collections
    property var panels: []
    property var overlays: []
    property var widgets: []
    property var docks: []
    property var notifications: []

    // Z-order constants
    readonly property int zPanel: 10
    readonly property int zDock: 15
    readonly property int zWidget: 20
    readonly property int zNotification: 90
    readonly property int zOverlay: 100

    // Active container tracking
    property var activeContainer: null

    /**
     * Register a container with the registry
     * @param type - Container type (panel, overlay, widget, dock, notification)
     * @param container - The container instance
     */
    function registerContainer(type, container) {
        switch (type) {
            case "panel":
                panels.push(container)
                container.z = zPanel + panels.length
                console.log("[ContainerRegistry] Registered panel, total:", panels.length)
                break
            case "overlay":
                overlays.push(container)
                container.z = zOverlay + overlays.length
                console.log("[ContainerRegistry] Registered overlay, total:", overlays.length)
                break
            case "widget":
                widgets.push(container)
                container.z = zWidget + widgets.length
                console.log("[ContainerRegistry] Registered widget, total:", widgets.length)
                break
            case "dock":
                docks.push(container)
                container.z = zDock + docks.length
                console.log("[ContainerRegistry] Registered dock, total:", docks.length)
                break
            case "notification":
                notifications.push(container)
                container.z = zNotification + notifications.length
                console.log("[ContainerRegistry] Registered notification, total:", notifications.length)
                break
            default:
                console.warn("[ContainerRegistry] Unknown container type:", type)
        }
    }

    /**
     * Unregister a container from the registry
     * @param type - Container type
     * @param container - The container instance
     */
    function unregisterContainer(type, container) {
        var collection
        switch (type) {
            case "panel": collection = panels; break
            case "overlay": collection = overlays; break
            case "widget": collection = widgets; break
            case "dock": collection = docks; break
            case "notification": collection = notifications; break
            default: return
        }

        var index = collection.indexOf(container)
        if (index !== -1) {
            collection.splice(index, 1)
            console.log("[ContainerRegistry] Unregistered", type)
        }
    }

    /**
     * Get z-order for a container type
     * @param type - Container type
     * @returns Base z-order for the type
     */
    function getZOrder(type) {
        switch (type) {
            case "panel": return zPanel
            case "dock": return zDock
            case "widget": return zWidget
            case "notification": return zNotification
            case "overlay": return zOverlay
            default: return 0
        }
    }

    /**
     * Bring a container to the front of its layer
     * @param type - Container type
     * @param container - The container to bring forward
     */
    function bringToFront(type, container) {
        var collection
        var baseZ
        switch (type) {
            case "panel":
                collection = panels
                baseZ = zPanel
                break
            case "overlay":
                collection = overlays
                baseZ = zOverlay
                break
            case "widget":
                collection = widgets
                baseZ = zWidget
                break
            case "dock":
                collection = docks
                baseZ = zDock
                break
            case "notification":
                collection = notifications
                baseZ = zNotification
                break
            default:
                return
        }

        // Find max z in collection
        var maxZ = baseZ
        for (var i = 0; i < collection.length; i++) {
            if (collection[i].z > maxZ) {
                maxZ = collection[i].z
            }
        }

        // Set container to max + 1
        container.z = maxZ + 1
        console.log("[ContainerRegistry] Brought", type, "to front, z:", container.z)
    }

    /**
     * Get all containers of a specific type
     * @param type - Container type
     * @returns Array of containers
     */
    function getContainers(type) {
        switch (type) {
            case "panel": return panels
            case "overlay": return overlays
            case "widget": return widgets
            case "dock": return docks
            case "notification": return notifications
            default: return []
        }
    }

    /**
     * Get all containers (flat array)
     * @returns Array of all containers
     */
    function getAllContainers() {
        return [].concat(panels, docks, widgets, notifications, overlays)
    }

    /**
     * Clear all containers of a specific type
     * @param type - Container type
     */
    function clearType(type) {
        var collection = getContainers(type)
        for (var i = 0; i < collection.length; i++) {
            collection[i].destroy()
        }
        switch (type) {
            case "panel": panels = []; break
            case "overlay": overlays = []; break
            case "widget": widgets = []; break
            case "dock": docks = []; break
            case "notification": notifications = []; break
        }
        console.log("[ContainerRegistry] Cleared all", type, "containers")
    }

    /**
     * Get container hierarchy info for debugging
     * @returns String representation of container hierarchy
     */
    function getHierarchyInfo() {
        var info = "Container Hierarchy:\n"
        info += "  Panels (" + panels.length + "):\n"
        for (var i = 0; i < panels.length; i++) {
            info += "    - z: " + panels[i].z + "\n"
        }
        info += "  Docks (" + docks.length + "):\n"
        for (i = 0; i < docks.length; i++) {
            info += "    - z: " + docks[i].z + "\n"
        }
        info += "  Widgets (" + widgets.length + "):\n"
        for (i = 0; i < widgets.length; i++) {
            info += "    - z: " + widgets[i].z + "\n"
        }
        info += "  Notifications (" + notifications.length + "):\n"
        for (i = 0; i < notifications.length; i++) {
            info += "    - z: " + notifications[i].z + "\n"
        }
        info += "  Overlays (" + overlays.length + "):\n"
        for (i = 0; i < overlays.length; i++) {
            info += "    - z: " + overlays[i].z + "\n"
        }
        return info
    }

    Component.onCompleted: {
        console.log("[WebShellContainerRegistry] Initialized")
    }
}
