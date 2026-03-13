# One Ok Todo - GEMINI Coding Instructions

## 🚀 Project Overview

- **Type**: Desktop Application (Tauri v2) with web fallback.
- **Tech Stack**: React 19, TypeScript, Vite, Chakra UI v3, Zustand, Rust.
- **Goal**: A timeline-centric todo application with complex dependency management.
- 工作环境：Windows，使用 `pwsh` (PowerShell) 作为终端类型。使用 `pnpm` 进行包管理。
- **路径别名**: `@/*` 指向 `./src/*`（通过 `vite-tsconfig-paths` 解析）。

## 🏗 Core Architecture & Data Flow

- **Data Model**: `TimelineGroup` -> `Timeline` (task | recurrence) -> `TimelineNode` (TaskNode | DelimiterNode) -> `Subtask`.
  - **Runtime (flat)**: `groups`, `timelines`, `nodes` 三个 `Record<string, T>` 字典 + `groupOrder: string[]`。实体通过 `Timeline.groupId`、`BaseNode.timelineId` 反向引用父级。`TimelineGroup.timelineOrder: string[]` 维护 timeline 顺序。
  - **Persisted (nested)**: 嵌套的 `PersistedTimelineGroup[]`，保持向后兼容。类型在 `src/types/persisted.ts`，转换工具 `flattenPersistedData()` / `nestFlatData()` 在 `src/utils/dataConversion.ts`。
- **Node Status**: 当前支持枚举值为 `todo` | `done` | `skipped` | `locked`。
  - **引擎化架构 (Engine Architecture)**:
    - **状态计算引擎 (State Computation Engine)**: 对于 `locked` -> `todo`，或者用户操作导致的级联反应，需统一交由无副作用的 `GraphEngine` 函数来进行状态转换图计算（计算更新 Diff），将复杂递归推导从 Immer Store 直接赋值中剥离出来。
    - **布局计算引擎 (Layout Engine)**: 对于可视化展示需要的排版，需要单独的引擎组件承接，将扁平数据映射成包含 X/Y 时空坐标的数据供渲染。
  - 需要维护节点间的 DAG（有向无环图）关系（基于 `dependsOn`），节点 ID 由 `nanoid()` 创建。
- **Persistence**: Hybrid strategy (`src/utils/storage.ts`).
  - Web: Fallback to IndexedDB (via `idb`).
  - Tauri: Uses `invoke('save_data_rust')` (Rust 命令位于 `src-tauri/src/lib.rs`).
  - 规划中需要有一层统一聚合器：同时对接本地（Tauri/Rust）、Web（IndexedDB）和 WebDAV，多源读取后按“最新且非空”选择。
  - 数据校验策略：可恢复问题（如可推断默认值/可补齐字段）优先通过 Zod 恢复；不可恢复时必须抛错，并同时输出控制台错误与 UI Toaster，禁止静默吞错。
  - **重要坑点**: 目前 TS 调用 `invoke` 时传的 `key`, `data` 参数以及 `remove_data_rust`，与 Rust 实际在 `lib.rs` 注册的签名不匹配，改动时需注意。
  - Serialization: Use `superjson` for rich types (Date, Set, Map). 持久化通过 Zustand 的 `partialize` 处理。

## 🧠 State Management (Zustand & Dual-Store)

本项目采用双 Store 模式以解耦持久化与 React Flow 视图渲染：

1. **主 Store (`useAppStore`)**: `src/store/index.ts`
   - persist + immer 持久化，由 `appSlice`, `memoSlice`, `timelineSlice` 构成。Timeline 数据以扁平字典存储（`groups`, `timelines`, `nodes` + `groupOrder`）。允许直接 mutation 更新数据。`partialize` 通过 `nestFlatData()` 转回嵌套格式写入，`merge` 通过 `flattenPersistedData()` 恢复扁平状态。
2. **React Flow Store (`useReactFlowStateStore`)**: `src/store/reactFlowStore.ts`
   - 作为桥接层。订阅扁平状态，通过 `selectNestedTimelineGroup()` 重组嵌套结构，再传给 `getReactFlowObjects()` 生成 Node/Edge。

## 🎨 UI & Chakra UI v3

- **Chakra UI v3**: Strictly follow v3 patterns. Use `colorPalette` instead of `colorScheme`. `<Provider>` is from `src/components/ui/Provider.tsx`.
- **Layout**: Use Layout components (`Flex`, `Box`, `HStack`, `VStack`). 完全避免写原生 CSS。
- **React 19 & Compiler**: Vite 中配置了 `babel-plugin-react-compiler`。**严禁**手动编写 `useMemo` / `useCallback` / `React.memo`。
- **Icons**: 推荐使用 Lucide icons (`react-icons/lu`，如 `LuPlus`)。

## 🛠 Workflows & Conventions

- **Commands**:
  - `pnpm tauri dev`: 启动桌面端开发（主要调试方式）。
  - `pnpm test`: 单元测试 (Vitest, 配置使用 jsdom)。
  - `pnpm test:e2e`: Playwright E2E 测试 (说明以中文为主)。
- **Testing Pattern**:
  - Store 单测：免 mock，直接用 `useAppStore.setState()` 喂数据，执行 action 后 `getState()` 断言。
  - Component 单测：用 `<Provider>` 包裹 Chakra，以手动 mock 对象传 props 测试。
- **TypeScript**: `verbatimModuleSyntax` 开启。纯类型引用**必须**使用 `import type { ... }`。
- **File Map**:
  - Logic/Helpers: `src/utils/`
  - Components: `src/components/{timeline,memo,ui}/`
  - Store/Slices: `src/store/`
  - Types & Zod Schemas: `src/types/`
