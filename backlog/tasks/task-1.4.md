---
id: task-1.4
title: Build QtWebChannel bridge layer
status: To Do
created_date: 2025-01-18
milestone: milestone-1
assignees: []
labels: [qml, bridge, critical]
dependencies: [task-1.3]
---

## Description

Implement the QtWebChannel bridge that replaces Fabric's manual message handlers. This enables bidirectional communication between JavaScript and QML.

**Critical Component**: This is the heart of the WebShell architecture.

## Acceptance Criteria

- [ ] QML side: WebChannel configured and exposed objects working
- [ ] JS side: qwebchannel.js integrated
- [ ] Can call QML functions from JavaScript
- [ ] Can receive signals from QML in JavaScript
- [ ] Promise-based async patterns work
- [ ] Error handling for failed calls
- [ ] Example communication working both ways

## Implementation Plan

1. **QML Bridge Setup**
```qml
   // In WebShellView.qml
   import QtWebChannel
   
   WebEngineView {
       webChannel: WebChannel {
           id: channel
           registeredObjects: ({
               "bridge": bridgeObject
           })
       }
   }
   
   QtObject {
       id: bridgeObject
       function echo(msg) { return "QML received: " + msg }
   }
```

2. **JS Bridge Setup**
   - Include qwebchannel.js
   - Initialize channel
   - Wrap in Promise API

3. **Create Bridge Service**
   - QML singleton for bridge logic
   - Expose shell services
   - Handle async operations

4. **Test Both Directions**
   - JS → QML: function calls
   - QML → JS: signal emission

## Technical Notes

**QML Side** (`Services/BridgeService.qml`):
```qml
pragma Singleton
import QtQuick

Singleton {
    id: root
    
    signal notifyJS(string message)
    
    function jsCallsThis(param) {
        console.log("JS called QML:", param)
        return { success: true, data: param }
    }
    
    function emitToJS(msg) {
        notifyJS(msg)
    }
}
```

**JS Side** (`src/bridge/webshell-bridge.ts`):
```typescript
import QWebChannel from 'qwebchannel';

export class WebShellBridge {
    private channel: any;
    private bridge: any;
    
    async initialize() {
        return new Promise((resolve) => {
            new QWebChannel(qt.webChannelTransport, (channel) => {
                this.channel = channel;
                this.bridge = channel.objects.bridge;
                resolve(this.bridge);
            });
        });
    }
    
    async call(method: string, ...args: any[]) {
        return this.bridge[method](...args);
    }
}
```

## Reference Material

**QtWebChannel Documentation**:
- Qt WebChannel Overview
- QML WebChannel API
- qwebchannel.js usage

**Fabric Bridge Pattern** (from research):
- Study the conversation about Fabric's bridge
- Note: We're replacing their manual system with Qt's built-in

**Example Usage Target**:
```typescript
// What developers will write
const bridge = new WebShellBridge();
await bridge.initialize();
const result = await bridge.call('echo', 'Hello');
console.log(result); // "QML received: Hello"
```

## Definition of Done

- QML bridge service created and working
- JS bridge client created and working
- Bidirectional communication verified
- Example code demonstrates usage
- Documentation written
- Git commit: "task-1.4: Implement QtWebChannel bridge"
