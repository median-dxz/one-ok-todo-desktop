# GEMINI.md - one-ok-todo

## Project Overview

This is a desktop todo application named "One OK Todo" built with Tauri, a framework for building lightweight, cross-platform desktop apps with web technologies. The frontend is built with React and TypeScript, using Chakra UI for components and Jotai for state management. The application provides a timeline-based view for managing tasks and a memo view for notes.

**Key Technologies:**

- **Framework:** Tauri (with React and TypeScript)
- **UI:** Chakra UI
- **State Management:** Jotai
- **Build Tool:** Vite
- **Testing:** Playwright for end-to-end tests

## Building and Running

### Development

To run the application in development mode, use the following command:

```bash
bun run dev
```

This will start the Vite development server and the Tauri application.

### Building

To build the application for production, use the following command:

```bash
bun run build
```

This will create a production-ready build in the `dist` directory.

### Testing

To run the end-to-end tests, use the following command:

```bash
bun run test:e2e
```

## Development Conventions

- **Code Style:** The project uses Prettier for code formatting and ESLint for linting. Configuration files for both are present in the root directory.
- **State Management:** The application uses Jotai for global state management. The main application state is defined in `src/store/appAtom.ts`.
- **Component Structure:** Components are organized by feature under the `src/components` directory.
- **Typing:** The project is written in TypeScript and uses type definitions located in the `src/types` directory.

## UI 设计风格参考

**主视图（Main View）：**

- **顶部：** 类似Office 365的简洁顶部导航栏，包含应用Logo、搜索框、全局筛选（例如：按项目、按优先级）、以及用户头像/设置菜单。
- **左侧：** 一个可折叠的侧边栏，显示项目列表、标签列表、或预设视图（例如：今天、本周、已完成）。
- **中间区域：** 核心的时间线视图。**横轴：** 代表日期和时间，从左到右延伸。可以有年、月、日的刻度，并允许用户缩放视图。**时间线：** 以彩色粗线表示，横向延伸。**主时间线：** 一条主干线，代表主要任务流。**分支与合并：** 当有子任务或并行任务时，主时间线会分叉出新的彩色粗线，这些分支线与主线平行，直到它们完成或合并回主线。合并时，多条线会汇聚成一条。**节点：** 时间线上的小圆圈或菱形，代表一个Todo任务。节点的颜色可以与所属时间线的颜色保持一致，或者根据任务状态（例如：已完成、进行中、待办）有不同的填充色或边框。**节点标签：** 每个节点旁边显示任务的简短标题。**交互：\*\***拖拽节点：** 用户可以直接在时间线上拖拽节点来调整任务的开始/结束时间。**拖拽时间线：** 拖拽整个时间线或其分支来调整一组任务的时间。**创建节点：** 在时间线上空白处双击或右键点击，可以创建一个新节点。**创建分支：** 从现有节点拖拽出一条新线，创建分支任务。**合并时间线：** 将一条分支线拖拽到另一条线上，实现合并。**缩放：\*\* 通过滚轮或手势缩放时间线，查看不同粒度的时间范围。
- **右侧边栏（Right Sidebar）：** 当用户点击某个节点时，此侧边栏展开（或显示在主视图的右侧）。**节点详情：** 显示选中节点的详细信息，包括：任务标题（可编辑）任务描述（富文本编辑器）开始日期/时间截止日期/时间优先级（下拉选择）标签（多选，支持自定义）负责人（如果支持协作）附件（可上传文件）评论区任务状态（例如：待办、进行中、已完成、已暂停）子任务列表（如果该节点是父任务，可以列出其子任务，并且这些子任务也可以是时间线上的节点）**操作按钮：** 保存、删除、标记完成、分享等。

**UI风格（Office 365 Modern Style）：**

- **色彩：** 采用柔和、专业的配色方案，强调信息层级。时间线本身可以使用多种鲜明的颜色来区分不同的项目或任务流，但整体UI背景以白色或浅灰色为主，辅以深色文本。
- **字体：** 使用清晰、现代的无衬线字体（如Segoe UI或类似的）。
- **图标：** 简洁、矢量化的线条图标。
- **圆角：** 适度的圆角应用于按钮、卡片和输入框，增加现代感。
- **阴影：** 轻微的阴影效果用于区分不同的UI元素，例如侧边栏和弹出窗口。
- **动画：** 流畅的过渡动画，例如节点展开、侧边栏滑入滑出、时间线缩放等，提升用户体验。

**具体设计元素设想：**

- **时间线节点：** **待办：** 内部空白圆圈，彩色边框。**进行中：** 内部填充彩色圆圈。**已完成：** 内部填充彩色圆圈，中间有一个对勾图标。\*\*逾期：\*\* 红色边框或红色填充，警示用户。
- **分支和合并：** 当时间线分叉时，线的颜色可以保持一致，也可以用不同的颜色来表示不同的子项目或责任人。分支和合并处的线条会有一个平滑的弧度，而不是尖锐的直角，使得视觉上更舒适。
- **日期时间轴：** 顶部有清晰的日期和时间刻度，当前日期可以有高亮显示。

## Gemini需要知道的重要事实

- Always use context7 when I need code generation, setup or configuration steps, or
  library/API documentation. This means you should automatically use the Context7 MCP
  tools to resolve library id and get library docs without me having to explicitly ask.
- 当需要执行浏览器操作时，使用你的工具而不是shell command+脚本
- 当你需要执行后台命令时，不用调用你的shell_command工具，相反，告诉用户你需要执行它，等待用户手动执行并反馈给你，因为你还没有执行后台命令的能力，这会阻塞你的对话进度。
