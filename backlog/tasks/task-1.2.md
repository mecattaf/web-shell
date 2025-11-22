---
id: task-1.2
title: Create QuickShell QML shell structure
status: To Do
created_date: 2025-01-18
milestone: milestone-1
assignees: []
labels: [qml, architecture]
dependencies: [task-1.1]
---

## Description

Establish the foundational QuickShell QML project structure that will host the WebEngineView. This creates the native shell layer that the web app runs inside.

## Acceptance Criteria

- [ ] `shell.qml` entry point created
- [ ] QuickShell project structure established
- [ ] Basic window configuration works
- [ ] Can launch with `quickshell -p .`
- [ ] Follows DMS architectural patterns
- [ ] Documentation for QML structure

## Implementation Plan

1. **Create QML Structure**
```
   quickshell/
   ├── shell.qml              # Entry point
   ├── WebShell.qml          # Main shell component
   ├── Services/
   │   └── WebShellService.qml
   └── Components/
       └── WebShellContainer.qml
```

2. **Implement shell.qml**
   - ShellRoot with proper configuration
   - Import WebShell component
   - Basic window setup

3. **Create WebShell.qml**
   - Main shell orchestration
   - Window management
   - Prepare for WebEngineView integration

4. **Follow DMS Patterns**
   - Use `Singleton` for services
   - Use `pragma ComponentBehavior: Bound`
   - Follow QML style guide

## Technical Notes

**shell.qml Template**:
```qml
import QtQuick
import Quickshell

ShellRoot {
    id: root

    WebShell {
        id: webshell
    }
}
```

**Study These DMS Files**:
- `quickshell/shell.qml` - entry point pattern
- `quickshell/DMSShell.qml` - main component pattern
- `quickshell/Services/*.qml` - singleton pattern

**QuickShell Requirements**:
- Qt 6.6+ 
- QtQuick
- QtWebEngine module

## Reference Material

Clone and study:
```bash
git clone https://github.com/quickshell-mirror/quickshell
git clone https://github.com/AvengeMedia/DankMaterialShell

# Study structure:
cd DankMaterialShell/quickshell
tree -L 2
```

Key files to reference:
- `quickshell/shell.qml`
- `quickshell/DMSShell.qml`
- `quickshell/Services/` - singleton pattern
- `quickshell/CLAUDE.md` - QML conventions

## Definition of Done

- QML structure created and documented
- Can launch with `quickshell -p quickshell/`
- Displays empty window (web view comes next)
- Code follows DMS conventions
- Git commit: "task-1.2: Create QuickShell QML structure"
