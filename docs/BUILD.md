# Cyberseed Build Guide

## Prerequisites

- Node.js 18+
- Rust (latest stable)
- NSIS (for Windows installer)

## Development Build

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# In another terminal, start Tauri dev
cd Seed
npx tauri dev
```

## Production Build (Recommended)

Uses Tauri's built-in bundler:

```bash
# From project root
npm install
npm run build
cd Seed
npx tauri build
```

Output: `Seed/src-tauri/target/release/bundle/nsis/Cyberseed_0.1.0_x64-setup.exe`

## Production Build with Embedded Python

Uses custom installer scripts:

```powershell
# From project root
.\scripts\create-installer.ps1 -IncludePython
```

Output: `build/windows/Cyberseed-Setup.exe`

## Build Outputs

| Build Type | Command | Output Location |
|------------|---------|-----------------|
| Dev | `npx tauri dev` | In-memory |
| Release (Tauri) | `npx tauri build` | `Seed/src-tauri/target/release/bundle/` |
| Release (Custom) | `create-installer.ps1` | `build/windows/` |

## Troubleshooting

### "File not found" errors during NSIS compilation
- Ensure you've run `npm run build` first
- Check that `cyberseed.exe` exists in `Seed/src-tauri/target/release/`

### Python not found
- Install Python 3.11+ and add to PATH
- Or use `-IncludePython` flag with custom installer
