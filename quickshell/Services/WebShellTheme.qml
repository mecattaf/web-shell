pragma Singleton
pragma ComponentBehavior: Bound
import QtQuick
import Quickshell
import Quickshell.Io

QtObject {
    id: root

    // Enable/disable automatic theme generation from wallpaper
    property bool autoGenerateFromWallpaper: false

    // Signal emitted when theme changes
    signal themeChanged()

    // ========================================
    // COLORS
    // ========================================

    // Surface colors
    property color colSurface: "#1a1a1a"
    property color colSurfaceHigh: "#2d2d2d"
    property color colSurfaceHighest: "#383838"
    property color colSurfaceLow: "#1e1e1e"

    // Text colors
    property color colText: "#e3e3e3"
    property color colTextSecondary: "#c7c7c7"

    // Primary colors
    property color colPrimary: "#ef8354"
    property color colOnPrimary: "#2d1e1a"
    property color colPrimaryContainer: "#4f3528"
    property color colOnPrimaryContainer: "#ffdcc8"

    // Secondary colors
    property color colSecondary: "#4f9d69"
    property color colOnSecondary: "#1a2e21"
    property color colSecondaryContainer: "#2d4936"
    property color colOnSecondaryContainer: "#c8f0d9"

    // Tertiary colors
    property color colTertiary: "#6b9bd1"
    property color colOnTertiary: "#1e2f42"
    property color colTertiaryContainer: "#364d6b"
    property color colOnTertiaryContainer: "#d6e7ff"

    // Error colors
    property color colError: "#ff6b6b"
    property color colOnError: "#3d1616"
    property color colErrorContainer: "#5c2020"
    property color colOnErrorContainer: "#ffd6d6"

    // Warning colors
    property color colWarning: "#f9c74f"
    property color colOnWarning: "#3d3318"
    property color colWarningContainer: "#5c4d24"
    property color colOnWarningContainer: "#fff0c8"

    // Success colors
    property color colSuccess: "#90be6d"
    property color colOnSuccess: "#243d1e"
    property color colSuccessContainer: "#375c2d"
    property color colOnSuccessContainer: "#daf2ce"

    // Info colors
    property color colInfo: "#577590"
    property color colOnInfo: "#1a242e"
    property color colInfoContainer: "#2d3d4f"
    property color colOnInfoContainer: "#d0dce8"

    // Border colors
    property color colBorder: "#8e8e8e"
    property color colBorderFocus: "#4a4a4a"

    // Background colors
    property color colBackground: "#121212"
    property color colOnBackground: "#e3e3e3"

    // Inverse colors
    property color colInverseSurface: "#e3e3e3"
    property color colInverseOnSurface: "#2d2d2d"
    property color colInversePrimary: "#b85c2f"

    // Shadow and scrim
    property color colShadow: "#000000"
    property color colScrim: "#000000"

    // ========================================
    // SPACING
    // ========================================

    property int spaceXs: 4
    property int spaceS: 8
    property int spaceM: 16
    property int spaceL: 24
    property int spaceXl: 32
    property int spaceXxl: 48

    // ========================================
    // TYPOGRAPHY
    // ========================================

    // Font families
    property string fontFamilyBase: "Inter, system-ui, -apple-system, sans-serif"
    property string fontFamilyMonospace: "JetBrains Mono, Consolas, monospace"
    property string fontFamilyHeading: "Inter, system-ui, -apple-system, sans-serif"

    // Font sizes
    property int fontSizeXs: 12
    property int fontSizeS: 14
    property int fontSizeM: 16
    property int fontSizeL: 18
    property int fontSizeXl: 20
    property int fontSizeXxl: 24
    property int fontSizeXxxl: 32

    // Font weights
    property int fontWeightNormal: 400
    property int fontWeightMedium: 500
    property int fontWeightSemibold: 600
    property int fontWeightBold: 700

    // Line heights
    property real lineHeightTight: 1.2
    property real lineHeightNormal: 1.5
    property real lineHeightRelaxed: 1.75

    // ========================================
    // ELEVATION
    // ========================================

    property string elevationNone: "none"
    property string elevationLow: "0 2px 4px rgba(0,0,0,0.12)"
    property string elevationMedium: "0 4px 8px rgba(0,0,0,0.16)"
    property string elevationHigh: "0 8px 16px rgba(0,0,0,0.20)"

    // ========================================
    // BORDER
    // ========================================

    // Border radius
    property int radiusNone: 0
    property int radiusS: 4
    property int radiusM: 8
    property int radiusL: 12
    property int radiusXl: 16
    property int radiusFull: 9999

    // Border width
    property int borderWidthThin: 1
    property int borderWidthMedium: 2
    property int borderWidthThick: 4

    // ========================================
    // ANIMATION
    // ========================================

    // Animation duration
    property int animationDurationFast: 150
    property int animationDurationNormal: 250
    property int animationDurationSlow: 400

    // Animation easing
    property string animationEasingStandard: "cubic-bezier(0.4, 0.0, 0.2, 1)"
    property string animationEasingDecelerate: "cubic-bezier(0.0, 0.0, 0.2, 1)"
    property string animationEasingAccelerate: "cubic-bezier(0.4, 0.0, 1, 1)"

    // ========================================
    // FUNCTIONS
    // ========================================

    /**
     * Update theme from design tokens JSON string
     * @param tokensJson - JSON string containing design tokens
     */
    function updateFromTokens(tokensJson: string) {
        try {
            const tokens = JSON.parse(tokensJson)

            // Update colors
            if (tokens.colors) {
                if (tokens.colors.surface) root.colSurface = tokens.colors.surface.value
                if (tokens.colors["surface-high"]) root.colSurfaceHigh = tokens.colors["surface-high"].value
                if (tokens.colors["surface-highest"]) root.colSurfaceHighest = tokens.colors["surface-highest"].value
                if (tokens.colors["surface-low"]) root.colSurfaceLow = tokens.colors["surface-low"].value

                if (tokens.colors.text) root.colText = tokens.colors.text.value
                if (tokens.colors["text-secondary"]) root.colTextSecondary = tokens.colors["text-secondary"].value

                if (tokens.colors.primary) root.colPrimary = tokens.colors.primary.value
                if (tokens.colors["on-primary"]) root.colOnPrimary = tokens.colors["on-primary"].value
                if (tokens.colors["primary-container"]) root.colPrimaryContainer = tokens.colors["primary-container"].value
                if (tokens.colors["on-primary-container"]) root.colOnPrimaryContainer = tokens.colors["on-primary-container"].value

                if (tokens.colors.secondary) root.colSecondary = tokens.colors.secondary.value
                if (tokens.colors["on-secondary"]) root.colOnSecondary = tokens.colors["on-secondary"].value
                if (tokens.colors["secondary-container"]) root.colSecondaryContainer = tokens.colors["secondary-container"].value
                if (tokens.colors["on-secondary-container"]) root.colOnSecondaryContainer = tokens.colors["on-secondary-container"].value

                if (tokens.colors.tertiary) root.colTertiary = tokens.colors.tertiary.value
                if (tokens.colors["on-tertiary"]) root.colOnTertiary = tokens.colors["on-tertiary"].value
                if (tokens.colors["tertiary-container"]) root.colTertiaryContainer = tokens.colors["tertiary-container"].value
                if (tokens.colors["on-tertiary-container"]) root.colOnTertiaryContainer = tokens.colors["on-tertiary-container"].value

                if (tokens.colors.error) root.colError = tokens.colors.error.value
                if (tokens.colors["on-error"]) root.colOnError = tokens.colors["on-error"].value
                if (tokens.colors["error-container"]) root.colErrorContainer = tokens.colors["error-container"].value
                if (tokens.colors["on-error-container"]) root.colOnErrorContainer = tokens.colors["on-error-container"].value

                if (tokens.colors.warning) root.colWarning = tokens.colors.warning.value
                if (tokens.colors["on-warning"]) root.colOnWarning = tokens.colors["on-warning"].value
                if (tokens.colors["warning-container"]) root.colWarningContainer = tokens.colors["warning-container"].value
                if (tokens.colors["on-warning-container"]) root.colOnWarningContainer = tokens.colors["on-warning-container"].value

                if (tokens.colors.success) root.colSuccess = tokens.colors.success.value
                if (tokens.colors["on-success"]) root.colOnSuccess = tokens.colors["on-success"].value
                if (tokens.colors["success-container"]) root.colSuccessContainer = tokens.colors["success-container"].value
                if (tokens.colors["on-success-container"]) root.colOnSuccessContainer = tokens.colors["on-success-container"].value

                if (tokens.colors.info) root.colInfo = tokens.colors.info.value
                if (tokens.colors["on-info"]) root.colOnInfo = tokens.colors["on-info"].value
                if (tokens.colors["info-container"]) root.colInfoContainer = tokens.colors["info-container"].value
                if (tokens.colors["on-info-container"]) root.colOnInfoContainer = tokens.colors["on-info-container"].value

                if (tokens.colors.border) root.colBorder = tokens.colors.border.value
                if (tokens.colors["border-focus"]) root.colBorderFocus = tokens.colors["border-focus"].value

                if (tokens.colors.background) root.colBackground = tokens.colors.background.value
                if (tokens.colors["on-background"]) root.colOnBackground = tokens.colors["on-background"].value

                if (tokens.colors["inverse-surface"]) root.colInverseSurface = tokens.colors["inverse-surface"].value
                if (tokens.colors["inverse-on-surface"]) root.colInverseOnSurface = tokens.colors["inverse-on-surface"].value
                if (tokens.colors["inverse-primary"]) root.colInversePrimary = tokens.colors["inverse-primary"].value

                if (tokens.colors.shadow) root.colShadow = tokens.colors.shadow.value
                if (tokens.colors.scrim) root.colScrim = tokens.colors.scrim.value
            }

            // Update spacing (convert px to int)
            if (tokens.spacing) {
                if (tokens.spacing.xs) root.spaceXs = parseInt(tokens.spacing.xs.value)
                if (tokens.spacing.s) root.spaceS = parseInt(tokens.spacing.s.value)
                if (tokens.spacing.m) root.spaceM = parseInt(tokens.spacing.m.value)
                if (tokens.spacing.l) root.spaceL = parseInt(tokens.spacing.l.value)
                if (tokens.spacing.xl) root.spaceXl = parseInt(tokens.spacing.xl.value)
                if (tokens.spacing.xxl) root.spaceXxl = parseInt(tokens.spacing.xxl.value)
            }

            // Update typography
            if (tokens.typography) {
                if (tokens.typography.fontFamily) {
                    if (tokens.typography.fontFamily.base) root.fontFamilyBase = tokens.typography.fontFamily.base.value
                    if (tokens.typography.fontFamily.monospace) root.fontFamilyMonospace = tokens.typography.fontFamily.monospace.value
                    if (tokens.typography.fontFamily.heading) root.fontFamilyHeading = tokens.typography.fontFamily.heading.value
                }

                if (tokens.typography.fontSize) {
                    if (tokens.typography.fontSize.xs) root.fontSizeXs = parseInt(tokens.typography.fontSize.xs.value)
                    if (tokens.typography.fontSize.s) root.fontSizeS = parseInt(tokens.typography.fontSize.s.value)
                    if (tokens.typography.fontSize.m) root.fontSizeM = parseInt(tokens.typography.fontSize.m.value)
                    if (tokens.typography.fontSize.l) root.fontSizeL = parseInt(tokens.typography.fontSize.l.value)
                    if (tokens.typography.fontSize.xl) root.fontSizeXl = parseInt(tokens.typography.fontSize.xl.value)
                    if (tokens.typography.fontSize.xxl) root.fontSizeXxl = parseInt(tokens.typography.fontSize.xxl.value)
                    if (tokens.typography.fontSize.xxxl) root.fontSizeXxxl = parseInt(tokens.typography.fontSize.xxxl.value)
                }

                if (tokens.typography.fontWeight) {
                    if (tokens.typography.fontWeight.normal) root.fontWeightNormal = tokens.typography.fontWeight.normal.value
                    if (tokens.typography.fontWeight.medium) root.fontWeightMedium = tokens.typography.fontWeight.medium.value
                    if (tokens.typography.fontWeight.semibold) root.fontWeightSemibold = tokens.typography.fontWeight.semibold.value
                    if (tokens.typography.fontWeight.bold) root.fontWeightBold = tokens.typography.fontWeight.bold.value
                }

                if (tokens.typography.lineHeight) {
                    if (tokens.typography.lineHeight.tight) root.lineHeightTight = tokens.typography.lineHeight.tight.value
                    if (tokens.typography.lineHeight.normal) root.lineHeightNormal = tokens.typography.lineHeight.normal.value
                    if (tokens.typography.lineHeight.relaxed) root.lineHeightRelaxed = tokens.typography.lineHeight.relaxed.value
                }
            }

            // Update elevation
            if (tokens.elevation) {
                if (tokens.elevation.none) root.elevationNone = tokens.elevation.none.value
                if (tokens.elevation.low) root.elevationLow = tokens.elevation.low.value
                if (tokens.elevation.medium) root.elevationMedium = tokens.elevation.medium.value
                if (tokens.elevation.high) root.elevationHigh = tokens.elevation.high.value
            }

            // Update border
            if (tokens.border) {
                if (tokens.border.radius) {
                    if (tokens.border.radius.none) root.radiusNone = parseInt(tokens.border.radius.none.value)
                    if (tokens.border.radius.s) root.radiusS = parseInt(tokens.border.radius.s.value)
                    if (tokens.border.radius.m) root.radiusM = parseInt(tokens.border.radius.m.value)
                    if (tokens.border.radius.l) root.radiusL = parseInt(tokens.border.radius.l.value)
                    if (tokens.border.radius.xl) root.radiusXl = parseInt(tokens.border.radius.xl.value)
                    if (tokens.border.radius.full) root.radiusFull = parseInt(tokens.border.radius.full.value)
                }

                if (tokens.border.width) {
                    if (tokens.border.width.thin) root.borderWidthThin = parseInt(tokens.border.width.thin.value)
                    if (tokens.border.width.medium) root.borderWidthMedium = parseInt(tokens.border.width.medium.value)
                    if (tokens.border.width.thick) root.borderWidthThick = parseInt(tokens.border.width.thick.value)
                }
            }

            // Update animation
            if (tokens.animation) {
                if (tokens.animation.duration) {
                    if (tokens.animation.duration.fast) root.animationDurationFast = parseInt(tokens.animation.duration.fast.value)
                    if (tokens.animation.duration.normal) root.animationDurationNormal = parseInt(tokens.animation.duration.normal.value)
                    if (tokens.animation.duration.slow) root.animationDurationSlow = parseInt(tokens.animation.duration.slow.value)
                }

                if (tokens.animation.easing) {
                    if (tokens.animation.easing.standard) root.animationEasingStandard = tokens.animation.easing.standard.value
                    if (tokens.animation.easing.decelerate) root.animationEasingDecelerate = tokens.animation.easing.decelerate.value
                    if (tokens.animation.easing.accelerate) root.animationEasingAccelerate = tokens.animation.easing.accelerate.value
                }
            }

            // Emit theme changed signal
            root.themeChanged()
            console.log("WebShellTheme: Theme updated from tokens")

        } catch (error) {
            console.error("WebShellTheme: Failed to update from tokens:", error)
        }
    }

    /**
     * Load theme from file path
     * @param filePath - Path to the design tokens JSON file
     */
    function loadFromFile(filePath: string) {
        // Note: File loading would need to be done via C++ backend
        // This is a placeholder for future implementation
        console.warn("WebShellTheme: loadFromFile() requires C++ integration")
    }

    /**
     * Get current theme as JSON object
     * @returns Object containing all theme values
     */
    function toJSON() {
        return {
            colors: {
                surface: root.colSurface,
                surfaceHigh: root.colSurfaceHigh,
                surfaceHighest: root.colSurfaceHighest,
                surfaceLow: root.colSurfaceLow,
                text: root.colText,
                textSecondary: root.colTextSecondary,
                primary: root.colPrimary,
                onPrimary: root.colOnPrimary,
                primaryContainer: root.colPrimaryContainer,
                onPrimaryContainer: root.colOnPrimaryContainer,
                secondary: root.colSecondary,
                onSecondary: root.colOnSecondary,
                secondaryContainer: root.colSecondaryContainer,
                onSecondaryContainer: root.colOnSecondaryContainer,
                tertiary: root.colTertiary,
                onTertiary: root.colOnTertiary,
                tertiaryContainer: root.colTertiaryContainer,
                onTertiaryContainer: root.colOnTertiaryContainer,
                error: root.colError,
                onError: root.colOnError,
                errorContainer: root.colErrorContainer,
                onErrorContainer: root.colOnErrorContainer,
                warning: root.colWarning,
                onWarning: root.colOnWarning,
                warningContainer: root.colWarningContainer,
                onWarningContainer: root.colOnWarningContainer,
                success: root.colSuccess,
                onSuccess: root.colOnSuccess,
                successContainer: root.colSuccessContainer,
                onSuccessContainer: root.colOnSuccessContainer,
                info: root.colInfo,
                onInfo: root.colOnInfo,
                infoContainer: root.colInfoContainer,
                onInfoContainer: root.colOnInfoContainer,
                border: root.colBorder,
                borderFocus: root.colBorderFocus,
                background: root.colBackground,
                onBackground: root.colOnBackground,
                inverseSurface: root.colInverseSurface,
                inverseOnSurface: root.colInverseOnSurface,
                inversePrimary: root.colInversePrimary,
                shadow: root.colShadow,
                scrim: root.colScrim
            },
            spacing: {
                xs: root.spaceXs,
                s: root.spaceS,
                m: root.spaceM,
                l: root.spaceL,
                xl: root.spaceXl,
                xxl: root.spaceXxl
            },
            typography: {
                fontFamily: {
                    base: root.fontFamilyBase,
                    monospace: root.fontFamilyMonospace,
                    heading: root.fontFamilyHeading
                },
                fontSize: {
                    xs: root.fontSizeXs,
                    s: root.fontSizeS,
                    m: root.fontSizeM,
                    l: root.fontSizeL,
                    xl: root.fontSizeXl,
                    xxl: root.fontSizeXxl,
                    xxxl: root.fontSizeXxxl
                },
                fontWeight: {
                    normal: root.fontWeightNormal,
                    medium: root.fontWeightMedium,
                    semibold: root.fontWeightSemibold,
                    bold: root.fontWeightBold
                },
                lineHeight: {
                    tight: root.lineHeightTight,
                    normal: root.lineHeightNormal,
                    relaxed: root.lineHeightRelaxed
                }
            },
            elevation: {
                none: root.elevationNone,
                low: root.elevationLow,
                medium: root.elevationMedium,
                high: root.elevationHigh
            },
            border: {
                radius: {
                    none: root.radiusNone,
                    s: root.radiusS,
                    m: root.radiusM,
                    l: root.radiusL,
                    xl: root.radiusXl,
                    full: root.radiusFull
                },
                width: {
                    thin: root.borderWidthThin,
                    medium: root.borderWidthMedium,
                    thick: root.borderWidthThick
                }
            },
            animation: {
                duration: {
                    fast: root.animationDurationFast,
                    normal: root.animationDurationNormal,
                    slow: root.animationDurationSlow
                },
                easing: {
                    standard: root.animationEasingStandard,
                    decelerate: root.animationEasingDecelerate,
                    accelerate: root.animationEasingAccelerate
                }
            }
        }
    }

    /**
     * Save tokens to disk (updates design-tokens.json)
     * @param tokensJson - JSON string to save
     */
    function saveTokensToDisk(tokensJson: string) {
        // For now, we'll just log this
        // In a full implementation, this would write to the design-tokens.json file
        // which would then trigger a regeneration of tokens.css via the build process
        console.log("[WebShellTheme] Theme tokens would be saved to disk");
        // TODO: Implement file writing when C++ backend supports it
    }

    /**
     * Manually trigger theme generation from wallpaper
     * @param wallpaperPath - Path to wallpaper image
     */
    function generateFromWallpaper(wallpaperPath: string) {
        console.log("[WebShellTheme] Manually triggering theme generation");
        ThemeGenerator.generateFromWallpaper(wallpaperPath);
    }

    /**
     * Set theme mode (light/dark/auto)
     * @param mode - "light", "dark", or "auto"
     */
    function setThemeMode(mode: string) {
        ThemeGenerator.setThemeMode(mode);
    }

    // ========================================
    // WALLPAPER-BASED THEME GENERATION
    // ========================================

    // Connection to WallpaperWatcher
    Connections {
        target: WallpaperWatcher
        enabled: root.autoGenerateFromWallpaper

        function onWallpaperChanged(wallpaperPath: string) {
            console.log("[WebShellTheme] Wallpaper changed, regenerating theme from:", wallpaperPath);
            ThemeGenerator.generateFromWallpaper(wallpaperPath);
        }
    }

    // Connection to ThemeGenerator
    Connections {
        target: ThemeGenerator

        function onThemeGenerated(tokensJson: string) {
            console.log("[WebShellTheme] Theme generated successfully, updating...");

            try {
                // Update theme from generated tokens
                root.updateFromTokens(tokensJson);

                // Optionally save to disk
                // saveTokensToDisk(tokensJson);

                console.log("[WebShellTheme] Theme updated from generated tokens");
            } catch (error) {
                console.error("[WebShellTheme] Failed to update theme:", error);
            }
        }

        function onGenerationFailed(error: string) {
            console.error("[WebShellTheme] Theme generation failed:", error);
            console.log("[WebShellTheme] Using current theme as fallback");
            // Current theme remains unchanged as fallback
        }
    }
}
