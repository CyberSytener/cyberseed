# Build Scripts

PowerShell scripts for building the Cyberseed desktop application.

## Scripts

### bundle-python.ps1

Downloads and configures Python embeddable package for bundling with the application.

**Usage:**
```powershell
# Default: Python 3.11.7
.\scripts\bundle-python.ps1

# Specific version
.\scripts\bundle-python.ps1 -PythonVersion "3.11.9"

# Custom output directory
.\scripts\bundle-python.ps1 -OutputDir "custom\path"
```

**What it does:**
1. Downloads Python embeddable package from python.org
2. Extracts to `Seed/src-tauri/python/`
3. Modifies `python._pth` to enable pip
4. Downloads and installs get-pip.py
5. Verifies pip installation

**Output:**
- Python executable at `Seed/src-tauri/python/python.exe`
- pip ready for installing requirements
- ~25MB compressed, ~60MB extracted

### build-installer.ps1

Builds the complete Tauri application with optional Python bundling.

**Usage:**
```powershell
# Build without Python (users need Python installed)
.\scripts\build-installer.ps1

# Build with bundled Python (standalone)
.\scripts\build-installer.ps1 -IncludePython

# Debug build
.\scripts\build-installer.ps1 -Debug

# Custom Python version with bundling
.\scripts\build-installer.ps1 -IncludePython -PythonVersion "3.11.9"
```

**What it does:**
1. Builds frontend with `npm run build`
2. Optionally bundles Python using `bundle-python.ps1`
3. Installs requirements in bundled Python
4. Runs `tauri build` (or `tauri dev` for debug)
5. Shows output artifacts location

**Output Locations:**
- Windows NSIS: `Seed/src-tauri/target/release/bundle/nsis/`
- Windows MSI: `Seed/src-tauri/target/release/bundle/msi/`
- Portable: `Seed/src-tauri/target/release/`

## Requirements

### Windows
- PowerShell 5.1+
- Internet connection (for downloading Python)
- Rust toolchain
- Node.js 18+

### Linux/macOS
These scripts are Windows-specific. For other platforms:

```bash
# Build frontend
npm run build

# Build Tauri app
npm run tauri:build
```

## Examples

### Development Build
```powershell
# Quick build for testing
.\scripts\build-installer.ps1 -Debug
```

### Production Build (System Python)
```powershell
# Build expecting users to have Python
.\scripts\build-installer.ps1
```

### Production Build (Standalone)
```powershell
# Build with everything included
.\scripts\build-installer.ps1 -IncludePython
```

### Custom Python Version
```powershell
# Use specific Python version
.\scripts\bundle-python.ps1 -PythonVersion "3.11.9"
.\scripts\build-installer.ps1 -IncludePython -PythonVersion "3.11.9"
```

## Troubleshooting

### Download Fails
- Check internet connection
- Verify Python version exists on python.org
- Try again (downloads are cached in %TEMP%)

### Build Fails
- Ensure Rust is installed: `cargo --version`
- Update dependencies: `npm install && cargo update`
- Clean build: `cargo clean && npm run build`

### Python Bundle Issues
- Delete `Seed/src-tauri/python/` and retry
- Check disk space (needs ~100MB free)
- Verify antivirus isn't blocking

### Requirements Installation Fails
- Check bundled pip works: `.\Seed\src-tauri\python\python.exe -m pip --version`
- Manually install: `.\Seed\src-tauri\python\python.exe -m pip install -r backend\requirements.txt`
- Check network/proxy settings

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Build Desktop App

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Setup Rust
        uses: dtolnay/rust-toolchain@stable
      
      - name: Install dependencies
        run: npm install
      
      - name: Build with bundled Python
        run: .\scripts\build-installer.ps1 -IncludePython
      
      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: installer
          path: Seed/src-tauri/target/release/bundle/nsis/*.exe
```

## Advanced Usage

### Modifying Bundle

To customize what's included in the bundle, edit `Seed/src-tauri/tauri.conf.json`:

```json
{
  "bundle": {
    "resources": {
      "../../backend": "./",
      "../../python": "./"
    }
  }
}
```

### Custom NSIS Template

1. Edit `Seed/src-tauri/installer/nsis/installer.nsi`
2. Add custom installation logic
3. Reference in tauri.conf.json (requires Tauri support)

### Pre-build Hooks

Create `Seed/src-tauri/build.rs` for custom pre-build steps:

```rust
fn main() {
    // Custom build logic
    println!("cargo:rerun-if-changed=../../backend");
}
```

## Best Practices

1. **Always test builds locally** before CI/CD
2. **Version Python carefully** - changes break compatibility
3. **Test on clean systems** to verify standalone installers
4. **Keep bundle size reasonable** - consider download size
5. **Document Python version** in release notes

## Size Estimates

- **Without Python**: ~15MB installer
- **With Python**: ~40MB installer
- **With Python + deps**: ~100MB+ installer

## Platform Support

| Platform | Script | Native Build |
|----------|--------|--------------|
| Windows  | ✅ Yes | ✅ Yes      |
| Linux    | ❌ No  | ✅ Yes      |
| macOS    | ❌ No  | ✅ Yes      |

For Linux/macOS, use standard Tauri build commands.
