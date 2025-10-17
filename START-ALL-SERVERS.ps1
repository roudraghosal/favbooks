# PowerShell Script to Start Both Servers

Write-Host "========================================" -ForegroundColor Green
Write-Host "  Starting Book Recommendation System  " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Start Backend
Write-Host "[1/2] Starting Backend Server (Port 8000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; uvicorn main:app --reload"
Start-Sleep -Seconds 3

# Start Frontend
Write-Host "[2/2] Starting Frontend Server (Port 3000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; `$env:BROWSER='none'; npm start"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Servers Starting...                  " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Backend:  " -NoNewline
Write-Host "http://localhost:8000" -ForegroundColor Cyan
Write-Host "Frontend: " -NoNewline
Write-Host "http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Wait 15-20 seconds for servers to fully start..." -ForegroundColor Yellow
Write-Host "Then open: " -NoNewline
Write-Host "http://localhost:3000" -ForegroundColor Green -BackgroundColor Black
Write-Host ""
