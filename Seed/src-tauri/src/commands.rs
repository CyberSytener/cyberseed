use crate::backend_manager::BackendManager;
use std::path::PathBuf;
use tauri::State;

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

    // Get detailed Python info instead of just boolean
    let python_details = manager.get_python_details(python_path.clone())?;
    let python_available = python_details
        .get("meets_requirements")
        .and_then(|v| v.as_bool())
        .unwrap_or(false);

    // Check requirements and capture error message if any
    let (requirements_installed, requirements_error) = if python_available {
        match manager.check_requirements(python_path, req_path) {
            Ok(installed) => (installed, None),
            Err(e) => (false, Some(e)),
        }
    } else {
        (false, None)
    };

    Ok(serde_json::json!({
        "python_available": python_available,
        "python_details": python_details,
        "requirements_installed": requirements_installed,
        "requirements_error": requirements_error,
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

#[tauri::command]
pub async fn get_python_info(
    manager: State<'_, BackendManager>,
    python_path: Option<String>,
) -> Result<serde_json::Value, String> {
    manager.get_python_details(python_path)
}
