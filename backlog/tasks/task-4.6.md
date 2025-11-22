---
id: task-4.6
title: Add TypeScript definitions
status: To Do
created_date: 2025-01-18
milestone: milestone-4
assignees: []
labels: [sdk, typescript]
dependencies: [task-4.2, task-4.3, task-4.4, task-4.5]
---

## Description

Create comprehensive TypeScript definition files for the entire WebShell SDK. This provides type safety, autocomplete, and inline documentation for developers.

## Acceptance Criteria

- [ ] Complete .d.ts files for all modules
- [ ] All interfaces and types documented with JSDoc
- [ ] Generic types where appropriate
- [ ] Proper module exports
- [ ] Works with both TypeScript and JavaScript projects
- [ ] Published types validate without errors
- [ ] Examples in docs use correct types

## Implementation Plan

1. **Create Main Declaration File**
   - Create `src/index.d.ts` as main entry point
   - Export all module types
   - Define webshell namespace
   - Add version constant type

2. **Module Type Definitions**
   - `types/shell.d.ts` - ShellModule, AppInfo, Manifest, AppMessage
   - `types/window.d.ts` - WindowModule, WindowSize, WindowPosition, WindowConfig
   - `types/theme.d.ts` - ThemeModule, Theme, all token interfaces
   - `types/calendar.d.ts` - CalendarModule, CalendarEvent, CreateEventInput
   - `types/notifications.d.ts` - NotificationModule, NotificationOptions
   - `types/power.d.ts` - PowerModule, BatteryStatus
   - `types/system.d.ts` - SystemModule, SystemInfo, MemoryInfo
   - `types/errors.d.ts` - WebShellError, error code enums

3. **JSDoc Comments**
   - Add comprehensive JSDoc to all public methods
   - Include @param descriptions
   - Include @returns descriptions
   - Add @throws for error cases
   - Include @example for complex methods

4. **Generic Types**
   - Make event handler types generic where appropriate
   - Use utility types (Partial, Pick, Omit) for update methods
   - Define branded types for IDs

5. **Package Configuration**
   - Update package.json with "types" field
   - Ensure tsconfig.json generates declarations correctly
   - Test with tsc --noEmit

6. **React Types** (if creating React hooks)
   - Create `react/index.d.ts`
   - Define hook return types
   - Export React-specific utilities

## Technical Notes

**JSDoc Example**:
```typescript
/**
 * Creates a new calendar event
 * @param event - Event details including title, start, end times
 * @returns Promise resolving to the created event with assigned ID
 * @throws {WebShellError} PERMISSION_DENIED if calendar.write not granted
 * @example
 * const event = await calendar.createEvent({
 *   title: "Meeting",
 *   start: new Date("2025-01-20T10:00"),
 *   end: new Date("2025-01-20T11:00")
 * });
 */
createEvent(event: CreateEventInput): Promise<CalendarEvent>;
```

**Module Augmentation**:
Support window.webshell global:
```typescript
declare global {
  interface Window {
    webshell: typeof import('./index').webshell;
  }
}
```

**Type Validation**:
Run type checks in CI:
```bash
tsc --noEmit
```

## Reference Material

Study well-typed SDKs:
- @types/node
- Electron's TypeScript definitions
- Tauri API types

## Definition of Done

- All .d.ts files created
- JSDoc comments complete
- Types validate without errors
- Works in both TS and JS projects
- Published to npm with types
- Git commit: "task-4.6: Add TypeScript definitions"
