# GEMINI.md - one-ok-todo

## Project Overview

This is a desktop todo application named "One OK Todo" built with Tauri, a framework for building lightweight, cross-platform desktop apps with web technologies. The frontend is built with React and TypeScript, using Chakra UI for components and Jotai for state management. The application provides a timeline-based view for managing tasks and a memo view for notes.

## Project Package Manager

This project uses **pnpm** (version 10.19.0+) as the package manager. Always use `pnpm` commands instead of `npm` or `yarn`:

- Install dependencies: `pnpm install`
- Add package: `pnpm add <package>`
- Remove package: `pnpm remove <package>`
- Run scripts: `pnpm <script-name>` or `pnpm run <script-name>`

## Typescript

`verbatimModuleSyntax` 被设置为 `true`，所以你的所有仅类型导入必须使用 type 修饰符。

`tsc --noEmit` 指令可以帮你查看 ts 错误。

## IMPORTANT FACTS

- 当需要执行浏览器操作时，使用你的工具而不是 shell_command + 脚本
- 当你需要执行后台命令时，不用调用你的shell_command工具，相反，告诉用户你需执行它，等待用户手动执行并反馈给你，因为你还没有执行后台命令的能力，这会阻塞你的对话进度。
- **总是**先使用 mcp 工具查阅文档！**总是**先使用 mcp 工具查阅文档！**总是**先使用 mcp 工具查阅文档！
- 看看 llm-docs 文件夹，里面有项目需求说明。
- 不许自己安装依赖项，相反，先查看 `package.json` 确定包是否已经安装，然后再通知用户你的想法。
- UI代码的编写总是需要先查看`chakra-ui`的文档。
