# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

One Ok Todo is a timeline-centric task management desktop app built with **Tauri v2** (React 19 + Rust) and a web browser fallback. Tasks form a **dependency DAG** (directed acyclic graph) via a `dependsOn` array on each node. The persistence strategy separates structural sequencing from logical dependencies.

**Stack**: TypeScript, Vite 7, Chakra UI v3, Zustand 5, `@xyflow/react`, Zod 4, superjson, Immer. Package manager: `pnpm`.

## Commands

| Task                  | Command                                     |
| --------------------- | ------------------------------------------- |
| Desktop dev (primary) | `pnpm tauri dev`                            |
| Web-only dev          | `pnpm dev` (Vite on port 1420)              |
| Type check            | `pnpm lint:tsc`                             |
| Lint                  | `pnpm lint:eslint`                          |
| Unit tests            | `pnpm test`                                 |
| Single test file      | `pnpm test tests/ui/store/someFile.test.ts` |
| Unit test UI          | `pnpm test:ui`                              |
| E2E tests             | `pnpm test:e2e`                             |
| Production build      | `pnpm build`                                |

## Architecture

### Dual-Store Pattern (Zustand)

Two stores decouple persistent data from React Flow rendering:

1. **`useAppStore`** (`src/store/index.ts`) — persistent data. Composed from three slices (`appSlice`, `timelineSlice`, `memoSlice`) with `immer` + `persist` middleware. Timeline data stored flat: `groups`, `timelines`, `nodes` (Record dicts) + `groupOrder`. Mutate state directly in actions (immer handles immutability).
2. **`useReactFlowStateStore`** (`src/store/reactFlowStore.ts`) — UI bridge. Subscribes to flat state, reconstructs nested structure via `selectNestedTimelineGroup()`, then converts to React Flow nodes/edges via `getReactFlowObjects()`. Always mutate data through `useAppStore` first.

Store access patterns:

```typescript
// Single field — direct selector
const groupId = useAppStore((s) => s.selectedTimelineGroupId);
// Multiple fields — useShallow to avoid extra re-renders
const { nodes, edges } = useReactFlowStore(useShallow(selector));
// Parameterized — selector factory
const group = useAppStore(selectTimelineGroupById(groupId));
// Get timelines for a group
const timelines = useAppStore(selectTimelinesForGroup(groupId));
// Get nodes for a timeline
const nodes = useAppStore(selectNodesForTimeline(timelineId));
```

### Data Model

`TimelineGroup` → `Timeline` (task | recurrence) → `TimelineNode` (TaskNode | DelimiterNode) → `Subtask`.

**Runtime (flat)**: `groups`, `timelines`, `nodes` are `Record<string, T>` dictionaries with `groupOrder: string[]`. Entities hold parent references (`Timeline.groupId`, `BaseNode.timelineId`). `TimelineGroup.timelineOrder: string[]` for timeline ordering. `TaskTimeline.nodeOrder: string[]` for chronological sequence. Types in `src/types/timeline.ts`.

**Persisted (nested)**: `PersistedTimelineGroup[]` with embedded `timelines` and `nodes` arrays. Types in `src/types/persisted.ts`. Zod schemas in `src/types/schemas.ts` validate this format.

**Conversion**: `flattenPersistedData()` / `nestFlatData()` in `src/utils/dataConversion.ts`.

Node status values: `todo` | `done` | `skipped` | `locked`.

- **State Computation Engine**: Derivation logic (locked→todo→done/skipped) should be extracted into a pure functional `GraphEngine` to resolve DAG cascades independently of Zustand stores. The Store dispatches actions to this engine to compute the diffs and updates state arrays.
- **Layout Engine**: Positioning calculation is moved out of React Flow converters into a dedicated Layout layer to handle complex DAG alignments (vertical chronological/horizontal parallel streams).

IDs generated with `nanoid()`. Factory functions in `src/store/timelineSlice.ts`.

### Persistence Layer (`src/utils/storage/`)

Multi-adapter aggregation architecture with a unified `StorageAdapter` interface:

- **Tauri adapter**: file I/O to `Documents/OneOkTodo/data/root-data.json` (Rust commands in `src-tauri/src/lib.rs`)
- **IndexedDB adapter**: web browser fallback via `idb`
- **WebDAV adapter**: cloud sync (configured via `VITE_WEBDAV_*` env vars)

`getItem()` reads from all available adapters concurrently, validates with Zod, picks the latest non-empty dataset by `lastModified`. `setItem()` broadcasts writes to all adapters. Serialization uses `superjson` to preserve `Date`/`Set`/`Map`. Persistence uses an anti-corruption layer: `partialize` calls `nestFlatData()` to convert flat runtime state to nested `PersistedTimelineGroup[]`; `merge` calls `flattenPersistedData()` on hydration to restore flat state.

**Schema handling rule**: use Zod `.catch()` for recoverable issues (missing/defaultable fields); throw on unrecoverable errors and surface in both console and UI toaster — no silent fallback.

### Path Alias

`@/*` → `./src/*` (tsconfig paths, resolved by `vite-tsconfig-paths`).

## Key Conventions

- **Chakra UI v3**: use `colorPalette` (not `colorScheme`). Layout with `Flex`/`Box`/`HStack`/`VStack`/`Grid` — no raw CSS for layout.
- **React Compiler** is enabled (`babel-plugin-react-compiler`). **Do NOT** add manual `useMemo`/`useCallback`/`React.memo`.
- **Icons**: `react-icons/lu` (Lucide). Example: `import { LuPlus } from 'react-icons/lu'`.
- **TypeScript**: `verbatimModuleSyntax` is ON — **must** use `import type { ... }` for type-only imports. `strict`, `noUnusedLocals`, `noUnusedParameters` enabled.
- **Graph rendering**: `@xyflow/react` with custom node types `task` and `delimiter` in `src/components/timeline/`.

## Testing Patterns

- **Store tests** (`tests/ui/store/`): no mocks needed. Seed with `useAppStore.setState()`, call actions via `getState()`, assert state.
- **Component tests** (`tests/ui/components/`): wrap in `<Provider>` (Chakra), pass manually constructed props.
- **E2E tests** (`tests/e2e/`): Playwright with Chinese test descriptions. Mock Tauri APIs when running in Vitest/web environment.

## File Map

| Area                   | Path                                                       |
| ---------------------- | ---------------------------------------------------------- |
| Types & Zod schemas    | `src/types/` (`persisted.ts` for nested persistence types) |
| Business logic & utils | `src/utils/`                                               |
| Data conversion        | `src/utils/dataConversion.ts`                              |
| Storage adapters       | `src/utils/storage/`                                       |
| State slices           | `src/store/`                                               |
| Components             | `src/components/{timeline,memo,ui}/`                       |
| Rust backend           | `src-tauri/src/lib.rs`                                     |
| Unit tests             | `tests/ui/{store,components}/`                             |
| E2E tests              | `tests/e2e/`                                               |
| Design doc (Chinese)   | `docs/设计文档.md`                                         |
