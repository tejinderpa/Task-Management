# Task Management System - Quick Start Launcher

Write-Host "`n" -NoNewline
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   🚀 Task Management System - Quick Launcher" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "`n"

# Check Node.js
Write-Host "Checking prerequisites..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($nodeVersion) {
    Write-Host "✅ Node.js installed: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Node.js is not installed!" -ForegroundColor Red
    exit 1
}

# Check MongoDB
$mongoInstalled = Get-Command mongod -ErrorAction SilentlyContinue
if ($mongoInstalled) {
    Write-Host "✅ MongoDB is installed" -ForegroundColor Green
    
    # Check if MongoDB service is running
    $mongoService = Get-Service -Name MongoDB -ErrorAction SilentlyContinue
    if ($mongoService -and $mongoService.Status -eq "Running") {
        Write-Host "✅ MongoDB service is running" -ForegroundColor Green
    } else {
        Write-Host "⚠️  MongoDB service is not running. Attempting to start..." -ForegroundColor Yellow
        try {
            Start-Service MongoDB -ErrorAction Stop
            Write-Host "✅ MongoDB service started" -ForegroundColor Green
        } catch {
            Write-Host "❌ Could not start MongoDB service" -ForegroundColor Red
            Write-Host "   Please start MongoDB manually or run: .\setup-mongodb.ps1" -ForegroundColor Yellow
            exit 1
        }
    }
} else {
    Write-Host "❌ MongoDB is not installed!" -ForegroundColor Red
    Write-Host "   Run: .\setup-mongodb.ps1 to install MongoDB" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n" -NoNewline

# Check if backend dependencies are installed
if (!(Test-Path "backend\node_modules")) {
    Write-Host "📦 Installing backend dependencies..." -ForegroundColor Yellow
    cd backend
    npm install
    cd ..
    Write-Host "✅ Backend dependencies installed" -ForegroundColor Green
}

# Check if frontend dependencies are installed
if (!(Test-Path "frontend\node_modules")) {
    Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Yellow
    cd frontend
    npm install
    cd ..
    Write-Host "✅ Frontend dependencies installed" -ForegroundColor Green
}

Write-Host "`n================================================" -ForegroundColor Cyan
Write-Host "   Starting servers..." -ForegroundColor Cyan
Write-Host "================================================`n" -ForegroundColor Cyan

# Start backend in a new window
Write-Host "🔧 Starting Backend Server (Port 8000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend' ; Write-Host '🔧 Backend Server Starting...' -ForegroundColor Cyan ; npm run dev"

# Wait a bit for backend to start
Start-Sleep -Seconds 3

# Start frontend in a new window
Write-Host "🎨 Starting Frontend Server (Port 3000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\frontend' ; Write-Host '🎨 Frontend Server Starting...' -ForegroundColor Cyan ; npm run dev"

# Wait a bit for frontend to start
Start-Sleep -Seconds 5

Write-Host "`n================================================" -ForegroundColor Green
Write-Host "   ✅ Application is starting!" -ForegroundColor Green
Write-Host "================================================`n" -ForegroundColor Green

Write-Host "📍 Backend API:  " -NoNewline -ForegroundColor White
Write-Host "http://localhost:8000" -ForegroundColor Cyan

Write-Host "📍 Frontend App: " -NoNewline -ForegroundColor White
Write-Host "http://localhost:3000" -ForegroundColor Cyan

Write-Host "`n💡 Opening browser..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Open browser
Start-Process "http://localhost:3000"

Write-Host "`n" -NoNewline
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   📚 Quick Tips" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "• Register a new account to get started" -ForegroundColor White
Write-Host "• Check the terminal windows for server logs" -ForegroundColor White
Write-Host "• Press Ctrl+C in terminal windows to stop servers" -ForegroundColor White
Write-Host "• See SETUP_GUIDE.md for detailed documentation" -ForegroundColor White
Write-Host "================================================`n" -ForegroundColor Cyan

Write-Host "✨ Happy Task Managing! ✨`n" -ForegroundColor Magenta
