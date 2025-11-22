---
id: milestone-1
title: WebShell Runtime - QtWebChannel Bridge Implementation
status: To Do
created_date: 2025-01-18
---

## Description

Replace Fabric's manual JavaScript bridge with QuickShell's QtWebChannel architecture. This establishes the foundation for all web-to-native communication.

**Current State**: React+Vite app with Fabric Python backend  
**Target State**: QuickShell QML runtime with QtWebEngine and proper bridge

## Goals

1. Complete removal of Fabric Python dependencies
2. Functional QtWebChannel bidirectional communication
3. WebEngineView properly embedded in QuickShell
4. Transparent background support for compositor integration
5. Basic JS SDK scaffold operational

## Reference Repositories

- QuickShell: `https://github.com/quickshell-mirror/quickshell`
- DankMaterialShell: `https://github.com/AvengeMedia/DankMaterialShell`
  - Study: `quickshell/Modules/*/` for QML patterns
  - Study: `quickshell/Services/` for singleton architecture
  - Study: `quickshell/PLUGINS/*/` for component patterns

## Success Criteria

- [ ] Can load React app in WebEngineView
- [ ] JS can call QML functions via WebChannel
- [ ] QML can emit signals to JS
- [ ] No Fabric/Python code remains
- [ ] Web app renders with proper theming hooks

## Tasks

- task-1.1: Audit and remove all Fabric dependencies
- task-1.2: Create QuickShell QML shell structure
- task-1.3: Implement WebEngineView wrapper component
- task-1.4: Build QtWebChannel bridge layer
- task-1.5: Migrate React app to use new bridge API
- task-1.6: Create integration test suite

## Dependencies

None - this is the foundation milestone.

## Notes

- Focus on establishing the bridge pattern - don't optimize yet
- Transparent background is deferred but architecture should support it
- Keep DMS patterns as reference but don't couple to their implementation
