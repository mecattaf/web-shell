---
id: milestone-4
title: WebShell JS SDK - Developer API
status: To Do
created_date: 2025-01-18
---

## Description

Create the JavaScript SDK that web developers use to interact with the shell. This is the public API surface that makes WebShell development ergonomic.

**Developer Experience**: `import { shell } from 'webshell';` then access shell services.

## Goals

1. Clean, typed JavaScript/TypeScript API
2. Core modules: window, theme, notifications, etc.
3. Promise-based async patterns
4. Comprehensive documentation
5. Example apps demonstrating usage

## Reference Repositories

- DankMaterialShell IPC:
  - Study: `docs/IPC.md`
  - Study: `quickshell/DMSShellIPC.qml`
- Fabric Bridge:
  - Study: Previous conversation (window.fabric.bridge pattern)

## Success Criteria

- [ ] `webshell` npm package structure
- [ ] TypeScript definitions for all APIs
- [ ] Core modules implemented (window, theme, shell, system)
- [ ] Promise-based async operations
- [ ] Error handling and edge cases
- [ ] API documentation with examples
- [ ] At least 3 example apps

## Tasks

- task-4.1: Design SDK API surface
- task-4.2: Implement core shell module
- task-4.3: Implement window management API
- task-4.4: Implement theme API
- task-4.5: Implement system services API
- task-4.6: Add TypeScript definitions
- task-4.7: Create example apps (Hello World, Calendar, System Monitor)
- task-4.8: Write comprehensive API docs

## Dependencies

- Requires: milestone-1 (bridge implementation)
- Requires: milestone-2 (theme system)
- Requires: milestone-3 (manifest for examples)

## Notes

- API should feel natural to web developers
- Consider React hooks for common patterns
- Document migration from Fabric bridge
