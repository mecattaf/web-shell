// WebShellProfile.qml - Shared WebEngine profile for all WebShell apps
// This implements the "Shared Profile" architecture for memory efficiency
pragma Singleton
import QtQuick
import QtWebEngine

WebEngineProfile {
    id: sharedProfile

    // Persistent storage (not incognito mode)
    storageName: "webshell-shared"
    offTheRecord: false

    // Storage location for cache, cookies, etc.
    persistentStoragePath: StandardPaths.writableLocation(
        StandardPaths.AppDataLocation
    ) + "/webshell"

    // Shared HTTP cache (disk-based)
    httpCacheType: WebEngineProfile.DiskHttpCache
    httpCacheMaximumSize: 100 * 1024 * 1024 // 100MB

    // User agent identification
    httpUserAgent: "WebShell/1.0 (QtWebEngine)"

    // Download handling (disable auto-download for security)
    // Downloads should be handled via manifest permissions

    Component.onCompleted: {
        console.log("[WebShellProfile] Initialized shared profile");
        console.log("[WebShellProfile] Storage path:", persistentStoragePath);
    }
}
