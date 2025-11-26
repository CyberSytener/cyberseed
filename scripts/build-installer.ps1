# Build Installer Script for Cyberseed
# Builds the Tauri application with optional Python bundling

param(
    [switch]$IncludePython = $false,
    [switch]$Debug = $false,
    [string]$PythonVersion = "3.11.7"
)

$ErrorActionPreference = "Stop"

Write-Host "=== Cyberseed Build Script ===" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the correct directory
if (-not (Test-Path "package.json")) {
    Write-Host "Error: package.json not found. Please run from project root." -ForegroundColor Red
    exit 1
}

# Step 1: Build Frontend
Write-Host "Step 1: Building frontend..." -ForegroundColor Yellow
try {
    npm run build
    Write-Host "Frontend build complete" -ForegroundColor Green
} catch {
    Write-Host "Frontend build failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 2: Bundle Python (optional)
if ($IncludePython) {
    Write-Host ""
    Write-Host "Step 2: Bundling Python..." -ForegroundColor Yellow
    try {
        & ".\scripts\bundle-python.ps1" -PythonVersion $PythonVersion
        Write-Host "Python bundling complete" -ForegroundColor Green
        
        # Install requirements in bundled Python
        $pythonExe = "Seed\src-tauri\python\python.exe"
        if (Test-Path $pythonExe) {
            Write-Host "Installing Python requirements..." -ForegroundColor Yellow
            & $pythonExe -m pip install -r "backend\requirements.txt"
            Write-Host "Requirements installed" -ForegroundColor Green
        }
    } catch {
        Write-Host "Python bundling failed: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "Continuing without bundled Python..." -ForegroundColor Yellow
    }
} else {
    Write-Host ""
    Write-Host "Step 2: Skipping Python bundling (use -IncludePython to bundle)" -ForegroundColor Gray
}

# Step 3: Build Tauri
Write-Host ""
Write-Host "Step 3: Building Tauri application..." -ForegroundColor Yellow

$buildCommand = if ($Debug) {
    Write-Host "Building in DEBUG mode..." -ForegroundColor Yellow
    "npm run tauri:dev"
} else {
    Write-Host "Building in RELEASE mode..." -ForegroundColor Yellow
    "npm run tauri:build"
}

try {
    Invoke-Expression $buildCommand
    Write-Host ""
    Write-Host "=== Build Complete ===" -ForegroundColor Cyan
    
    # Show output location
    $bundleDir = "Seed\src-tauri\target\release\bundle"
    if (Test-Path $bundleDir) {
        Write-Host ""
        Write-Host "Build artifacts:" -ForegroundColor Green
        Get-ChildItem $bundleDir -Recurse -File | Where-Object { 
            $_.Extension -in @('.exe', '.msi', '.dmg', '.AppImage', '.deb') 
        } | ForEach-Object {
            Write-Host "  - $($_.FullName)" -ForegroundColor White
        }
    }
    
    Write-Host ""
    Write-Host "Build completed successfully!" -ForegroundColor Green
    
} catch {
    Write-Host ""
    Write-Host "=== Build Failed ===" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

# Step 4: Show instructions
Write-Host ""
Write-Host "=== Next Steps ===" -ForegroundColor Cyan
Write-Host "1. Test the installer from the bundle directory" -ForegroundColor White
Write-Host "2. Run the application to verify everything works" -ForegroundColor White
Write-Host "3. Check that backend starts correctly" -ForegroundColor White

if (-not $IncludePython) {
    Write-Host ""
    Write-Host "Note: Python was not bundled. Users will need:" -ForegroundColor Yellow
    Write-Host "  - Python 3.11+ installed on their system" -ForegroundColor White
    Write-Host "  - Or run with -IncludePython flag for standalone installer" -ForegroundColor White
}

Write-Host ""
Write-Host "Done!" -ForegroundColor Green
