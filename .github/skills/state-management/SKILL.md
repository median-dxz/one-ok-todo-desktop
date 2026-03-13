---
name: state-management
description: Use when writing or modifying store actions, Zustand selectors, Immer mutations, dual-store context (React Flow), types mapping, and node status DAG logic.
---

# Skill: State Management & Types

## Architecture
- **App Store**: Zustand + `immer` + `persist` (`src/store/index.ts`).
- **UI Bridge**: `useReactFlowStateStore` (`src/store/reactFlowStore.ts`) subscribes to the app store, resolving structural alignment for `@xyflow/react`.
- **Logic decoupling**: Status transitions (locked ↔ todo cascades) compute in a pure `GraphEngine`. Layout positioning calculates in an isolated layout engine.

## Data Model: The 4-Layer Architecture
The application strictly separates data shapes based on their lifecycle phase to ensure performance and reliability:

1. **Persistence Layer (Nested)**: `PersistedTimelineGroup[]`
   - Nested JSON structure used exclusively for disk/DB storage.
   - Handled behind the scenes by `partialize` (convert to nested via `nestFlatData`) and `merge` (convert to flat via `flattenPersistedData`). Ensure O(1) reads via `superjson`.
2. **Domain Layer (App Data)**: `TimelineGroup`, `Timeline`, `TimelineNode` (`src/types/timeline.ts`)
   - The standard nested entity shapes (e.g., `TimelineGroup` contains an array of `Timeline` objects). Used heavily by schema generation and as the target structure reconstructed for the React Flow UI bridge.
3. **Store Layer (Flat)**: `FlatTimelineData` & `*Flat` schemas (`src/types/flat.ts`)
   - Normalized flat dictionaries used solely inside `useAppStore`. Essential for performance (O(1) lookups, shallow Immer mutations).
   - `groups: Record<string, TimelineGroupFlat>` (Holds `timelineOrder: string[]`).
   - `timelines: Record<string, TaskTimelineFlat | RecurrenceTimelineFlat>` (Task timelines hold `nodeOrder: string[]`).
   - `nodes: Record<string, TaskNode | DelimiterNode>`.
   - DAG logical relations use `dependsOn` (forward) and `dependedBy` (backward) arrays of IDs.
4. **Form Layer (Draft)**: `*Draft` schemas (`src/types/flat.ts`)
   - Relaxed input shapes (using `z.input`) used strictly for UI form state and data entry (e.g., `TaskNodeDraft`).
   - Allows omitting runtime-controlled fields (like `timelineId`) before dispatching the `add*` action. Store actions validate the Draft and generate the final Flat entity.

## Mutations & Selectors
- **Mutations (Immer)**: Mutate directly in `set(state => ...)`. You do **not** need a explicit `produce` wrapper since middleware is at the root.
  ```typescript
  updateTimeline: (timelineId, recipe) => set((state) => {
    const timeline = state.timelines[timelineId];
    if (timeline) {
      const r = recipe(timeline);
      r && Object.assign(timeline, r); // Fallback for pure function returns
    }
  })
  ```
- **Selectors**: Always prefer fine-grained `selectX(state)` functions to prevent component re-renders. (e.g. lookup dict directly rather than reconstruct nested states everywhere).

## Persistence & Reliability
- **Multi-source adapters**: Aggregates from local **Tauri file** (`root-data.json`), **IndexedDB** (`idb`), and **WebDAV**. Resolves conflicts by picking the latest `lastModified` timestamp. Broadcasts writes to all.
- **Anti-corruption layer**:
  - The store state is strictly `FlatTimelineData`.
  - `partialize` intercepts persist to format to nested `PersistedTimelineGroup[]` utilizing `nestFlatData()`.
  - `merge` calls `flattenPersistedData()` during hydration.
- **Validation**: Schema assertions via Zod. Recoverable faults hit Zod defaults `.catch(...)` rules. Unrecoverable states throw violently rather than failing silently, halting with an error dialog toast.
- **Serialization**: Strictly `superjson` to stringify rich JS objects like `Date`/`Set`.
