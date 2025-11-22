---
id: task-1.1
title: Audit and remove all Fabric dependencies
status: To Do
created_date: 2025-01-18
milestone: milestone-1
assignees: []
labels: [cleanup, migration]
---

## Description

Perform a complete audit of the codebase to identify and remove all Fabric-specific dependencies. This includes Python backend code, Fabric widget imports, and the manual JavaScript bridge.

## Acceptance Criteria

- [ ] No Python files remain (config.py, requirements.txt removed)
- [ ] No Fabric imports in any source files
- [ ] package.json cleaned of Fabric-related dependencies
- [ ] All JavaScript bridge code (window.webkit.messageHandlers) removed
- [ ] Git history preserved with clear commit messages
- [ ] README updated to reflect QuickShell basis

## Implementation Plan

1. **Audit Phase**
   - Run `grep -r "fabric" src/` to find all Fabric references
   - Check `package.json` for Fabric-related packages
   - Identify all Python files

2. **Removal Phase**
   - Delete `config.py`, `requirements.txt`
   - Remove Python-specific files
   - Strip Fabric imports from TypeScript/React files
   - Remove manual bridge code from `src/@types/global.d.ts`

3. **Verification**
   - Ensure project still compiles (even if non-functional)
   - No broken imports
   - Update documentation

## Technical Notes

**Files to Remove**:
- `config.py`
- `requirements.txt`

**Files to Modify**:
- `src/@types/global.d.ts` - remove Fabric bridge types
- `package.json` - remove any Python/Fabric deps
- `README.md` - update project description
- All component files using Fabric bridge

**Bridge Code Pattern to Remove**:
```typescript
// OLD - Remove this pattern
window.fabric.bridge.someFunction()
```

## Reference Material

- Current project structure (see directory listing)
- DMS for reference on clean QML-only projects

## Definition of Done

- All Fabric code removed
- Project compiles without Fabric errors
- Git commit with message: "task-1.1: Remove Fabric dependencies"
- README reflects QuickShell migration
