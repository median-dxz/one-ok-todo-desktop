# One Ok Todo - AI Coding Instructions

## Project Overview

- **Type**: Tauri v2 desktop app (React 19 + Rust) with web fallback.
- **Stack**: TypeScript, Vite, Chakra UI v3, Zustand, `@xyflow/react`, Zod, superjson.
- **Dev environment**: Windows, pwsh terminal, `pnpm` package manager.
- **Path alias**: `@/*` → `./src/*` (configured in `tsconfig.json`, resolved by `vite-tsconfig-paths`).

## Architecture

### Data Model & Node Graph

`TimelineGroup` → `Timeline` (task | recurrence) → `TimelineNode` (TaskNode | DelimiterNode) → `Subtask`.

- **Flattened runtime store**: `groups`, `timelines`, `nodes` are three `Record<string, T>` dictionaries in the store, with `groupOrder: string[]` for ordering. Entities hold `parentId` references (`Timeline.groupId`, `BaseNode.timelineId`). `TimelineGroup.timelineOrder: string[]` tracks ordered timeline IDs. `TimelineFlat.nodeOrder: string[]` arrays manage chronologically ordered nodes.
- **Persisted format**: nested `PersistedTimelineGroup[]` (backward-compatible). Conversion handled by `flattenPersistedData()` / `nestFlatData()` in `src/utils/dataConversion.ts`.
- Nodes form a **dependency DAG** via the `dependsOn` array (node IDs). See `src/types/timeline.ts`.
- **Node status values**: `todo` | `done` | `skipped` | `locked` (see `src/types/timeline.ts`).
- **Engine Architecture**:
  - **State Computation Engine**: Delegate node status resolution (`locked` <-> `todo` cascades) to an isolated, pure-function `GraphEngine`. The store collects diffs from this engine.
  - **Layout Engine**: Positioning calculation for React Flow node generation goes into an isolated layout engine block.
- IDs generated with `nanoid()`. Factory functions: `createTaskTimeline()`, `createTaskNode()`, `createTimelineGroup()` in `src/store/timelineSlice.ts`.
- Zod validation schemas in `src/types/schemas.ts` validate the **persisted** (nested) format. Persisted types in `src/types/persisted.ts`.

### Dual-Store Pattern

1. **`useAppStore`** (`src/store/index.ts`): Persistent data store. Zustand + `immer` + `persist`. Composed from slices: `appSlice`, `memoSlice`, `timelineSlice`. Mutate state directly in actions (immer). Timeline data is stored flat: `groups`, `timelines`, `nodes` (Record dicts) + `groupOrder`.
2. **`useReactFlowStateStore`** (`src/store/reactFlowStore.ts`): UI bridge for React Flow. Subscribes to flat state, reconstructs nested structure via `selectNestedTimelineGroup()`, then converts to React Flow nodes/edges via `getReactFlowObjects()`.

Access patterns:

```typescript
// Single field — fine-grained selector
const groupId = useAppStore((s) => s.selectedTimelineGroupId);
// Multiple fields — useShallow to prevent extra re-renders
const { nodes, edges } = useReactFlowStore(useShallow(reactFlowSelector));
// Parameterized selector factory
const group = useAppStore(selectTimelineGroupById(groupId));
// Get timelines for a group
const timelines = useAppStore(selectTimelinesForGroup(groupId));
```

### Persistence (src/utils/storage/)

- **Tauri**: `invoke('save_data_rust')` → `Documents/OneOkTodo/data/root-data.json` (Rust in `src-tauri/src/lib.rs`).
- **Web fallback**: IndexedDB via `idb`.
- **Multi-source aggregation**: adapter layer over Tauri local file, IndexedDB, and WebDAV; loads from all available sources and picks the latest non-empty dataset.
- **Always** serialize with `superjson` to preserve `Date`, `Set`, `Map`.
- **Anti-corruption layer**: `partialize` calls `nestFlatData()` to convert flat runtime state back to nested `PersistedTimelineGroup[]` for storage. `merge` calls `flattenPersistedData()` on hydration to restore flat state.
- **Schema handling rule**: use Zod recovery for recoverable shape issues (e.g. missing recoverable fields/defaultable values); if unrecoverable, throw an error and surface it in both console and UI toaster (no silent fallback).

## UI Conventions

- **Chakra UI v3 only** — use `colorPalette` (not `colorScheme`), import from `@chakra-ui/react`. Provider: `src/components/ui/Provider.tsx`.
- **Icons**: `react-icons/lu` (Lucide). Example: `import { LuPlus } from 'react-icons/lu'`.
- **React Compiler** is enabled (`babel-plugin-react-compiler`). **Do NOT add manual `useMemo`/`useCallback`/`React.memo`** — the compiler handles memoization automatically.
- **No raw CSS for layout** — use Chakra's `Flex`, `Box`, `HStack`, `VStack`, `Grid`.
- **Graph rendering**: `@xyflow/react` in `src/components/timeline/TimelineDisplay.tsx`. Custom node types: `task`, `delimiter`.

## Workflows & Commands

| Task                   | Command            |
| ---------------------- | ------------------ |
| Desktop dev            | `pnpm tauri dev`   |
| Unit tests (Vitest)    | `pnpm test`        |
| Unit tests UI          | `pnpm test:ui`     |
| E2E tests (Playwright) | `pnpm test:e2e`    |
| Type check             | `pnpm lint:tsc`    |
| Lint                   | `pnpm lint:eslint` |

## TypeScript Rules

- `verbatimModuleSyntax` is ON → **MUST** use `import type { ... }` for type-only imports.
- `strict`, `noUnusedLocals`, `noUnusedParameters` are enabled.
- Short-circuit expressions are allowed: `condition && fn()`.

## Testing Patterns

- **Unit tests** (`tests/ui/`): Vitest + jsdom + `@testing-library/react`.
  - Store tests: call `useAppStore.setState(...)` to seed, `useAppStore.getState().action()` to act, `useAppStore.getState()` to assert. No mocks needed.
  - Component tests: wrap in `<Provider>` (Chakra), pass manually constructed props.
- **E2E tests** (`tests/e2e/`): Playwright. Chinese test descriptions. `page.goto('/')` + `waitForLoadState('networkidle')`.
- Mock Tauri APIs when running in Vitest/web environment.

## File Map

| Area            | Path                                                       |
| --------------- | ---------------------------------------------------------- |
| Types & schemas | `src/types/` (`persisted.ts` for nested persistence types) |
| Business logic  | `src/utils/`                                               |
| State (slices)  | `src/store/`                                               |
| Components      | `src/components/{timeline,memo,ui}/`                       |
| Rust backend    | `src-tauri/src/lib.rs`                                     |
| Unit tests      | `tests/ui/{store,components}/`                             |
| E2E tests       | `tests/e2e/`                                               |

## 额外信息

除非绝对必要，否则禁止使用 Shell 命令工具(`runCommand` 或者 `runTerminal`)。尽一切可能优先使用内置工具。如果真的非 Shell 工具不可，明确中断回复告知用户。

认清职责所在，不要在一轮对话完成完全闭环，严格按照 Plan -> Code -> Test 的步骤来。每一步都要输出明确的结果，等待用户确认后再进入下一步。