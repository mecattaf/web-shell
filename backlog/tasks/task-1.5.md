---
id: task-1.5
title: Migrate React app to use new bridge API
status: To Do
created_date: 2025-01-18
milestone: milestone-1
assignees: []
labels: [react, migration]
dependencies: [task-1.4]
---

## Description

Update all React components to use the new QtWebChannel bridge instead of Fabric's bridge. This makes the web app QuickShell-native.

## Acceptance Criteria

- [ ] All components use new bridge API
- [ ] No Fabric bridge references remain
- [ ] Bridge initialization handled properly
- [ ] Error boundaries for bridge failures
- [ ] Loading states while bridge initializes
- [ ] All existing functionality preserved

## Implementation Plan

1. **Create Bridge Context**
```tsx
   // src/contexts/BridgeContext.tsx
   const BridgeContext = createContext<WebShellBridge | null>(null);
   
   export function BridgeProvider({ children }) {
       const [bridge, setBridge] = useState<WebShellBridge | null>(null);
       const [ready, setReady] = useState(false);
       
       useEffect(() => {
           const init = async () => {
               const b = new WebShellBridge();
               await b.initialize();
               setBridge(b);
               setReady(true);
           };
           init();
       }, []);
       
       return <BridgeContext.Provider value={bridge}>
           {ready ? children : <Loading />}
       </BridgeContext.Provider>;
   }
```

2. **Create Custom Hook**
```tsx
   export function useBridge() {
       const bridge = useContext(BridgeContext);
       if (!bridge) throw new Error('Bridge not initialized');
       return bridge;
   }
```

3. **Migrate Components**
   - Update each component in `src/components/`
   - Replace Fabric calls with bridge calls
   - Add error handling

4. **Test Each Component**
   - Verify functionality preserved
   - Test error cases

## Technical Notes

**Migration Pattern**:
```tsx
// OLD (Fabric)
const volume = await window.fabric.bridge.getVolume();

// NEW (QtWebChannel)
const bridge = useBridge();
const volume = await bridge.call('getVolume');
```

**Components to Migrate**:
- [ ] DateTime.tsx
- [ ] Hyprland.tsx
- [ ] Notifications.tsx
- [ ] PlayerControlButtons.tsx
- [ ] PlayerCover.tsx
- [ ] PlayerMetadata.tsx
- [ ] PlayerProgress.tsx
- [ ] SystemStats.tsx
- [ ] Volume.tsx

**Error Handling Pattern**:
```tsx
try {
    const result = await bridge.call('method');
} catch (err) {
    console.error('Bridge call failed:', err);
    // Fallback behavior
}
```

## Reference Material

Study DMS for patterns:
- How they handle async data
- Loading states
- Error boundaries

Current components already have logic - just change the bridge calls.

## Definition of Done

- All components migrated
- Bridge context implemented
- Error handling in place
- App functional with new bridge
- No Fabric references remain
- Git commit: "task-1.5: Migrate React app to QtWebChannel bridge"
