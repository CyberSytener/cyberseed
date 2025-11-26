# Build Windows Release Script for Cyberseed
# Builds the frontend and Tauri application in release mode

param(
    [switch]$Debug = $false
)

$ErrorActionPreference = "Stop"

Write-Host "=== Cyberseed Windows Build Script ===" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the correct directory
if (-not (Test-Path "package.json")) {
    Write-Host "Error: package.json not found. Please run from project root." -ForegroundColor Red
    exit 1
}

# Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Yellow

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "  Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "  Node.js: NOT FOUND" -ForegroundColor Red
    Write-Host "Error: Node.js is required. Install from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check npm
try {
    $npmVersion = npm --version
    Write-Host "  npm: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "  npm: NOT FOUND" -ForegroundColor Red
    exit 1
}

# Check Rust
try {
    $rustVersion = cargo --version
    Write-Host "  Rust: $rustVersion" -ForegroundColor Green
} catch {
    Write-Host "  Rust: NOT FOUND" -ForegroundColor Red
    Write-Host "Error: Rust is required. Install from https://rustup.rs/" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Prerequisites OK" -ForegroundColor Green
Write-Host ""

# Step 1: Install dependencies (if needed)
if (-not (Test-Path "node_modules")) {
    Write-Host "Step 1: Installing dependencies..." -ForegroundColor Yellow
    npm install
    Write-Host "Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "Step 1: Dependencies already installed" -ForegroundColor Gray
}

Write-Host ""

# Step 2: Build Frontend
Write-Host "Step 2: Building frontend..." -ForegroundColor Yellow
try {
    npm run build
    Write-Host "Frontend build complete" -ForegroundColor Green
} catch {
    Write-Host "Frontend build failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 3: Build Tauri
Write-Host "Step 3: Building Tauri application..." -ForegroundColor Yellow

$buildMode = if ($Debug) { "debug" } else { "release" }
Write-Host "Build mode: $buildMode" -ForegroundColor Cyan

try {
    if ($Debug) {
        # Debug build
        Set-Location "Seed/src-tauri"
        cargo build
        Set-Location "../.."
    } else {
        # Release build
        npm run tauri:build
    }
    
    Write-Host "Tauri build complete" -ForegroundColor Green
} catch {
    Write-Host "Tauri build failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 4: Copy backend files
Write-Host "Step 4: Copying backend files..." -ForegroundColor Yellow

$targetDir = if ($Debug) {
    "Seed\src-tauri\target\debug"
} else {
    "Seed\src-tauri\target\release"
}

if (Test-Path $targetDir) {
    # Create backend directory in output
    $backendTarget = Join-Path $targetDir "backend"
    
    if (-not (Test-Path $backendTarget)) {
        New-Item -ItemType Directory -Path $backendTarget -Force | Out-Null
    }
    
    # Copy backend files
    Copy-Item "backend\*" -Destination $backendTarget -Recurse -Force
    Write-Host "Backend files copied to $backendTarget" -ForegroundColor Green
} else {
    Write-Host "Warning: Target directory not found: $targetDir" -ForegroundColor Yellow
}

Write-Host ""

# Step 5: Create output directory structure
Write-Host "Step 5: Organizing output..." -ForegroundColor Yellow

$outputDir = "build\windows"

if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
}

# Copy build artifacts
$bundleDir = "Seed\src-tauri\target\release\bundle"
if (Test-Path $bundleDir) {
    Write-Host "Copying bundle artifacts to $outputDir..." -ForegroundColor Yellow
    
    # Copy NSIS installer if exists
    $nsisDir = Join-Path $bundleDir "nsis"
    if (Test-Path $nsisDir) {
        Get-ChildItem $nsisDir -Filter "*.exe" | ForEach-Object {
            Copy-Item $_.FullName -Destination $outputDir -Force
            Write-Host "  Copied: $($_.Name)" -ForegroundColor White
        }
    }
    
    # Copy MSI if exists
    $msiDir = Join-Path $bundleDir "msi"
    if (Test-Path $msiDir) {
        Get-ChildItem $msiDir -Filter "*.msi" | ForEach-Object {
            Copy-Item $_.FullName -Destination $outputDir -Force
            Write-Host "  Copied: $($_.Name)" -ForegroundColor White
        }
    }
}

Write-Host ""
Write-Host "=== Build Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Build artifacts location:" -ForegroundColor Green
Write-Host "  Target: $targetDir" -ForegroundColor White
Write-Host "  Bundle: $bundleDir" -ForegroundColor White
Write-Host "  Output: $outputDir" -ForegroundColor White
Write-Host ""

if (Test-Path $outputDir) {
    Write-Host "Installers in output directory:" -ForegroundColor Green
    Get-ChildItem $outputDir | ForEach-Object {
        Write-Host "  - $($_.Name)" -ForegroundColor White
    }
} else {
    Write-Host "No installers found in output directory" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Done!" -ForegroundColor Green
