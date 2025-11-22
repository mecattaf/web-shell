pragma Singleton
pragma ComponentBehavior: Bound
import QtQuick

/**
 * FocusManager - Singleton for managing container focus
 *
 * Features:
 * - Track active container
 * - Focus switching between containers
 * - Integration with ContainerRegistry
 * - Keyboard shortcuts for focus navigation
 */
QtObject {
    id: root

    // Active container tracking
    property var activeContainer: null
    property var focusHistory: []
    property int maxHistoryLength: 10

    // Focus change signal
    signal focusChanged(var container)

    /**
     * Request focus for a container
     * @param container - The container to focus
     */
    function requestFocus(container) {
        if (!container) {
            console.warn("[FocusManager] Cannot focus null container")
            return
        }

        // Unfocus previous container
        if (activeContainer && activeContainer !== container) {
            activeContainer.hasFocus = false
        }

        // Focus new container
        activeContainer = container
        container.hasFocus = true
        container.forceActiveFocus()

        // Add to history
        addToHistory(container)

        // Bring to front if it's a widget
        if (container.containerType === "widget") {
            WebShellContainerRegistry.bringToFront("widget", container)
        }

        console.log("[FocusManager] Focus changed to:", container.containerType)
        focusChanged(container)
    }

    /**
     * Clear focus from current container
     */
    function clearFocus() {
        if (activeContainer) {
            activeContainer.hasFocus = false
            activeContainer = null
            console.log("[FocusManager] Focus cleared")
        }
    }

    /**
     * Focus the previous container in history
     */
    function focusPrevious() {
        if (focusHistory.length < 2) {
            console.log("[FocusManager] No previous container in history")
            return
        }

        // Get second-to-last item (last is current)
        var previous = focusHistory[focusHistory.length - 2]
        requestFocus(previous)
    }

    /**
     * Focus next widget in the stack
     */
    function focusNextWidget() {
        var widgets = WebShellContainerRegistry.getContainers("widget")
        if (widgets.length === 0) {
            console.log("[FocusManager] No widgets to focus")
            return
        }

        var currentIndex = -1
        if (activeContainer && activeContainer.containerType === "widget") {
            currentIndex = widgets.indexOf(activeContainer)
        }

        var nextIndex = (currentIndex + 1) % widgets.length
        requestFocus(widgets[nextIndex])
    }

    /**
     * Focus previous widget in the stack
     */
    function focusPreviousWidget() {
        var widgets = WebShellContainerRegistry.getContainers("widget")
        if (widgets.length === 0) {
            console.log("[FocusManager] No widgets to focus")
            return
        }

        var currentIndex = -1
        if (activeContainer && activeContainer.containerType === "widget") {
            currentIndex = widgets.indexOf(activeContainer)
        }

        var nextIndex = (currentIndex - 1 + widgets.length) % widgets.length
        requestFocus(widgets[nextIndex])
    }

    /**
     * Add container to focus history
     * @param container - The container to add
     */
    function addToHistory(container) {
        // Remove container if it's already in history
        var index = focusHistory.indexOf(container)
        if (index !== -1) {
            focusHistory.splice(index, 1)
        }

        // Add to end
        focusHistory.push(container)

        // Trim history if too long
        if (focusHistory.length > maxHistoryLength) {
            focusHistory.shift()
        }
    }

    /**
     * Get focus history
     * @returns Array of containers in focus history
     */
    function getHistory() {
        return focusHistory.slice() // Return copy
    }

    /**
     * Clear focus history
     */
    function clearHistory() {
        focusHistory = []
        console.log("[FocusManager] Focus history cleared")
    }

    /**
     * Check if a container has focus
     * @param container - The container to check
     * @returns Boolean indicating focus state
     */
    function hasFocus(container) {
        return activeContainer === container
    }

    /**
     * Get debug info
     * @returns String with focus state information
     */
    function getDebugInfo() {
        var info = "Focus Manager State:\n"
        info += "  Active container: " + (activeContainer ? activeContainer.containerType : "none") + "\n"
        info += "  History length: " + focusHistory.length + "\n"
        info += "  History:\n"
        for (var i = 0; i < focusHistory.length; i++) {
            info += "    " + (i + 1) + ". " + focusHistory[i].containerType + "\n"
        }
        return info
    }

    Component.onCompleted: {
        console.log("[FocusManager] Initialized")
    }
}
