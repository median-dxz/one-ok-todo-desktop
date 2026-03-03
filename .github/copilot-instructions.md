# One Ok Todo - AI Coding Instructions

## Project Overview
- **Type**: Tauri v2 desktop app (React 19 + Rust) with web fallback.
- **Stack**: TypeScript, Vite, Chakra UI v3, Zustand, `@xyflow/react`, Zod, superjson.
- **Dev environment**: Windows, pwsh terminal, `pnpm` package manager.
- **Path alias**: `@/*` → `./src/*` (configured in `tsconfig.json`, resolved by `vite-tsconfig-paths`).

## Architecture

### Data Model & Node Graph
`TimelineGroup` → `Timeline` (task | recurrence) → `TimelineNode` (TaskNode | DelimiterNode) → `SubTask`.
- Nodes form a **dependency DAG** via `prevs`/`succs` arrays (node IDs). See `src/types/timeline.ts`.
- **Node status values**: `todo` | `done` | `skipped` | `lock` (see `src/types/timeline.ts`).
- **Status derivation (intended)**: `lock` (any prev not done/skipped) → `todo` (all prevs done/skipped) → `done`/`skipped` (user-set). If you implement/adjust this logic, keep it in `src/utils/` or store actions, **never in components**.
- IDs generated with `nanoid()`. Factory functions: `createTaskTimeline()`, `createTaskNode()`, `createTimelineGroup()` in `src/store/timelineSlice.ts`.
- Zod validation schemas mirror types in `src/types/schemas.ts`.

### Dual-Store Pattern
1. **`useAppStore`** (`src/store/index.ts`): Persistent data store. Zustand + `immer` + `persist`. Composed from slices: `appSlice`, `memoSlice`, `timelineSlice`. Mutate state directly in actions (immer).
2. **`useReactFlowStateStore`** (`src/store/reactFlowStore.ts`): UI bridge for React Flow. Converts `TimelineGroup` → React Flow nodes/edges via `getReactFlowObjects()`. Mutations go through `useAppStore` first, then `syncWithTimelineSlice()` updates the RF store.

Access patterns:
```typescript
// Single field — fine-grained selector
const groupId = useAppStore(s => s.selectedTimelineGroupId);
// Multiple fields — useShallow to prevent extra re-renders
const { nodes, edges } = useReactFlowStore(useShallow(reactFlowSelector));
// Parameterized selector factory
const group = useAppStore(selectTimelineGroupById(groupId));
```

### Persistence (src/utils/storage.ts)
- **Tauri**: `invoke('save_data_rust')` → `Documents/OneOkTodo/data/root-data.json` (Rust in `src-tauri/src/lib.rs`).
- **Web fallback**: IndexedDB via `idb`.
- **Always** serialize with `superjson` to preserve `Date`, `Set`, `Map`.
- `partialize` extracts only `appMetadata`, `memo`, `timelineGroups` for storage.

## UI Conventions
- **Chakra UI v3 only** — use `colorPalette` (not `colorScheme`), import from `@chakra-ui/react`. Provider: `src/components/ui/Provider.tsx`.
- **Icons**: `react-icons/lu` (Lucide). Example: `import { LuPlus } from 'react-icons/lu'`.
- **React Compiler** is enabled (`babel-plugin-react-compiler`). **Do NOT add manual `useMemo`/`useCallback`/`React.memo`** — the compiler handles memoization automatically.
- **No raw CSS for layout** — use Chakra's `Flex`, `Box`, `HStack`, `VStack`, `Grid`.
- **Graph rendering**: `@xyflow/react` in `src/components/timeline/TimelineDisplay.tsx`. Custom node types: `task`, `delimiter`.

## Workflows & Commands
| Task | Command |
|---|---|
| Desktop dev | `pnpm tauri dev` |
| Unit tests (Vitest) | `pnpm test` |
| Unit tests UI | `pnpm test:ui` |
| E2E tests (Playwright) | `pnpm test:e2e` |
| Type check | `pnpm lint:tsc` |
| Lint | `pnpm lint:eslint` |

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
| Area | Path |
|---|---|
| Types & schemas | `src/types/` |
| Business logic | `src/utils/` |
| State (slices) | `src/store/` |
| Components | `src/components/{timeline,memo,ui}/` |
| Rust backend | `src-tauri/src/lib.rs` |
| Unit tests | `tests/ui/{store,components}/` |
| E2E tests | `tests/e2e/` |
