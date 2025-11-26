# Cyberseed Desktop App

This document describes the desktop application features including backend process management, resource optimization, Python bundling, and installation procedures.

---

## Table of Contents

1. [End User Installation Guide](#end-user-installation-guide)
2. [Developer Build Instructions](#developer-build-instructions)
3. [Architecture Overview](#architecture-overview)
4. [Features](#features)
5. [Troubleshooting](#troubleshooting)

---

## End User Installation Guide

### System Requirements

- **Operating System**: Windows 10/11 (64-bit)
- **RAM**: 4GB minimum, 8GB recommended
- **Disk Space**: 500MB for application + 1GB for Python (if not installed)
- **Python**: 3.11+ (optional - can be bundled with installer)

### Installation Steps

#### Option 1: Standalone Installer (Recommended)

1. **Download** `Cyberseed-Setup.exe` from the releases page
2. **Run** the installer (no admin rights required)
3. **Select** installation options:
   - ✅ Cyberseed Application (required)
   - ✅ Embedded Python 3.11 (recommended if you don't have Python)
   - ✅ Desktop Shortcut (optional)
   - ✅ Install Python Dependencies (required)
4. **Click** Install and wait for completion
5. **Launch** Cyberseed from Start Menu or Desktop

The installer will:
- Install to `%LOCALAPPDATA%\Cyberseed`
- Detect system Python or use embedded version
- Automatically install all required Python packages
- Create Start Menu and Desktop shortcuts
- Register in Add/Remove Programs

#### Option 2: System Python Required

If you download the non-bundled installer:
1. Install Python 3.11+ from [python.org](https://www.python.org/downloads/)
2. Run `Cyberseed-Setup.exe`
3. The installer will use your system Python

### First Launch

On first launch, Cyberseed will:
1. Check Python availability
2. Verify all dependencies are installed
3. Start the backend server
4. Open the main application window

If any issues occur, see the [Troubleshooting](#troubleshooting) section.

### Uninstallation

1. Go to **Start Menu** → **Cyberseed** → **Uninstall**
2. Or use **Settings** → **Apps** → **Cyberseed** → **Uninstall**

All files and settings will be completely removed.

---

## Developer Build Instructions

### Prerequisites

Before building Cyberseed, ensure you have:

1. **Node.js 18+** - [Download](https://nodejs.org/)
   ```powershell
   node --version  # Should be v18.0.0 or higher
   ```

2. **Rust** - [Install from rustup.rs](https://rustup.rs/)
   ```powershell
   cargo --version  # Should show cargo version
   ```

3. **Python 3.11+** - [Download](https://www.python.org/downloads/)
   ```powershell
   python --version  # Should be 3.11.0 or higher
   ```

4. **NSIS** (for Windows installer) - [Download](https://nsis.sourceforge.io/Download)
   ```powershell
   makensis /VERSION  # Should show NSIS version
   ```

### Clone and Setup

```powershell
# Clone the repository
git clone https://github.com/CyberSytener/cyberseed.git
cd cyberseed

# Install dependencies
npm install

# Install Python dependencies
pip install -r backend/requirements.txt
```

### Build Commands

#### Quick Build (Development)

```powershell
# Build frontend and run in development mode
npm run tauri:dev
```

#### Production Build

```powershell
# Build frontend and Tauri app
npm run build
npm run tauri:build

# Or use the build script
.\scripts\build-windows.ps1
```

#### Create Installer

**Option 1: Without Embedded Python**
```powershell
.\scripts\create-installer.ps1
```

**Option 2: With Embedded Python (Standalone)**
```powershell
.\scripts\create-installer.ps1 -IncludePython
```

**Option 3: Skip Build (if already built)**
```powershell
.\scripts\create-installer.ps1 -IncludePython -SkipBuild
```

### Build Artifacts

After building, you'll find:
- Executable: `Seed/src-tauri/target/release/Cyberseed.exe`
- Installer: `build/windows/Cyberseed-Setup.exe`
- NSIS bundle: `Seed/src-tauri/target/release/bundle/nsis/`

### Development Workflow

```powershell
# 1. Make code changes
# 2. Build frontend
npm run build

# 3. Test with Tauri dev
npm run tauri:dev

# 4. Build release
.\scripts\build-windows.ps1

# 5. Create installer
.\scripts\create-installer.ps1 -IncludePython

# 6. Test installer on clean VM or machine
```

---

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────┐
│     Cyberseed Desktop App           │
│  (Tauri + React + TypeScript)       │
└───────────────┬─────────────────────┘
                │
                │ IPC Commands
                ▼
┌─────────────────────────────────────┐
│    Backend Manager (Rust)           │
│  - Process lifecycle                │
│  - Python detection                 │
│  - Dependency management            │
└───────────────┬─────────────────────┘
                │
                │ Spawns/Manages
                ▼
┌─────────────────────────────────────┐
│    Python Backend (FastAPI)         │
│  - API endpoints                    │
│  - LLM integration                  │
│  - RAG pipeline                     │
│  - Lazy loading                     │
└─────────────────────────────────────┘
```

### Component Details

**Frontend (React + Tauri)**
- Location: `src/`
- Built with: Vite, React 19, TypeScript
- UI Framework: Radix UI, TailwindCSS
- State Management: Zustand

**Backend Manager (Rust)**
- Location: `Seed/src-tauri/src/`
- Purpose: Python process lifecycle management
- Features: Auto-start, health checks, dependency installation

**Python Backend (FastAPI)**
- Location: `backend/`
- Framework: FastAPI + Uvicorn
- Features: Chat, RAG, authentication, file management

**Lazy Loading Module**
- Location: `backend/core/lazy_init.py`
- Purpose: Deferred imports for heavy dependencies
- Pattern: Thread-safe double-checked locking

### Data Flow

```
User Action → Frontend (React)
           ↓
    Tauri IPC Command
           ↓
Backend Manager (Rust) → Start Python Backend
           ↓
    HTTP API Call
           ↓
Python Backend (FastAPI) → Process Request
           ↓
    Lazy Load Modules (if needed)
           ↓
    Response → Frontend → User
```

### File Structure

```
cyberseed/
├── src/                    # Frontend source (React/TS)
│   ├── components/         # React components
│   ├── lib/               # API client, types
│   └── stores/            # State management
├── backend/               # Python backend
│   ├── core/             # Core modules (lazy_init, auth)
│   ├── app_v2.py         # FastAPI application
│   └── requirements.txt  # Python dependencies
├── Seed/src-tauri/       # Tauri application
│   ├── src/             # Rust backend manager
│   ├── installer/       # NSIS installer scripts
│   └── tauri.conf.json  # Tauri configuration
├── scripts/             # Build scripts
│   ├── build-windows.ps1
│   ├── create-installer.ps1
│   └── bundle-python.ps1
└── build/              # Build output
    └── windows/        # Installers
```

---

## Features

### 1. Backend Process Manager (Rust)

The desktop app includes a robust backend manager written in Rust that handles the Python backend lifecycle:

- **Auto-start/stop**: Backend starts automatically when the app launches and stops on exit
- **Python detection**: Automatically detects embedded Python or system Python
- **Thread-safe**: Uses Mutex for safe concurrent access
- **Dependency management**: Checks and installs pip requirements
- **Status monitoring**: Real-time backend status checks

**Tauri Commands Available:**
- `start_backend(python_path?, backend_dir?)` - Start the Python backend
- `stop_backend()` - Stop the backend process
- `check_backend_status()` - Check if backend is running
- `check_dependencies(python_path?, requirements_path?)` - Check Python and dependencies
- `install_requirements(python_path?, requirements_path?)` - Install pip packages
- `get_backend_port()` - Get the backend port number

### 2. Lazy Loading (Python)

The backend supports lazy loading to minimize startup time and memory usage:

```python
from backend.core.lazy_init import lazy_import

# Instead of importing immediately:
# from heavy_module import HeavyClass

# Use lazy loading:
HeavyClass = lazy_import('heavy_module.HeavyClass')

# Module loads only when first accessed
instance = HeavyClass()  # Loads here
```

**Pre-defined lazy modules:**
- `embeddings_lazy` - Sentence transformers
- `whisper_lazy` - Whisper transcription
- `transformers_lazy` - HuggingFace transformers
- `llm_router_lazy` - LLM router (when implemented)

### 3. Setup Screen

First-run experience with automatic dependency checking:

- Checks for Python installation
- Verifies pip requirements
- Installs dependencies automatically
- Starts backend when ready
- Beautiful gradient UI with progress indicators
- Manual fallback options if auto-setup fails

### 4. Build Scripts

#### Bundle Python (Windows)

```powershell
# Bundle Python 3.11.7 embedded
.\scripts\bundle-python.ps1

# Bundle specific version
.\scripts\bundle-python.ps1 -PythonVersion "3.11.9"
```

#### Build Installer

```powershell
# Build without bundled Python (users need Python installed)
.\scripts\build-installer.ps1

# Build with bundled Python (standalone installer)
.\scripts\build-installer.ps1 -IncludePython

# Build in debug mode
.\scripts\build-installer.ps1 -Debug
```

## Development

### Prerequisites

- **Rust**: Install from [rustup.rs](https://rustup.rs)
- **Node.js**: Version 18+ 
- **Python**: Version 3.11+ (for development)
- **System Libraries** (Linux):
  ```bash
  sudo apt-get install libgtk-3-dev libwebkit2gtk-4.1-dev \
    libjavascriptcoregtk-4.1-dev libsoup-3.0-dev
  ```

### Setup

```bash
# Install frontend dependencies
npm install

# Build frontend
npm run build

# Run in development mode
npm run tauri:dev

# Build for production
npm run tauri:build
```

### Environment Variables

See `.env.example` and `Seed/src-tauri/.env.example` for configuration options:

```env
# Desktop App Settings
CYBERSEED_BACKEND_PORT=8000
CYBERSEED_USE_EMBEDDED_PYTHON=auto
CYBERSEED_LAZY_LOAD_MODELS=true

# Build Settings
BUNDLE_PYTHON=false
PYTHON_VERSION=3.11.7
```

## Architecture

### Backend Manager Flow

```
App Start
    ↓
Setup Screen
    ↓
Check Python → Not Found → Error + Manual Install
    ↓ Found
Check Dependencies → Missing → Auto Install
    ↓ Installed
Start Backend → Success → Main App
    ↓ Fail
    Error + Retry
```

### Window Close Handling

```rust
.on_window_event(move |_window, event| {
    if let tauri::WindowEvent::CloseRequested { .. } = event {
        // Gracefully stop backend
        let _ = backend_manager_clone.stop_backend();
    }
})
```

### Lazy Loading Pattern

```python
class LazyModule:
    def _load(self):
        if self._loaded:
            return self._module
        
        with self._lock:
            if self._loaded:
                return self._module
            
            # Load module here
            self._module = importlib.import_module(...)
            self._loaded = True
            return self._module
```

## NSIS Installer (Windows)

The NSIS installer provides:

- Python detection on installation
- Option to use system or embedded Python
- Automatic dependency installation
- Start menu shortcuts
- Desktop shortcut
- Proper uninstaller
- User-level installation (no admin required)

**Location**: `Seed/src-tauri/installer/nsis/installer.nsi`

## Resource Optimization

### Key Features

1. **Backend Only Runs When Active**
   - Starts with app
   - Stops on exit
   - No background processes

2. **Lazy Loading**
   - Heavy modules load on-demand
   - Reduced startup time
   - Lower memory footprint at idle

3. **Process Management**
   - Proper cleanup on exit
   - Thread-safe operations
   - Error recovery

## Troubleshooting

### For End Users

#### Application won't start

**Symptom**: Double-clicking Cyberseed does nothing or shows an error

**Solutions**:
1. Check if Python is installed (for non-bundled installer)
   - Open Command Prompt
   - Type: `python --version`
   - Should show Python 3.11 or higher
2. Reinstall Cyberseed using the standalone installer with embedded Python
3. Check Windows Event Viewer for application errors
4. Try running as administrator (right-click → Run as administrator)

#### Backend connection failed

**Symptom**: Application opens but shows "Backend not available" or connection errors

**Solutions**:
1. Wait 10-15 seconds for backend to start (first launch is slower)
2. Check if port 8000 is available:
   - Open Command Prompt
   - Type: `netstat -ano | findstr :8000`
   - If another process is using port 8000, close it or restart your computer
3. Check firewall settings - allow Cyberseed through Windows Firewall
4. Restart the application

#### Dependencies installation failed

**Symptom**: Installer completes but application shows missing dependencies

**Solutions**:
1. **With embedded Python**:
   - Open Command Prompt as Administrator
   - Navigate to: `%LOCALAPPDATA%\Cyberseed\python`
   - Run: `python.exe -m pip install -r ..\backend\requirements.txt`

2. **With system Python**:
   - Open Command Prompt
   - Run: `pip install -r "%LOCALAPPDATA%\Cyberseed\backend\requirements.txt"`

3. Check internet connection (pip needs to download packages)

#### Application crashes on startup

**Symptom**: Application window appears then immediately closes

**Solutions**:
1. Check if you have sufficient disk space (need at least 1GB free)
2. Check if you have sufficient RAM (need at least 4GB)
3. Update Windows to latest version
4. Reinstall Cyberseed
5. Check logs at: `%LOCALAPPDATA%\Cyberseed\logs\`

#### Can't uninstall properly

**Symptom**: Uninstaller fails or leaves files behind

**Solutions**:
1. Run uninstaller from Start Menu → Cyberseed → Uninstall
2. If that fails, manually delete: `%LOCALAPPDATA%\Cyberseed`
3. Remove Start Menu shortcuts manually
4. Remove from registry (advanced users only):
   - Open Registry Editor (regedit)
   - Navigate to: `HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Uninstall`
   - Delete Cyberseed entry

### For Developers

#### Backend won't start in development

**Symptom**: `npm run tauri:dev` fails to start backend

**Solutions**:
1. Check Python is installed: `python --version`
2. Verify requirements are installed: `pip list | grep fastapi`
3. Check backend logs in terminal output
4. Try manual backend start:
   ```powershell
   cd backend
   python -m uvicorn app_v2:app --reload
   ```
5. Install requirements manually: `pip install -r backend/requirements.txt`

#### Setup screen stuck in development

**Symptom**: Setup screen loops or never completes

**Solutions**:
1. Check browser console for errors (F12 in Tauri window)
2. Use manual install buttons in setup screen
3. Restart the application completely
4. Verify Python path is correct in backend manager
5. Check if backend is accessible: `curl http://localhost:8000/health`

#### Build fails with Rust errors

**Symptom**: `npm run tauri:build` fails with cargo errors

**Solutions**:
1. Ensure Rust is up to date: `rustup update`
2. Clean build cache: `cargo clean`
3. Update dependencies: `cargo update`
4. Check Tauri version compatibility: `npm list @tauri-apps/cli`
5. On Linux, ensure system libraries are installed:
   ```bash
   sudo apt-get install libgtk-3-dev libwebkit2gtk-4.1-dev
   ```

#### Frontend build errors

**Symptom**: TypeScript or Vite build errors

**Solutions**:
1. Delete node_modules and reinstall: `rm -rf node_modules && npm install`
2. Clear npm cache: `npm cache clean --force`
3. Check Node.js version: `node --version` (should be 18+)
4. Verify TypeScript files compile: `npm run build`
5. Check for missing type definitions

#### NSIS installer creation fails

**Symptom**: `create-installer.ps1` fails or produces no output

**Solutions**:
1. Verify NSIS is installed: `makensis /VERSION`
2. Install NSIS from [nsis.sourceforge.io](https://nsis.sourceforge.io/Download)
3. Check that build artifacts exist in `Seed/src-tauri/target/release/`
4. Verify NSIS script syntax: Check `Seed/src-tauri/installer/nsis/CyberseedInstaller.nsi`
5. Run with verbose output: Check PowerShell error messages
6. Ensure all file paths in script are correct

#### Python bundling fails

**Symptom**: `bundle-python.ps1` fails to download or extract Python

**Solutions**:
1. Check internet connection
2. Verify Python version exists: Check [python.org](https://www.python.org/downloads/)
3. Try different Python version: `.\scripts\bundle-python.ps1 -PythonVersion "3.11.9"`
4. Clear temp files: Delete `%TEMP%\python-embed.zip`
5. Run PowerShell as Administrator

### Common Error Messages

#### "Python not found"
- **Cause**: Python not in PATH or not installed
- **Fix**: Install Python 3.11+ or use standalone installer with embedded Python

#### "Module not found: fastapi"
- **Cause**: Python dependencies not installed
- **Fix**: Run `pip install -r backend/requirements.txt`

#### "Port 8000 already in use"
- **Cause**: Another application is using port 8000
- **Fix**: Close other applications or restart computer

#### "Failed to spawn backend process"
- **Cause**: Backend executable not found or permissions issue
- **Fix**: Check file exists, verify permissions, run as administrator

#### "Access denied" during installation
- **Cause**: Insufficient permissions or antivirus blocking
- **Fix**: Run installer as administrator, temporarily disable antivirus

### Getting More Help

If you're still having issues:

1. **Check logs**:
   - End users: `%LOCALAPPDATA%\Cyberseed\logs\`
   - Developers: Terminal output from `npm run tauri:dev`

2. **Check existing issues**: [GitHub Issues](https://github.com/CyberSytener/cyberseed/issues)

3. **Create a new issue**: Include:
   - Windows version
   - Python version (if applicable)
   - Error messages
   - Log files
   - Steps to reproduce

4. **Community support**: Check repository discussions

## Performance

Expected resource usage:

- **Idle**: ~150MB RAM, minimal CPU
- **Active chat**: ~400MB RAM, moderate CPU
- **Training**: ~1GB+ RAM, high CPU (temporary)
- **Startup time**: 2-5 seconds with lazy loading

## Security

- User-level installation (no admin required)
- No network access except backend API
- Sandboxed Tauri application
- Python dependencies verified via pip

## Future Enhancements

- [ ] Auto-update functionality
- [ ] Multiple backend profiles
- [ ] GPU detection and utilization
- [ ] Background task queue
- [ ] Crash reporting
- [ ] Telemetry (opt-in)

## Contributing

When adding heavy Python dependencies:

1. Add lazy import in `backend/core/lazy_init.py`
2. Use lazy import in your code
3. Update documentation
4. Test startup time impact

## License

See LICENSE file in repository root.
