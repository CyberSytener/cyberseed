; Cyberseed NSIS Installer Script
; Standalone Windows installer with Python detection and management

!include "MUI2.nsh"
!include "FileFunc.nsh"
!include "LogicLib.nsh"

; Application Info
!define PRODUCT_NAME "Cyberseed"
!define PRODUCT_VERSION "0.1.0"
!define PRODUCT_PUBLISHER "Cyberseed Team"
!define PRODUCT_WEB_SITE "https://github.com/CyberSytener/cyberseed"
!define PRODUCT_UNINST_KEY "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}"

; Python settings
!define PYTHON_VERSION "3.11"
!define PYTHON_MIN_VERSION "3.11.0"

; Installer settings
Name "${PRODUCT_NAME}"
OutFile "${OUTPUT_DIR}\Cyberseed-Setup.exe"
InstallDir "$LOCALAPPDATA\${PRODUCT_NAME}"
RequestExecutionLevel user
ShowInstDetails show
ShowUninstDetails show

; Modern UI Configuration
!define MUI_ABORTWARNING
!define MUI_ICON "..\..\icons\icon.ico"
!define MUI_UNICON "..\..\icons\icon.ico"
!define MUI_HEADERIMAGE
!define MUI_WELCOMEPAGE_TITLE "Welcome to ${PRODUCT_NAME} Setup"
!define MUI_WELCOMEPAGE_TEXT "This wizard will guide you through the installation of ${PRODUCT_NAME}.$\r$\n$\r$\nThis is a standalone installer that includes all necessary components."
!define MUI_FINISHPAGE_RUN "$INSTDIR\${PRODUCT_NAME}.exe"
!define MUI_FINISHPAGE_RUN_TEXT "Launch ${PRODUCT_NAME}"

; Pages
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_LICENSE "..\..\..\..\LICENSE"
!insertmacro MUI_PAGE_COMPONENTS
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
Var INSTALL_EMBEDDED_PYTHON

; Functions

Function .onInit
    ; Check if already installed
    ReadRegStr $R0 HKCU "${PRODUCT_UNINST_KEY}" "UninstallString"
    ${If} $R0 != ""
        MessageBox MB_OKCANCEL|MB_ICONEXCLAMATION \
            "${PRODUCT_NAME} is already installed.$\r$\n$\r$\nClick OK to remove the previous version or Cancel to cancel this installation." \
            IDOK uninst
        Abort
        
        uninst:
            ClearErrors
            ExecWait '$R0 /S _?=$INSTDIR'
    ${EndIf}
    
    ; Initialize variables
    StrCpy $PYTHON_AVAILABLE "0"
    StrCpy $PYTHON_PATH ""
    StrCpy $INSTALL_EMBEDDED_PYTHON "0"
FunctionEnd

Function CheckSystemPython
    DetailPrint "Checking for system Python..."
    
    ; Try to find Python in PATH
    nsExec::ExecToStack 'python --version'
    Pop $0
    Pop $1
    
    ${If} $0 == 0
        DetailPrint "System Python found: $1"
        
        ; Get Python path
        nsExec::ExecToStack 'python -c "import sys; print(sys.executable)"'
        Pop $0
        Pop $2
        
        ${If} $0 == 0
            StrCpy $PYTHON_PATH $2
            StrCpy $PYTHON_AVAILABLE "1"
            StrCpy $PYTHON_VERSION_STR $1
            DetailPrint "Python executable: $PYTHON_PATH"
        ${EndIf}
    ${Else}
        DetailPrint "System Python not found"
        StrCpy $PYTHON_AVAILABLE "0"
    ${EndIf}
FunctionEnd

Function InstallPipPackages
    DetailPrint "Installing Python dependencies..."
    
    ${If} $PYTHON_AVAILABLE == "1"
        ${If} $PYTHON_PATH != ""
            DetailPrint "Using system Python: $PYTHON_PATH"
            nsExec::ExecToLog '"$PYTHON_PATH" -m pip install --user -r "$INSTDIR\backend\requirements.txt"'
            Pop $0
            ${If} $0 == 0
                DetailPrint "Dependencies installed successfully"
            ${Else}
                DetailPrint "Warning: Some dependencies may not have installed correctly"
            ${EndIf}
        ${EndIf}
    ${ElseIf} $INSTALL_EMBEDDED_PYTHON == "1"
        ${If} ${FileExists} "$INSTDIR\python\python.exe"
            DetailPrint "Using embedded Python"
            nsExec::ExecToLog '"$INSTDIR\python\python.exe" -m pip install -r "$INSTDIR\backend\requirements.txt"'
            Pop $0
            ${If} $0 == 0
                DetailPrint "Dependencies installed successfully"
            ${Else}
                DetailPrint "Warning: Some dependencies may not have installed correctly"
            ${EndIf}
        ${EndIf}
    ${Else}
        DetailPrint "Warning: No Python available for dependency installation"
        MessageBox MB_OK|MB_ICONEXCLAMATION "Python was not found or selected. You may need to install Python 3.11+ and dependencies manually."
    ${EndIf}
FunctionEnd

; Installation Sections

