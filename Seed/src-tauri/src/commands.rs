use tauri::State;
use std::path::PathBuf;
use crate::backend_manager::BackendManager;

#[tauri::command]
pub async fn start_backend(
    manager: State<'_, BackendManager>,
    python_path: Option<String>,
    backend_dir: String,
) -> Result<String, String> {
    let backend_path = PathBuf::from(backend_dir);
    manager.start_backend(python_path, backend_path)
}

#[tauri::command]
pub async fn stop_backend(manager: State<'_, BackendManager>) -> Result<String, String> {
    manager.stop_backend()
}

#[tauri::command]
pub async fn check_backend_status(manager: State<'_, BackendManager>) -> Result<bool, String> {
    manager.check_status()
}

#[tauri::command]
pub async fn check_dependencies(
    manager: State<'_, BackendManager>,
    python_path: Option<String>,
    requirements_path: String,
) -> Result<serde_json::Value, String> {
    let req_path = PathBuf::from(requirements_path);
    
    let python_available = manager.check_python_available(python_path.clone())?;
    let requirements_installed = if python_available {
        manager.check_requirements(python_path, req_path)?
    } else {
        false
    };

    Ok(serde_json::json!({
        "python_available": python_available,
        "requirements_installed": requirements_installed,
    }))
}

#[tauri::command]
pub async fn install_requirements(
    manager: State<'_, BackendManager>,
    python_path: Option<String>,
    requirements_path: String,
) -> Result<String, String> {
    let req_path = PathBuf::from(requirements_path);
    manager.install_requirements(python_path, req_path)
}

#[tauri::command]
pub async fn get_backend_port(manager: State<'_, BackendManager>) -> Result<u16, String> {
    Ok(manager.backend_port)
}
