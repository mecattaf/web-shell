---
id: milestone-2
title: Seed UI Kit - Design Tokens & Component Library
status: To Do
created_date: 2025-01-18
---

## Description

Create a unified design token system that synchronizes QML and web theming, plus a neutral component library for rapid WebShell app development.

**Why This Matters**: Without design tokens, every web app will have inconsistent styling. This system ensures wallpaper-based theming works across QML and web layers.

## Goals

1. JSON-based design token schema
2. CSS variable generation from tokens
3. QML theme mirror for consistency
4. Neutral component primitives (buttons, cards, inputs)
5. Wallpaper→theme pipeline integration

## Reference Repositories

- DankMaterialShell Theme System:
  - Study: `quickshell/Common/Theme.qml`
  - Study: `docs/CUSTOM_THEMES.md`
  - Extract: Color roles, spacing, typography, elevation

## Success Criteria

- [ ] Design tokens defined in JSON schema
- [ ] CSS variables generated from tokens
- [ ] QML Theme.qml mirrors token values
- [ ] 10+ neutral components (Button, Card, Input, etc.)
- [ ] Theme changes propagate to both QML and web
- [ ] Documentation with usage examples

## Tasks

- task-2.1: Define design token JSON schema
- task-2.2: Extract DMS theme to token format
- task-2.3: Build CSS variable generator
- task-2.4: Create QML theme mirror system
- task-2.5: Implement neutral component library
- task-2.6: Create Storybook-style component showcase
- task-2.7: Write theme integration guide

## Dependencies

- Requires: milestone-1 (bridge must exist to test theme sync)

## Notes

- Tokens should be semantic (e.g., `surface-high`) not concrete (`#1a1a1a`)
- Components should work with any token set
- Consider Material Design 3 principles but don't couple to MD3
