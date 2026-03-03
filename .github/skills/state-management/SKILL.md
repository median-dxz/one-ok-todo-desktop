---
name: state-management
description: Use when writing or modifying store actions, Zustand selectors, Immer mutations, or syncing useAppStore with useReactFlowStateStore (syncWithTimelineSlice). Also covers dual-store pattern, superjson persistence, and node status derivation logic.
---

# Skill: State Management & Logic

## Overview
- **Store**: Zustand with `immer` and `persist` middleware.
- **Serialization**: `superjson` for rich types (Date, Set, Map).
- **Data Model**: `TimelineGroup` -> `Timeline` -> `TaskNode` -> `SubTask`.

### Dual-store (React Flow)
- Persistent app data lives in `useAppStore` (`src/store/index.ts`).
- React Flow UI state lives in `useReactFlowStateStore` (`src/store/reactFlowStore.ts`) and is synced via `syncWithTimelineSlice()`.

## Implementation Patterns
### State Mutations
- Use `immer` (via `produce` or direct mutation in store actions) for complex state updates.
- Example:
  ```typescript
  updateTimeline: (id, updater) => set(produce((state) => {
    const timeline = findTimeline(state, id);
    if (timeline) updater(timeline);
  }))
  ```

### Selectors
- Use fine-grained selectors to prevent unnecessary re-renders.
- `const task = useAppStore(s => s.tasks.find(t => t.id === id))`.

### Business Logic
- Status calculation (locked/todo/done) must be derived or computed in store actions using utility functions from `src/utils/`.

Note: in current types the status value is `lock` (not `locked`). See `src/types/timeline.ts`.

## Persistence & Sync
- Data is saved to local disk via Tauri command `save_data_rust`.
- Fallback to IndexedDB (`idb`) for web.
- Use `superjson` for all serialization to avoid losing `Date` and `Set` instances.
