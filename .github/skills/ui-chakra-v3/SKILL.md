---
name: ui-chakra-v3
description: Use when building React components, styling with Chakra UI v3 (colorPalette, Field, forms), adding icons (react-icons/lu), or working with @xyflow/react nodes. Covers React Compiler no-memo rules, task/delimiter node types, and Field.Root focus-bug pitfall.
---

# Skill: UI & Chakra UI v3

## Core Tech
- **Framework**: React 19.
- **Styling**: Chakra UI v3 (Strictly components, no raw CSS).
- **Icons**: `react-icons/lu` (Lucide icons via react-icons).
- **Graphs**: `@xyflow/react` (React Flow).

## Component Guidelines
### Chakra UI v3 Patterns
- **Color Palette**: Use `colorPalette` prop instead of `colorScheme`.
- **Layout**: Use `HStack`, `VStack`, `Stack`, and `Box`.
- **Field & Forms**:
  - **CRITICAL**: Do NOT wrap multiple repeated inputs/checkboxes in a single `<Field.Root>` if they need unique IDs. Each list item should have its own `<Field.Root>` or handle IDs manually to avoid focus/click bugs.
  - Use `<Field.Label>`, `<Input>`, and `<Field.ErrorText>`.

### React Flow (XYFlow)
- Timelines are rendered as nodes in React Flow.
- See `src/components/timeline/TimelineDisplay.tsx` for core graph logic.
- Node types (current): `task`, `delimiter` (see `src/types/timeline.ts`).
- Recurrence timelines render extra synthetic nodes/edges via `src/utils/reactFlowObjects.ts`.

### React 19 + React Compiler
- React Compiler is enabled via `babel-plugin-react-compiler` in `vite.config.ts`; avoid adding manual `useMemo`/`useCallback`/`React.memo` unless there is a proven need.

### Icons
- Prefer `react-icons/lu` for a consistent modern look.
- Example: `import { LuPlus, LuTrash2 } from 'react-icons/lu'`.

## Visual Design
- Keep it clean, modern, and dark-mode friendly (Chakra v3 default).
- Use `Separator` for dividing sections.
- Use `IconButton` for compact actions with tooltips.
