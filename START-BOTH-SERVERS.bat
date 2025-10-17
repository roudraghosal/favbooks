@echo off
echo ========================================
echo Book Recommendation App - Server Startup
echo ========================================
echo.
echo Starting Backend Server...
start "Backend Server" "%~dp0START-BACKEND.bat"
timeout /t 3 /nobreak >nul
echo.
echo Starting Frontend Server...
start "Frontend Server" "%~dp0START-FRONTEND.bat"
echo.
echo ========================================
echo Both servers are starting!
echo ========================================
echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Check the server windows for status.
echo Close this window when done.
pause
