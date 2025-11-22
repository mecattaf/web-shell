// WindowConfig.qml - Window configuration component for WebShell apps
// Manages window size, position, behavior, and appearance
pragma ComponentBehavior: Bound
import QtQuick

QtObject {
    id: root

    // Window type
    property string type: "widget" // widget, panel, overlay, dialog

    // Dimensions
    property int width: 800
    property int height: 600
    property int minWidth: 400
    property int minHeight: 300
    property int maxWidth: -1 // -1 = unlimited
    property int maxHeight: -1

    // Behavior
    property bool resizable: true
    property bool movable: true

    // Appearance
    property bool blur: true
    property real blurRadius: 20
    property bool transparency: true
    property real opacity: 1.0

    // Position
    property string position: "center" // center, top-left, top-right, etc.
    property int x: -1 // -1 = use position string
    property int y: -1

    // Margins (from screen edges)
    property int marginTop: 0
    property int marginRight: 0
    property int marginBottom: 0
    property int marginLeft: 0

    // Load from manifest
    function fromManifest(manifestWindowConfig) {
        if (!manifestWindowConfig) return;

        type = manifestWindowConfig.type || type;
        width = manifestWindowConfig.width || width;
        height = manifestWindowConfig.height || height;
        minWidth = manifestWindowConfig.minWidth || minWidth;
        minHeight = manifestWindowConfig.minHeight || minHeight;
        maxWidth = manifestWindowConfig.maxWidth ?? maxWidth;
        maxHeight = manifestWindowConfig.maxHeight ?? maxHeight;
        resizable = manifestWindowConfig.resizable ?? resizable;
        movable = manifestWindowConfig.movable ?? movable;
        blur = manifestWindowConfig.blur ?? blur;
        blurRadius = manifestWindowConfig.blurRadius || blurRadius;
        transparency = manifestWindowConfig.transparency ?? transparency;
        opacity = manifestWindowConfig.opacity ?? opacity;
        position = manifestWindowConfig.position || position;
        x = manifestWindowConfig.x ?? x;
        y = manifestWindowConfig.y ?? y;

        if (manifestWindowConfig.margins) {
            const m = manifestWindowConfig.margins;
            marginTop = m.top || 0;
            marginRight = m.right || 0;
            marginBottom = m.bottom || 0;
            marginLeft = m.left || 0;
        }
    }

    // Apply type-specific defaults
    function applyTypeDefaults() {
        const typeDefaults = {
            widget: {
                width: 800,
                height: 600,
                blur: true,
                transparency: true,
                resizable: true,
                movable: true,
                position: "center"
            },
            panel: {
                width: -1, // full width
                height: 60,
                blur: true,
                transparency: true,
                resizable: false,
                movable: false,
                position: "top-center"
            },
            overlay: {
                width: -1, // full width
                height: -1, // full height
                blur: true,
                transparency: true,
                resizable: false,
                movable: false,
                position: "center"
            },
            dialog: {
                width: 400,
                height: 300,
                blur: true,
                transparency: true,
                resizable: false,
                movable: true,
                position: "center"
            }
        };

        const defaults = typeDefaults[type];
        if (defaults) {
            // Only apply defaults that haven't been explicitly set
            if (width === 800) width = defaults.width;
            if (height === 600) height = defaults.height;
            blur = defaults.blur;
            transparency = defaults.transparency;
            resizable = defaults.resizable;
            movable = defaults.movable;
            position = defaults.position;
        }
    }

    // Calculate actual position from string
    function calculatePosition(containerWidth, containerHeight, parentWidth, parentHeight) {
        let posX = x;
        let posY = y;

        if (posX === -1 || posY === -1) {
            // Use position string
            switch (position) {
                case "center":
                    posX = (parentWidth - containerWidth) / 2;
                    posY = (parentHeight - containerHeight) / 2;
                    break;
                case "top-left":
                    posX = marginLeft;
                    posY = marginTop;
                    break;
                case "top-right":
                    posX = parentWidth - containerWidth - marginRight;
                    posY = marginTop;
                    break;
                case "bottom-left":
                    posX = marginLeft;
                    posY = parentHeight - containerHeight - marginBottom;
                    break;
                case "bottom-right":
                    posX = parentWidth - containerWidth - marginRight;
                    posY = parentHeight - containerHeight - marginBottom;
                    break;
                case "top-center":
                    posX = (parentWidth - containerWidth) / 2;
                    posY = marginTop;
                    break;
                case "bottom-center":
                    posX = (parentWidth - containerWidth) / 2;
                    posY = parentHeight - containerHeight - marginBottom;
                    break;
                case "left-center":
                    posX = marginLeft;
                    posY = (parentHeight - containerHeight) / 2;
                    break;
                case "right-center":
                    posX = parentWidth - containerWidth - marginRight;
                    posY = (parentHeight - containerHeight) / 2;
                    break;
            }
        }

        return { x: posX, y: posY };
    }

    // Enforce size constraints
    function constrainSize(requestedWidth, requestedHeight) {
        let w = requestedWidth;
        let h = requestedHeight;

        // Minimum
        w = Math.max(w, minWidth);
        h = Math.max(h, minHeight);

        // Maximum
        if (maxWidth > 0) w = Math.min(w, maxWidth);
        if (maxHeight > 0) h = Math.min(h, maxHeight);

        return { width: w, height: h };
    }

    // Snap to screen edges
    function snapToEdge(posX, posY, containerWidth, containerHeight, screenWidth, screenHeight, threshold) {
        const snapThreshold = threshold || 20;
        let snappedX = posX;
        let snappedY = posY;

        // Snap to left edge
        if (posX < snapThreshold) {
            snappedX = 0;
        }
        // Snap to right edge
        else if (posX > screenWidth - containerWidth - snapThreshold) {
            snappedX = screenWidth - containerWidth;
        }

        // Snap to top edge
        if (posY < snapThreshold) {
            snappedY = 0;
        }
        // Snap to bottom edge
        else if (posY > screenHeight - containerHeight - snapThreshold) {
            snappedY = screenHeight - containerHeight;
        }

        return { x: snappedX, y: snappedY };
    }
}
