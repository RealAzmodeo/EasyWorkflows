@echo off
setlocal enabledelayedexpansion

title ALLAI - Setup ^& Launch
echo ==========================================
echo       ALLAI - Your Creative Intelligence
echo ==========================================
echo.

:: Check for node_modules
if not exist "node_modules\" (
    echo [!] First time setup detected. Installing requirements...
    call npm install
    if !errorlevel! neq 0 (
        echo [X] Error installing requirements. Please check your internet connection.
        pause
        exit /b 1
    )
    echo [OK] Requirements installed successfully.
)

echo.
echo [i] Starting ALLAI Frontend...
echo [i] Access locally at: http://localhost:5173
echo [i] Access remotely via Tailscale IP
echo.

call npm run dev

pause
