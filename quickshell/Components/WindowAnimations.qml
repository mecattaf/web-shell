// WindowAnimations.qml - Window animations for WebShell apps
// Provides slide, fade, and scale animations for window transitions
pragma ComponentBehavior: Bound
import QtQuick

Item {
    id: root

    property Item target
    property bool enabled: true

    // Store original position for animations
    property point originalPosition: Qt.point(0, 0)

    // Slide in from position
    function slideIn(from) {
        if (!enabled || !target) return;

        const startX = target.x;
        const startY = target.y;
        originalPosition = Qt.point(startX, startY);

        // Set initial position based on direction
        switch (from) {
            case "top":
                target.y = -target.height;
                target.x = startX;
                break;
            case "bottom":
                target.y = target.parent.height;
                target.x = startX;
                break;
            case "left":
                target.x = -target.width;
                target.y = startY;
                break;
            case "right":
                target.x = target.parent.width;
                target.y = startY;
                break;
        }

        // Animate to original position
        slideXAnimation.to = originalPosition.x;
        slideYAnimation.to = originalPosition.y;
        slideAnimation.start();
    }

    // Slide out to position
    function slideOut(to) {
        if (!enabled || !target) return;

        // Set target position based on direction
        switch (to) {
            case "top":
                slideOutYAnimation.to = -target.height;
                break;
            case "bottom":
                slideOutYAnimation.to = target.parent.height;
                break;
            case "left":
                slideOutXAnimation.to = -target.width;
                break;
            case "right":
                slideOutXAnimation.to = target.parent.width;
                break;
        }

        slideOutAnimation.start();
    }

    ParallelAnimation {
        id: slideAnimation

        NumberAnimation {
            id: slideXAnimation
            target: root.target
            property: "x"
            duration: 250
            easing.type: Easing.OutCubic
        }

        NumberAnimation {
            id: slideYAnimation
            target: root.target
            property: "y"
            duration: 250
            easing.type: Easing.OutCubic
        }
    }

    ParallelAnimation {
        id: slideOutAnimation

        NumberAnimation {
            id: slideOutXAnimation
            target: root.target
            property: "x"
            duration: 200
            easing.type: Easing.InCubic
        }

        NumberAnimation {
            id: slideOutYAnimation
            target: root.target
            property: "y"
            duration: 200
            easing.type: Easing.InCubic
        }
    }

    // Fade in
    function fadeIn() {
        if (!enabled || !target) return;

        target.opacity = 0;
        fadeAnimation.start();
    }

    // Fade out
    function fadeOut() {
        if (!enabled || !target) return;

        fadeOutAnimation.start();
    }

    NumberAnimation {
        id: fadeAnimation
        target: root.target
        property: "opacity"
        from: 0
        to: 1
        duration: 200
        easing.type: Easing.OutQuad
    }

    NumberAnimation {
        id: fadeOutAnimation
        target: root.target
        property: "opacity"
        from: 1
        to: 0
        duration: 150
        easing.type: Easing.InQuad
    }

    // Scale in
    function scaleIn() {
        if (!enabled || !target) return;

        target.scale = 0.9;
        target.opacity = 0;
        scaleAnimation.start();
    }

    // Scale out
    function scaleOut() {
        if (!enabled || !target) return;

        scaleOutAnimation.start();
    }

    ParallelAnimation {
        id: scaleAnimation

        NumberAnimation {
            target: root.target
            property: "scale"
            from: 0.9
            to: 1.0
            duration: 200
            easing.type: Easing.OutBack
        }

        NumberAnimation {
            target: root.target
            property: "opacity"
            from: 0
            to: 1
            duration: 200
        }
    }

    ParallelAnimation {
        id: scaleOutAnimation

        NumberAnimation {
            target: root.target
            property: "scale"
            from: 1.0
            to: 0.9
            duration: 150
            easing.type: Easing.InQuad
        }

        NumberAnimation {
            target: root.target
            property: "opacity"
            from: 1
            to: 0
            duration: 150
        }
    }

    // Combined slide and fade
    function slideInWithFade(from) {
        if (!enabled || !target) return;

        const startX = target.x;
        const startY = target.y;
        originalPosition = Qt.point(startX, startY);

        // Set initial position and opacity
        target.opacity = 0;
        switch (from) {
            case "top":
                target.y = startY - 50;
                target.x = startX;
                break;
            case "bottom":
                target.y = startY + 50;
                target.x = startX;
                break;
            case "left":
                target.x = startX - 50;
                target.y = startY;
                break;
            case "right":
                target.x = startX + 50;
                target.y = startY;
                break;
        }

        // Animate to original position with fade
        slideFadeXAnimation.to = originalPosition.x;
        slideFadeYAnimation.to = originalPosition.y;
        slideFadeAnimation.start();
    }

    ParallelAnimation {
        id: slideFadeAnimation

        NumberAnimation {
            id: slideFadeXAnimation
            target: root.target
            property: "x"
            duration: 250
            easing.type: Easing.OutCubic
        }

        NumberAnimation {
            id: slideFadeYAnimation
            target: root.target
            property: "y"
            duration: 250
            easing.type: Easing.OutCubic
        }

        NumberAnimation {
            target: root.target
            property: "opacity"
            from: 0
            to: 1
            duration: 250
            easing.type: Easing.OutQuad
        }
    }

    // Get default animation for window type
    function playDefaultAnimation(windowType) {
        if (!enabled || !target) return;

        switch (windowType) {
            case "widget":
                scaleIn();
                break;
            case "panel":
                slideIn("top");
                break;
            case "overlay":
                fadeIn();
                break;
            case "dialog":
                scaleIn();
                break;
            default:
                fadeIn();
                break;
        }
    }
}
