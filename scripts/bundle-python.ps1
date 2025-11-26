# Bundle Python Script for Cyberseed
# Downloads and configures Python embeddable package

param(
    [string]$PythonVersion = "3.11.7",
    [string]$OutputDir = "Seed\src-tauri\python"
)

$ErrorActionPreference = "Stop"

Write-Host "=== Cyberseed Python Bundler ===" -ForegroundColor Cyan
Write-Host "Python Version: $PythonVersion"
Write-Host "Output Directory: $OutputDir"
Write-Host ""

# Determine architecture
$arch = if ([Environment]::Is64BitOperatingSystem) { "amd64" } else { "win32" }
Write-Host "Detected architecture: $arch" -ForegroundColor Green

# Construct download URL
$pythonUrl = "https://www.python.org/ftp/python/$PythonVersion/python-$PythonVersion-embed-$arch.zip"
$tempZip = Join-Path $env:TEMP "python-embed.zip"
$getpipUrl = "https://bootstrap.pypa.io/get-pip.py"
$getpipPath = Join-Path $env:TEMP "get-pip.py"

Write-Host "Downloading Python embeddable from: $pythonUrl" -ForegroundColor Yellow

try {
    # Download Python embeddable
    Invoke-WebRequest -Uri $pythonUrl -OutFile $tempZip -UseBasicParsing
    Write-Host "Download complete" -ForegroundColor Green

    # Create output directory
    if (Test-Path $OutputDir) {
        Write-Host "Cleaning existing Python directory..." -ForegroundColor Yellow
        Remove-Item -Path $OutputDir -Recurse -Force
    }
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null

    # Extract Python
    Write-Host "Extracting Python to $OutputDir..." -ForegroundColor Yellow
    Expand-Archive -Path $tempZip -DestinationPath $OutputDir -Force
    Write-Host "Extraction complete" -ForegroundColor Green

    # Enable pip in embedded Python
    Write-Host "Configuring embedded Python for pip..." -ForegroundColor Yellow
    
    # Find and modify python*._pth file to enable site-packages
    $pthFile = Get-ChildItem -Path $OutputDir -Filter "python*._pth" | Select-Object -First 1
    if ($pthFile) {
        $pthContent = Get-Content $pthFile.FullName
        $pthContent = $pthContent -replace "^#import site", "import site"
        
        # Add Scripts directory to path
        $pthContent += "`nScripts"
        $pthContent += "`nLib\site-packages"
        
        Set-Content -Path $pthFile.FullName -Value $pthContent
        Write-Host "Modified $($pthFile.Name) to enable pip" -ForegroundColor Green
    } else {
        Write-Warning "Could not find python._pth file"
    }

    # Download get-pip.py
    Write-Host "Downloading get-pip.py..." -ForegroundColor Yellow
    Invoke-WebRequest -Uri $getpipUrl -OutFile $getpipPath -UseBasicParsing
    
    # Install pip in embedded Python
    Write-Host "Installing pip..." -ForegroundColor Yellow
    $pythonExe = Join-Path $OutputDir "python.exe"
    
    if (Test-Path $pythonExe) {
        & $pythonExe $getpipPath
        Write-Host "pip installed successfully" -ForegroundColor Green
        
        # Verify pip installation
        Write-Host "Verifying pip installation..." -ForegroundColor Yellow
        & $pythonExe -m pip --version
        
        Write-Host ""
        Write-Host "=== Python Bundle Complete ===" -ForegroundColor Cyan
        Write-Host "Python location: $OutputDir" -ForegroundColor Green
        Write-Host "Python executable: $pythonExe" -ForegroundColor Green
        Write-Host ""
        Write-Host "To install requirements, run:" -ForegroundColor Yellow
        Write-Host "  $pythonExe -m pip install -r backend\requirements.txt" -ForegroundColor White
    } else {
        throw "Python executable not found after extraction"
    }

} catch {
    Write-Host ""
    Write-Host "=== Error ===" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
} finally {
    # Cleanup
    if (Test-Path $tempZip) {
        Remove-Item $tempZip -Force
    }
    if (Test-Path $getpipPath) {
        Remove-Item $getpipPath -Force
    }
}

Write-Host ""
Write-Host "Done!" -ForegroundColor Green
