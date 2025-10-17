@echo off
title Book Recommendation - Frontend Server
echo 🌐 Starting BookHub Frontend...

cd frontend

REM Check if node_modules exists
if not exist node_modules (
    echo ❌ Node modules not found. Please run setup-complete.bat first.
    pause
    exit /b 1
)

REM Check if .env exists  
if not exist .env (
    echo Creating frontend .env file...
    copy .env.example .env
)

echo 🚀 Starting React development server on http://localhost:3000
echo 🌐 Frontend will be available at http://localhost:3000
echo.
echo The app will automatically open in your browser
echo Press Ctrl+C to stop the server
echo.

npm start