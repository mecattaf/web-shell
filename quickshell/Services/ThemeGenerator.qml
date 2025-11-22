pragma Singleton
pragma ComponentBehavior: Bound
import QtQuick
import Quickshell
import Quickshell.Io

QtObject {
    id: root

    property string wallpaperPath: ""
    property bool generating: false
    property string lastError: ""

    // Theme mode: "auto", "light", "dark"
    property string themeMode: "dark"

    signal themeGenerated(string tokensJson)
    signal generationFailed(string error)

    /**
     * Generate theme from wallpaper image using Matugen
     * @param imagePath - Path to the wallpaper image
     * @param mode - Theme mode: "light" or "dark" (default: current themeMode)
     */
    function generateFromWallpaper(imagePath: string, mode: string = "") {
        if (generating) {
            console.warn("[ThemeGenerator] Already generating theme");
            return;
        }

        if (!imagePath || imagePath === "") {
            console.error("[ThemeGenerator] Invalid image path");
            generationFailed("Invalid image path");
            return;
        }

        const actualMode = mode || themeMode;
        console.log("[ThemeGenerator] Generating theme from:", imagePath, "mode:", actualMode);

        generating = true;
        wallpaperPath = imagePath;
        lastError = "";

        // Check if matugen is available
        checkMatugenAvailable(imagePath, actualMode);
    }

    /**
     * Check if matugen is installed
     */
    function checkMatugenAvailable(imagePath: string, mode: string) {
        const checkProcess = new Process({
            command: ["which", "matugen"]
        });

        checkProcess.running = true;

        checkProcess.exited.connect((exitCode, exitStatus) => {
            if (exitCode === 0) {
                // Matugen is available, proceed with generation
                executeMatugen(imagePath, mode);
            } else {
                generating = false;
                lastError = "Matugen is not installed. Please install it with: cargo install matugen";
                console.error("[ThemeGenerator]", lastError);
                generationFailed(lastError);
            }
            checkProcess.running = false;
        });
    }

    /**
     * Execute matugen to extract colors from wallpaper
     */
    function executeMatugen(imagePath: string, mode: string) {
        const matugenProcess = new Process({
            command: [
                "matugen",
                "image",
                imagePath,
                "--json",
                "hex"
            ]
        });

        matugenProcess.running = true;

        matugenProcess.exited.connect((exitCode, exitStatus) => {
            generating = false;

            if (exitCode === 0) {
                const output = matugenProcess.stdout;
                parseMatugenOutput(output, mode);
            } else {
                const error = matugenProcess.stderr || "Unknown error";
                lastError = "Matugen execution failed: " + error;
                console.error("[ThemeGenerator]", lastError);
                generationFailed(lastError);
            }
            matugenProcess.running = false;
        });
    }

    /**
     * Parse Matugen JSON output and convert to design tokens
     */
    function parseMatugenOutput(output: string, mode: string) {
        try {
            const matugenData = JSON.parse(output);
            const tokens = mapToDesignTokens(matugenData, mode);
            const tokensJson = JSON.stringify(tokens, null, 2);

            console.log("[ThemeGenerator] Theme generated successfully");
            themeGenerated(tokensJson);

        } catch (e) {
            lastError = "JSON parse error: " + e;
            console.error("[ThemeGenerator]", lastError);
            generationFailed(lastError);
        }
    }

    /**
     * Map Matugen's Material You colors to WebShell design token format
     */
    function mapToDesignTokens(matugenData: var, mode: string) {
        // Matugen outputs colors in different schemes
        // We use the "dark" or "light" scheme based on mode
        const colors = matugenData.colors || {};
        const scheme = mode === "light" ? (colors.light || {}) : (colors.dark || {});

        // Fallback to default colors if scheme is empty
        if (Object.keys(scheme).length === 0) {
            console.warn("[ThemeGenerator] Scheme is empty, using fallback");
            return getFallbackTokens();
        }

        return {
            "$schema": "./src/style/design-tokens.schema.json",
            "version": "1.0.0",
            "colors": {
                // Surface colors
                "surface": {
                    "value": scheme.surface || "#1a1a1a",
                    "description": "Generated from wallpaper - surface"
                },
                "surface-high": {
                    "value": scheme.surface_container_high || scheme.surfaceContainerHigh || "#2d2d2d",
                    "description": "Generated from wallpaper - elevated surface"
                },
                "surface-highest": {
                    "value": scheme.surface_container_highest || scheme.surfaceContainerHighest || "#383838",
                    "description": "Generated from wallpaper - highest elevation surface"
                },
                "surface-low": {
                    "value": scheme.surface_container_low || scheme.surfaceContainerLow || "#1e1e1e",
                    "description": "Generated from wallpaper - lower surface"
                },

                // Text colors
                "text": {
                    "value": scheme.on_surface || scheme.onSurface || "#e3e3e3",
                    "description": "Generated from wallpaper - primary text"
                },
                "text-secondary": {
                    "value": scheme.on_surface_variant || scheme.onSurfaceVariant || "#c7c7c7",
                    "description": "Generated from wallpaper - secondary text"
                },

                // Primary colors
                "primary": {
                    "value": scheme.primary || "#ef8354",
                    "description": "Generated from wallpaper - primary color"
                },
                "on-primary": {
                    "value": scheme.on_primary || scheme.onPrimary || "#2d1e1a",
                    "description": "Generated from wallpaper - text on primary"
                },
                "primary-container": {
                    "value": scheme.primary_container || scheme.primaryContainer || "#4f3528",
                    "description": "Generated from wallpaper - primary container"
                },
                "on-primary-container": {
                    "value": scheme.on_primary_container || scheme.onPrimaryContainer || "#ffdcc8",
                    "description": "Generated from wallpaper - text on primary container"
                },

                // Secondary colors
                "secondary": {
                    "value": scheme.secondary || "#4f9d69",
                    "description": "Generated from wallpaper - secondary color"
                },
                "on-secondary": {
                    "value": scheme.on_secondary || scheme.onSecondary || "#1a2e21",
                    "description": "Generated from wallpaper - text on secondary"
                },
                "secondary-container": {
                    "value": scheme.secondary_container || scheme.secondaryContainer || "#2d4936",
                    "description": "Generated from wallpaper - secondary container"
                },
                "on-secondary-container": {
                    "value": scheme.on_secondary_container || scheme.onSecondaryContainer || "#c8f0d9",
                    "description": "Generated from wallpaper - text on secondary container"
                },

                // Tertiary colors
                "tertiary": {
                    "value": scheme.tertiary || "#6b9bd1",
                    "description": "Generated from wallpaper - tertiary color"
                },
                "on-tertiary": {
                    "value": scheme.on_tertiary || scheme.onTertiary || "#1e2f42",
                    "description": "Generated from wallpaper - text on tertiary"
                },
                "tertiary-container": {
                    "value": scheme.tertiary_container || scheme.tertiaryContainer || "#364d6b",
                    "description": "Generated from wallpaper - tertiary container"
                },
                "on-tertiary-container": {
                    "value": scheme.on_tertiary_container || scheme.onTertiaryContainer || "#d6e7ff",
                    "description": "Generated from wallpaper - text on tertiary container"
                },

                // Error colors
                "error": {
                    "value": scheme.error || "#ff6b6b",
                    "description": "Generated from wallpaper - error color"
                },
                "on-error": {
                    "value": scheme.on_error || scheme.onError || "#3d1616",
                    "description": "Generated from wallpaper - text on error"
                },
                "error-container": {
                    "value": scheme.error_container || scheme.errorContainer || "#5c2020",
                    "description": "Generated from wallpaper - error container"
                },
                "on-error-container": {
                    "value": scheme.on_error_container || scheme.onErrorContainer || "#ffd6d6",
                    "description": "Generated from wallpaper - text on error container"
                },

                // Warning colors (fallback to generated or defaults)
                "warning": {
                    "value": scheme.warning || "#f9c74f",
                    "description": "Warning color"
                },
                "on-warning": {
                    "value": scheme.on_warning || scheme.onWarning || "#3d3318",
                    "description": "Text on warning"
                },
                "warning-container": {
                    "value": scheme.warning_container || scheme.warningContainer || "#5c4d24",
                    "description": "Warning container"
                },
                "on-warning-container": {
                    "value": scheme.on_warning_container || scheme.onWarningContainer || "#fff0c8",
                    "description": "Text on warning container"
                },

                // Success colors (fallback to generated or defaults)
                "success": {
                    "value": scheme.success || "#90be6d",
                    "description": "Success color"
                },
                "on-success": {
                    "value": scheme.on_success || scheme.onSuccess || "#243d1e",
                    "description": "Text on success"
                },
                "success-container": {
                    "value": scheme.success_container || scheme.successContainer || "#375c2d",
                    "description": "Success container"
                },
                "on-success-container": {
                    "value": scheme.on_success_container || scheme.onSuccessContainer || "#daf2ce",
                    "description": "Text on success container"
                },

                // Info colors (fallback to generated or defaults)
                "info": {
                    "value": scheme.info || "#577590",
                    "description": "Info color"
                },
                "on-info": {
                    "value": scheme.on_info || scheme.onInfo || "#1a242e",
                    "description": "Text on info"
                },
                "info-container": {
                    "value": scheme.info_container || scheme.infoContainer || "#2d3d4f",
                    "description": "Info container"
                },
                "on-info-container": {
                    "value": scheme.on_info_container || scheme.onInfoContainer || "#d0dce8",
                    "description": "Text on info container"
                },

                // Border colors
                "border": {
                    "value": scheme.outline || "#8e8e8e",
                    "description": "Generated from wallpaper - border"
                },
                "border-focus": {
                    "value": scheme.outline_variant || scheme.outlineVariant || "#4a4a4a",
                    "description": "Generated from wallpaper - focus border"
                },

                // Background colors
                "background": {
                    "value": scheme.background || "#121212",
                    "description": "Generated from wallpaper - background"
                },
                "on-background": {
                    "value": scheme.on_background || scheme.onBackground || "#e3e3e3",
                    "description": "Generated from wallpaper - text on background"
                },

                // Inverse colors
                "inverse-surface": {
                    "value": scheme.inverse_surface || scheme.inverseSurface || "#e3e3e3",
                    "description": "Generated from wallpaper - inverse surface"
                },
                "inverse-on-surface": {
                    "value": scheme.inverse_on_surface || scheme.inverseOnSurface || "#2d2d2d",
                    "description": "Generated from wallpaper - inverse text"
                },
                "inverse-primary": {
                    "value": scheme.inverse_primary || scheme.inversePrimary || "#b85c2f",
                    "description": "Generated from wallpaper - inverse primary"
                },

                // Shadow and scrim
                "shadow": {
                    "value": scheme.shadow || "#000000",
                    "description": "Shadow color"
                },
                "scrim": {
                    "value": scheme.scrim || "#000000",
                    "description": "Scrim overlay color"
                }
            },
            "spacing": {
                "xs": { "value": "4px", "description": "Extra small spacing" },
                "s": { "value": "8px", "description": "Small spacing" },
                "m": { "value": "16px", "description": "Medium spacing" },
                "l": { "value": "24px", "description": "Large spacing" },
                "xl": { "value": "32px", "description": "Extra large spacing" },
                "xxl": { "value": "48px", "description": "Extra extra large spacing" }
            },
            "typography": {
                "fontFamily": {
                    "base": { "value": "Inter, system-ui, -apple-system, sans-serif", "description": "Base font family" },
                    "monospace": { "value": "JetBrains Mono, Consolas, monospace", "description": "Monospace font family" },
                    "heading": { "value": "Inter, system-ui, -apple-system, sans-serif", "description": "Heading font family" }
                },
                "fontSize": {
                    "xs": { "value": "12px", "description": "Extra small font size" },
                    "s": { "value": "14px", "description": "Small font size" },
                    "m": { "value": "16px", "description": "Medium font size" },
                    "l": { "value": "18px", "description": "Large font size" },
                    "xl": { "value": "20px", "description": "Extra large font size" },
                    "xxl": { "value": "24px", "description": "Extra extra large font size" },
                    "xxxl": { "value": "32px", "description": "Extra extra extra large font size" }
                },
                "fontWeight": {
                    "normal": { "value": 400, "description": "Normal font weight" },
                    "medium": { "value": 500, "description": "Medium font weight" },
                    "semibold": { "value": 600, "description": "Semibold font weight" },
                    "bold": { "value": 700, "description": "Bold font weight" }
                },
                "lineHeight": {
                    "tight": { "value": 1.2, "description": "Tight line height" },
                    "normal": { "value": 1.5, "description": "Normal line height" },
                    "relaxed": { "value": 1.75, "description": "Relaxed line height" }
                }
            },
            "elevation": {
                "none": { "value": "none", "description": "No elevation" },
                "low": { "value": "0 2px 4px rgba(0,0,0,0.12)", "description": "Low elevation" },
                "medium": { "value": "0 4px 8px rgba(0,0,0,0.16)", "description": "Medium elevation" },
                "high": { "value": "0 8px 16px rgba(0,0,0,0.20)", "description": "High elevation" }
            },
            "border": {
                "radius": {
                    "none": { "value": "0px", "description": "No border radius" },
                    "s": { "value": "4px", "description": "Small border radius" },
                    "m": { "value": "8px", "description": "Medium border radius" },
                    "l": { "value": "12px", "description": "Large border radius" },
                    "xl": { "value": "16px", "description": "Extra large border radius" },
                    "full": { "value": "9999px", "description": "Full border radius (circular)" }
                },
                "width": {
                    "thin": { "value": "1px", "description": "Thin border" },
                    "medium": { "value": "2px", "description": "Medium border" },
                    "thick": { "value": "4px", "description": "Thick border" }
                }
            },
            "animation": {
                "duration": {
                    "fast": { "value": "150ms", "description": "Fast animation" },
                    "normal": { "value": "250ms", "description": "Normal animation" },
                    "slow": { "value": "400ms", "description": "Slow animation" }
                },
                "easing": {
                    "standard": { "value": "cubic-bezier(0.4, 0.0, 0.2, 1)", "description": "Standard easing" },
                    "decelerate": { "value": "cubic-bezier(0.0, 0.0, 0.2, 1)", "description": "Decelerate easing" },
                    "accelerate": { "value": "cubic-bezier(0.4, 0.0, 1, 1)", "description": "Accelerate easing" }
                }
            }
        };
    }

    /**
     * Get fallback theme when generation fails
     */
    function getFallbackTokens() {
        return {
            "$schema": "./src/style/design-tokens.schema.json",
            "version": "1.0.0",
            "colors": {
                "surface": { "value": "#1a1a1a", "description": "Fallback surface" },
                "surface-high": { "value": "#2d2d2d", "description": "Fallback surface high" },
                "surface-highest": { "value": "#383838", "description": "Fallback surface highest" },
                "surface-low": { "value": "#1e1e1e", "description": "Fallback surface low" },
                "text": { "value": "#e3e3e3", "description": "Fallback text" },
                "text-secondary": { "value": "#c7c7c7", "description": "Fallback secondary text" },
                "primary": { "value": "#ef8354", "description": "Fallback primary" },
                "on-primary": { "value": "#2d1e1a", "description": "Fallback on primary" },
                "primary-container": { "value": "#4f3528", "description": "Fallback primary container" },
                "on-primary-container": { "value": "#ffdcc8", "description": "Fallback on primary container" },
                "secondary": { "value": "#4f9d69", "description": "Fallback secondary" },
                "on-secondary": { "value": "#1a2e21", "description": "Fallback on secondary" },
                "secondary-container": { "value": "#2d4936", "description": "Fallback secondary container" },
                "on-secondary-container": { "value": "#c8f0d9", "description": "Fallback on secondary container" },
                "tertiary": { "value": "#6b9bd1", "description": "Fallback tertiary" },
                "on-tertiary": { "value": "#1e2f42", "description": "Fallback on tertiary" },
                "tertiary-container": { "value": "#364d6b", "description": "Fallback tertiary container" },
                "on-tertiary-container": { "value": "#d6e7ff", "description": "Fallback on tertiary container" },
                "error": { "value": "#ff6b6b", "description": "Fallback error" },
                "on-error": { "value": "#3d1616", "description": "Fallback on error" },
                "error-container": { "value": "#5c2020", "description": "Fallback error container" },
                "on-error-container": { "value": "#ffd6d6", "description": "Fallback on error container" },
                "warning": { "value": "#f9c74f", "description": "Fallback warning" },
                "on-warning": { "value": "#3d3318", "description": "Fallback on warning" },
                "warning-container": { "value": "#5c4d24", "description": "Fallback warning container" },
                "on-warning-container": { "value": "#fff0c8", "description": "Fallback on warning container" },
                "success": { "value": "#90be6d", "description": "Fallback success" },
                "on-success": { "value": "#243d1e", "description": "Fallback on success" },
                "success-container": { "value": "#375c2d", "description": "Fallback success container" },
                "on-success-container": { "value": "#daf2ce", "description": "Fallback on success container" },
                "info": { "value": "#577590", "description": "Fallback info" },
                "on-info": { "value": "#1a242e", "description": "Fallback on info" },
                "info-container": { "value": "#2d3d4f", "description": "Fallback info container" },
                "on-info-container": { "value": "#d0dce8", "description": "Fallback on info container" },
                "border": { "value": "#8e8e8e", "description": "Fallback border" },
                "border-focus": { "value": "#4a4a4a", "description": "Fallback border focus" },
                "background": { "value": "#121212", "description": "Fallback background" },
                "on-background": { "value": "#e3e3e3", "description": "Fallback on background" },
                "inverse-surface": { "value": "#e3e3e3", "description": "Fallback inverse surface" },
                "inverse-on-surface": { "value": "#2d2d2d", "description": "Fallback inverse on surface" },
                "inverse-primary": { "value": "#b85c2f", "description": "Fallback inverse primary" },
                "shadow": { "value": "#000000", "description": "Fallback shadow" },
                "scrim": { "value": "#000000", "description": "Fallback scrim" }
            }
        };
    }

    /**
     * Set theme mode (light or dark)
     */
    function setThemeMode(mode: string) {
        if (mode !== "light" && mode !== "dark" && mode !== "auto") {
            console.warn("[ThemeGenerator] Invalid theme mode:", mode);
            return;
        }

        themeMode = mode;
        console.log("[ThemeGenerator] Theme mode set to:", mode);

        // Regenerate theme with new mode if we have a wallpaper
        if (wallpaperPath && wallpaperPath !== "") {
            generateFromWallpaper(wallpaperPath, mode);
        }
    }
}
