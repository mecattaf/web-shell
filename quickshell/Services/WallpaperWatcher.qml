pragma Singleton
pragma ComponentBehavior: Bound
import QtQuick
import Quickshell
import Quickshell.Io

QtObject {
    id: root

    property string wallpaperPath: ""
    property string wallpaperSource: "unknown" // "hyprpaper", "swww", "feh", "nitrogen", etc.
    property bool watching: false

    signal wallpaperChanged(string newPath)

    Component.onCompleted: {
        console.log("[WallpaperWatcher] Initializing wallpaper watcher");
        detectWallpaper();
        startWatching();
    }

    /**
     * Detect current wallpaper from various sources
     */
    function detectWallpaper() {
        // Try multiple wallpaper sources in order of preference
        detectHyprpaperWallpaper();
    }

    /**
     * Start watching for wallpaper changes
     */
    function startWatching() {
        if (watching) {
            console.warn("[WallpaperWatcher] Already watching");
            return;
        }

        watching = true;
        console.log("[WallpaperWatcher] Started watching for wallpaper changes");

        // Set up a timer to periodically check for wallpaper changes
        // This is a simple polling approach that works with all wallpaper setters
        wallpaperCheckTimer.running = true;
    }

    /**
     * Stop watching for wallpaper changes
     */
    function stopWatching() {
        watching = false;
        wallpaperCheckTimer.running = false;
        console.log("[WallpaperWatcher] Stopped watching");
    }

    /**
     * Manually set wallpaper path
     */
    function setWallpaper(path: string) {
        if (path && path !== "" && path !== wallpaperPath) {
            console.log("[WallpaperWatcher] Wallpaper set manually:", path);
            wallpaperPath = path;
            wallpaperSource = "manual";
            wallpaperChanged(path);
        }
    }

    /**
     * Detect Hyprpaper wallpaper (Hyprland)
     */
    function detectHyprpaperWallpaper() {
        // Try hyprctl to get current wallpaper
        const hyprctlProcess = new Process({
            command: ["hyprctl", "hyprpaper", "listactive"]
        });

        hyprctlProcess.running = true;

        hyprctlProcess.exited.connect((exitCode, exitStatus) => {
            if (exitCode === 0) {
                const output = hyprctlProcess.stdout.trim();
                parseHyprpaperOutput(output);
            } else {
                // Hyprpaper not available, try other sources
                detectSwwwWallpaper();
            }
            hyprctlProcess.running = false;
        });
    }

    /**
     * Parse hyprpaper output to extract wallpaper path
     */
    function parseHyprpaperOutput(output: string) {
        // Hyprpaper output format: "MONITOR = /path/to/wallpaper.jpg"
        const lines = output.split('\n');
        if (lines.length > 0) {
            const firstLine = lines[0];
            const parts = firstLine.split('=');
            if (parts.length >= 2) {
                const path = parts[1].trim();
                if (path && path !== wallpaperPath) {
                    console.log("[WallpaperWatcher] Detected Hyprpaper wallpaper:", path);
                    wallpaperPath = path;
                    wallpaperSource = "hyprpaper";
                    wallpaperChanged(path);
                }
            }
        }
    }

    /**
     * Detect swww wallpaper (Wayland)
     */
    function detectSwwwWallpaper() {
        // Try swww query
        const swwwProcess = new Process({
            command: ["swww", "query"]
        });

        swwwProcess.running = true;

        swwwProcess.exited.connect((exitCode, exitStatus) => {
            if (exitCode === 0) {
                const output = swwwProcess.stdout.trim();
                parseSwwwOutput(output);
            } else {
                // swww not available, try other sources
                detectFehWallpaper();
            }
            swwwProcess.running = false;
        });
    }

    /**
     * Parse swww output to extract wallpaper path
     */
    function parseSwwwOutput(output: string) {
        // swww output format: "monitor: image: /path/to/wallpaper.jpg"
        const lines = output.split('\n');
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line.includes("image:")) {
                const parts = line.split("image:");
                if (parts.length >= 2) {
                    const path = parts[1].trim();
                    if (path && path !== wallpaperPath) {
                        console.log("[WallpaperWatcher] Detected swww wallpaper:", path);
                        wallpaperPath = path;
                        wallpaperSource = "swww";
                        wallpaperChanged(path);
                        return;
                    }
                }
            }
        }
    }

    /**
     * Detect feh wallpaper (X11)
     */
    function detectFehWallpaper() {
        // Try reading ~/.fehbg
        const homeDir = Qt.getenv("HOME");
        const fehbgPath = homeDir + "/.fehbg";

        // Note: Reading files directly in QML requires FileIO or Process
        // We'll use a process to read the file
        const catProcess = new Process({
            command: ["cat", fehbgPath]
        });

        catProcess.running = true;

        catProcess.exited.connect((exitCode, exitStatus) => {
            if (exitCode === 0) {
                const output = catProcess.stdout.trim();
                parseFehbgOutput(output);
            } else {
                // feh not available, try nitrogen
                detectNitrogenWallpaper();
            }
            catProcess.running = false;
        });
    }

    /**
     * Parse .fehbg file to extract wallpaper path
     */
    function parseFehbgOutput(output: string) {
        // .fehbg format: feh --bg-scale '/path/to/wallpaper.jpg'
        const lines = output.split('\n');
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line.includes("feh") && line.includes("--bg")) {
                // Extract path between quotes
                const matches = line.match(/['"]([^'"]+)['"]/);
                if (matches && matches.length > 1) {
                    const path = matches[1];
                    if (path && path !== wallpaperPath) {
                        console.log("[WallpaperWatcher] Detected feh wallpaper:", path);
                        wallpaperPath = path;
                        wallpaperSource = "feh";
                        wallpaperChanged(path);
                        return;
                    }
                }
            }
        }
    }

    /**
     * Detect nitrogen wallpaper (X11)
     */
    function detectNitrogenWallpaper() {
        // Try reading ~/.config/nitrogen/bg-saved.cfg
        const homeDir = Qt.getenv("HOME");
        const nitrogenPath = homeDir + "/.config/nitrogen/bg-saved.cfg";

        const catProcess = new Process({
            command: ["cat", nitrogenPath]
        });

        catProcess.running = true;

        catProcess.exited.connect((exitCode, exitStatus) => {
            if (exitCode === 0) {
                const output = catProcess.stdout.trim();
                parseNitrogenOutput(output);
            } else {
                console.log("[WallpaperWatcher] No wallpaper source detected");
            }
            catProcess.running = false;
        });
    }

    /**
     * Parse nitrogen config to extract wallpaper path
     */
    function parseNitrogenOutput(output: string) {
        // nitrogen format: file=/path/to/wallpaper.jpg
        const lines = output.split('\n');
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line.startsWith("file=")) {
                const path = line.substring(5).trim();
                if (path && path !== wallpaperPath) {
                    console.log("[WallpaperWatcher] Detected nitrogen wallpaper:", path);
                    wallpaperPath = path;
                    wallpaperSource = "nitrogen";
                    wallpaperChanged(path);
                    return;
                }
            }
        }
    }

    /**
     * Timer to periodically check for wallpaper changes
     */
    Timer {
        id: wallpaperCheckTimer
        interval: 5000 // Check every 5 seconds
        running: false
        repeat: true

        onTriggered: {
            if (watching) {
                // Re-detect wallpaper to check for changes
                const previousPath = wallpaperPath;
                detectWallpaper();

                // If path changed, wallpaperChanged signal will be emitted
                // by the detect functions
            }
        }
    }

    /**
     * Debounce timer to avoid too frequent updates
     */
    Timer {
        id: debounceTimer
        interval: 1000 // 1 second debounce
        running: false
        repeat: false

        property string pendingPath: ""

        onTriggered: {
            if (pendingPath && pendingPath !== "") {
                wallpaperChanged(pendingPath);
                pendingPath = "";
            }
        }
    }
}
