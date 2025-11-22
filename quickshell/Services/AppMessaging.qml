// AppMessaging.qml - Inter-app communication system
// Enables apps to send messages to each other
pragma Singleton
pragma ComponentBehavior: Bound
import QtQuick

/**
 * AppMessaging - Inter-app messaging system
 *
 * Features:
 * - Message routing between apps
 * - Handler registration
 * - Broadcast support
 * - Message queuing (for apps not ready)
 */
QtObject {
    id: root

    // Message handlers registry: { appName: handler }
    property var messageHandlers: ({})

    // Message queue for apps that haven't registered handlers yet
    property var messageQueue: ({})

    // Signals
    signal messageSent(string fromApp, string toApp, string messageType)
    signal messageDelivered(string fromApp, string toApp, string messageType)
    signal messageFailed(string fromApp, string toApp, string messageType, string reason)

    /**
     * Register a message handler for an app
     * @param appName - The application identifier
     * @param handler - Function to handle messages: (message) => void
     */
    function registerHandler(appName, handler) {
        console.log("[AppMessaging] Registering handler for:", appName);

        messageHandlers[appName] = handler;

        // Process any queued messages for this app
        if (messageQueue[appName] && messageQueue[appName].length > 0) {
            console.log(`[AppMessaging] Processing ${messageQueue[appName].length} queued messages for:`, appName);

            const queued = messageQueue[appName];
            messageQueue[appName] = [];

            queued.forEach(msg => {
                deliverMessage(appName, msg);
            });
        }
    }

    /**
     * Unregister a message handler
     * @param appName - The application identifier
     */
    function unregisterHandler(appName) {
        if (messageHandlers[appName]) {
            console.log("[AppMessaging] Unregistering handler for:", appName);
            delete messageHandlers[appName];
        }
    }

    /**
     * Check if an app has a registered handler
     * @param appName - The application identifier
     * @return true if handler is registered
     */
    function hasHandler(appName) {
        return messageHandlers.hasOwnProperty(appName);
    }

    /**
     * Send a message from one app to another
     * @param fromApp - Source application name
     * @param toApp - Target application name
     * @param messageType - Type/category of message
     * @param data - Message payload
     * @return true if delivered, false if queued or failed
     */
    function sendMessage(fromApp, toApp, messageType, data) {
        console.log(`[AppMessaging] ${fromApp} -> ${toApp}: ${messageType}`);

        const message = {
            from: fromApp,
            to: toApp,
            type: messageType,
            data: data || {},
            timestamp: Date.now()
        };

        messageSent(fromApp, toApp, messageType);

        const handler = messageHandlers[toApp];
        if (!handler) {
            console.warn("[AppMessaging] No handler registered for:", toApp);

            // Queue the message for later delivery
            if (!messageQueue[toApp]) {
                messageQueue[toApp] = [];
            }
            messageQueue[toApp].push(message);

            console.log("[AppMessaging] Message queued for:", toApp);
            return false;
        }

        return deliverMessage(toApp, message);
    }

    /**
     * Deliver a message to a registered handler
     * @param appName - Target application name
     * @param message - Message object to deliver
     * @return true if successful, false if error
     */
    function deliverMessage(appName, message) {
        const handler = messageHandlers[appName];
        if (!handler) {
            messageFailed(message.from, appName, message.type, "No handler");
            return false;
        }

        try {
            handler(message);
            messageDelivered(message.from, appName, message.type);
            return true;
        } catch (e) {
            console.error("[AppMessaging] Handler error for", appName, ":", e);
            messageFailed(message.from, appName, message.type, String(e));
            return false;
        }
    }

    /**
     * Broadcast a message to all apps except sender
     * @param fromApp - Source application name
     * @param messageType - Type/category of message
     * @param data - Message payload
     * @return Number of apps that received the message
     */
    function broadcast(fromApp, messageType, data) {
        console.log(`[AppMessaging] Broadcasting from ${fromApp}: ${messageType}`);

        let deliveredCount = 0;

        Object.keys(messageHandlers).forEach(appName => {
            if (appName !== fromApp && appName !== "system") {
                const success = sendMessage(fromApp, appName, messageType, data);
                if (success) {
                    deliveredCount++;
                }
            }
        });

        console.log(`[AppMessaging] Broadcast delivered to ${deliveredCount} apps`);
        return deliveredCount;
    }

    /**
     * Send a request and wait for response (promise-like)
     * Note: QML doesn't have native promises, so this uses callbacks
     * @param fromApp - Source application name
     * @param toApp - Target application name
     * @param requestType - Type of request
     * @param data - Request payload
     * @param callback - Function to call with response: (response) => void
     * @param timeout - Timeout in milliseconds (default: 5000)
     * @return Request ID for tracking
     */
    function sendRequest(fromApp, toApp, requestType, data, callback, timeout) {
        const requestId = generateRequestId();

        console.log(`[AppMessaging] Request ${requestId}: ${fromApp} -> ${toApp}: ${requestType}`);

        // Create timeout timer
        const timeoutMs = timeout || 5000;
        const timer = timerComponent.createObject(root, {
            interval: timeoutMs,
            repeat: false
        });

        let responded = false;

        timer.triggered.connect(() => {
            if (!responded) {
                console.warn(`[AppMessaging] Request ${requestId} timed out`);
                callback({
                    success: false,
                    error: "Request timed out",
                    requestId: requestId
                });
                timer.destroy();
            }
        });

        // Register temporary handler for response
        const originalHandler = messageHandlers[fromApp];
        const responseType = `${requestType}:response`;

        messageHandlers[fromApp] = (message) => {
            // Call original handler for other messages
            if (message.type !== responseType || message.data.requestId !== requestId) {
                if (originalHandler) {
                    originalHandler(message);
                }
                return;
            }

            // This is our response
            responded = true;
            timer.stop();
            timer.destroy();

            console.log(`[AppMessaging] Request ${requestId} received response`);
            callback(message.data);

            // Restore original handler
            messageHandlers[fromApp] = originalHandler;
        };

        // Send the request
        sendMessage(fromApp, toApp, requestType, {
            ...data,
            requestId: requestId,
            expectsResponse: true
        });

        timer.start();

        return requestId;
    }

    /**
     * Send a response to a request
     * @param toApp - Application that made the request
     * @param requestType - Original request type
     * @param requestId - Request ID to respond to
     * @param responseData - Response payload
     */
    function sendResponse(toApp, requestType, requestId, responseData) {
        console.log(`[AppMessaging] Sending response for request ${requestId}`);

        sendMessage("system", toApp, `${requestType}:response`, {
            requestId: requestId,
            ...responseData
        });
    }

    /**
     * Generate a unique request ID
     * @return String request ID
     */
    function generateRequestId() {
        return `req_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    }

    /**
     * Clear message queue for an app
     * @param appName - The application identifier
     */
    function clearQueue(appName) {
        if (messageQueue[appName]) {
            const count = messageQueue[appName].length;
            messageQueue[appName] = [];
            console.log(`[AppMessaging] Cleared ${count} queued messages for:`, appName);
        }
    }

    /**
     * Get queue length for an app
     * @param appName - The application identifier
     * @return Number of queued messages
     */
    function getQueueLength(appName) {
        return messageQueue[appName] ? messageQueue[appName].length : 0;
    }

    /**
     * Get debug information
     * @return String with messaging state
     */
    function getDebugInfo() {
        let info = "App Messaging State:\n";
        info += `  Registered handlers: ${Object.keys(messageHandlers).length}\n`;

        info += "\nHandlers:\n";
        Object.keys(messageHandlers).forEach(appName => {
            info += `  - ${appName}\n`;
        });

        const queuedApps = Object.keys(messageQueue).filter(app => messageQueue[app].length > 0);
        if (queuedApps.length > 0) {
            info += "\nQueued messages:\n";
            queuedApps.forEach(appName => {
                info += `  - ${appName}: ${messageQueue[appName].length} messages\n`;
            });
        }

        return info;
    }

    // Timer component for request timeouts
    Component {
        id: timerComponent
        Timer {}
    }

    Component.onCompleted: {
        console.log("[AppMessaging] Initialized");
    }
}
