; Cyberseed NSIS Installer Script
; Windows installer with Python detection and dependency management

!include "MUI2.nsh"
!include "FileFunc.nsh"

; Application Info
!define PRODUCT_NAME "Cyberseed"
!define PRODUCT_VERSION "0.1.0"
!define PRODUCT_PUBLISHER "Cyberseed Team"
!define PRODUCT_WEB_SITE "https://github.com/CyberSytener/cyberseed"
!define PRODUCT_UNINST_KEY "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}"

; Installer settings
Name "${PRODUCT_NAME}"
OutFile "cyberseed-setup.exe"
InstallDir "$LOCALAPPDATA\${PRODUCT_NAME}"
RequestExecutionLevel user
ShowInstDetails show
ShowUninstDetails show

; Modern UI Configuration
!define MUI_ABORTWARNING
!define MUI_ICON "..\..\icons\icon.ico"
!define MUI_UNICON "..\..\icons\icon.ico"
; Bitmap files commented out - files don't exist
; !define MUI_WELCOMEFINISHPAGE_BITMAP "..\..\icons\installer-banner.bmp"
!define MUI_HEADERIMAGE
; !define MUI_HEADERIMAGE_BITMAP "..\..\icons\installer-header.bmp"

; Pages
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_LICENSE "..\..\..\..\LICENSE"
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES

; Languages
!insertmacro MUI_LANGUAGE "English"

; Variables
Var PYTHON_AVAILABLE
Var PYTHON_PATH
Var PYTHON_VERSION_STR
Var PYTHON_MAJOR
Var PYTHON_MINOR

; Functions

Function .onInit
    ; Check if already installed
    ReadRegStr $R0 HKCU "${PRODUCT_UNINST_KEY}" "UninstallString"
    StrCmp $R0 "" done

    MessageBox MB_OKCANCEL|MB_ICONEXCLAMATION \
    "${PRODUCT_NAME} is already installed. $\n$\nClick OK to remove the previous version or Cancel to cancel this installation." \
    IDOK uninst
    Abort

    uninst:
        ClearErrors
        ExecWait '$R0 /S _?=$INSTDIR'
    
    done:
FunctionEnd

Function CheckPython
    ; Check for Python 3.11+ in system PATH
    DetailPrint "Checking for Python 3.11+..."
    
    ; Initialize
    StrCpy $PYTHON_AVAILABLE "0"
    StrCpy $PYTHON_PATH ""
    
    ; Try python3 first (Linux/macOS style, sometimes available on Windows)
    nsExec::ExecToStack 'python3 --version'
    Pop $0
    Pop $1
    ${If} $0 == 0
        Call ValidatePythonVersion
        ${If} $PYTHON_AVAILABLE == "1"
            nsExec::ExecToStack 'python3 -c "import sys; print(sys.executable)"'
            Pop $0
            Pop $PYTHON_PATH
            StrCpy $PYTHON_VERSION_STR $1
            DetailPrint "Found Python 3: $PYTHON_PATH ($PYTHON_VERSION_STR)"
            Return
        ${EndIf}
    ${EndIf}
    
    ; Try generic python command
    nsExec::ExecToStack 'python --version'
    Pop $0
    Pop $1
    ${If} $0 == 0
        Call ValidatePythonVersion
        ${If} $PYTHON_AVAILABLE == "1"
            nsExec::ExecToStack 'python -c "import sys; print(sys.executable)"'
            Pop $0
            Pop $PYTHON_PATH
            StrCpy $PYTHON_VERSION_STR $1
            DetailPrint "Found Python: $PYTHON_PATH ($PYTHON_VERSION_STR)"
            Return
        ${EndIf}
    ${EndIf}
    
    ; Try py launcher (Windows Python Launcher)
    nsExec::ExecToStack 'py -3.11 --version'
    Pop $0
    Pop $1
    ${If} $0 == 0
        nsExec::ExecToStack 'py -3.11 -c "import sys; print(sys.executable)"'
        Pop $0
        Pop $PYTHON_PATH
        StrCpy $PYTHON_AVAILABLE "1"
        StrCpy $PYTHON_VERSION_STR $1
        DetailPrint "Found Python via py launcher: $PYTHON_PATH"
        Return
    ${EndIf}
    
    DetailPrint "Python 3.11+ not found on system"
FunctionEnd