Section "Cyberseed Application" SEC01
    SectionIn RO  ; Required section
    
    SetOutPath "$INSTDIR"
    SetOverwrite on
    
    ; Copy main application
    File "${BUILD_DIR}\Cyberseed.exe"
    
    ; Copy backend files
    SetOutPath "$INSTDIR\backend"
    File /r "${BUILD_DIR}\backend\*.*"
    
    ; Check for Python
    Call CheckSystemPython
    
    ; Create shortcuts
    CreateDirectory "$SMPROGRAMS\${PRODUCT_NAME}"
    CreateShortCut "$SMPROGRAMS\${PRODUCT_NAME}\${PRODUCT_NAME}.lnk" "$INSTDIR\${PRODUCT_NAME}.exe"
    CreateShortCut "$SMPROGRAMS\${PRODUCT_NAME}\Uninstall.lnk" "$INSTDIR\uninst.exe"
    
    ; Write registry entries
    WriteRegStr HKCU "${PRODUCT_UNINST_KEY}" "DisplayName" "${PRODUCT_NAME}"
    WriteRegStr HKCU "${PRODUCT_UNINST_KEY}" "UninstallString" "$INSTDIR\uninst.exe"
    WriteRegStr HKCU "${PRODUCT_UNINST_KEY}" "DisplayIcon" "$INSTDIR\${PRODUCT_NAME}.exe"
    WriteRegStr HKCU "${PRODUCT_UNINST_KEY}" "DisplayVersion" "${PRODUCT_VERSION}"
    WriteRegStr HKCU "${PRODUCT_UNINST_KEY}" "Publisher" "${PRODUCT_PUBLISHER}"
    WriteRegStr HKCU "${PRODUCT_UNINST_KEY}" "URLInfoAbout" "${PRODUCT_WEB_SITE}"
    WriteRegStr HKCU "${PRODUCT_UNINST_KEY}" "InstallLocation" "$INSTDIR"
    
    ; Get install size
    ${GetSize} "$INSTDIR" "/S=0K" $0 $1 $2
    IntFmt $0 "0x%08X" $0
    WriteRegDWORD HKCU "${PRODUCT_UNINST_KEY}" "EstimatedSize" "$0"
    
    ; Create uninstaller
    WriteUninstaller "$INSTDIR\uninst.exe"
SectionEnd

Section /o "Embedded Python 3.11" SEC02
    DetailPrint "Installing embedded Python..."
    
    SetOutPath "$INSTDIR\python"
    
    !ifdef INCLUDE_PYTHON
        ; Copy embedded Python if it was bundled
        ${If} ${FileExists} "${BUILD_DIR}\python\python.exe"
            File /r "${BUILD_DIR}\python\*.*"
            StrCpy $INSTALL_EMBEDDED_PYTHON "1"
            DetailPrint "Embedded Python installed"
        ${Else}
            DetailPrint "Warning: Embedded Python files not found in build"
            MessageBox MB_OK|MB_ICONINFORMATION "Embedded Python was selected but files were not found. Please use system Python or download the full installer."
        ${EndIf}
    !else
        DetailPrint "Embedded Python not included in this installer"
        MessageBox MB_OK|MB_ICONINFORMATION "This installer does not include embedded Python. Please ensure Python 3.11+ is installed on your system."
    !endif
SectionEnd

Section "Desktop Shortcut" SEC03
    CreateShortCut "$DESKTOP\${PRODUCT_NAME}.lnk" "$INSTDIR\${PRODUCT_NAME}.exe"
SectionEnd

Section "Install Python Dependencies" SEC04
    SectionIn RO  ; Required section
    Call InstallPipPackages
SectionEnd

; Section Descriptions
!insertmacro MUI_FUNCTION_DESCRIPTION_BEGIN
    !insertmacro MUI_DESCRIPTION_TEXT ${SEC01} "The main Cyberseed application (required)"
    !insertmacro MUI_DESCRIPTION_TEXT ${SEC02} "Embedded Python 3.11 (select if you don't have Python installed)"
    !insertmacro MUI_DESCRIPTION_TEXT ${SEC03} "Create a shortcut on the desktop"
    !insertmacro MUI_DESCRIPTION_TEXT ${SEC04} "Install required Python packages (required)"
!insertmacro MUI_FUNCTION_DESCRIPTION_END

; Uninstaller Section
Section "Uninstall"
    ; Remove shortcuts
    Delete "$DESKTOP\${PRODUCT_NAME}.lnk"
    Delete "$SMPROGRAMS\${PRODUCT_NAME}\${PRODUCT_NAME}.lnk"
    Delete "$SMPROGRAMS\${PRODUCT_NAME}\Uninstall.lnk"
    RMDir "$SMPROGRAMS\${PRODUCT_NAME}"
    
    ; Remove files and directories
    Delete "$INSTDIR\${PRODUCT_NAME}.exe"
    Delete "$INSTDIR\uninst.exe"
    RMDir /r "$INSTDIR\backend"
    RMDir /r "$INSTDIR\python"
    RMDir "$INSTDIR"
    
    ; Remove registry entries
    DeleteRegKey HKCU "${PRODUCT_UNINST_KEY}"
    
    SetAutoClose true
SectionEnd
