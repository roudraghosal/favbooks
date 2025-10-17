@echo off
setlocal enabledelayedexpansion
title Book Recommendation System - Complete Setup
color 0A

echo ==========================================
echo  Book Recommendation System Setup
echo ==========================================
echo.

:: Check if Python is installed
echo [1/6] Checking Python installation...
python --version >nul 2>&1
if !errorlevel! neq 0 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python 3.11+ from https://www.python.org/
    pause
    exit /b 1
)
echo ✅ Python is installed

:: Check if Node.js is installed
echo [2/6] Checking Node.js installation...
node --version >nul 2>&1
if !errorlevel! neq 0 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js is installed

:: Create and activate Python virtual environment
echo [3/6] Setting up Python virtual environment...
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
    if !errorlevel! neq 0 (
        echo ❌ Failed to create virtual environment
        pause
        exit /b 1
    )
)

echo Activating virtual environment...
call venv\Scripts\activate.bat

:: Upgrade pip
echo Upgrading pip...
python -m pip install --upgrade pip

:: Install Python dependencies
echo [4/6] Installing Python dependencies...
cd backend
pip install -r requirements.txt
if !errorlevel! neq 0 (
    echo ❌ Failed to install Python dependencies
    cd ..
    pause
    exit /b 1
)
cd ..
echo ✅ Python dependencies installed

:: Install Node.js dependencies
echo [5/6] Installing Node.js dependencies...
cd frontend
npm install
if !errorlevel! neq 0 (
    echo ❌ Failed to install Node.js dependencies
    cd ..
    pause
    exit /b 1
)
cd ..
echo ✅ Node.js dependencies installed

:: Create environment files
echo [6/6] Setting up environment files...
if not exist ".env" (
    echo Creating backend .env file...
    copy .env.example .env
)

if not exist "frontend\.env" (
    echo Creating frontend .env file...
    copy frontend\.env.example frontend\.env
)

:: Initialize database and sample data
echo Setting up database and sample data...
call venv\Scripts\activate.bat
cd backend
python -c "
from app.core.database import engine, Base
from app.models import *
print('Creating database tables...')
Base.metadata.create_all(bind=engine)
print('✅ Database tables created')
"

cd ..\ml
python sample_data.py
python train.py
cd ..

echo.
echo ==========================================
echo ✅ Setup completed successfully!
echo ==========================================
echo.
echo 🚀 To start the application:
echo    1. Backend: run start-backend.bat
echo    2. Frontend: run start-frontend.bat
echo.
echo 🌐 URLs:
echo    Frontend: http://localhost:3000
echo    Backend:  http://localhost:8000
echo    API Docs: http://localhost:8000/docs
echo.
echo 👤 Login credentials:
echo    Admin: admin@bookapp.com / admin123
echo    User:  user@bookapp.com / user123
echo.
pause