; Validate Python version >= 3.11
Function ValidatePythonVersion
    StrCpy $PYTHON_AVAILABLE "0"
    
    ; Use Python to check its own version
    nsExec::ExecToStack 'python -c "import sys; v=sys.version_info; exit(0 if v.major==3 and v.minor>=11 else 1)"'
    Pop $0
    ${If} $0 == 0
        StrCpy $PYTHON_AVAILABLE "1"
        DetailPrint "Python version meets requirements (3.11+)"
    ${Else}
        DetailPrint "Python version does not meet minimum requirements (3.11+)"
    ${EndIf}
FunctionEnd

; Installation Section
Section "MainSection" SEC01
    SetOutPath "$INSTDIR"
    SetOverwrite on
    
    ; Copy application files
    File /r "${BUILD_DIR}\*.*"
    
    ; Check for Python
    Call CheckPython
    
    ; If Python not available, install embedded version
    ${If} $PYTHON_AVAILABLE == "0"
        DetailPrint "Installing embedded Python..."
        
        ; Check if embedded Python bundle exists
        IfFileExists "$INSTDIR\python\python.exe" PythonExists NoPython
        
        PythonExists:
            DetailPrint "Embedded Python found"
            Goto PythonDone
        
        NoPython:
            DetailPrint "Warning: Embedded Python not found. You may need to install Python manually."
            MessageBox MB_OK|MB_ICONINFORMATION "Python was not found on your system. Please install Python 3.11+ manually or use the embedded version."
        
        PythonDone:
    ${EndIf}
    
    ; Install Python dependencies if Python is available
    ${If} $PYTHON_AVAILABLE == "1"
        DetailPrint "Installing Python dependencies..."
        nsExec::ExecToLog 'python -m pip install -r "$INSTDIR\backend\requirements.txt"'
    ${ElseIf} $PYTHON_AVAILABLE == "0"
        ${If} ${FileExists} "$INSTDIR\python\python.exe"
            DetailPrint "Installing Python dependencies with embedded Python..."
            nsExec::ExecToLog '"$INSTDIR\python\python.exe" -m pip install -r "$INSTDIR\backend\requirements.txt"'
        ${EndIf}
    ${EndIf}
    
    ; Create shortcuts
    CreateDirectory "$SMPROGRAMS\${PRODUCT_NAME}"
    CreateShortCut "$SMPROGRAMS\${PRODUCT_NAME}\${PRODUCT_NAME}.lnk" "$INSTDIR\cyberseed.exe"
    CreateShortCut "$SMPROGRAMS\${PRODUCT_NAME}\Uninstall.lnk" "$INSTDIR\uninst.exe"
    CreateShortCut "$DESKTOP\${PRODUCT_NAME}.lnk" "$INSTDIR\cyberseed.exe"
    
    ; Write registry entries
    WriteRegStr HKCU "${PRODUCT_UNINST_KEY}" "DisplayName" "${PRODUCT_NAME}"
    WriteRegStr HKCU "${PRODUCT_UNINST_KEY}" "UninstallString" "$INSTDIR\uninst.exe"
    WriteRegStr HKCU "${PRODUCT_UNINST_KEY}" "DisplayIcon" "$INSTDIR\cyberseed.exe"
    WriteRegStr HKCU "${PRODUCT_UNINST_KEY}" "DisplayVersion" "${PRODUCT_VERSION}"
    WriteRegStr HKCU "${PRODUCT_UNINST_KEY}" "Publisher" "${PRODUCT_PUBLISHER}"
    WriteRegStr HKCU "${PRODUCT_UNINST_KEY}" "URLInfoAbout" "${PRODUCT_WEB_SITE}"
    
    ; Get install size
    ${GetSize} "$INSTDIR" "/S=0K" $0 $1 $2
    IntFmt $0 "0x%08X" $0
    WriteRegDWORD HKCU "${PRODUCT_UNINST_KEY}" "EstimatedSize" "$0"
    
    ; Create uninstaller
    WriteUninstaller "$INSTDIR\uninst.exe"
SectionEnd

; Uninstaller Section
Section "Uninstall"
    ; Remove shortcuts
    Delete "$DESKTOP\${PRODUCT_NAME}.lnk"
    Delete "$SMPROGRAMS\${PRODUCT_NAME}\${PRODUCT_NAME}.lnk"
    Delete "$SMPROGRAMS\${PRODUCT_NAME}\Uninstall.lnk"
    RMDir "$SMPROGRAMS\${PRODUCT_NAME}"
    
    ; Remove files and directories
    RMDir /r "$INSTDIR"
    
    ; Remove registry entries
    DeleteRegKey HKCU "${PRODUCT_UNINST_KEY}"
    
    SetAutoClose true
SectionEnd
