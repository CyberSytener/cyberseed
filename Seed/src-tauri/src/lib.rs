mod backend_manager;
mod commands;

use backend_manager::BackendManager;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Initialize backend manager with default port
    let backend_manager = BackendManager::new(8000);
    let backend_manager_clone = backend_manager.clone();

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .manage(backend_manager)
        .invoke_handler(tauri::generate_handler![
            greet,
            commands::start_backend,
            commands::stop_backend,
            commands::check_backend_status,
            commands::check_dependencies,
            commands::install_requirements,
            commands::get_backend_port,
        ])
        .on_window_event(move |_window, event| {
            if let tauri::WindowEvent::CloseRequested { .. } = event {
                // Stop backend on window close
                let _ = backend_manager_clone.stop_backend();
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
