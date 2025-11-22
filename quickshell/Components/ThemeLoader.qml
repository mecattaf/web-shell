// ThemeLoader.qml - Loads design tokens and watches for theme changes
// Integrates with WebShellTheme singleton and propagates changes to WebViews
pragma ComponentBehavior: Bound
import QtQuick
import QtQuick.LocalStorage
import WebShell.Services

QtObject {
    id: root

    // Path to design tokens JSON file
    property string tokenFilePath: Qt.resolvedUrl("../../src/style/design-tokens.json")

    // Whether to watch for file changes (dev mode)
    property bool watchForChanges: false

    // Fallback to Appearance.* values (DMS compatibility)
    property bool useDmsCompatibility: true

    // Reference to Appearance object (if available from DMS)
    property var appearance: null

    signal themeLoaded()
    signal themeFailed(string error)

    /**
     * Initialize and load theme
     */
    function initialize() {
        console.log("ThemeLoader: Initializing...")
        loadTheme()
    }

    /**
     * Load theme from design tokens file
     * Note: In production, this would use Qt.openUrlExternally or C++ file reading
     * For now, we rely on the default values in WebShellTheme
     */
    function loadTheme() {
        console.log("ThemeLoader: Loading theme from", root.tokenFilePath)

        // In a real implementation, we would:
        // 1. Read the JSON file using C++ backend or Qt.labs.platform.FileDialog
        // 2. Parse the JSON
        // 3. Call WebShellTheme.updateFromTokens(jsonString)

        // For now, apply DMS compatibility if available
        if (root.useDmsCompatibility && root.appearance) {
            applyDmsTheme()
        }

        root.themeLoaded()
        console.log("ThemeLoader: Theme loaded successfully")
    }

    /**
     * Apply theme from DMS Appearance object
     * This provides backward compatibility with the existing DMS theme system
     */
    function applyDmsTheme() {
        if (!root.appearance) {
            console.warn("ThemeLoader: DMS Appearance object not available")
            return
        }

        console.log("ThemeLoader: Applying DMS theme compatibility layer")

        // Map DMS colors to WebShellTheme
        if (root.appearance.colors) {
            const colors = root.appearance.colors

            // Surface colors
            if (colors.colSurface !== undefined)
                WebShellTheme.colSurface = colors.colSurface
            if (colors.colSurfaceContainerHigh !== undefined)
                WebShellTheme.colSurfaceHigh = colors.colSurfaceContainerHigh
            if (colors.colSurfaceContainerHighest !== undefined)
                WebShellTheme.colSurfaceHighest = colors.colSurfaceContainerHighest
            if (colors.colSurfaceContainerLow !== undefined)
                WebShellTheme.colSurfaceLow = colors.colSurfaceContainerLow

            // Text colors
            if (colors.colOnSurface !== undefined)
                WebShellTheme.colText = colors.colOnSurface
            if (colors.colOnSurfaceVariant !== undefined)
                WebShellTheme.colTextSecondary = colors.colOnSurfaceVariant

            // Primary colors
            if (colors.colPrimary !== undefined)
                WebShellTheme.colPrimary = colors.colPrimary
            if (colors.colOnPrimary !== undefined)
                WebShellTheme.colOnPrimary = colors.colOnPrimary
            if (colors.colPrimaryContainer !== undefined)
                WebShellTheme.colPrimaryContainer = colors.colPrimaryContainer
            if (colors.colOnPrimaryContainer !== undefined)
                WebShellTheme.colOnPrimaryContainer = colors.colOnPrimaryContainer

            // Secondary colors
            if (colors.colSecondary !== undefined)
                WebShellTheme.colSecondary = colors.colSecondary
            if (colors.colOnSecondary !== undefined)
                WebShellTheme.colOnSecondary = colors.colOnSecondary
            if (colors.colSecondaryContainer !== undefined)
                WebShellTheme.colSecondaryContainer = colors.colSecondaryContainer
            if (colors.colOnSecondaryContainer !== undefined)
                WebShellTheme.colOnSecondaryContainer = colors.colOnSecondaryContainer

            // Tertiary colors
            if (colors.colTertiary !== undefined)
                WebShellTheme.colTertiary = colors.colTertiary
            if (colors.colOnTertiary !== undefined)
                WebShellTheme.colOnTertiary = colors.colOnTertiary
            if (colors.colTertiaryContainer !== undefined)
                WebShellTheme.colTertiaryContainer = colors.colTertiaryContainer
            if (colors.colOnTertiaryContainer !== undefined)
                WebShellTheme.colOnTertiaryContainer = colors.colOnTertiaryContainer

            // Error colors
            if (colors.colError !== undefined)
                WebShellTheme.colError = colors.colError
            if (colors.colOnError !== undefined)
                WebShellTheme.colOnError = colors.colOnError
            if (colors.colErrorContainer !== undefined)
                WebShellTheme.colErrorContainer = colors.colErrorContainer
            if (colors.colOnErrorContainer !== undefined)
                WebShellTheme.colOnErrorContainer = colors.colOnErrorContainer

            // Borders
            if (colors.colOutline !== undefined)
                WebShellTheme.colBorder = colors.colOutline
            if (colors.colOutlineVariant !== undefined)
                WebShellTheme.colBorderFocus = colors.colOutlineVariant

            // Background
            if (colors.colBackground !== undefined)
                WebShellTheme.colBackground = colors.colBackground
            if (colors.colOnBackground !== undefined)
                WebShellTheme.colOnBackground = colors.colOnBackground

            // Inverse colors
            if (colors.colInverseSurface !== undefined)
                WebShellTheme.colInverseSurface = colors.colInverseSurface
            if (colors.colInverseOnSurface !== undefined)
                WebShellTheme.colInverseOnSurface = colors.colInverseOnSurface
            if (colors.colInversePrimary !== undefined)
                WebShellTheme.colInversePrimary = colors.colInversePrimary

            // Shadow and scrim
            if (colors.colShadow !== undefined)
                WebShellTheme.colShadow = colors.colShadow
            if (colors.colScrim !== undefined)
                WebShellTheme.colScrim = colors.colScrim
        }

        // Map DMS spacing to WebShellTheme
        if (root.appearance.spacing) {
            const spacing = root.appearance.spacing
            if (spacing.xs !== undefined) WebShellTheme.spaceXs = spacing.xs
            if (spacing.s !== undefined) WebShellTheme.spaceS = spacing.s
            if (spacing.m !== undefined) WebShellTheme.spaceM = spacing.m
            if (spacing.l !== undefined) WebShellTheme.spaceL = spacing.l
            if (spacing.xl !== undefined) WebShellTheme.spaceXl = spacing.xl
            if (spacing.xxl !== undefined) WebShellTheme.spaceXxl = spacing.xxl
        }

        // Map DMS font to WebShellTheme
        if (root.appearance.font) {
            const font = root.appearance.font
            if (font.family !== undefined)
                WebShellTheme.fontFamilyBase = font.family
            if (font.monospace !== undefined)
                WebShellTheme.fontFamilyMonospace = font.monospace

            // Font sizes
            if (font.pixelSize) {
                if (font.pixelSize.small !== undefined)
                    WebShellTheme.fontSizeXs = font.pixelSize.small
                if (font.pixelSize.medium !== undefined)
                    WebShellTheme.fontSizeS = font.pixelSize.medium
                if (font.pixelSize.normal !== undefined)
                    WebShellTheme.fontSizeM = font.pixelSize.normal
                if (font.pixelSize.large !== undefined)
                    WebShellTheme.fontSizeL = font.pixelSize.large
                if (font.pixelSize.larger !== undefined)
                    WebShellTheme.fontSizeXl = font.pixelSize.larger
                if (font.pixelSize.xl !== undefined)
                    WebShellTheme.fontSizeXxl = font.pixelSize.xl
                if (font.pixelSize.xxl !== undefined)
                    WebShellTheme.fontSizeXxxl = font.pixelSize.xxl
            }

            // Font weights
            if (font.weight) {
                if (font.weight.normal !== undefined)
                    WebShellTheme.fontWeightNormal = font.weight.normal
                if (font.weight.medium !== undefined)
                    WebShellTheme.fontWeightMedium = font.weight.medium
                if (font.weight.semibold !== undefined)
                    WebShellTheme.fontWeightSemibold = font.weight.semibold
                if (font.weight.bold !== undefined)
                    WebShellTheme.fontWeightBold = font.weight.bold
            }
        }

        // Map DMS rounding to WebShellTheme
        if (root.appearance.rounding) {
            const rounding = root.appearance.rounding
            if (rounding.none !== undefined) WebShellTheme.radiusNone = rounding.none
            if (rounding.small !== undefined) WebShellTheme.radiusS = rounding.small
            if (rounding.normal !== undefined) WebShellTheme.radiusM = rounding.normal
            if (rounding.large !== undefined) WebShellTheme.radiusL = rounding.large
            if (rounding.xl !== undefined) WebShellTheme.radiusXl = rounding.xl
            if (rounding.full !== undefined) WebShellTheme.radiusFull = rounding.full
        }

        // Map DMS animation to WebShellTheme
        if (root.appearance.animation) {
            const animation = root.appearance.animation
            if (animation.durationFast !== undefined)
                WebShellTheme.animationDurationFast = animation.durationFast
            if (animation.durationNormal !== undefined)
                WebShellTheme.animationDurationNormal = animation.durationNormal
            if (animation.durationSlow !== undefined)
                WebShellTheme.animationDurationSlow = animation.durationSlow

            if (animation.easingStandard !== undefined)
                WebShellTheme.animationEasingStandard = animation.easingStandard
            if (animation.easingDecelerate !== undefined)
                WebShellTheme.animationEasingDecelerate = animation.easingDecelerate
            if (animation.easingAccelerate !== undefined)
                WebShellTheme.animationEasingAccelerate = animation.easingAccelerate
        }

        // Emit theme changed signal
        WebShellTheme.themeChanged()
    }

    /**
     * Watch Appearance object for changes (DMS integration)
     */
    Connections {
        target: root.appearance
        enabled: root.useDmsCompatibility && root.appearance !== null

        // Watch for theme changes in DMS
        function onThemeChanged() {
            console.log("ThemeLoader: DMS theme changed, updating WebShellTheme")
            root.applyDmsTheme()
        }
    }

    /**
     * File system watcher for design tokens
     * Note: This requires Qt.labs.folderlistmodel or C++ integration
     */
    Timer {
        id: fileWatcher
        interval: 1000  // Check every second
        running: root.watchForChanges
        repeat: true

        onTriggered: {
            // In production, use proper file watching (inotify, FileSystemWatcher, etc.)
            // For now, this is a placeholder
            // root.loadTheme()
        }
    }

    Component.onCompleted: {
        // Auto-initialize on creation
        Qt.callLater(() => root.initialize())
    }
}
