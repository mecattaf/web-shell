/**
 * Wallpaper-Based Theme Generation Example
 *
 * This example demonstrates how to use WebShell's automatic theme generation
 * from wallpapers using Matugen and Material You principles.
 *
 * Prerequisites:
 * - Install Matugen: cargo install matugen
 * - Set a wallpaper using hyprpaper, swww, feh, or nitrogen
 */

import QtQuick
import QtQuick.Controls
import Quickshell
import WebShell.Services

ShellRoot {
    id: root

    Component.onCompleted: {
        console.log("=== Wallpaper-Based Theme Generation Example ===")

        // Enable automatic theme generation from wallpaper
        WebShellTheme.autoGenerateFromWallpaper = true

        // Set theme mode (light or dark)
        WebShellTheme.setThemeMode("dark")

        // Check current wallpaper
        console.log("Current wallpaper:", WallpaperWatcher.wallpaperPath)
        console.log("Wallpaper source:", WallpaperWatcher.wallpaperSource)
        console.log("Theme mode:", ThemeGenerator.themeMode)
    }

    // Listen for theme changes
    Connections {
        target: WebShellTheme

        function onThemeChanged() {
            console.log("Theme has been updated!")
            console.log("New primary color:", WebShellTheme.colPrimary)
        }
    }

    // Listen for wallpaper changes
    Connections {
        target: WallpaperWatcher

        function onWallpaperChanged(newPath: string) {
            console.log("Wallpaper changed to:", newPath)
        }
    }

    // Listen for theme generation events
    Connections {
        target: ThemeGenerator

        function onThemeGenerated(tokensJson: string) {
            console.log("Theme generated successfully!")
        }

        function onGenerationFailed(error: string) {
            console.error("Theme generation failed:", error)
        }
    }

    // Demo panel showing the generated theme
    PanelWindow {
        id: demoPanel

        anchors {
            top: true
            left: true
        }

        width: 400
        height: 600

        color: WebShellTheme.colBackground

        Rectangle {
            anchors.fill: parent
            anchors.margins: WebShellTheme.spaceL
            color: WebShellTheme.colSurface
            radius: WebShellTheme.radiusL

            Column {
                anchors.fill: parent
                anchors.margins: WebShellTheme.spaceL
                spacing: WebShellTheme.spaceM

                // Header
                Text {
                    text: "Theme Demo"
                    color: WebShellTheme.colPrimary
                    font.family: WebShellTheme.fontFamilyHeading
                    font.pixelSize: WebShellTheme.fontSizeXxl
                    font.weight: WebShellTheme.fontWeightBold
                }

                // Wallpaper info
                Rectangle {
                    width: parent.width - WebShellTheme.spaceL * 2
                    height: 80
                    color: WebShellTheme.colSurfaceHigh
                    radius: WebShellTheme.radiusM

                    Column {
                        anchors.fill: parent
                        anchors.margins: WebShellTheme.spaceM
                        spacing: WebShellTheme.spaceS

                        Text {
                            text: "Current Wallpaper"
                            color: WebShellTheme.colTextSecondary
                            font.family: WebShellTheme.fontFamilyBase
                            font.pixelSize: WebShellTheme.fontSizeS
                        }

                        Text {
                            text: WallpaperWatcher.wallpaperPath || "Not detected"
                            color: WebShellTheme.colText
                            font.family: WebShellTheme.fontFamilyMonospace
                            font.pixelSize: WebShellTheme.fontSizeXs
                            wrapMode: Text.WrapAnywhere
                            width: parent.width
                        }
                    }
                }

                // Color swatches
                Text {
                    text: "Generated Colors"
                    color: WebShellTheme.colText
                    font.family: WebShellTheme.fontFamilyBase
                    font.pixelSize: WebShellTheme.fontSizeM
                    font.weight: WebShellTheme.fontWeightSemibold
                }

                Row {
                    spacing: WebShellTheme.spaceM

                    // Primary color
                    Rectangle {
                        width: 80
                        height: 80
                        color: WebShellTheme.colPrimary
                        radius: WebShellTheme.radiusM

                        Text {
                            anchors.centerIn: parent
                            text: "Primary"
                            color: WebShellTheme.colOnPrimary
                            font.pixelSize: WebShellTheme.fontSizeXs
                        }
                    }

                    // Secondary color
                    Rectangle {
                        width: 80
                        height: 80
                        color: WebShellTheme.colSecondary
                        radius: WebShellTheme.radiusM

                        Text {
                            anchors.centerIn: parent
                            text: "Secondary"
                            color: WebShellTheme.colOnSecondary
                            font.pixelSize: WebShellTheme.fontSizeXs
                        }
                    }

                    // Tertiary color
                    Rectangle {
                        width: 80
                        height: 80
                        color: WebShellTheme.colTertiary
                        radius: WebShellTheme.radiusM

                        Text {
                            anchors.centerIn: parent
                            text: "Tertiary"
                            color: WebShellTheme.colOnTertiary
                            font.pixelSize: WebShellTheme.fontSizeXs
                        }
                    }
                }

                // Container examples
                Text {
                    text: "Container Variants"
                    color: WebShellTheme.colText
                    font.family: WebShellTheme.fontFamilyBase
                    font.pixelSize: WebShellTheme.fontSizeM
                    font.weight: WebShellTheme.fontWeightSemibold
                }

                Rectangle {
                    width: parent.width - WebShellTheme.spaceL * 2
                    height: 60
                    color: WebShellTheme.colPrimaryContainer
                    radius: WebShellTheme.radiusM

                    Text {
                        anchors.centerIn: parent
                        text: "Primary Container"
                        color: WebShellTheme.colOnPrimaryContainer
                        font.pixelSize: WebShellTheme.fontSizeM
                    }
                }

                Rectangle {
                    width: parent.width - WebShellTheme.spaceL * 2
                    height: 60
                    color: WebShellTheme.colSecondaryContainer
                    radius: WebShellTheme.radiusM

                    Text {
                        anchors.centerIn: parent
                        text: "Secondary Container"
                        color: WebShellTheme.colOnSecondaryContainer
                        font.pixelSize: WebShellTheme.fontSizeM
                    }
                }

                // Controls
                Text {
                    text: "Theme Controls"
                    color: WebShellTheme.colText
                    font.family: WebShellTheme.fontFamilyBase
                    font.pixelSize: WebShellTheme.fontSizeM
                    font.weight: WebShellTheme.fontWeightSemibold
                }

                Row {
                    spacing: WebShellTheme.spaceM

                    Button {
                        text: "Light Mode"
                        onClicked: {
                            WebShellTheme.setThemeMode("light")
                        }
                    }

                    Button {
                        text: "Dark Mode"
                        onClicked: {
                            WebShellTheme.setThemeMode("dark")
                        }
                    }

                    Button {
                        text: "Regenerate"
                        enabled: WallpaperWatcher.wallpaperPath !== ""
                        onClicked: {
                            ThemeGenerator.generateFromWallpaper(WallpaperWatcher.wallpaperPath)
                        }
                    }
                }

                // Status
                Rectangle {
                    width: parent.width - WebShellTheme.spaceL * 2
                    height: 40
                    color: ThemeGenerator.generating ? WebShellTheme.colWarningContainer : WebShellTheme.colSuccessContainer
                    radius: WebShellTheme.radiusS

                    Text {
                        anchors.centerIn: parent
                        text: ThemeGenerator.generating ? "Generating theme..." : "Theme ready"
                        color: ThemeGenerator.generating ? WebShellTheme.colOnWarningContainer : WebShellTheme.colOnSuccessContainer
                        font.pixelSize: WebShellTheme.fontSizeS
                    }
                }
            }
        }
    }
}
