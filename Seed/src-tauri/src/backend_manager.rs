use std::path::PathBuf;
use std::process::{Child, Command, Stdio};
use std::sync::{Arc, Mutex};

#[derive(Clone)]
pub struct BackendManager {
    process: Arc<Mutex<Option<Child>>>,
    pub backend_port: u16,
}

/// Information about a detected Python installation
#[derive(Clone, Debug)]
pub struct PythonInfo {
    pub path: String,
    pub version: String,
    pub major: u32,
    pub minor: u32,
    pub patch: u32,
}

impl BackendManager {
    pub fn new(port: u16) -> Self {
        BackendManager {
            process: Arc::new(Mutex::new(None)),
            backend_port: port,
        }
    }

    /// Start the Python backend process using uvicorn
    pub fn start_backend(
        &self,
        python_path: Option<String>,
        backend_dir: PathBuf,
    ) -> Result<String, String> {
        let mut process_guard = self
            .process
            .lock()
            .map_err(|e| format!("Mutex lock error: {}", e))?;

        // Check if backend is already running
        if process_guard.is_some() {
            return Ok("Backend already running".to_string());
        }

        // Determine Python executable
        let python_cmd = python_path.unwrap_or_else(|| self.detect_python());

        // Verify Python is valid before starting
        if !Self::verify_python_executable(&python_cmd) {
            return Err(format!(
                "Python executable not valid or not found: {}",
                python_cmd
            ));
        }

        // Verify backend directory exists
        if !backend_dir.exists() {
            return Err(format!("Backend directory not found: {:?}", backend_dir));
        }

        // Verify app_v2.py exists
        let backend_script = backend_dir.join("app_v2.py");
        if !backend_script.exists() {
            return Err(format!("Backend script not found: {:?}", backend_script));
        }

        // Get the parent directory of backend_dir (project root) for proper module resolution
        let project_root = backend_dir
            .parent()
            .map(|p| p.to_path_buf())
            .unwrap_or_else(|| backend_dir.clone());

        // Start backend using uvicorn module for proper ASGI server
        let child = Command::new(&python_cmd)
            .arg("-m")
            .arg("uvicorn")
            .arg("backend.app_v2:app")
            .arg("--host")
            .arg("127.0.0.1")
            .arg("--port")
            .arg(self.backend_port.to_string())
            .current_dir(&project_root)
            .env("CYBERSEED_BACKEND_PORT", self.backend_port.to_string())
            .env("CYBERSEED_LAZY_LOAD_MODELS", "true")
            .env("PYTHONUNBUFFERED", "1")
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .spawn()
            .map_err(|e| {
                format!(
                    "Failed to start backend: {}. Python path: {}, Project root: {:?}",
                    e, python_cmd, project_root
                )
            })?;

        *process_guard = Some(child);

        Ok(format!(
            "Backend started on port {} using Python: {}",
            self.backend_port, python_cmd
        ))
    }

    /// Verify that a Python executable is valid and runnable
    fn verify_python_executable(python_path: &str) -> bool {
        Command::new(python_path)
            .arg("--version")
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .status()
            .map(|s| s.success())
            .unwrap_or(false)
    }

    /// Stop the Python backend process
    pub fn stop_backend(&self) -> Result<String, String> {
        let mut process_guard = self
            .process
            .lock()
            .map_err(|e| format!("Mutex lock error: {}", e))?;

        if let Some(mut child) = process_guard.take() {
            child
                .kill()
                .map_err(|e| format!("Failed to kill backend process: {}", e))?;
            Ok("Backend stopped".to_string())
        } else {
            Ok("Backend not running".to_string())
        }
    }

    /// Check if backend is running
    pub fn check_status(&self) -> Result<bool, String> {
        let process_guard = self
            .process
            .lock()
            .map_err(|e| format!("Mutex lock error: {}", e))?;
        Ok(process_guard.is_some())
    }

    /// Auto-detect Python executable (embedded vs system)
    fn detect_python(&self) -> String {
        // Determine platform-specific Python executable name
        let python_exe = if cfg!(windows) {
            "python.exe"
        } else {
            "python3"
        };

        // Try embedded Python first (in resources folder)
        if let Some(embedded) = self.find_embedded_python(python_exe) {
            // Verify embedded Python works and meets version requirements
            if let Some(info) = Self::get_python_info(&embedded) {
                if info.major == 3 && info.minor >= 11 {
                    return embedded;
                }
            }
        }

        // Try to find Python 3.11+ in system PATH
        // On Windows, also check common Python installation paths
        let mut candidates: Vec<&str> = vec![
            "python3.11",
            "python3.12",
            "python3.13",
            "python3",
            "python",
        ];

        // On Windows, try py launcher with version specifiers
        #[cfg(windows)]
        {
            candidates.insert(0, "py -3.13");
            candidates.insert(0, "py -3.12");
            candidates.insert(0, "py -3.11");
        }

        for cmd in candidates {
            if let Some(info) = Self::get_python_info(cmd) {
                if info.major == 3 && info.minor >= 11 {
                    return cmd.to_string();
                }
            }
        }

        // Fall back to generic python command (may not meet version requirements)
        if cfg!(windows) {
            "python".to_string()
        } else {
            "python3".to_string()
        }
    }

