use std::fs::{self, File};
use std::io::{self, Write};
use std::path::PathBuf;
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::{AppHandle, Manager};

const DATA_DIR: &str = "data";
const ROOT_FILE: &str = "root-data.json";

fn get_data_dir_path(app: &AppHandle) -> Result<PathBuf, String> {
    let mut path = app
        .path()
        .document_dir()
        .map_err(|e| format!("无法获取文档目录: {}", e))?;

    path.push("one-ok-todo");
    path.push(DATA_DIR);
    Ok(path)
}

#[tauri::command]
async fn save_data_rust(app: AppHandle, data: String) -> Result<(), String> {
    let data_dir = get_data_dir_path(&app)?;

    // create_dir_all 是幂等的，无需先检查是否存在（避免 TOCTOU）
    fs::create_dir_all(&data_dir).map_err(|e| format!("创建目录失败 ({:?}): {}", data_dir, e))?;

    let target_file_path = data_dir.join(ROOT_FILE);
    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_nanos();
    let temp_file_path = data_dir.join(format!("{}.{}.tmp", ROOT_FILE, timestamp));

    // 先写入临时文件并 fsync，保证数据落盘
    {
        let mut temp_file = File::create(&temp_file_path)
            .map_err(|e| format!("File::create 失败 ({:?}): {}", temp_file_path, e))?;

        temp_file
            .write_all(data.as_bytes())
            .map_err(|e| format!("write_all 失败: {}", e))?;

        temp_file
            .sync_all()
            .map_err(|e| format!("sync_all 失败: {}", e))?;
    }

    // 直接 rename，不要手动 remove_file：
    //   Unix：rename(2) 原子替换目标，POSIX 保证
    //   Windows：Rust stdlib 使用 MoveFileExW(MOVEFILE_REPLACE_EXISTING)
    //             手动 DeleteFile 会让目标进入 delete-pending 状态，
    //             导致后续 rename 以 ERROR_FILE_NOT_FOUND (errno 2) 失败
    fs::rename(&temp_file_path, &target_file_path).map_err(|e| {
        format!(
            "rename 失败 (从 {:?} 到 {:?}): {}",
            temp_file_path, target_file_path, e
        )
    })?;

    Ok(())
}

#[tauri::command]
async fn load_data_rust(app: AppHandle) -> Result<String, String> {
    let data_dir = get_data_dir_path(&app)?;
    let file_path = data_dir.join(ROOT_FILE);

    // 直接读取，将 NotFound 视为空数据，避免 exists() → open() 的 TOCTOU
    match fs::read_to_string(&file_path) {
        Ok(contents) => Ok(contents),
        Err(e) if e.kind() == io::ErrorKind::NotFound => Ok(String::new()),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
async fn remove_data_rust(app: AppHandle) -> Result<(), String> {
    let data_dir = get_data_dir_path(&app)?;
    let file_path = data_dir.join(ROOT_FILE);

    // 直接删除，将 NotFound 视为成功，避免 exists() → remove() 的 TOCTOU
    match fs::remove_file(&file_path) {
        Ok(()) => Ok(()),
        Err(e) if e.kind() == io::ErrorKind::NotFound => Ok(()),
        Err(e) => Err(e.to_string()),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            save_data_rust,
            load_data_rust,
            remove_data_rust
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
