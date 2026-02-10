@echo off
setlocal enabledelayedexpansion

title ALLAI - Startup & Launch
echo ==========================================
echo       ALLAI - Your Creative Intelligence
echo ==========================================
echo.

:: Configuration
set "COMY_PORT=8188"
set "FRONTEND_URL=http://localhost:5173"
set "HYBRID_BAT=..\ComfyUI-Easy-Install\run_hybrid_stable.bat"
set "NVIDIA_BAT=..\ComfyUI-Easy-Install\run_nvidia_gpu.bat"

:: 1. Check for node_modules
if not exist "node_modules\" (
    echo [!] First time setup detected. Installing requirements...
    call npm install
    if !errorlevel! neq 0 (
        echo [X] Error installing requirements.
        pause
        exit /b 1
    )
    echo [OK] Requirements installed successfully.
)

echo [1/3] Checking ComfyUI Status...
netstat -ano | find ":%COMY_PORT%" | find "LISTENING" >nul
if %errorlevel% equ 0 (
    echo    + ComfyUI is already running.
) else (
    echo    + ComfyUI NOT running. Starting it now...
    if exist "%NVIDIA_BAT%" (
        start "ALLAI - ComfyUI Backend" cmd /c "call %NVIDIA_BAT%"
    ) else if exist "%HYBRID_BAT%" (
        start "ALLAI - ComfyUI Backend" cmd /c "call %HYBRID_BAT%"
    ) else (
        echo    [WARNING] No startup script found in ..\ComfyUI-Easy-Install\
        echo    Please start ComfyUI manually.
    )
    echo    + Waiting 10 seconds for ComfyUI to initialize...
    timeout /t 10 >nul
)

echo [2/3] Starting ALLAI Frontend...
start "ALLAI - Frontend Server" cmd /c "npm run dev"

echo [3/3] Launching Browser...
timeout /t 5 >nul
start "" "%FRONTEND_URL%"

echo.
echo ==========================================
echo       ALLAI IS READY TO CREATE
echo ==========================================
echo.
echo [i] Frontend: %FRONTEND_URL%
echo [i] Backend:  Port %COMY_PORT%
echo.
echo You can keep this window open or close it.
echo The servers are running in the background.
echo.

pause
