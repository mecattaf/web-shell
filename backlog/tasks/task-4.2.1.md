---
id: task-4.2.1
title: Bundle and distribute qwebchannel.js with SDK
status: To Do
created_date: 2025-01-19
milestone: milestone-4
assignees: []
labels: [sdk, packaging]
dependencies: [task-4.2]
---

## Description

Package the Qt WebChannel JavaScript library (`qwebchannel.js`) with the WebShell SDK and provide multiple distribution methods for web apps to consume it.

**Critical**: Without this, web apps cannot initialize the bridge to communicate with QML.

## Acceptance Criteria

- [ ] qwebchannel.js bundled with SDK npm package
- [ ] Available via npm import
- [ ] Available via CDN
- [ ] Available as qrc:// resource
- [ ] TypeScript definitions included
- [ ] Works with all major bundlers (Vite, Webpack, Rollup)
- [ ] Documentation for all import methods

## Implementation Plan

1. **Extract qwebchannel.js from Qt**

**Location in Qt installation**:
```bash
# Find qwebchannel.js
find /usr -name "qwebchannel.js" 2>/dev/null
# Typically: /usr/share/qt6/resources/qwebchannel.js
# OR: /usr/lib/qt6/qml/QtWebChannel/qwebchannel.js
```

Copy to SDK:
```bash
mkdir -p sdk/vendor
cp /path/to/qwebchannel.js sdk/vendor/qwebchannel.js
```

2. **Create TypeScript Definitions**

**File**: `sdk/vendor/qwebchannel.d.ts`
```typescript
declare class QWebChannel {
  constructor(
    transport: any,
    initCallback: (channel: QWebChannel) => void
  );
  
  objects: {
    [key: string]: any;
  };
}

export default QWebChannel;

declare global {
  interface Window {
    qt: {
      webChannelTransport: any;
    };
  }
}
```

3. **Create ES Module Wrapper**

**File**: `sdk/src/vendor/qwebchannel.ts`
```typescript
/**
 * Qt WebChannel JavaScript API
 * 
 * This is the official Qt WebChannel library packaged for WebShell.
 * It enables communication between JavaScript and QML via QtWebChannel.
 */

// Import the raw qwebchannel.js
import qwebchannelRaw from './qwebchannel.js?raw';

// Execute in global scope
if (typeof window !== 'undefined' && !window.QWebChannel) {
  const script = document.createElement('script');
  script.textContent = qwebchannelRaw;
  document.head.appendChild(script);
}

// Export the constructor
export const QWebChannel = (window as any).QWebChannel;
export default QWebChannel;
```

4. **Add to SDK Package**

**Update**: `package.json`
```json
{
  "name": "webshell-sdk",
  "version": "1.0.0",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./qwebchannel": {
      "import": "./dist/qwebchannel.mjs",
      "require": "./dist/qwebchannel.js",
      "types": "./dist/qwebchannel.d.ts"
    }
  },
  "files": [
    "dist",
    "vendor/qwebchannel.js",
    "vendor/qwebchannel.d.ts"
  ]
}
```

5. **Create Multiple Import Methods**

**Method 1: NPM Import** (recommended)
```typescript
import QWebChannel from 'webshell-sdk/qwebchannel';

new QWebChannel(window.qt.webChannelTransport, (channel) => {
  // Use channel
});
```

**Method 2: Script Tag**
```html
<script src="node_modules/webshell-sdk/vendor/qwebchannel.js"></script>
<script>
  new QWebChannel(qt.webChannelTransport, (channel) => {
    // Use channel
  });
</script>
```

**Method 3: CDN** (for quick prototyping)
```html
<script src="https://cdn.jsdelivr.net/npm/webshell-sdk@1/vendor/qwebchannel.js"></script>
```

**Method 4: qrc:// Resource** (production builds)

Create Qt resource file:

**File**: `sdk/resources/qwebchannel.qrc`
```xml
<!DOCTYPE RCC>
<RCC version="1.0">
  <qresource prefix="/webshell">
    <file>qwebchannel.js</file>
  </qresource>
</RCC>
```

In QML:
```qml
WebEngineView {
    onLoadingChanged: {
        if (loadRequest.status === WebEngineView.LoadSucceededStatus) {
            // Inject qwebchannel.js
            runJavaScript(loadQWebChannelSource());
        }
    }
}

function loadQWebChannelSource() {
    const file = Qt.resolvedUrl("qrc:/webshell/qwebchannel.js");
    const xhr = new XMLHttpRequest();
    xhr.open("GET", file, false); // Synchronous
    xhr.send();
    return xhr.responseText;
}
```

6. **Update Bridge to Auto-Inject**

