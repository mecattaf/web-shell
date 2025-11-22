---
id: task-2.1
title: Define design token JSON schema
status: Done
created_date: 2025-01-18
completed_date: 2025-11-19
milestone: milestone-2
assignees: []
labels: [design-system, architecture]
---

## Description

Create the JSON schema that defines all design tokens for the WebShell system. This is the source of truth for colors, spacing, typography, and other design primitives.

## Acceptance Criteria

- [x] JSON schema file created (`design-tokens.schema.json`)
- [x] Schema covers: colors, spacing, typography, elevation, animation
- [x] Schema is well-documented with examples
- [x] Validation rules included
- [x] Example token file created
- [x] Schema versioned for future evolution

## Implementation Plan

1. **Schema Structure**
```json
   {
     "$schema": "http://json-schema.org/draft-07/schema#",
     "title": "WebShell Design Tokens",
     "type": "object",
     "required": ["version", "colors", "spacing", "typography"],
     "properties": {
       "version": { "type": "string", "pattern": "^\\d+\\.\\d+\\.\\d+$" },
       "colors": { ... },
       "spacing": { ... }
     }
   }
```

2. **Token Categories**
   - **Colors**: Semantic roles (surface, primary, error, etc.)
   - **Spacing**: Scale from XS to XL
   - **Typography**: Font families, sizes, weights
   - **Elevation**: Shadow definitions
   - **Border**: Radii for different sizes
   - **Animation**: Timing functions and durations

3. **Create Example**
   - `design-tokens.example.json`
   - Full token set demonstrating schema

## Technical Notes

**Color Token Structure**:
```json
{
  "colors": {
    "surface": {
      "value": "#1a1a1a",
      "description": "Default surface color"
    },
    "surface-high": {
      "value": "#2a2a2a",
      "description": "Elevated surface"
    },
    "primary": { ... },
    "on-primary": { ... }
  }
}
```

**Spacing Scale**:
```json
{
  "spacing": {
    "xs": { "value": "4px" },
    "s": { "value": "8px" },
    "m": { "value": "16px" },
    "l": { "value": "24px" },
    "xl": { "value": "32px" }
  }
}
```

## Reference Material

Study DMS theme:
```bash
cd DankMaterialShell/quickshell
cat Common/Theme.qml | grep "property"
cat docs/CUSTOM_THEMES.md
```

Extract patterns for:
- Color naming (surface, primary, secondary, etc.)
- Spacing scale
- Typography hierarchy

## Definition of Done

- Schema file created and documented
- Example token file validates against schema
- Documentation explains each category
- Git commit: "task-2.1: Define design token JSON schema"
