# Frontend Startup Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "STARTING FRONTEND SERVER" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get the project root directory (parent of this script)
$ProjectRoot = Split-Path -Parent $PSScriptRoot
if (-not $ProjectRoot) {
    $ProjectRoot = $PSScriptRoot
}

# Navigate to frontend directory
$FrontendPath = Join-Path $ProjectRoot "frontend"
Write-Host "Navigating to: $FrontendPath" -ForegroundColor Gray

if (-not (Test-Path $FrontendPath)) {
    Write-Host "ERROR: Frontend directory not found at $FrontendPath" -ForegroundColor Red
    Write-Host "Press any key to exit..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

Set-Location $FrontendPath

# Verify package.json exists
if (-not (Test-Path "package.json")) {
    Write-Host "ERROR: package.json not found in $FrontendPath" -ForegroundColor Red
    Write-Host "Press any key to exit..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

# Start npm dev server
Write-Host "Starting React development server..." -ForegroundColor Green
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000/favbooks" -ForegroundColor White
Write-Host "Press Ctrl+C to stop" -ForegroundColor Gray
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

npm start
