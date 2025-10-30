# Backend Startup Script
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "   🚀 STARTING BACKEND SERVER" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan

# Set the project root as PYTHONPATH
$env:PYTHONPATH = "$PSScriptRoot"

# Navigate to backend directory
Set-Location "$PSScriptRoot\backend"

# Activate virtual environment
Write-Host "✓ Activating virtual environment..." -ForegroundColor Green
& "$PSScriptRoot\backend\venv\Scripts\Activate.ps1"

# Start uvicorn server
Write-Host "✓ Starting uvicorn server...`n" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "   Backend running on http://localhost:8000" -ForegroundColor White
Write-Host "   API Docs: http://localhost:8000/docs" -ForegroundColor White
Write-Host "   Press Ctrl+C to stop" -ForegroundColor Gray
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan

python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
