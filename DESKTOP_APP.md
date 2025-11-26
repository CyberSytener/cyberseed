# Cyberseed Desktop App

This document describes the Phase 4 Extended desktop application features including backend process management, resource optimization, and Python bundling.

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

### Backend won't start

1. Check Python is installed: `python --version`
2. Verify requirements are installed: `pip list`
3. Check backend logs in app data directory
4. Try manual install: `pip install -r backend/requirements.txt`

### Setup screen stuck

1. Check console for errors (F12)
2. Use manual install buttons
3. Restart the application
4. Verify Python path is correct

### Build fails

1. Ensure Rust is installed: `cargo --version`
2. Update dependencies: `cargo update`
3. Clean build: `cargo clean && npm run build`
4. Check system libraries on Linux

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
