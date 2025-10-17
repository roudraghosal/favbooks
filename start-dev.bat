@echo off
echo 🚀 Starting BookHub Development Server...

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python 3.8+ and try again
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js 16+ and try again
    pause
    exit /b 1
)

echo 📂 Project directory: %CD%

REM Backend setup
echo.
echo 🔧 Setting up Backend...
cd backend

REM Check if virtual environment exists
if not exist venv (
    echo Creating Python virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo Installing Python dependencies...
pip install -r requirements.txt

REM Initialize database
echo Initializing database...
python init_db.py

REM Generate sample data
echo Generating sample data...
if exist ..\ml\sample_data.py (
    python ..\ml\sample_data.py
)

REM Train models
echo Training ML models...
if exist ..\ml\train.py (
    python ..\ml\train.py
)

REM Start backend
echo.
echo Starting FastAPI backend on http://localhost:8000...
start "FastAPI Backend" cmd /k "cd /d %CD% && venv\Scripts\activate.bat && uvicorn main:app --reload --host 0.0.0.0 --port 8000"

REM Frontend setup
cd ..
echo.
echo 🔧 Setting up Frontend...
cd frontend

REM Install npm dependencies
if not exist node_modules (
    echo Installing npm dependencies...
    npm install
)

REM Wait for backend to start
echo Waiting for backend to start...
timeout /t 5 /nobreak >nul

REM Start frontend
echo Starting React frontend on http://localhost:3000...
start "React Frontend" cmd /k "cd /d %CD% && npm start"

echo.
echo ✅ Both servers are starting!
echo 🌐 Frontend: http://localhost:3000
echo 🔧 Backend API: http://localhost:8000
echo 📚 API Docs: http://localhost:8000/docs
echo.
echo 👤 Demo credentials:
echo    Admin: admin@bookapp.com / admin123
echo.
echo Press any key to close this window (servers will continue running)
pause >nul