@echo off
echo 🚀 Setting up BookHub for Local Development...

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed. Please install Python 3.11+ and try again.
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ and try again.
    exit /b 1
)

echo ✅ Python and Node.js are installed

REM Create environment files if they don't exist
if not exist .env (
    echo 📄 Creating backend .env file...
    copy .env.example .env
    echo 📝 Please update the DATABASE_URL in .env file with your PostgreSQL connection string
)

if not exist frontend\.env (
    echo 📄 Creating frontend .env file...
    copy frontend\.env.example frontend\.env
)

echo 🔧 Setting up backend...
cd backend

REM Create virtual environment
if not exist venv (
    echo 📦 Creating Python virtual environment...
    python -m venv venv
)

REM Activate virtual environment and install dependencies
echo 📥 Installing Python dependencies...
call venv\Scripts\activate.bat
pip install -r requirements.txt

echo 🗄️ Initializing database...
python init_db.py

echo 🎲 Generating sample data...
cd ..\ml
python sample_data.py

echo 🤖 Training ML models...
python train.py

cd ..

echo 🌐 Setting up frontend...
cd frontend

echo 📥 Installing Node.js dependencies...
call npm install

cd ..

echo ✅ Setup complete!
echo.
echo 🚀 To start the application:
echo.
echo 1. Start the backend:
echo    cd backend
echo    venv\Scripts\activate.bat
echo    uvicorn main:app --reload --port 8000
echo.
echo 2. In a new terminal, start the frontend:
echo    cd frontend
echo    npm start
echo.
echo 🌐 Then access:
echo    Frontend: http://localhost:3000
echo    Backend API: http://localhost:8000
echo    API Docs: http://localhost:8000/docs
echo.
echo 👤 Demo credentials:
echo    Admin: admin@bookapp.com / admin123

pause