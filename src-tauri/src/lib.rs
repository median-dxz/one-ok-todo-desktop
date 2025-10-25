use tauri::api::path;
use std::fs::{self, File};
use std::io::{Read, Write};
use std::path::PathBuf;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

const DATA_DIR: &str = "data";
const ROOT_FILE: &str = "root-data.json";

fn get_data_dir_path() -> PathBuf {
    let mut path = path::document_dir().unwrap();
    path.push("OneOkTodo");
    path.push(DATA_DIR);
    path
}

#[tauri::command]
fn save_data_rust(data: &str) -> Result<(), String> {
    let data_dir = get_data_dir_path();
    if !data_dir.exists() {
        fs::create_dir_all(&data_dir).map_err(|e| e.to_string())?;
    }

    let mut file_path = data_dir.clone();
    file_path.push(ROOT_FILE);

    let mut file = File::create(&file_path).map_err(|e| e.to_string())?;
    file.write_all(data.as_bytes()).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn load_data_rust() -> Result<String, String> {
    let data_dir = get_data_dir_path();
    let mut file_path = data_dir.clone();
    file_path.push(ROOT_FILE);

    if !file_path.exists() {
        return Ok(String::new());
    }

    let mut file = File::open(&file_path).map_err(|e| e.to_string())?;
    let mut contents = String::new();
    file.read_to_string(&mut contents).map_err(|e| e.to_string())?;
    Ok(contents)
}


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, save_data_rust, load_data_rust])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
