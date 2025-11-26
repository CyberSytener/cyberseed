use std::process::{Child, Command};
use std::sync::{Arc, Mutex};
use std::path::PathBuf;

#[derive(Clone)]
pub struct BackendManager {
    process: Arc<Mutex<Option<Child>>>,
    pub backend_port: u16,
}

impl BackendManager {
    pub fn new(port: u16) -> Self {
        BackendManager {
            process: Arc::new(Mutex::new(None)),
            backend_port: port,
        }
    }

    /// Start the Python backend process
    pub fn start_backend(&self, python_path: Option<String>, backend_dir: PathBuf) -> Result<String, String> {
        let mut process_guard = self.process.lock().map_err(|e| format!("Mutex lock error: {}", e))?;
        
        // Check if backend is already running
        if process_guard.is_some() {
            return Ok("Backend already running".to_string());
        }

        // Determine Python executable
        let python_cmd = python_path.unwrap_or_else(|| self.detect_python());
        
        // Build command to start backend
        let backend_script = backend_dir.join("backend").join("app_v2.py");
        
        if !backend_script.exists() {
            return Err(format!("Backend script not found: {:?}", backend_script));
        }

        let child = Command::new(&python_cmd)
            .arg(&backend_script)
            .env("CYBERSEED_BACKEND_PORT", self.backend_port.to_string())
            .env("CYBERSEED_LAZY_LOAD_MODELS", "true")
            .spawn()
            .map_err(|e| format!("Failed to start backend: {}", e))?;

        *process_guard = Some(child);
        
        Ok(format!("Backend started on port {}", self.backend_port))
    }

    /// Stop the Python backend process
    pub fn stop_backend(&self) -> Result<String, String> {
        let mut process_guard = self.process.lock().map_err(|e| format!("Mutex lock error: {}", e))?;
        
        if let Some(mut child) = process_guard.take() {
            child.kill().map_err(|e| format!("Failed to kill backend process: {}", e))?;
            Ok("Backend stopped".to_string())
        } else {
            Ok("Backend not running".to_string())
        }
    }

    /// Check if backend is running
    pub fn check_status(&self) -> Result<bool, String> {
        let process_guard = self.process.lock().map_err(|e| format!("Mutex lock error: {}", e))?;
        Ok(process_guard.is_some())
    }

    /// Auto-detect Python executable (embedded vs system)
    fn detect_python(&self) -> String {
        // Try embedded Python first
        let embedded_python = std::env::current_exe()
            .ok()
            .and_then(|exe| exe.parent().map(|p| p.join("python").join("python.exe")))
            .filter(|p| p.exists());

        if let Some(python) = embedded_python {
            return python.to_string_lossy().to_string();
        }

        // Fall back to system Python
        if cfg!(windows) {
            "python".to_string()
        } else {
            "python3".to_string()
        }
    }

    /// Check if Python is available
    pub fn check_python_available(&self, python_path: Option<String>) -> Result<bool, String> {
        let python_cmd = python_path.unwrap_or_else(|| self.detect_python());
        
        let output = Command::new(&python_cmd)
            .arg("--version")
            .output()
            .map_err(|e| format!("Failed to check Python: {}", e))?;

        Ok(output.status.success())
    }

    /// Check if pip requirements are installed
    pub fn check_requirements(&self, python_path: Option<String>, requirements_path: PathBuf) -> Result<bool, String> {
        let python_cmd = python_path.unwrap_or_else(|| self.detect_python());
        
        // Check if requirements file exists
        if !requirements_path.exists() {
            return Err(format!("Requirements file not found: {:?}", requirements_path));
        }

        // Try to import key dependencies
        let output = Command::new(&python_cmd)
            .arg("-c")
            .arg("import fastapi, uvicorn")
            .output()
            .map_err(|e| format!("Failed to check requirements: {}", e))?;

        Ok(output.status.success())
    }

    /// Install pip requirements
    pub fn install_requirements(&self, python_path: Option<String>, requirements_path: PathBuf) -> Result<String, String> {
        let python_cmd = python_path.unwrap_or_else(|| self.detect_python());
        
        if !requirements_path.exists() {
            return Err(format!("Requirements file not found: {:?}", requirements_path));
        }

        let output = Command::new(&python_cmd)
            .arg("-m")
            .arg("pip")
            .arg("install")
            .arg("-r")
            .arg(&requirements_path)
            .output()
            .map_err(|e| format!("Failed to install requirements: {}", e))?;

        if output.status.success() {
            Ok("Requirements installed successfully".to_string())
        } else {
            let stderr = String::from_utf8_lossy(&output.stderr);
            Err(format!("Failed to install requirements: {}", stderr))
        }
    }
}
