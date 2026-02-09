@echo off
setlocal
title Connect ComfyUI Frontend

REM Configuration - Path adjusted for being inside the frontend folder
set "COMFY_BAT=..\ComfyUI-Easy-Install\run_nvidia_gpu.bat"
set "COMFY_PORT=8188"
set "FRONTEND_URL=http://localhost:5173"

echo [1/3] Checking ComfyUI Status...

REM Check if port 8188 is active
netstat -ano | find ":%COMFY_PORT%" | find "LISTENING" >nul
if %errorlevel% equ 0 (
    echo    + ComfyUI is already running.
) else (
    echo    + ComfyUI NOT running. Starting it now...
    if exist "%COMFY_BAT%" (
        start "" "%COMFY_BAT%"
        echo    + Waiting 15 seconds for ComfyUI to initialize...
        timeout /t 15 >nul
    ) else (
        echo    [ERROR] Could not find %COMFY_BAT%
        echo    Make sure this script is inside the "ComfyUI-Custom-Frontend" folder.
        pause
        exit /b
    )
)

echo [2/3] Starting Frontend Server...
if exist "package.json" (
    REM Start npm run dev since we are already in the frontend directory
    start "ComfyUI Frontend" cmd /c "npm run dev"
) else (
    echo    [ERROR] Could not find package.json. 
    echo    Make sure this script is inside the "ComfyUI-Custom-Frontend" folder.
    pause
    exit /b
)

echo [3/3] Launching Browser...
timeout /t 4 >nul
start "" "%FRONTEND_URL%"

echo.
echo [DONE] System is running. 
echo        - Local Access:     %FRONTEND_URL%
echo        - Network Access:   Check your Local IP (e.g., http://192.168.1.XX:5173)
echo.
echo TIP: Open "cmd" and type "ipconfig" to find your IPv4 Address for mobile access.
echo.
echo You can close this window, but keep the "ComfyUI Frontend" and "ComfyUI" windows open.
pause
