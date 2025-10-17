@echo off
echo 🚀 Setting up BookHub...

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not running. Please start Docker and try again.
    exit /b 1
)

REM Create environment files if they don't exist
if not exist .env (
    echo 📄 Creating backend .env file...
    copy .env.example .env
)

if not exist frontend\.env (
    echo 📄 Creating frontend .env file...
    copy frontend\.env.example frontend\.env
)

REM Build and start services
echo 🔨 Building and starting services...
docker-compose up -d --build

REM Wait for services to be ready
echo ⏳ Waiting for services to start...
timeout /t 30 /nobreak >nul

REM Check if backend is healthy
echo 🏥 Checking backend health...
:check_health
curl -f http://localhost:8000/health >nul 2>&1
if errorlevel 1 (
    echo Waiting for backend to be ready...
    timeout /t 5 /nobreak >nul
    goto check_health
)

REM Initialize sample data
echo 📚 Generating sample books and ratings...
docker-compose exec backend python ml/sample_data.py

REM Train ML models
echo 🤖 Training recommendation models...
docker-compose exec backend python ml/train.py

echo ✅ Setup complete!
echo.
echo 🌐 Access the application:
echo    Frontend: http://localhost:3000
echo    Backend API: http://localhost:8000
echo    API Docs: http://localhost:8000/docs
echo.
echo 👤 Demo credentials:
echo    Admin: admin@bookapp.com / admin123
echo    User: user@example.com / password123
echo.
echo 🎉 Happy reading!