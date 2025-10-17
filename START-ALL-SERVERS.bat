@echo off
echo ========================================
echo   Starting Book Recommendation System
echo ========================================
echo.

REM Start Backend Server
echo [1/2] Starting Backend Server (Port 8000)...
cd backend
start "Backend Server" cmd /k "uvicorn main:app --reload"
timeout /t 3 /nobreak > nul

REM Start Frontend Server
echo [2/2] Starting Frontend Server (Port 3000)...
cd ..\frontend
start "Frontend Server" cmd /k "set BROWSER=none && npm start"

echo.
echo ========================================
echo   Servers Starting...
echo ========================================
echo.
echo Backend will be available at:  http://localhost:8000
echo Frontend will be available at: http://localhost:3000
echo.
echo Press any key to close this window...
echo (Keep the other windows open!)
pause > nul
