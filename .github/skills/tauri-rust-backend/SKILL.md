---
name: tauri-rust-backend
description: Use when adding Tauri invoke calls, writing Rust #[tauri::command], registering commands in tauri::Builder, or debugging TS-to-Rust bridge. Covers current save_data_rust/load_data_rust signature mismatch gotcha between storage.ts and lib.rs.
---

# Skill: Tauri & Rust Backend

## Tech Stack
- **Framework**: Tauri v2.
- **Language**: Rust 2021.
- **Bridge**: `invoke` from `@tauri-apps/api/core`.

## Backend Logic (`src-tauri/`)
- **Commands**: Defined in `src-tauri/src/lib.rs` with `#[tauri::command]`.
- **Registration**: Commands are registered in `src-tauri/src/lib.rs` inside `tauri::Builder` (note: `src-tauri/src/main.rs` only calls `one_ok_todo_lib::run()`).
- **Data Path**: Use `Documents/OneOkTodo/data/` for user data.

## Frontend Bridge
- Use `invoke` to call Rust commands.
- Example:
  ```typescript
  import { invoke } from '@tauri-apps/api/core';
  await invoke('save_data_rust', { data: serializedData });
  ```

### Current gotcha (important)
- `src/utils/storage.ts` currently calls `invoke('save_data_rust'|'load_data_rust'|'remove_data_rust')` with `{ key, data }` and expects a `remove_data_rust` command.
- `src-tauri/src/lib.rs` currently exposes `save_data_rust(data: &str)` and `load_data_rust()` (no `key`, no `remove_data_rust`).
- When working on persistence, ensure TS + Rust command names and parameter shapes match.

## Best Practices
- Keep Rust logic focused on OS access, File I/O, and performance-critical tasks.
- Use `Result<T, E>` in Rust for error handling, which maps to Promise rejection in JS.
- Ensure serialized data sent between TS and Rust is compatible (use simple JSON-serializable structures).
