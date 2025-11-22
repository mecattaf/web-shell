---
id: milestone-3
title: App Host Layer - Manifest & Permissions System
status: To Do
created_date: 2025-01-18
---

## Description

Implement the manifest system that defines how WebShell apps declare their requirements, permissions, and configuration. This is the "package.json" of the WebShell ecosystem.

**Purpose**: Enables multiple web apps to run as shell widgets/panels with proper sandboxing and configuration.

## Goals

1. WebShell manifest schema (webshell.json)
2. Manifest parser and validator
3. App loader with permission enforcement
4. Window configuration system
5. Multi-app orchestration

## Reference Repositories

- DankMaterialShell Plugin System:
  - Study: `quickshell/PLUGINS/README.md`
  - Study: `quickshell/PLUGINS/*/plugin.json`
  - Study: `quickshell/Services/PluginService.qml`

## Success Criteria

- [ ] webshell.json schema defined with validation
- [ ] Manifest parser implemented in QML
- [ ] Permission system enforces capabilities
- [ ] Multiple apps can coexist
- [ ] Window geometry/blur/transparency configurable
- [ ] Error handling for invalid manifests

## Tasks

- task-3.1: Design webshell.json schema
- task-3.2: Implement manifest parser (QML)
- task-3.3: Build permission system
- task-3.4: Create app loader component
- task-3.5: Implement window configuration
- task-3.6: Add multi-app orchestration
- task-3.7: Write manifest documentation

## Dependencies

- Requires: milestone-1 (needs bridge to load apps)
- Requires: milestone-2 (apps use design tokens)

## Notes

- Study DMS plugin.json but WebShell apps have different needs
- Consider future: app store, dependency management
- Keep permissions simple initially (read, write, network, etc.)
