#!/usr/bin/env pwsh

Write-Host "🚀 Starting BookHub Development Server..." -ForegroundColor Green

# Check if Python is installed
if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Python is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Python 3.8+ and try again" -ForegroundColor Yellow
    exit 1
}

# Check if Node.js is installed
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js 16+ and try again" -ForegroundColor Yellow
    exit 1
}

# Change to project directory
$ProjectRoot = Split-Path -Path $MyInvocation.MyCommand.Definition -Parent
Set-Location $ProjectRoot

Write-Host "📂 Project directory: $ProjectRoot" -ForegroundColor Cyan

# Backend setup
Write-Host "`n🔧 Setting up Backend..." -ForegroundColor Yellow
Set-Location "backend"

# Check if virtual environment exists
if (-not (Test-Path "venv")) {
    Write-Host "Creating Python virtual environment..." -ForegroundColor Cyan
    python -m venv venv
}

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Cyan
if ($IsWindows -or $env:OS -eq "Windows_NT") {
    & ".\venv\Scripts\Activate.ps1"
}
else {
    & "./venv/bin/Activate.ps1"
}

# Install dependencies
Write-Host "Installing Python dependencies..." -ForegroundColor Cyan
pip install -r requirements.txt

# Initialize database
Write-Host "Initializing database..." -ForegroundColor Cyan
python init_db.py

# Generate sample data
Write-Host "Generating sample data..." -ForegroundColor Cyan
if (Test-Path "..\ml\sample_data.py") {
    python ..\ml\sample_data.py
}

# Train models
Write-Host "Training ML models..." -ForegroundColor Cyan
if (Test-Path "..\ml\train.py") {
    python ..\ml\train.py
}

# Start backend in background
Write-Host "Starting FastAPI backend on http://localhost:8000..." -ForegroundColor Green
$BackendJob = Start-Job -ScriptBlock {
    Set-Location $using:ProjectRoot
    Set-Location "backend"
    if ($IsWindows -or $env:OS -eq "Windows_NT") {
        & ".\venv\Scripts\Activate.ps1"
    }
    else {
        & "./venv/bin/Activate.ps1"
    }
    uvicorn main:app --reload --host 0.0.0.0 --port 8000
}

# Frontend setup
Set-Location $ProjectRoot
Write-Host "`n🔧 Setting up Frontend..." -ForegroundColor Yellow
Set-Location "frontend"

# Install npm dependencies
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing npm dependencies..." -ForegroundColor Cyan
    npm install
}

# Wait a bit for backend to start
Write-Host "Waiting for backend to start..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

# Start frontend
Write-Host "Starting React frontend on http://localhost:3000..." -ForegroundColor Green
$FrontendJob = Start-Job -ScriptBlock {
    Set-Location $using:ProjectRoot
    Set-Location "frontend"
    npm start
}

Write-Host "`n✅ Both servers are starting!" -ForegroundColor Green
Write-Host "🌐 Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔧 Backend API: http://localhost:8000" -ForegroundColor Cyan
Write-Host "📚 API Docs: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "`n👤 Demo credentials:" -ForegroundColor Yellow
Write-Host "   Admin: admin@bookapp.com / admin123" -ForegroundColor White
Write-Host "`nPress Ctrl+C to stop both servers" -ForegroundColor Red

# Monitor jobs
try {
    while ($true) {
        Start-Sleep -Seconds 1
        
        # Check if jobs are still running
        $BackendRunning = (Get-Job -Id $BackendJob.Id).State -eq "Running"
        $FrontendRunning = (Get-Job -Id $FrontendJob.Id).State -eq "Running"
        
        if (-not $BackendRunning) {
            Write-Host "❌ Backend stopped unexpectedly" -ForegroundColor Red
            Receive-Job -Id $BackendJob.Id
            break
        }
        
        if (-not $FrontendRunning) {
            Write-Host "❌ Frontend stopped unexpectedly" -ForegroundColor Red
            Receive-Job -Id $FrontendJob.Id
            break
        }
    }
}
catch {
    Write-Host "`n🛑 Stopping servers..." -ForegroundColor Yellow
}
finally {
    # Cleanup jobs
    Stop-Job -Id $BackendJob.Id -ErrorAction SilentlyContinue
    Stop-Job -Id $FrontendJob.Id -ErrorAction SilentlyContinue
    Remove-Job -Id $BackendJob.Id -ErrorAction SilentlyContinue
    Remove-Job -Id $FrontendJob.Id -ErrorAction SilentlyContinue
    Write-Host "✅ Servers stopped" -ForegroundColor Green
}