@echo off
echo ========================================
echo    STARTING FAVBOOKS APPLICATION
echo ========================================
echo.

REM Start Backend in new window
echo [1/2] Starting Backend Server...
start "FavBooks Backend" powershell -NoExit -ExecutionPolicy Bypass -File "%~dp0start-backend.ps1"

REM Wait 3 seconds
timeout /t 3 /nobreak >nul

REM Start Frontend in new window
echo [2/2] Starting Frontend Server...
start "FavBooks Frontend" powershell -NoExit -ExecutionPolicy Bypass -File "%~dp0start-frontend.ps1"

echo.
echo ========================================
echo   SERVERS STARTING...
echo ========================================
echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:3000/favbooks
echo.
echo Two PowerShell windows will open.
echo Keep them open while using the app!
echo.
pause
