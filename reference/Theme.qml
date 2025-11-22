// Reference DMS Theme.qml
// This represents the DankMaterialShell theme structure
// Based on Material 3 design system
pragma Singleton
import QtQuick

QtObject {
    id: theme

    // ============ Colors (Material 3 Color Roles) ============
    readonly property QtObject colors: QtObject {
        // Surface colors
        readonly property color colSurface: "#1a1a1a"
        readonly property color colSurfaceContainer: "#232323"
        readonly property color colSurfaceContainerHigh: "#2d2d2d"
        readonly property color colSurfaceContainerHighest: "#383838"
        readonly property color colSurfaceContainerLow: "#1e1e1e"
        readonly property color colOnSurface: "#e3e3e3"
        readonly property color colOnSurfaceVariant: "#c7c7c7"

        // Primary colors
        readonly property color colPrimary: "#ef8354"
        readonly property color colOnPrimary: "#2d1e1a"
        readonly property color colPrimaryContainer: "#4f3528"
        readonly property color colOnPrimaryContainer: "#ffdcc8"

        // Secondary colors
        readonly property color colSecondary: "#4f9d69"
        readonly property color colOnSecondary: "#1a2e21"
        readonly property color colSecondaryContainer: "#2d4936"
        readonly property color colOnSecondaryContainer: "#c8f0d9"

        // Tertiary colors
        readonly property color colTertiary: "#6b9bd1"
        readonly property color colOnTertiary: "#1e2f42"
        readonly property color colTertiaryContainer: "#364d6b"
        readonly property color colOnTertiaryContainer: "#d6e7ff"

        // Error colors
        readonly property color colError: "#ff6b6b"
        readonly property color colOnError: "#3d1616"
        readonly property color colErrorContainer: "#5c2020"
        readonly property color colOnErrorContainer: "#ffd6d6"

        // Warning colors
        readonly property color colWarning: "#f9c74f"
        readonly property color colOnWarning: "#3d3318"
        readonly property color colWarningContainer: "#5c4d24"
        readonly property color colOnWarningContainer: "#fff0c8"

        // Success colors
        readonly property color colSuccess: "#90be6d"
        readonly property color colOnSuccess: "#243d1e"
        readonly property color colSuccessContainer: "#375c2d"
        readonly property color colOnSuccessContainer: "#daf2ce"

        // Info colors
        readonly property color colInfo: "#577590"
        readonly property color colOnInfo: "#1a242e"
        readonly property color colInfoContainer: "#2d3d4f"
        readonly property color colOnInfoContainer: "#d0dce8"

        // Outline colors
        readonly property color colOutline: "#8e8e8e"
        readonly property color colOutlineVariant: "#4a4a4a"

        // Background colors
        readonly property color colBackground: "#121212"
        readonly property color colOnBackground: "#e3e3e3"

        // Inverse colors
        readonly property color colInverseSurface: "#e3e3e3"
        readonly property color colInverseOnSurface: "#2d2d2d"
        readonly property color colInversePrimary: "#b85c2f"

        // Shadow and scrim
        readonly property color colShadow: "#000000"
        readonly property color colScrim: "#000000"
    }

    // ============ Typography ============
    readonly property QtObject font: QtObject {
        readonly property string family: "Inter"
        readonly property string fallback: "system-ui, -apple-system, sans-serif"
        readonly property string monospace: "JetBrains Mono, Consolas, monospace"

        readonly property QtObject pixelSize: QtObject {
            readonly property int small: 12
            readonly property int medium: 14
            readonly property int normal: 16
            readonly property int large: 18
            readonly property int larger: 20
            readonly property int xl: 24
            readonly property int xxl: 32
        }

        readonly property QtObject weight: QtObject {
            readonly property int normal: 400
            readonly property int medium: 500
            readonly property int semibold: 600
            readonly property int bold: 700
        }
    }

    // ============ Spacing ============
    readonly property QtObject spacing: QtObject {
        readonly property int xs: 4
        readonly property int s: 8
        readonly property int m: 16
        readonly property int l: 24
        readonly property int xl: 32
        readonly property int xxl: 48
    }

    // ============ Rounding (Border Radius) ============
    readonly property QtObject rounding: QtObject {
        readonly property int none: 0
        readonly property int small: 4
        readonly property int normal: 8
        readonly property int large: 12
        readonly property int xl: 16
        readonly property int full: 9999
    }

    // ============ Elevation (Shadows) ============
    readonly property QtObject elevation: QtObject {
        readonly property string none: "none"
        readonly property string level1: "0 1px 2px rgba(0,0,0,0.08)"
        readonly property string level2: "0 2px 4px rgba(0,0,0,0.12)"
        readonly property string level3: "0 4px 8px rgba(0,0,0,0.16)"
        readonly property string level4: "0 8px 16px rgba(0,0,0,0.20)"
        readonly property string level5: "0 16px 32px rgba(0,0,0,0.24)"
    }

    // ============ Animation ============
    readonly property QtObject animation: QtObject {
        readonly property int durationFast: 150
        readonly property int durationNormal: 250
        readonly property int durationSlow: 400

        readonly property string easingStandard: "cubic-bezier(0.4, 0.0, 0.2, 1)"
        readonly property string easingDecelerate: "cubic-bezier(0.0, 0.0, 0.2, 1)"
        readonly property string easingAccelerate: "cubic-bezier(0.4, 0.0, 1, 1)"
    }

    // ============ Border Width ============
    readonly property QtObject borderWidth: QtObject {
        readonly property int thin: 1
        readonly property int medium: 2
        readonly property int thick: 4
    }
}