**File**: `src/bridge.ts`
```typescript
export class Bridge {
  async initialize(): Promise<void> {
    // Check if QWebChannel is available
    if (typeof (window as any).QWebChannel === 'undefined') {
      // Auto-inject if not present
      await this.injectQWebChannel();
    }
    
    return new Promise((resolve, reject) => {
      if (!window.qt || !window.qt.webChannelTransport) {
        reject(new Error('QtWebChannel transport not available'));
        return;
      }
      
      const QWebChannel = (window as any).QWebChannel;
      new QWebChannel(window.qt.webChannelTransport, (channel) => {
        this.channel = channel;
        this.shell = channel.objects.shell;
        
        if (!this.shell) {
          reject(new Error('Shell API not available'));
          return;
        }
        
        this.setupEventForwarding();
        resolve();
      });
    });
  }
  
  private async injectQWebChannel(): Promise<void> {
    // Try to load from multiple sources
    const sources = [
      'qrc:/webshell/qwebchannel.js',  // Production qrc://
      '/qwebchannel.js',                // Served by dev server
      'node_modules/webshell-sdk/vendor/qwebchannel.js'  // Local
    ];
    
    for (const src of sources) {
      try {
        await this.loadScript(src);
        if (typeof (window as any).QWebChannel !== 'undefined') {
          console.log('[Bridge] Loaded QWebChannel from:', src);
          return;
        }
      } catch (err) {
        console.warn('[Bridge] Failed to load from:', src);
      }
    }
    
    throw new Error('Could not load qwebchannel.js');
  }
  
  private loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load: ${src}`));
      document.head.appendChild(script);
    });
  }
}
```

7. **Add to Build Process**

**Update**: `vite.config.ts` (or equivalent)
```typescript
export default {
  build: {
    rollupOptions: {
      external: ['qwebchannel'],
      output: {
        globals: {
          qwebchannel: 'QWebChannel'
        }
      }
    }
  },
  resolve: {
    alias: {
      'qwebchannel': path.resolve(__dirname, 'vendor/qwebchannel.js')
    }
  }
}
```

8. **Create Documentation**

**File**: `docs/qwebchannel.md`
```markdown
# QWebChannel Integration

## What is QWebChannel?

QWebChannel is Qt's official JavaScript library for communicating between web content and QML/C++. The WebShell SDK packages this library for easy consumption.

## Installation

QWebChannel is automatically included when you install the WebShell SDK:

```bash
npm install webshell-sdk
```

## Usage

### Automatic (Recommended)

The SDK's Bridge class automatically loads and initializes QWebChannel:

```typescript
import { webshell } from 'webshell-sdk';

// QWebChannel is automatically loaded
webshell.ready(() => {
  console.log('Bridge ready!');
});
```

### Manual Import

If you need direct access to QWebChannel:

```typescript
import QWebChannel from 'webshell-sdk/qwebchannel';

new QWebChannel(window.qt.webChannelTransport, (channel) => {
  const api = channel.objects.shell;
  console.log('App name:', api.getAppName());
});
```

### Script Tag (No Build System)

```html
<!DOCTYPE html>
<html>
<head>
  <script src="node_modules/webshell-sdk/vendor/qwebchannel.js"></script>
</head>
<body>
  <script>
    new QWebChannel(qt.webChannelTransport, function(channel) {
      var api = channel.objects.shell;
      console.log('App name:', api.getAppName());
    });
  </script>
</body>
</html>
```

## Troubleshooting

### "QWebChannel is not defined"

**Cause**: qwebchannel.js not loaded
**Solution**: Ensure WebShell SDK is installed and bridge is initialized

### "qt.webChannelTransport is undefined"

**Cause**: Not running inside WebShell
**Solution**: Only run in WebShell environment, not regular browser

### TypeScript errors with QWebChannel

**Cause**: Missing type definitions
**Solution**: Install WebShell SDK types:
```bash
npm install --save-dev webshell-sdk
```

## Version Compatibility

| WebShell Version | QWebChannel Version | Qt Version |
|------------------|---------------------|------------|
| 1.x              | 5.15+               | Qt 6.6+    |

## License

QWebChannel is licensed under LGPL. See Qt licensing for details.
```

## Technical Notes

**Qt Version Compatibility**:
- Qt 5.15+ uses older qwebchannel.js API
- Qt 6.x uses newer API (minor differences)
- SDK should support both if targeting multiple Qt versions

**Bundler Considerations**:
- Mark as external if QML will inject it
- Bundle if serving standalone

**Size**:
- qwebchannel.js is ~15KB minified
- Negligible impact on bundle size

**Auto-Injection Strategy**:
QML can inject qwebchannel.js before loading app:
```qml
WebEngineView {
    userScripts: [
        WebEngineScript {
            name: "qwebchannel"
            sourceUrl: "qrc:/webshell/qwebchannel.js"
            injectionPoint: WebEngineScript.DocumentCreation
            worldId: WebEngineScript.MainWorld
        }
    ]
}
```

## Reference Material

Qt Documentation:
- Qt WebChannel Overview: https://doc.qt.io/qt-6/qtwebchannel-index.html
- QWebChannel JavaScript API: https://doc.qt.io/qt-6/qtwebchannel-javascript.html

Extract from Qt source:
```bash
# Qt 6 location
/usr/share/qt6/resources/qwebchannel.js
```

## Definition of Done

- qwebchannel.js extracted and bundled
- TypeScript definitions created
- Multiple import methods work
- Auto-injection implemented
- Documentation written
- Tested with Vite, Webpack, and script tags
- Git commit: "task-4.2.1: Bundle qwebchannel.js with SDK"

