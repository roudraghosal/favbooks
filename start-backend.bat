@echo off
title Book Recommendation - Backend Server
echo 🔧 Starting BookHub Backend...

:: Activate virtual environment from root directory
if not exist venv (
    echo ❌ Virtual environment not found. Please run setup-complete.bat first.
    pause
    exit /b 1
)

call venv\Scripts\activate.bat

:: Set Python path
set PYTHONPATH=%cd%\backend

:: Check if .env exists
if not exist .env (
    echo ❌ .env file not found. Please copy .env.example to .env and configure it.
    pause
    exit /b 1
)

:: Move to backend directory
cd backend

echo 🚀 Starting FastAPI server on http://localhost:8000
echo 📚 API documentation available at http://localhost:8000/docs
echo.
echo Press Ctrl+C to stop the server
echo.

uvicorn main:app --reload --port 8000 --host 0.0.0.0