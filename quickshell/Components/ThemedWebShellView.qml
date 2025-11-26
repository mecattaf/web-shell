// ThemedWebShellView.qml - WebShellView wrapper with automatic theme propagation
// Listens to WebShellTheme changes and pushes updates to the WebView
pragma ComponentBehavior: Bound
import QtQuick
import qs.Services

WebShellView {
    id: themedView

    // Whether to automatically inject theme on load
    property bool autoInjectTheme: true

    // Whether to push theme updates to WebView in real-time
    property bool liveThemeUpdates: true

    /**
     * Inject current theme into WebView
     * This makes the theme available to the web application via window.webShellTheme
     */
    function injectTheme() {
        const themeData = WebShellTheme.toJSON()
        const themeJson = JSON.stringify(themeData)

        // Inject theme into window object
        const script = `
            (function() {
                // Create or update window.webShellTheme
                window.webShellTheme = ${themeJson};

                // Dispatch custom event for web apps to react to
                const event = new CustomEvent('webshellthemeupdate', {
                    detail: window.webShellTheme
                });
                window.dispatchEvent(event);

                // Log for debugging
                console.log('[WebShell] Theme updated:', window.webShellTheme);
            })();
        `

        // Run in the WebView
        const webview = themedView.children[0]  // WebEngineView is first child
        if (webview && webview.runJavaScript) {
            webview.runJavaScript(script, (result) => {
                console.log("ThemedWebShellView: Theme injected successfully")
            })
        }
    }

    /**
     * Create CSS custom properties from theme
     * This allows web apps to use CSS variables like var(--color-primary)
     */
    function injectThemeCSS() {
        const theme = WebShellTheme.toJSON()

        // Build CSS custom properties
        let cssVars = ':root {\n'

        // Colors
        if (theme.colors) {
            for (const [key, value] of Object.entries(theme.colors)) {
                const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase()
                cssVars += `  --color-${cssKey}: ${value};\n`
            }
        }

        // Spacing
        if (theme.spacing) {
            for (const [key, value] of Object.entries(theme.spacing)) {
                cssVars += `  --space-${key}: ${value}px;\n`
            }
        }

        // Typography
        if (theme.typography) {
            if (theme.typography.fontFamily) {
                for (const [key, value] of Object.entries(theme.typography.fontFamily)) {
                    cssVars += `  --font-family-${key}: ${value};\n`
                }
            }
            if (theme.typography.fontSize) {
                for (const [key, value] of Object.entries(theme.typography.fontSize)) {
                    cssVars += `  --font-size-${key}: ${value}px;\n`
                }
            }
            if (theme.typography.fontWeight) {
                for (const [key, value] of Object.entries(theme.typography.fontWeight)) {
                    cssVars += `  --font-weight-${key}: ${value};\n`
                }
            }
            if (theme.typography.lineHeight) {
                for (const [key, value] of Object.entries(theme.typography.lineHeight)) {
                    cssVars += `  --line-height-${key}: ${value};\n`
                }
            }
        }

        // Border radius
        if (theme.border && theme.border.radius) {
            for (const [key, value] of Object.entries(theme.border.radius)) {
                cssVars += `  --radius-${key}: ${value}px;\n`
            }
        }

        // Border width
        if (theme.border && theme.border.width) {
            for (const [key, value] of Object.entries(theme.border.width)) {
                cssVars += `  --border-width-${key}: ${value}px;\n`
            }
        }

        // Animation
        if (theme.animation) {
            if (theme.animation.duration) {
                for (const [key, value] of Object.entries(theme.animation.duration)) {
                    cssVars += `  --animation-duration-${key}: ${value}ms;\n`
                }
            }
            if (theme.animation.easing) {
                for (const [key, value] of Object.entries(theme.animation.easing)) {
                    cssVars += `  --animation-easing-${key}: ${value};\n`
                }
            }
        }

        cssVars += '}\n'

        // Inject CSS into page
        const script = `
            (function() {
                // Remove old theme style if exists
                const oldStyle = document.getElementById('webshell-theme-vars');
                if (oldStyle) {
                    oldStyle.remove();
                }

                // Create new style element
                const style = document.createElement('style');
                style.id = 'webshell-theme-vars';
                style.textContent = ${JSON.stringify(cssVars)};

                // Add to document
                if (document.head) {
                    document.head.appendChild(style);
                } else {
                    document.addEventListener('DOMContentLoaded', () => {
                        document.head.appendChild(style);
                    });
                }
            })();
        `

        const webview = themedView.children[0]
        if (webview && webview.runJavaScript) {
            webview.runJavaScript(script, (result) => {
                console.log("ThemedWebShellView: Theme CSS variables injected")
            })
        }
    }

    /**
     * Update theme in WebView (both JS object and CSS variables)
     */
    function updateTheme() {
        injectTheme()
        injectThemeCSS()
    }

    // Listen for theme changes
    Connections {
        target: WebShellTheme
        enabled: themedView.liveThemeUpdates

        function onThemeChanged() {
            console.log("ThemedWebShellView: Theme changed, pushing to WebView")
            themedView.updateTheme()
        }
    }

    // Inject theme when page loads
    onReady: {
        if (themedView.autoInjectTheme) {
            console.log("ThemedWebShellView: Page ready, injecting theme")
            // Use Qt.callLater to ensure DOM is fully loaded
            Qt.callLater(() => themedView.updateTheme())
        }
    }

    Component.onCompleted: {
        console.log("ThemedWebShellView: Initialized with theme support")
    }
}
