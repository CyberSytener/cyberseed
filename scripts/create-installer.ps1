# Create Standalone Windows Installer for Cyberseed
# Creates a production-ready installer with optional embedded Python

param(
    [switch]$IncludePython = $false,
    [switch]$SkipBuild = $false,
    [string]$PythonVersion = "3.11.7"
)

$ErrorActionPreference = "Stop"

Write-Host "=== Cyberseed Installer Creation Script ===" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the correct directory
if (-not (Test-Path "package.json")) {
    Write-Host "Error: package.json not found. Please run from project root." -ForegroundColor Red
    exit 1
}

# Check NSIS
Write-Host "Checking for NSIS..." -ForegroundColor Yellow
try {
    $nsisPath = Get-Command makensis -ErrorAction SilentlyContinue
    if ($nsisPath) {
        Write-Host "  NSIS found: $($nsisPath.Source)" -ForegroundColor Green
    } else {
        # Try common installation paths
        $commonPaths = @(
            "${env:ProgramFiles}\NSIS\makensis.exe",
            "${env:ProgramFiles(x86)}\NSIS\makensis.exe"
        )
        
        $found = $false
        foreach ($path in $commonPaths) {
            if (Test-Path $path) {
                $nsisPath = $path
                $found = $true
                Write-Host "  NSIS found: $path" -ForegroundColor Green
                break
            }
        }
        
        if (-not $found) {
            Write-Host "  NSIS: NOT FOUND" -ForegroundColor Red
            Write-Host "Error: NSIS is required to create the installer." -ForegroundColor Red
            Write-Host "Download from: https://nsis.sourceforge.io/Download" -ForegroundColor Yellow
            exit 1
        }
    }
} catch {
    Write-Host "  NSIS: NOT FOUND" -ForegroundColor Red
    Write-Host "Error: NSIS is required. Install from https://nsis.sourceforge.io/" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 1: Build application (unless skipped)
if (-not $SkipBuild) {
    Write-Host "Step 1: Building application..." -ForegroundColor Yellow
    try {
        & ".\scripts\build-windows.ps1"
        Write-Host "Build complete" -ForegroundColor Green
    } catch {
        Write-Host "Build failed: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "Step 1: Skipping build (use -SkipBuild flag)" -ForegroundColor Gray
}

Write-Host ""

# Step 2: Download and prepare embedded Python (if requested)
if ($IncludePython) {
    Write-Host "Step 2: Preparing embedded Python..." -ForegroundColor Yellow
    
    $pythonDir = "Seed\src-tauri\python"
    
    # Check if Python already bundled
    if (Test-Path "$pythonDir\python.exe") {
        Write-Host "  Embedded Python already exists" -ForegroundColor Green
        
        # Ask if user wants to re-download
        $response = Read-Host "Re-download Python? (y/N)"
        if ($response -eq "y" -or $response -eq "Y") {
            Remove-Item -Path $pythonDir -Recurse -Force
        } else {
            Write-Host "  Using existing Python bundle" -ForegroundColor Gray
        }
    }
    
    # Download if not exists
    if (-not (Test-Path "$pythonDir\python.exe")) {
        try {
            & ".\scripts\bundle-python.ps1" -PythonVersion $PythonVersion
            Write-Host "Python bundled successfully" -ForegroundColor Green
        } catch {
            Write-Host "Python bundling failed: $($_.Exception.Message)" -ForegroundColor Red
            Write-Host "Continuing without embedded Python..." -ForegroundColor Yellow
        }
    }
    
    # Install requirements in bundled Python
    if (Test-Path "$pythonDir\python.exe") {
        Write-Host "Installing Python requirements in embedded Python..." -ForegroundColor Yellow
        try {
            & "$pythonDir\python.exe" -m pip install -r "backend\requirements.txt" --quiet
            Write-Host "Requirements installed" -ForegroundColor Green
        } catch {
            Write-Host "Warning: Could not install requirements: $($_.Exception.Message)" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "Step 2: Skipping embedded Python (use -IncludePython to bundle)" -ForegroundColor Gray
}

Write-Host ""

# Step 3: Prepare installer staging directory
Write-Host "Step 3: Preparing installer staging..." -ForegroundColor Yellow

$stagingDir = "build\installer-staging"
$installerOutput = "build\windows"

# Clean staging directory
if (Test-Path $stagingDir) {
    Remove-Item -Path $stagingDir -Recurse -Force
}
New-Item -ItemType Directory -Path $stagingDir -Force | Out-Null

# Create output directory
if (-not (Test-Path $installerOutput)) {
    New-Item -ItemType Directory -Path $installerOutput -Force | Out-Null
}

# Copy application files
$releaseDir = "Seed\src-tauri\target\release"
$exePath = Join-Path $releaseDir "Cyberseed.exe"

if (Test-Path $exePath) {
    Copy-Item $exePath -Destination $stagingDir -Force
    Write-Host "  Copied Cyberseed.exe" -ForegroundColor White
} else {
    Write-Host "Error: Cyberseed.exe not found at $exePath" -ForegroundColor Red
    Write-Host "Please build the application first or remove -SkipBuild flag" -ForegroundColor Yellow
    exit 1
}

# Copy backend
$backendSource = "backend"
$backendTarget = Join-Path $stagingDir "backend"
Copy-Item $backendSource -Destination $backendTarget -Recurse -Force
Write-Host "  Copied backend files" -ForegroundColor White

# Copy Python if included
if ($IncludePython -and (Test-Path "Seed\src-tauri\python")) {
    $pythonTarget = Join-Path $stagingDir "python"
    Copy-Item "Seed\src-tauri\python" -Destination $pythonTarget -Recurse -Force
    Write-Host "  Copied embedded Python" -ForegroundColor White
}

Write-Host "Staging complete" -ForegroundColor Green
Write-Host ""

# Step 4: Download get-pip.py (for installer)
Write-Host "Step 4: Downloading get-pip.py..." -ForegroundColor Yellow

$getpipUrl = "https://bootstrap.pypa.io/get-pip.py"
$getpipPath = Join-Path $stagingDir "get-pip.py"

try {
    Invoke-WebRequest -Uri $getpipUrl -OutFile $getpipPath -UseBasicParsing
    Write-Host "get-pip.py downloaded" -ForegroundColor Green
} catch {
    Write-Host "Warning: Could not download get-pip.py: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""

# Step 5: Run NSIS to create installer
Write-Host "Step 5: Creating installer with NSIS..." -ForegroundColor Yellow

$nsisScript = "Seed\src-tauri\installer\nsis\CyberseedInstaller.nsi"

if (-not (Test-Path $nsisScript)) {
    Write-Host "Warning: NSIS script not found at $nsisScript" -ForegroundColor Yellow
    Write-Host "Falling back to installer.nsi" -ForegroundColor Yellow
    $nsisScript = "Seed\src-tauri\installer\nsis\installer.nsi"
}

if (-not (Test-Path $nsisScript)) {
    Write-Host "Error: NSIS script not found" -ForegroundColor Red
    exit 1
}

try {
    # Define build variables for NSIS
    $nsisDefines = @(
        "/DPRODUCT_VERSION=0.1.0",
        "/DBUILD_DIR=$stagingDir",
        "/DOUTPUT_DIR=$installerOutput"
    )
    
    if ($IncludePython) {
        $nsisDefines += "/DINCLUDE_PYTHON=1"
    }
    
    # Run NSIS
    $nsisArgs = $nsisDefines + @($nsisScript)
    
    if ($nsisPath -is [System.Management.Automation.ApplicationInfo]) {
        & makensis @nsisArgs
    } else {
        & $nsisPath @nsisArgs
    }
    
    Write-Host "Installer created successfully" -ForegroundColor Green
} catch {
    Write-Host "NSIS compilation failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 6: Show results
Write-Host "=== Installer Creation Complete ===" -ForegroundColor Cyan
Write-Host ""

if (Test-Path $installerOutput) {
    Write-Host "Installer location:" -ForegroundColor Green
    Get-ChildItem $installerOutput -Filter "*.exe" | ForEach-Object {
        $size = [math]::Round($_.Length / 1MB, 2)
        Write-Host "  $($_.FullName) ($size MB)" -ForegroundColor White
    }
} else {
    Write-Host "No installer found in output directory" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Next Steps ===" -ForegroundColor Cyan
Write-Host "1. Test the installer on a clean Windows machine" -ForegroundColor White
Write-Host "2. Verify that Python detection works correctly" -ForegroundColor White
Write-Host "3. Check that dependencies are installed properly" -ForegroundColor White
Write-Host "4. Test the application after installation" -ForegroundColor White

if (-not $IncludePython) {
    Write-Host ""
    Write-Host "Note: This installer requires Python 3.11+ on the target system." -ForegroundColor Yellow
    Write-Host "For a standalone installer, use -IncludePython flag" -ForegroundColor White
}

Write-Host ""
Write-Host "Done!" -ForegroundColor Green