    /// Find embedded Python in common locations relative to the application
    fn find_embedded_python(&self, python_exe: &str) -> Option<String> {
        let app_dir = std::env::current_exe()
            .ok()
            .and_then(|exe| exe.parent().map(|p| p.to_path_buf()))?;

        // Check multiple possible locations for embedded Python
        let locations = vec![
            app_dir.join("python").join(python_exe),
            app_dir.join("resources").join("python").join(python_exe),
            app_dir
                .join("..")
                .join("Resources")
                .join("python")
                .join(python_exe),
            // Additional Windows-specific locations
            app_dir.join("_internal").join("python").join(python_exe),
            app_dir.join("lib").join("python").join(python_exe),
        ];

        locations
            .into_iter()
            .find(|p| p.exists())
            .map(|p| p.to_string_lossy().to_string())
    }

    /// Get detailed Python version information from a Python executable
    fn get_python_info(python_path: &str) -> Option<PythonInfo> {
        // Handle commands with arguments like "py -3.11"
        let (cmd, args): (&str, Vec<&str>) = if python_path.contains(' ') {
            let parts: Vec<&str> = python_path.split_whitespace().collect();
            (parts[0], parts[1..].to_vec())
        } else {
            (python_path, vec![])
        };

        let mut command = Command::new(cmd);
        for arg in &args {
            command.arg(arg);
        }
        command.arg("--version");

        let output = command.output().ok()?;

        if !output.status.success() {
            return None;
        }

        // Python version can be in stdout or stderr depending on version
        let version_str = {
            let stdout = String::from_utf8_lossy(&output.stdout);
            let stderr = String::from_utf8_lossy(&output.stderr);

            // Try stdout first, then stderr
            if stdout.contains("Python") {
                stdout.to_string()
            } else if stderr.contains("Python") {
                stderr.to_string()
            } else {
                return None;
            }
        };

        Self::parse_python_version(&version_str, python_path)
    }

    /// Parse Python version string into PythonInfo
    fn parse_python_version(version_str: &str, path: &str) -> Option<PythonInfo> {
        // Extract version from string like "Python 3.11.5" or "Python 3.12.0"
        let version_str = version_str.trim();
        let version_part = version_str.strip_prefix("Python ")?;

        let parts: Vec<&str> = version_part.split('.').collect();
        if parts.len() < 2 {
            return None;
        }

        let major: u32 = parts[0].parse().ok()?;
        let minor: u32 = parts[1].parse().ok()?;
        // Patch version might have additional characters like "3.11.5rc1"
        let patch: u32 = parts
            .get(2)
            .and_then(|p| {
                p.chars()
                    .take_while(|c| c.is_ascii_digit())
                    .collect::<String>()
                    .parse()
                    .ok()
            })
            .unwrap_or(0);

        Some(PythonInfo {
            path: path.to_string(),
            version: version_part.to_string(),
            major,
            minor,
            patch,
        })
    }

    /// Check if Python version string indicates 3.11 or higher
    fn is_python_311_or_higher(version_str: &str) -> bool {
        Self::parse_python_version(version_str, "")
            .map(|info| info.major == 3 && info.minor >= 11)
            .unwrap_or(false)
    }

    /// Check if Python is available and meets minimum version requirements
    pub fn check_python_available(&self, python_path: Option<String>) -> Result<bool, String> {
        let python_cmd = python_path.unwrap_or_else(|| self.detect_python());

        match Self::get_python_info(&python_cmd) {
            Some(info) => {
                if info.major == 3 && info.minor >= 11 {
                    Ok(true)
                } else {
                    Err(format!(
                        "Python version {} found, but version 3.11 or higher is required",
                        info.version
                    ))
                }
            }
            None => Err(format!(
                "Could not detect Python version for: {}",
                python_cmd
            )),
        }
    }

    /// Get detailed Python information for diagnostics
    pub fn get_python_details(
        &self,
        python_path: Option<String>,
    ) -> Result<serde_json::Value, String> {
        let python_cmd = python_path.unwrap_or_else(|| self.detect_python());

        match Self::get_python_info(&python_cmd) {
            Some(info) => {
                let meets_requirements = info.major == 3 && info.minor >= 11;
                Ok(serde_json::json!({
                    "path": info.path,
                    "version": info.version,
                    "major": info.major,
                    "minor": info.minor,
                    "patch": info.patch,
                    "meets_requirements": meets_requirements,
                    "required_version": "3.11+"
                }))
            }
            None => Ok(serde_json::json!({
                "error": format!("Could not detect Python at: {}", python_cmd),
                "path": python_cmd,
                "meets_requirements": false,
                "required_version": "3.11+"
            })),
        }
    }

    /// Check if pip requirements are installed
    pub fn check_requirements(
        &self,
        python_path: Option<String>,
        requirements_path: PathBuf,
    ) -> Result<bool, String> {
        let python_cmd = python_path.unwrap_or_else(|| self.detect_python());

        // Check if requirements file exists
        if !requirements_path.exists() {
            return Err(format!(
                "Requirements file not found: {:?}",
                requirements_path
            ));
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
    pub fn install_requirements(
        &self,
        python_path: Option<String>,
        requirements_path: PathBuf,
    ) -> Result<String, String> {
        let python_cmd = python_path.unwrap_or_else(|| self.detect_python());

        if !requirements_path.exists() {
            return Err(format!(
                "Requirements file not found: {:?}",
                requirements_path
            ));
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
